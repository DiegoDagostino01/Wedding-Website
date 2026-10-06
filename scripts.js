/* ============================================================
   LANGUAGE — English / Italiano
   English is read from the page itself; Italian comes from i18n.js.
   Elements opt in with data-i18n="key" (content) or
   data-i18n-attr="attr:key;attr2:key2" (attributes). Scripts use t()
   for anything they build themselves, and listen for 'langchange'
   to re-render it when a guest switches language.
   ============================================================ */
  const LANG_KEY = 'db-wedding-lang';
  let LANG = document.documentElement.lang === 'it' ? 'it' : 'en';
  const IT_TEXT = (typeof I18N_IT !== 'undefined') ? I18N_IT : {};
  const STRINGS = (typeof I18N_STR !== 'undefined') ? I18N_STR : { en: {}, it: {} };
  const EN_HTML = {};
  const EN_ATTR = {};

  function parseAttrSpec(spec){
    return String(spec || '').split(';')
      .map(pair => pair.split(':').map(s => s.trim()))
      .filter(pair => pair.length === 2 && pair[0] && pair[1]);
  }

  // Capture the English originals before any script touches the page.
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if(!(key in EN_HTML)) EN_HTML[key] = el instanceof SVGElement ? el.textContent : el.innerHTML;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    parseAttrSpec(el.dataset.i18nAttr).forEach(([attr, key]) => {
      if(!(key in EN_ATTR)) EN_ATTR[key] = el.getAttribute(attr) || '';
    });
  });

  function htmlValue(key){
    return (LANG === 'it' && IT_TEXT[key] != null) ? IT_TEXT[key] : EN_HTML[key];
  }
  function attrValue(key){
    return (LANG === 'it' && IT_TEXT[key] != null) ? IT_TEXT[key] : EN_ATTR[key];
  }

  // t('key', { name:'Ann' }) — dynamic strings, with {placeholders}.
  function t(key, vars){
    let s = (STRINGS[LANG] || {})[key];
    if(s == null) s = (STRINGS.en || {})[key];
    if(s == null) return key;
    if(typeof s !== 'string' || !vars) return s;
    return s.replace(/\{(\w+)\}/g, (m, name) => vars[name] != null ? vars[name] : m);
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function applyLang(){
    document.documentElement.lang = LANG;
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = htmlValue(el.dataset.i18n);
      if(value == null) return;
      if(el instanceof SVGElement){ el.textContent = value; }
      else if(el.innerHTML !== value){ el.innerHTML = value; }
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      parseAttrSpec(el.dataset.i18nAttr).forEach(([attr, key]) => {
        const value = attrValue(key);
        if(value != null) el.setAttribute(attr, value);
      });
    });
    document.querySelectorAll('.lang-flag').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.setLang === LANG));
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: LANG } }));
  }

  function setLang(lang){
    if(lang !== 'en' && lang !== 'it') return;
    LANG = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode: still switch */ }
    applyLang();
  }


/* ---------- Navigation ---------- */
  // Nav scroll state
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive:true });

  // Publish the live nav height as --nav-h so sticky elements (journey map)
  // always pin below the bar, at every breakpoint and scroll state.
  (function(){
    if(!nav) return;
    const setNavH = () => document.documentElement.style.setProperty('--nav-h', (nav.offsetTop + nav.offsetHeight) + 'px');
    setNavH();
    if('ResizeObserver' in window){ new ResizeObserver(setNavH).observe(nav); }
    else { window.addEventListener('resize', setNavH, { passive:true }); }
  })();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  let navBackdrop = null;
  const openNav = () => { navLinks.classList.add('open'); createBackdrop(); navToggle.setAttribute('aria-expanded', 'true'); };
  const closeNav = () => { navLinks.classList.remove('open'); removeBackdrop(); navToggle.setAttribute('aria-expanded', 'false'); };
  const createBackdrop = () => {
    if (navBackdrop) return;
    navBackdrop = document.createElement('div');
    navBackdrop.style.cssText = 'position:fixed;inset:0;z-index:98;background:rgba(46,50,32,0.28);';
    navBackdrop.addEventListener('click', closeNav);
    document.body.appendChild(navBackdrop);
  };
  const removeBackdrop = () => {
    if (!navBackdrop) return;
    navBackdrop.remove();
    navBackdrop = null;
  };
  navToggle.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeNav() : openNav();
  });
  navLinks.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click', closeNav));
  // Escape closes the drawer and returns focus to the toggle.
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && navLinks.classList.contains('open')){
      closeNav();
      navToggle.focus();
    }
  });

  // Active section marker keeps the floating navigation oriented as guests explore.
  if ('IntersectionObserver' in window) {
    const sectionLinks = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
    const sectionMap = new Map(sectionLinks.map(link => [document.querySelector(link.getAttribute('href')), link]));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sectionLinks.forEach(link => link.classList.remove('active'));
          const link = sectionMap.get(entry.target);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    sectionMap.forEach((link, section) => { if (section) sectionObserver.observe(section); });
  }


  // Countdown to 29 April 2027, 1:30 PM UK time (BST, UTC+1) — pinned to the
  // venue's clock so guests browsing from Italy count to the real ceremony,
  // not to 1:30 PM in their own time zone.
  // Days-only until the last week; hours/minutes appear at 7 days out;
  // seconds only on the wedding day itself. After the day it retires
  // gracefully instead of counting zeros forever.
  const weddingDate = new Date('2027-04-29T13:30:00+01:00');
  const countdownEl = document.getElementById('countdown');
  let cdTimer = null;
  function updateCountdown(){
    const now = new Date();
    let diff = weddingDate - now;
    if(diff <= 0){
      if(countdownEl){
        countdownEl.innerHTML = '<div class="unit"><div class="num">&hearts;</div><div class="label">' + t('justMarried') + '</div></div>';
      }
      if(cdTimer) clearInterval(cdTimer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-days').textContent = d;
    const showHours = d <= 7;
    const showSecs = d === 0;
    ['cd-hours','cd-mins','cd-secs'].forEach(function(id){
      var el = document.getElementById(id);
      var parent = el && el.parentNode;
      if(!parent) return;
      var show = id === 'cd-secs' ? showSecs : showHours;
      parent.style.display = show ? '' : 'none';
    });
    if(showHours){
      document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
      document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
    }
    if(showSecs) document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
  }
  updateCountdown();
  cdTimer = setInterval(updateCountdown, 1000);
  document.addEventListener('langchange', updateCountdown);


  // Scroll reveal — ONE system for the whole page. Content is visible by default;
  // elements animate in only when JS + motion allow, and a failsafe guarantees
  // nothing stays hidden on headless renderers, background tabs, or no-scroll views.
  if ('IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const sectionEls = Array.from(document.querySelectorAll('[data-tr], [data-dr], [data-hm], [data-faq], [data-rv]'));
    sectionEls.forEach(el => { const s = el.closest('section'); if (s) s.classList.add('js-reveal'); });
    const rootGated = document.documentElement.classList.contains('js-reveal')
      ? Array.from(document.querySelectorAll('.reveal'))
      : [];
    const revealEls = rootGated.concat(sectionEls);
    const reveal = el => el.classList.add('in');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { reveal(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
    // Failsafe: headless renderers, background tabs, or a no-scroll view must never see blank content
    const revealAll = () => revealEls.forEach(reveal);
    window.addEventListener('load', () => setTimeout(revealAll, 1000), { once: true });
    setTimeout(revealAll, 2600);
  }


  // Travel — copy the venue postcode
  const copyBtn = document.getElementById('copyPostcode');
  if (copyBtn) {
    const label = copyBtn.querySelector('.copy-label');
    copyBtn.addEventListener('click', async () => {
      const pc = copyBtn.getAttribute('data-postcode') || '';
      try {
        await navigator.clipboard.writeText(pc);
      } catch (_) {
        const el = document.getElementById('venuePostcode');
        if (el) {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel.removeAllRanges(); sel.addRange(range);
          try { document.execCommand('copy'); } catch (e) {}
          sel.removeAllRanges();
        }
      }
      copyBtn.classList.add('copied');
      if (label) label.textContent = t('copied');
      clearTimeout(copyBtn._resetTimer);
      copyBtn._resetTimer = setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (label) label.innerHTML = htmlValue('car.copy');
      }, 1800);
    });
  }

  /* ============================================================
     RSVP — guest lookup, one meal choice per guest, submission.
     ============================================================ */
  (function initRSVP(){
    const form = document.getElementById('rsvpForm');
    if(!form) return;

    // Google Apps Script Web App URL (ends in /exec). While empty, the form
    // runs in preview mode and the name field is free text.
    const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzyGZG01id0VhLFkjGRDnaNHNZgHoKV2Kuj5-jA1JhYq87rOsoCjlXliChsdt3uLWjw/exec';
    const CONTACT = 'Diego.beth21@gmail.com';
    // The guest lookup only answers 3+ letters, and only returns the few names
    // that match — the full guest list is never sent to the browser.
    const MIN_CHARS = 3;

    const $ = id => document.getElementById(id);
    const nameInput = $('rsvp-name');            // hidden — holds the chosen name
    const pickerInput = $('guest-picker-input');
    const pickerList = $('guest-picker-list');
    const pickerNotFound = $('guest-not-found');
    const pickerHint = $('guest-picker-hint');
    const nameErrText = document.querySelector('#rsvp-name-err span');
    const attendanceNote = $('guest-attendance-note');
    const partnerField = $('partnerField');
    const partnerNameEl = $('partner-name');
    const soloNote = $('soloNote');
    const alreadyRepliedNote = $('alreadyRepliedNote');
    const emailInput = $('rsvp-email');
    const party = $('rsvpParty');
    const mealPartner = $('mealPartner');
    const mealSelfName = $('mealSelfName');
    const mealPartnerName = $('mealPartnerName');
    const partnerCourseErrText = document.querySelector('#rsvp-partner-course-err span');
    const submitBtn = $('rsvpSubmit');
    const submitLabel = submitBtn.querySelector('.btn-label');
    const note = $('formNote');
    const success = $('rsvpSuccess');
    const successTitle = $('rsvpSuccessTitle');
    const successMsg = $('rsvpSuccessMsg');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let selectedGuest = null;
    let freeText = !RSVP_ENDPOINT;   // true once the lookup is unavailable
    let results = [];
    let resultsMore = 0;
    let lastSuccess = null;

    // The deadline is soft: late replies are still welcome, just flagged.
    const deadlineNote = $('deadlinePassed');
    if(deadlineNote && new Date() > new Date('2027-02-28T23:59:59Z')) deadlineNote.hidden = false;

    function normaliseName(s){
      return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim().toLowerCase().replace(/\s+/g, ' ');
    }

    // ── Attending + party ──
    function isDeclining(){
      const sel = form.querySelector('input[name="attending"]:checked');
      return !!sel && sel.value === 'Regretfully declines';
    }
    function partnerComing(){
      if(isDeclining() || !selectedGuest || !selectedGuest.partner) return false;
      const radio = form.querySelector('input[name="partnerAttending"]:checked');
      return !!radio && radio.value === 'yes';
    }

    // The second meal card only exists for a named plus-one who is coming.
    function syncMeals(){
      const both = partnerComing();
      mealPartner.hidden = !both;
      mealSelfName.hidden = !both;
      if(both){
        mealSelfName.textContent = selectedGuest.name;
        mealPartnerName.textContent = selectedGuest.partner;
      } else {
        setError($('partner-course-trigger'), 'rsvp-partner-course-err', false);
      }
      partnerCourseErrText.textContent = t('partnerCourseErr', {
        name: selectedGuest && selectedGuest.partner ? selectedGuest.partner : ''
      });
    }

    function syncAttendance(){
      const declining = isDeclining();
      party.classList.toggle('collapsed', declining);
      party.toggleAttribute('inert', declining);
      party.setAttribute('aria-hidden', String(declining));
      party.querySelectorAll('input').forEach(i => { i.disabled = declining; });
      if(selectedGuest){
        partnerField.hidden = !selectedGuest.partner || declining;
        soloNote.hidden = !!selectedGuest.partner || declining;
      } else {
        partnerField.hidden = true;
        soloNote.hidden = true;
      }
      // A welcome never outlives a regret: on decline the note becomes a farewell.
      if(selectedGuest || declining) updateAttendanceNote(selectedGuest);
      else attendanceNote.hidden = true;
      syncMeals();
    }
    form.querySelectorAll('input[name="attending"]').forEach(i => i.addEventListener('change', syncAttendance));
    form.querySelectorAll('input[name="partnerAttending"]').forEach(i => i.addEventListener('change', syncMeals));

    // Attendance comes from the Guests sheet; keep the wording guest-friendly
    // and never show raw sheet text.
    function updateAttendanceNote(g){
      if(!attendanceNote) return;
      if(isDeclining()){
        attendanceNote.textContent = t('farewell');
        attendanceNote.hidden = false;
        return;
      }
      const attendance = normaliseName(g && (g.attendance || g.Attendance));
      let message = '';
      if(attendance === 'full day' || attendance === 'full-day') message = t('welcomeFull');
      else if(attendance === 'evening only' || attendance === 'evening-only') message = t('welcomeEvening');
      else if(attendance === 'day before' || attendance === 'day-before') message = t('welcomeDayBefore');
      attendanceNote.textContent = message;
      attendanceNote.hidden = !message;
    }

    // ── Free-text fallback ──
    // If the lookup can't be reached, the form degrades honestly: the typed
    // name is accepted instead of requiring a pick that can never come.
    function applyFreeTextCopy(){
      pickerInput.setAttribute('placeholder', t('freePlaceholder'));
      if(pickerHint) pickerHint.textContent = t('freeHint');
      if(nameErrText) nameErrText.textContent = t('freeErr');
    }
    function enterFreeTextMode(){
      freeText = true;
      applyFreeTextCopy();
      hideList();
      pickerNotFound.hidden = true;
    }
    if(freeText) applyFreeTextCopy();

    // ── Guest picker (searchable dropdown, server-side lookup) ──
    function hideList(){
      pickerList.hidden = true;
      pickerInput.setAttribute('aria-expanded', 'false');
    }
    function showList(){
      pickerList.hidden = false;
      pickerInput.setAttribute('aria-expanded', 'true');
    }
    function showListMessage(text, notFound){
      pickerList.innerHTML = '';
      const li = document.createElement('li');
      li.className = 'picker-empty';
      li.textContent = text;
      pickerList.appendChild(li);
      pickerNotFound.hidden = !notFound;
      showList();
    }
    function renderResults(){
      if(!results.length){ showListMessage(t('pickerNoMatch'), true); return; }
      pickerNotFound.hidden = true;
      pickerList.innerHTML = '';
      results.forEach((g, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.dataset.index = String(i);
        if(i === 0) li.classList.add('is-active');
        if(g.responded) li.classList.add('is-responded');
        const name = document.createElement('span');
        name.textContent = g.name;
        li.appendChild(name);
        if(g.responded){
          const tag = document.createElement('span');
          tag.className = 'picker-tag';
          tag.textContent = t('pickerReplied');
          li.appendChild(tag);
        }
        li.addEventListener('mousedown', (e) => { e.preventDefault(); pickGuest(g); });
        pickerList.appendChild(li);
      });
      if(resultsMore > 0){
        const more = document.createElement('li');
        more.className = 'picker-empty';
        more.textContent = t('pickerMore', { n: resultsMore });
        pickerList.appendChild(more);
      }
      showList();
    }

    const cache = new Map();
    let searchTimer = 0;
    let searchSeq = 0;
    // Same matching rule as the Apps Script: every typed word starts a word in the name.
    function matches(name, key){
      const words = normaliseName(name).split(' ');
      return key.split(' ').every(tok => words.some(w => w.startsWith(tok)));
    }
    // If a shorter search already returned the COMPLETE set (more === 0), anything
    // longer that starts with it is a subset — filter that locally, no round trip.
    function fromCache(key){
      if(cache.has(key)) return cache.get(key);
      for(let len = key.length - 1; len >= MIN_CHARS; len--){
        const hit = cache.get(key.slice(0, len));
        if(hit && hit.more === 0){
          const out = { guests: hit.guests.filter(g => matches(g.name, key)), more: 0 };
          cache.set(key, out);
          return out;
        }
      }
      return null;
    }
    // Apps Script "cold starts" can take a few seconds. Wake it quietly when the
    // RSVP section comes near, so the first real search is quick.
    let warmed = false;
    function warmUp(){
      if(warmed || freeText) return;
      warmed = true;
      fetch(RSVP_ENDPOINT + '?q=', { method: 'GET' }).catch(() => {});
    }
    const rsvpSection = document.getElementById('rsvp');
    if(rsvpSection && 'IntersectionObserver' in window){
      const warmIo = new IntersectionObserver(entries => {
        if(entries.some(e => e.isIntersecting)){ warmIo.disconnect(); warmUp(); }
      }, { rootMargin: '1200px 0px' });
      warmIo.observe(rsvpSection);
    }
    pickerInput.addEventListener('focus', warmUp, { once: true });
    async function lookup(q){
      const key = normaliseName(q);
      const cached = fromCache(key);
      if(cached) return cached;
      const res = await fetch(RSVP_ENDPOINT + '?q=' + encodeURIComponent(q.trim()), { method: 'GET' });
      if(!res.ok) throw new Error('Lookup replied ' + res.status);
      const data = await res.json();
      // An older deployment returns the whole list without { ok:true } —
      // treat that as unavailable rather than trusting it.
      if(!data || data.ok !== true || !Array.isArray(data.guests)) throw new Error('Lookup unavailable');
      const out = { guests: data.guests, more: Number(data.more) || 0 };
      cache.set(key, out);
      return out;
    }
    function queueSearch(){
      clearTimeout(searchTimer);
      const q = pickerInput.value;
      const seq = ++searchSeq;
      const instant = fromCache(normaliseName(q));
      if(instant){
        results = instant.guests;
        resultsMore = instant.more;
        renderResults();
        return;
      }
      searchTimer = setTimeout(async () => {
        try {
          const found = await lookup(q);
          if(seq !== searchSeq || freeText || selectedGuest) return;
          results = found.guests;
          resultsMore = found.more;
          renderResults();
        } catch (err) {
          if(seq !== searchSeq) return;
          console.warn('Guest lookup unavailable — falling back to free text.', err);
          enterFreeTextMode();
        }
      }, 180);
    }

    function pickGuest(g){
      selectedGuest = g;
      pickerInput.value = g.name;
      nameInput.value = g.name;
      hideList();
      if(pickerHint) pickerHint.hidden = true;
      setError(pickerInput, 'rsvp-name-err', false);
      partnerNameEl.textContent = g.partner || '';
      alreadyRepliedNote.hidden = !g.responded;
      syncAttendance();
    }

    pickerInput.addEventListener('focus', () => {
      if(!freeText && !selectedGuest && pickerInput.value.trim().length >= MIN_CHARS) queueSearch();
    });
    pickerInput.addEventListener('input', () => {
      selectedGuest = null;
      nameInput.value = '';
      results = [];
      alreadyRepliedNote.hidden = true;
      if(pickerHint) pickerHint.hidden = false;
      syncAttendance();
      if(freeText) return;
      const q = pickerInput.value.trim();
      if(q.length >= MIN_CHARS){
        if(!pickerList.querySelector('[role="option"]')) showListMessage(t('pickerSearching'));
        queueSearch();
      } else {
        clearTimeout(searchTimer);
        searchSeq++;
        pickerNotFound.hidden = true;
        if(q.length > 0) showListMessage(t('pickerKeepTyping'));
        else hideList();
      }
    });
    pickerInput.addEventListener('keydown', (e) => {
      const items = Array.from(pickerList.querySelectorAll('li[role="option"]'));
      const activeIdx = items.findIndex(li => li.classList.contains('is-active'));
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        e.preventDefault();
        if(!items.length) return;
        const next = e.key === 'ArrowDown' ? Math.min(activeIdx + 1, items.length - 1) : Math.max(activeIdx - 1, 0);
        items.forEach(li => li.classList.remove('is-active'));
        items[next].classList.add('is-active');
        items[next].scrollIntoView({ block: 'nearest' });
      } else if(e.key === 'Enter'){
        if(!pickerList.hidden && items[activeIdx]){
          e.preventDefault();
          const g = results[Number(items[activeIdx].dataset.index)];
          if(g) pickGuest(g);
        }
      } else if(e.key === 'Escape'){
        hideList();
      }
    });
    document.addEventListener('click', (e) => {
      if(!$('guestPicker').contains(e.target)) hideList();
    });

    // ── Custom styled dropdowns ──
    const selectSyncers = [];
    function initCustomSelects(){
      document.querySelectorAll('[data-custom-select]').forEach(select => {
        const hiddenInput = select.querySelector('input[type="hidden"]');
        const trigger = select.querySelector('.select-trigger');
        const selectedText = select.querySelector('[data-select-value]');
        const menu = select.querySelector('.select-menu');
        const options = Array.from(select.querySelectorAll('[role="option"]'));
        if(!hiddenInput || !trigger || !selectedText || !menu || !options.length) return;

        // The trigger shows the chosen option in the current language, or the
        // "Please choose" placeholder. The value sent to the sheet stays English.
        function syncText(){
          const current = options.find(o => o.getAttribute('aria-selected') === 'true');
          selectedText.textContent = hiddenInput.value === '' || !current ? t('choose') : current.textContent.trim();
          trigger.classList.toggle('is-placeholder', hiddenInput.value === '');
        }
        selectSyncers.push(syncText);

        function close(){
          select.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
          options.forEach(option => option.classList.remove('is-active'));
        }
        function open(){
          select.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
          menu.hidden = false;
          const current = options.find(option => option.getAttribute('aria-selected') === 'true') || options[0];
          current.classList.add('is-active');
          current.scrollIntoView({ block: 'nearest' });
        }
        function choose(option){
          options.forEach(item => {
            item.setAttribute('aria-selected', 'false');
            item.classList.remove('is-active');
          });
          option.setAttribute('aria-selected', 'true');
          hiddenInput.value = option.getAttribute('data-value') || option.textContent.trim();
          syncText();
          // A programmatic value set fires nothing, so announce it (validation listens).
          hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
          close();
          trigger.focus();
        }
        trigger.addEventListener('click', () => { select.classList.contains('open') ? close() : open(); });
        options.forEach(option => {
          option.addEventListener('click', () => choose(option));
          option.addEventListener('mousemove', () => {
            options.forEach(item => item.classList.remove('is-active'));
            option.classList.add('is-active');
          });
        });
        trigger.addEventListener('keydown', event => {
          if(event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' '){
            event.preventDefault();
            open();
          }
          if(event.key === 'Escape') close();
        });
        menu.addEventListener('keydown', event => {
          const activeIndex = options.findIndex(option => option.classList.contains('is-active'));
          let nextIndex = activeIndex >= 0 ? activeIndex : 0;
          if(event.key === 'ArrowDown'){ event.preventDefault(); nextIndex = Math.min(nextIndex + 1, options.length - 1); }
          if(event.key === 'ArrowUp'){ event.preventDefault(); nextIndex = Math.max(nextIndex - 1, 0); }
          if(event.key === 'Enter' || event.key === ' '){
            event.preventDefault();
            const active = options[nextIndex];
            if(active) choose(active);
            return;
          }
          if(event.key === 'Escape'){ close(); trigger.focus(); return; }
          options.forEach(option => option.classList.remove('is-active'));
          options[nextIndex].classList.add('is-active');
        });
        document.addEventListener('click', event => { if(!select.contains(event.target)) close(); });
        syncText();
      });
    }
    initCustomSelects();

    // ── Validation ──
    function setError(input, errId, on){
      if(input) input.setAttribute('aria-invalid', on ? 'true' : 'false');
      const err = $(errId);
      if(err) err.hidden = !on;
    }
    function validate(){
      let firstInvalid = null;
      let nameOk;
      if(freeText){
        nameOk = pickerInput.value.trim().length >= 2;
        if(nameOk) nameInput.value = pickerInput.value.trim();
      } else {
        nameOk = !!selectedGuest && nameInput.value.trim().length > 0;
      }
      setError(pickerInput, 'rsvp-name-err', !nameOk);
      if(!nameOk) firstInvalid = firstInvalid || pickerInput;

      const emailOk = emailRe.test(emailInput.value.trim());
      setError(emailInput, 'rsvp-email-err', !emailOk);
      if(!emailOk) firstInvalid = firstInvalid || emailInput;

      // The kitchen needs a dish for every guest who's coming.
      const courseTrigger = $('course-trigger');
      const courseMissing = !isDeclining() && !$('rsvp-course').value.trim();
      setError(courseTrigger, 'rsvp-course-err', courseMissing);
      if(courseMissing) firstInvalid = firstInvalid || courseTrigger;

      const partnerTrigger = $('partner-course-trigger');
      const partnerMissing = partnerComing() && !$('rsvp-partner-course').value.trim();
      setError(partnerTrigger, 'rsvp-partner-course-err', partnerMissing);
      if(partnerMissing) firstInvalid = firstInvalid || partnerTrigger;

      return firstInvalid;
    }
    emailInput.addEventListener('blur', () => { if(emailInput.getAttribute('aria-invalid') === 'true') setError(emailInput, 'rsvp-email-err', !emailRe.test(emailInput.value.trim())); });
    emailInput.addEventListener('input', () => { if(emailInput.getAttribute('aria-invalid') === 'true' && emailRe.test(emailInput.value.trim())) setError(emailInput, 'rsvp-email-err', false); });
    $('rsvp-course').addEventListener('change', () => setError($('course-trigger'), 'rsvp-course-err', false));
    $('rsvp-partner-course').addEventListener('change', () => setError($('partner-course-trigger'), 'rsvp-partner-course-err', false));

    // ── Collect + submit ──
    function setNote(html, isError){
      note.classList.toggle('is-error', !!isError);
      note.innerHTML = html;
    }
    const val = id => $(id).value.trim();
    function collect(){
      const declining = isDeclining();
      const both = partnerComing();
      return {
        submission_id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2),
        name: nameInput.value.trim(),
        attendance: selectedGuest ? String(selectedGuest.attendance || selectedGuest.Attendance || '').trim() : '',
        email: emailInput.value.trim(),
        attending: declining ? 'Regretfully declines' : 'Joyfully accepts',
        party_size: declining ? '0' : String(1 + (both ? 1 : 0)),
        guests: both ? selectedGuest.partner : '',
        course: declining ? '' : val('rsvp-course'),
        dietary: declining ? '' : val('rsvp-dietary'),
        partner_course: both ? val('rsvp-partner-course') : '',
        partner_dietary: both ? val('rsvp-partner-dietary') : '',
        song: declining ? '' : val('rsvp-song'),
        message: val('rsvp-message'),
        language: LANG,
        submitted_at: new Date().toISOString(),
        user_agent: navigator.userAgent
      };
    }
    async function send(data){
      if(!RSVP_ENDPOINT){
        console.info('[RSVP preview] would submit:', data);
        await new Promise(r => setTimeout(r, 700));
        return;
      }
      // A simple CORS POST (URLSearchParams = no preflight). Apps Script always
      // answers 200, so the JSON body's ok flag is what says whether it saved.
      const res = await fetch(RSVP_ENDPOINT, { method: 'POST', body: new URLSearchParams(data) });
      if(!res.ok) throw new Error('RSVP endpoint replied ' + res.status);
      let reply = null;
      try { reply = JSON.parse(await res.text()); } catch (_) { /* non-JSON: treat as delivered */ }
      if(reply && reply.ok === false) throw new Error(reply.error || 'RSVP rejected');
    }
    function renderSuccess(){
      const data = lastSuccess;
      if(!data) return;
      if(data.attending === 'Regretfully declines'){
        successTitle.textContent = t('declineTitle');
        successMsg.textContent = t('declineMsg');
      } else {
        const first = data.name.split(' ')[0] || t('friend');
        const attendance = normaliseName(data.attendance);
        const timing = attendance === 'evening only' || attendance === 'evening-only' ? t('timingEvening')
          : attendance === 'full day' || attendance === 'full-day' ? t('timingFull')
          : attendance === 'day before' || attendance === 'day-before' ? t('timingDayBefore')
          : t('timingDay');
        successTitle.textContent = t('acceptTitle');
        successMsg.textContent = t('acceptMsg', { timing: timing, first: first });
      }
    }
    function showSuccess(data){
      lastSuccess = data;
      renderSuccess();
      form.hidden = true;
      success.hidden = false;
      success.classList.add('in');
      success.focus();
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstInvalid = validate();
      if(firstInvalid){
        setNote(t('checkFields'), true);
        firstInvalid.focus();
        return;
      }
      const data = collect();
      submitBtn.disabled = true;
      submitBtn.classList.add('is-sending');
      submitLabel.textContent = t('sending');
      setNote('', false);
      try {
        await send(data);
        showSuccess(data);
      } catch(err){
        console.warn('RSVP not saved:', err);
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-sending');
        submitLabel.innerHTML = htmlValue('rsvp.send');
        const link = '<a href="mailto:' + CONTACT + '?subject=Wedding%20RSVP">' + CONTACT + '</a>';
        setNote(escapeHtml(t('sendErr', { email: '\u0000' })).replace('\u0000', link), true);
      }
    });

    // Re-render everything the form wrote itself when the language changes.
    document.addEventListener('langchange', () => {
      if(freeText) applyFreeTextCopy();
      if(pickerHint && selectedGuest) pickerHint.hidden = true;
      syncAttendance();
      selectSyncers.forEach(fn => fn());
      if(results.length && !pickerList.hidden) renderResults();
      if(note.textContent) setNote('', false);
      renderSuccess();
    });

    syncAttendance();
  })();


  // Vine — JS-driven scroll animation (replaces CSS scroll-driven animation which
  // has an inverted range bug on position:fixed full-viewport elements in Chromium).
  (function () {
    var vine = document.querySelector('.vine');
    if (!vine) return;
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      // Reduced-motion: keep vine hidden (CSS default) and bail out.
      return;
    }

    var stem = vine.querySelector('.vine-stem path.stem');
    var scroller = document.scrollingElement || document.documentElement;

    // The stem finishes growing slightly before the page does. Keyed to raw scroll
    // progress the tip sits at progress × viewport height, so the closing screens —
    // footer included — showed a stem that stopped just short of the bottom edge.
    // At 0.92 the spine is fully grown while the last screen is being read.
    var VINE_LEAD = 0.92;

    // The stem's length is no longer a measured number we keep in sync. A measured
    // height goes stale the instant the viewport changes without a clean resize
    // (URL bars, zoom, window snapping, a page that grows after first paint), and
    // each stale value left the tip hanging short of the bottom edge. The reveal is
    // now a clip on a full-height element, so the stem always spans the live
    // viewport and only the scroll maths below needs re-measuring.
    var footer = document.querySelector('footer');
    var pageFoot = scroller.scrollHeight;

    // Where the page actually ends. Not scrollHeight: anything overflowing below
    // the footer (a decorative element, an embedded frame) inflates the scroll
    // range, and progress would then only reach 1 inside a strip of empty space the
    // guest has to scroll into before the vine looks finished. Anchoring to the
    // footer's foot means "bottom of the page" is where the content ends.
    function measureFoot(){
      var top = window.scrollY || scroller.scrollTop || 0;
      var end = footer ? footer.getBoundingClientRect().bottom + top : scroller.scrollHeight;
      pageFoot = Math.min(scroller.scrollHeight, Math.max(end, scroller.clientHeight));
    }
    measureFoot();
    var blooms = Array.from(vine.querySelectorAll('.vine-bloom'));

    // Parse --b0 / --b1 percentage values from each bloom's inline style.
    var bloomData = blooms.map(function (el) {
      var b0 = parseFloat(getComputedStyle(el).getPropertyValue('--b0')) / 100 || 0;
      var b1 = parseFloat(getComputedStyle(el).getPropertyValue('--b1')) / 100 || 0;
      return { el: el, b0: b0, b1: b1 };
    });
    var canopyItems = Array.from(document.querySelectorAll('.canopy-leaf'));
    var canopyData = canopyItems.map(function (el) {
      var tp = parseFloat(getComputedStyle(el).getPropertyValue('--tp')) || 0;
      return { el: el, tp: tp };
    });
    var depthItems = Array.from(document.querySelectorAll('.depth-spec'));
    var depthData = depthItems.map(function (el) {
      var tp = parseFloat(getComputedStyle(el).getPropertyValue('--tp')) || 0;
      return { el: el, tp: tp };
    });
    canopyData = canopyData.concat(depthData);

    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

    function paint() {
      var maxScroll = Math.max(pageFoot - scroller.clientHeight, 1);
      var scrollTop = window.scrollY || scroller.scrollTop || 0;
      var progress = clamp(scrollTop / maxScroll, 0, 1);
      var reveal = clamp(progress / VINE_LEAD, 0, 1);
      vine.style.setProperty('--vine-reveal', (reveal * 100).toFixed(3) + '%');

      // Stem: stroke-dashoffset from 1002 (hidden) → 0 (fully drawn);
      // the clip-path above keeps flowers and endpoint artifacts from outrunning the stem.
      if (stem) stem.style.strokeDashoffset = (1002 * (1 - reveal)).toFixed(1);

      // Blooms: each has its own scroll range [b0, b1]
      bloomData.forEach(function (d) {
        if (progress <= d.b0) {
          d.el.style.opacity = '0';
          d.el.style.scale = '0.14';
        } else if (progress >= d.b1) {
          d.el.style.opacity = '1';
          d.el.style.scale = '1';
        } else {
          var t = (progress - d.b0) / (d.b1 - d.b0);
          d.el.style.opacity = String(clamp(t / 0.35, 0, 1).toFixed(3));
          d.el.style.scale = String((0.14 + 0.86 * clamp(t / 0.60, 0, 1)).toFixed(3));
        }
      });

      // Overdrive B: canopy + depth floaters — each has a --tp (% of page height),
      // blooms when scroll progress approaches it, wilts when scroll passes it.
      canopyData.forEach(function (d) {
        var bloomStart = clamp(d.tp / 100 - 0.08, 0, 1);
        var bloomPeak  = clamp(d.tp / 100 + 0.06, 0, 1);
        var bloomEnd   = clamp(d.tp / 100 + 0.22, 0, 1);
        if (progress <= bloomStart) {
          d.el.style.opacity = '0'; d.el.style.scale = '0.14';
        } else if (progress >= bloomEnd) {
          d.el.style.opacity = '0'; d.el.style.scale = '0.18';
        } else if (progress <= bloomPeak) {
          var enter = (progress - bloomStart) / (bloomPeak - bloomStart);
          d.el.style.opacity = String(clamp(enter / 0.4, 0, 1).toFixed(3));
          d.el.style.scale = String((0.14 + 0.86 * clamp(enter / 0.55, 0, 1)).toFixed(3));
        } else {
          var leave = (progress - bloomPeak) / (bloomEnd - bloomPeak);
          d.el.style.opacity = String(clamp((1 - leave / 0.6), 0, 1).toFixed(3));
          d.el.style.scale = String(clamp((1 - leave * 0.4), 0.6, 1).toFixed(3));
        }
      });
    }

    // Scroll fires faster than we can paint, and every read here forces layout on
    // a fixed element spanning the whole document — so reads and writes are
    // collected into one frame.
    var frame = 0;
    function tick(){
      if (frame) return;
      frame = requestAnimationFrame(function(){ frame = 0; paint(); });
    }

    tick(); // set initial state
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', function(){ measureFoot(); tick(); }, { passive: true });
    window.addEventListener('orientationchange', function(){ measureFoot(); tick(); }, { passive: true });
    window.addEventListener('load', function(){ measureFoot(); tick(); }, { passive: true });
    // Mobile URL bars resize the visual viewport without always firing a window
    // resize, which is the other way the scroll maths used to drift out of step.
    if (window.visualViewport) window.visualViewport.addEventListener('resize', function(){ measureFoot(); tick(); }, { passive: true });

    // Photographs and the journey map arrive after first paint and move where the
    // page actually ends, which used to leave progress measured against a shorter
    // page than the one on screen. Re-measure whenever the document reflows.
    if ('ResizeObserver' in window){
      var vineObserver = new ResizeObserver(function(){ measureFoot(); tick(); });
      vineObserver.observe(document.documentElement);
      vineObserver.observe(document.body);
      if (footer) vineObserver.observe(footer);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ measureFoot(); tick(); });
  })();


  /* ============================================================
     INVITATION OPENING + LANGUAGE CHOICE
     First visit: the letter waits with a bilingual chooser; picking a
     flag saves the language and then the letter opens. Returning
     guests (language saved) get the usual one-time opening.
     Reduced motion: the chooser still appears, but simply disappears
     once a language is picked — no unfolding.
     ============================================================ */
  (function () {
    var root = document.documentElement;
    var veil = document.getElementById('inviteVeil');
    var picking = root.classList.contains('lang-pick');
    if (!veil) { root.classList.remove('invite', 'lang-pick'); return; }
    if (!picking && !root.classList.contains('invite')) { veil.remove(); return; }

    var done = false;
    function finish(){
      if (done) return; done = true;
      root.classList.remove('invite', 'lang-pick', 'lang-chosen');
      if (veil.parentNode) veil.parentNode.removeChild(veil);
    }
    function play(timeout){
      if (!root.classList.contains('invite')) { finish(); return; }
      var bottom = veil.querySelector('.veil-bottom');
      if (bottom) bottom.addEventListener('animationend', finish, { once: true });
      setTimeout(finish, timeout); // fail-safe: never leave the page covered
    }

    if (!picking) { play(3000); return; }

    var buttons = Array.from(veil.querySelectorAll('[data-set-lang]'));
    veil.removeAttribute('aria-hidden');
    veil.setAttribute('role', 'dialog');
    veil.setAttribute('aria-modal', 'true');
    veil.setAttribute('aria-labelledby', 'veilLangPrompt');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.dataset.setLang);
        veil.setAttribute('aria-hidden', 'true');
        veil.removeAttribute('role');
        root.classList.add('lang-chosen');
        root.classList.remove('lang-pick');
        play(1800);
      }, { once: true });
    });
    // Keep keyboard focus on the two choices while the letter is closed.
    veil.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !root.classList.contains('lang-pick')) return;
      e.preventDefault();
      var i = buttons.indexOf(document.activeElement);
      var next = e.shiftKey ? (i <= 0 ? buttons.length - 1 : i - 1) : (i + 1) % buttons.length;
      buttons[next].focus();
    });
    if (buttons[0]) buttons[0].focus({ preventScroll: true });
  })();

  /* Hero tilt — a gentle 3D lean toward the pointer. Mouse-only and skipped
     entirely under reduced motion; work is done once per frame, only while
     the pointer is actually moving (no permanent animation loop). */
  (function () {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const frame = document.querySelector('.hero-frame');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let targetX = 0, targetY = 0, raf = 0;
    function apply(){
      raf = 0;
      if (frame) frame.style.transform = `rotateY(${targetX * 8}deg) rotateX(${targetY * -6}deg)`;
      if (heroContent) heroContent.style.transform = `rotateY(${targetX * 6}deg) rotateX(${targetY * -4}deg)`;
    }
    function queue(){ if (!raf) raf = requestAnimationFrame(apply); }
    hero.addEventListener('mousemove', (e) => {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
      queue();
    });
    hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; queue(); });
  })();


  // Gallery lightbox: guests pause on one photograph without leaving the page.
  // Arrow keys navigate between photos; focus-trap inside the dialog; fade+scale transition.
  (function initGalleryLightbox(){
    var lightbox = document.getElementById('galleryLightbox');
    var lightboxImage = document.getElementById('galleryLightboxImage');
    var lightboxCaption = document.getElementById('galleryLightboxCaption');
    var closeButton = document.getElementById('galleryLightboxClose');
    var items = Array.from(document.querySelectorAll('.gw-item[role="button"]'));
    if(!lightbox || !lightboxImage || !closeButton || !items.length) return;

    var currentIndex = -1;
    var navPrev = null;
    var navNext = null;
    var lastFocused = null;

    // ── Build arrow-nav buttons (injected so the HTML stays clean) ──
    navPrev = document.createElement('button');
    navPrev.className = 'gallery-lightbox-nav nav-prev';
    navPrev.setAttribute('aria-label', t('photoPrev'));
    navPrev.innerHTML = '&#8249;';
    navPrev.addEventListener('click', function(e){ e.stopPropagation(); navigate(-1); });
    lightbox.querySelector('.gallery-lightbox-inner').appendChild(navPrev);

    navNext = document.createElement('button');
    navNext.className = 'gallery-lightbox-nav nav-next';
    navNext.setAttribute('aria-label', t('photoNext'));
    navNext.innerHTML = '&#8250;';
    navNext.addEventListener('click', function(e){ e.stopPropagation(); navigate(1); });
    lightbox.querySelector('.gallery-lightbox-inner').appendChild(navNext);

    function navigate(dir){
      var next = currentIndex + dir;
      if(next < 0) next = items.length - 1;
      if(next >= items.length) next = 0;
      showItem(items[next], next);
    }

    function showItem(item, idx){
      var image = item.querySelector('img');
      var caption = item.querySelector('figcaption');
      if(!image) return;
      currentIndex = idx;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || '';
      var capText = caption ? caption.textContent : '';
      var counter = ' <em>' + (idx + 1) + ' / ' + items.length + '</em>';
      lightboxCaption.innerHTML = capText + counter;
    }

    function close(){
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      // Return focus to the photograph that opened the dialog.
      if(lastFocused && lastFocused.focus){ lastFocused.focus(); lastFocused = null; }
      // Wait for the fade transition (0.22s) then hide from the DOM.
      clearTimeout(lightbox._closeTimer);
      lightbox._closeTimer = setTimeout(function(){
        lightbox.hidden = true;
      }, 240);
    }
    function open(item){
      var idx = items.indexOf(item);
      if(idx === -1) idx = 0;
      showItem(item, idx);
      lightbox.hidden = false;
      // Force reflow so the transition class takes effect
      lightbox.offsetHeight;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lastFocused = document.activeElement;
      closeButton.focus();
    }

    items.forEach(function(item){
      item.addEventListener('click', function(){ open(item); });
      item.addEventListener('keydown', function(event){
        if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); open(item); }
      });
    });

    closeButton.addEventListener('click', close);
    lightbox.addEventListener('click', function(event){ if(event.target === lightbox) close(); });

    document.addEventListener('keydown', function(event){
      if(lightbox.hidden) return;
      if(event.key === 'Escape'){ close(); return; }
      if(event.key === 'ArrowLeft'){ navigate(-1); return; }
      if(event.key === 'ArrowRight'){ navigate(1); return; }
      // Focus trap: Tab / Shift+Tab cycles between close + nav buttons only.
      if(event.key === 'Tab'){
        var focusable = [closeButton, navPrev, navNext].filter(function(el){ return el && el.offsetParent !== null; });
        if(!focusable.length) return;
        var idx = focusable.indexOf(document.activeElement);
        if(event.shiftKey){
          var prev = idx <= 0 ? focusable.length - 1 : idx - 1;
          event.preventDefault();
          focusable[prev].focus();
        } else {
          var next = idx >= focusable.length - 1 ? 0 : idx + 1;
          event.preventDefault();
          focusable[next].focus();
        }
      }
    });

    document.addEventListener('langchange', function(){
      navPrev.setAttribute('aria-label', t('photoPrev'));
      navNext.setAttribute('aria-label', t('photoNext'));
    });
    // Touch swipe support
    var touchStartX = 0;
    lightbox.addEventListener('touchstart', function(e){
      if(e.target === navPrev || e.target === navNext || e.target === closeButton) return;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function(e){
      if(!touchStartX) return;
      var diff = e.changedTouches[0].clientX - touchStartX;
      var threshold = 60;
      if(diff > threshold) navigate(-1);
      else if(diff < -threshold) navigate(1);
      touchStartX = 0;
    });
  })();


  /* ============================================================
     SCROLL JOURNEY MAP — one deterministic progress source.
     Scroll position controls route drawing, active destination and
     camera movement. requestAnimationFrame prevents work per event.
     ============================================================ */
  (function initScrollJourneyMap(){
    const section = document.getElementById('storymap');
    if(!section) return;

    const camera = document.getElementById('journeyMapCamera');
    const caption = document.getElementById('journeyMapCaption');
    const cards = Array.from(section.querySelectorAll('[data-stage-card]'));
    const markers = Array.from(section.querySelectorAll('[data-stage]'));
    const routes = [
      document.getElementById('journeyRoute01'),
      document.getElementById('journeyRoute02'),
      document.getElementById('journeyRoute03')
    ];

    if(!camera || !caption || !cards.length || markers.length !== 4 || routes.some(r => !r)) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let ticking = false;

    const stageLabel = i => t('stageLabels')[i];

    // Geographic-ish camera targets in the SVG coordinate system.
    // Values are deliberately gentle so the experience remains editorial,
    // rather than feeling like a conventional interactive map.
    const cameraTargets = [
      { x: 0, y: 4, scale: 1.02 },
      { x: -2, y: -2, scale: 1.04 },
      { x: -8, y: 8, scale: 1.08 },
      { x: 7, y: 4, scale: 1.07 }
    ];

    function clamp(value, min, max){
      return Math.max(min, Math.min(max, value));
    }

    function smoothstep(t){
      t = clamp(t, 0, 1);
      return t * t * (3 - 2 * t);
    }

    function sectionProgress(){
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const travel = Math.max(1, rect.height - viewport * 0.46);
      return clamp((viewport * 0.20 - rect.top) / travel, 0, 1);
    }

    function setRouteProgress(path, progress){
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length * (1 - progress)}`;
    }

    // Pre-compute route lengths once; SVG geometry itself never changes.
    routes.forEach(route => {
      const length = route.getTotalLength();
      route.dataset.length = String(length);
      route.style.strokeDasharray = String(length);
      route.style.strokeDashoffset = String(length);
    });

    function update(progress){
      const segment = progress * 4;
      const activeStage = Math.min(3, Math.floor(segment));
      const local = smoothstep(segment - activeStage);

      // Route 1 draws during 0.00–0.50 of stage 2,
      // route 2 during stage 3, route 3 during stage 4.
      const routeProgress = [
        clamp((progress - 0.25) / 0.25, 0, 1),
        clamp((progress - 0.50) / 0.25, 0, 1),
        clamp((progress - 0.75) / 0.25, 0, 1)
      ];

      routes.forEach((route, index) => {
        const length = Number(route.dataset.length);
        route.style.strokeDashoffset = String(length * (1 - routeProgress[index]));
        route.classList.toggle('route-complete', routeProgress[index] >= 1);
      });

      markers.forEach((marker, index) => {
        const visible = index === 0
          ? progress >= 0.02
          : progress >= [0.50, 0.75, 0.99][index - 1];

        marker.classList.toggle('is-visible', visible);
        marker.classList.toggle('is-active', index === activeStage);
      });

      cards.forEach((card, index) => {
        card.classList.toggle('is-active', index === activeStage);
        card.classList.toggle('is-complete', index < activeStage);
      });

      const a = cameraTargets[activeStage];
      const b = cameraTargets[Math.min(3, activeStage + 1)];
      const blend = local * (activeStage < 3 ? 0.65 : 0);
      const x = a.x + (b.x - a.x) * blend;
      const y = a.y + (b.y - a.y) * blend;
      const scale = a.scale + (b.scale - a.scale) * blend;

      // Once Leaflet takes over (.leaflet-ready) it owns the caption and the
      // camera; the SVG system keeps only the story cards in sync, so the
      // caption no longer flickers between two label formats while scrolling.
      if(!section.classList.contains('leaflet-ready')){
        camera.style.transform = `translate3d(${x}%, ${y}%, 0) scale(${scale})`;
        caption.textContent = stageLabel(activeStage);
      }
    }

    function tick(){
      ticking = false;
      update(sectionProgress());
    }

    function requestUpdate(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(tick);
    }

    if(reduceMotion.matches){
      // Accessible static state: no camera movement or animated drawing.
      routes.forEach(route => {
        route.style.strokeDashoffset = '0';
      });
      markers.forEach(marker => {
        marker.classList.add('is-visible');
        marker.classList.toggle('is-active', marker.dataset.stage === '3');
      });
      cards.forEach((card, index) => {
        card.classList.add('is-complete');
        card.classList.toggle('is-active', index === 3);
      });
      caption.textContent = stageLabel(3);
      document.addEventListener('langchange', () => {
        if(!section.classList.contains('leaflet-ready')) caption.textContent = stageLabel(3);
      });
      camera.style.transform = 'none';
      return;
    }

    window.addEventListener('scroll', requestUpdate, { passive:true });
    document.addEventListener('langchange', requestUpdate);
    window.addEventListener('resize', requestUpdate, { passive:true });
    reduceMotion.addEventListener?.('change', requestUpdate);

    // Handles direct navigation / refresh midway through the page.
    update(sectionProgress());
  })();


  /* ============================================================
     LIVING SCHEDULE — on the wedding day the running order marks
     whatever is happening right now and keeps itself up to date.
     Always read on UK time (the venue's clock), wherever the guest is.
     ============================================================ */
  (function(){
    const schedule = document.getElementById('schedule');
    const pill = document.getElementById('dayStatus');
    if(!schedule || !pill) return;
    const items = Array.from(schedule.querySelectorAll('.schedule-item'));
    if(!items.length) return;
    const DAY = 20270429;
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    });
    function ukNow(){
      const parts = fmt.formatToParts(new Date());
      const get = type => Number((parts.find(p => p.type === type) || {}).value || 0);
      return { date: get('year') * 10000 + get('month') * 100 + get('day'), mins: get('hour') * 60 + get('minute') };
    }
    const minutesFor = item => Number(item.dataset.start || 0);
    const dot = '<span class="dot"></span>';

    function paint(){
      const now = ukNow();
      items.forEach(i => i.classList.remove('is-now', 'is-done'));
      if(now.date !== DAY){
        pill.classList.remove('live');
        pill.innerHTML = dot + t(now.date < DAY ? 'statusBefore' : 'statusAfter');
        return;
      }
      let current = null;
      items.forEach(item => {
        if(now.mins >= minutesFor(item)){ item.classList.add('is-done'); current = item; }
      });
      pill.classList.add('live');
      if(current){
        current.classList.remove('is-done');
        current.classList.add('is-now');
        const name = current.querySelector('.schedule-name');
        pill.innerHTML = dot + t('statusNow', { name: escapeHtml(name ? name.textContent : '') });
      } else {
        const start = minutesFor(items[0]);
        const time = String(Math.floor(start / 60)).padStart(2, '0') + ':' + String(start % 60).padStart(2, '0');
        pill.innerHTML = dot + t('statusDoors', { time: time });
      }
    }
    paint();
    setInterval(paint, 30000);
    document.addEventListener('langchange', paint);
  })();

  /* ============================================================
     ADD TO CALENDAR — builds an .ics on the fly, running order in
     the notes (in the guest's language), so guests can save the day
     in one tap. Times are UTC: 29 April is BST (UTC+1), so 12:00–22:00
     at the manor is 11:00–21:00Z.
     ============================================================ */
  (function(){
    const buttons = Array.from(document.querySelectorAll('[data-ics]'));
    if(!buttons.length) return;
    // RFC 5545 text escaping + 75-octet line folding.
    const esc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    function fold(line){
      const bytes = new TextEncoder();
      if(bytes.encode(line).length <= 75) return line;
      const out = [];
      let chunk = '';
      for(const ch of line){
        if(bytes.encode(chunk + ch).length > (out.length ? 74 : 75)){ out.push(chunk); chunk = ''; }
        chunk += ch;
      }
      out.push(chunk);
      return out.join('\r\n ');
    }
    function stamp(d){ return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    function build(){
      const rows = Array.from(document.querySelectorAll('#schedule .schedule-item')).map(item => {
        const time = item.querySelector('.schedule-time');
        const name = item.querySelector('.schedule-name');
        return (time ? time.textContent.trim() : '') + ': ' + (name ? name.textContent.trim() : '');
      });
      const desc = [t('icsOrder'), ...rows, '', t('icsDress'), 'Southdowns Manor, Dumpford Lane, Petersfield GU31 5JN'].join('\n');
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Diego and Bethany//Wedding//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:diego-bethany-wedding-20270429@southdownsmanor',
        'DTSTAMP:' + stamp(new Date()),
        'DTSTART:20270429T110000Z',
        'DTEND:20270429T210000Z',
        'SUMMARY:' + esc(t('icsSummary')),
        'LOCATION:' + esc('Southdowns Manor, Dumpford Lane, Petersfield GU31 5JN'),
        'DESCRIPTION:' + esc(desc),
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:' + esc(t('icsAlarm')),
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ];
      return lines.map(fold).join('\r\n');
    }
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const blob = new Blob([build()], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diego-and-bethany-29-april-2027.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        const label = btn.querySelector('.ics-label');
        if(label){
          const key = label.dataset.i18n;
          label.textContent = t('icsSaved');
          clearTimeout(btn._icsTimer);
          btn._icsTimer = setTimeout(() => { label.innerHTML = htmlValue(key); }, 2600);
        }
      });
    });
  })();

  /* ============================================================
     PLAN MY JOURNEY — a guest types their town or postcode and gets
     a real drive time to the manor, plus the rail alternative.
     Geocoding: postcodes.io · Routing: OSRM (both open, no key).
     Falls back to a straight-line estimate if routing is unreachable.
     Italian shows kilometres; English shows miles.
     ============================================================ */
  (function(){
    const form = document.getElementById('journeyForm');
    if(!form) return;
    const input = document.getElementById('journeyFrom');
    const out = document.getElementById('journeyResult');
    const btn = document.getElementById('journeyBtn');
    const VENUE = { lat: 50.9522, lon: -0.8459 };
    const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
    const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>';
    let lastView = null;   // re-rendered on language change

    function say(html, tone){
      out.hidden = false;
      out.className = 'journey-result' + (tone ? ' journey-result--' + tone : '');
      out.innerHTML = html;
    }
    function haversine(a, b){
      const R = 6371, toRad = x => x * Math.PI / 180;
      const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    }
    function pretty(mins){
      const m = Math.round(mins);
      if(m < 60) return m + ' ' + t('unitMin');
      const h = Math.floor(m / 60), r = m % 60;
      return h + ' ' + (h > 1 ? t('unitHrs') : t('unitHr')) + (r ? ' ' + r + ' ' + t('unitMin') : '');
    }
    async function geocode(q){
      const clean = q.trim();
      if(POSTCODE.test(clean)){
        const r = await fetch('https://api.postcodes.io/postcodes/' + encodeURIComponent(clean.replace(/\s+/g, '')));
        if(!r.ok) throw new Error('postcode');
        const j = await r.json();
        return { lat: j.result.latitude, lon: j.result.longitude, label: j.result.postcode };
      }
      // postcodes.io returns fuzzy matches in no useful order — "Guildford" can come
      // back as a hamlet in Pembrokeshire. Score the candidates: exact name first,
      // then real settlements (towns/cities) over farms and hamlets.
      const r = await fetch('https://api.postcodes.io/places?q=' + encodeURIComponent(clean) + '&limit=20');
      if(!r.ok) throw new Error('place');
      const j = await r.json();
      if(!j.result || !j.result.length) throw new Error('place');
      const want = clean.toLowerCase();
      const RANK = { 'City': 5, 'Town': 4, 'Village': 3, 'Suburban Area': 3, 'Hamlet': 1, 'Other Settlement': 1 };
      const score = p => {
        const name = (p.name_1 || '').toLowerCase();
        let s = 0;
        if(name === want) s += 100;
        else if(name.startsWith(want)) s += 40;
        s += (RANK[p.local_type] || 0) * 6;
        if(p.country === 'England') s += 8;
        return s;
      };
      const p = j.result.slice().sort((a, b) => score(b) - score(a))[0];
      const county = p.county_unitary || p.region || '';
      return { lat: p.latitude, lon: p.longitude, label: p.name_1 + (county ? ', ' + county : '') };
    }
    async function route(from){
      const url = 'https://router.project-osrm.org/route/v1/driving/' +
        from.lon + ',' + from.lat + ';' + VENUE.lon + ',' + VENUE.lat + '?overview=false';
      const r = await fetch(url);
      if(!r.ok) throw new Error('route');
      const j = await r.json();
      if(!j.routes || !j.routes.length) throw new Error('route');
      return { mins: j.routes[0].duration / 60, km: j.routes[0].distance / 1000, estimated: false };
    }
    function renderResult(v){
      const miles = v.leg.km * 0.621371;
      const distance = LANG === 'it' ? v.leg.km : miles;
      say(
        '<p class="journey-from">' + t('planFrom', { from: escapeHtml(v.from.label) }) + '</p>' +
        '<div class="journey-stats">' +
          '<div class="journey-stat"><span class="jv">' + pretty(v.leg.mins) + '</span><span class="jl">' + t('planDriving') + '</span></div>' +
          '<div class="journey-stat"><span class="jv">' + Math.round(distance) + '</span><span class="jl">' + t('planDistance') + '</span></div>' +
          '<div class="journey-stat"><span class="jv">' + pretty(v.leg.mins + 25) + '</span><span class="jl">' + t('planBuffer') + '</span></div>' +
        '</div>' +
        '<p class="journey-note">' + t('planArrive') + (v.leg.estimated ? t('planEstimate') : '') + '</p>' +
        '<p class="journey-note">' + (miles > 28 ? t('planTrainFar') : t('planTrainNear')) + '</p>' +
        '<a class="ext-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&origin=' +
          encodeURIComponent(v.query) + '&destination=Southdowns+Manor+GU31+5JN">' + t('planOpenRoute') + ARROW + '</a>',
        'ok'
      );
    }
    function renderView(){
      if(!lastView) return;
      if(lastView.kind === 'ok') renderResult(lastView);
      else if(lastView.kind === 'need') say(t('planNeedInput'), 'warn');
      else if(lastView.kind === 'notfound'){
        const link = '<a class="ext-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=Southdowns+Manor+GU31+5JN">' + t('planNotFoundLink') + '</a>';
        say(t('planNotFound', { link: link }), 'warn');
      }
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = (input.value || '').trim();
      if(q.length < 2){
        lastView = { kind: 'need' };
        renderView();
        input.focus();
        return;
      }
      btn.disabled = true;
      btn.classList.add('is-busy');
      lastView = null;
      say('<span class="journey-spin" aria-hidden="true"></span>' + t('planBusy'));
      try {
        const from = await geocode(q);
        let leg;
        try {
          leg = await route(from);
        } catch (err) {
          const km = haversine(from, VENUE);
          leg = { mins: (km / 62) * 60 * 1.28, km: km * 1.22, estimated: true };
        }
        lastView = { kind: 'ok', from: from, leg: leg, query: q };
      } catch (err) {
        lastView = { kind: 'notfound' };
      } finally {
        renderView();
        btn.disabled = false;
        btn.classList.remove('is-busy');
      }
    });
    document.addEventListener('langchange', renderView);
  })();

  /* ============================================================
     STAYS — "closest first" flattens every place to stay into one
     list ordered by drive time from the manor.
     ============================================================ */
  (function(){
    const toggle = document.getElementById('staySort');
    const tiers = document.querySelector('.stay-tiers');
    if(!toggle || !tiers) return;
    const label = toggle.querySelector('.sort-label');
    const flat = document.createElement('div');
    flat.className = 'stays stays--flat';
    flat.hidden = true;
    const cards = Array.from(tiers.querySelectorAll('.stay')).map(card => {
      const meta = card.querySelector('.stay-meta');
      const mins = meta ? Number((meta.textContent.match(/(\d+)\s*min/) || [])[1] || 999) : 999;
      const tierLabel = card.closest('.tier')?.querySelector('.tier-label');
      const clone = card.cloneNode(true);
      const tag = document.createElement('span');
      tag.className = 'stay-tier-tag';
      tag.innerHTML = tierLabel ? tierLabel.innerHTML : '';
      if(tierLabel && tierLabel.dataset.i18n) tag.dataset.i18n = tierLabel.dataset.i18n; // follows the language
      clone.appendChild(tag);
      return { mins, clone };
    }).sort((a, b) => a.mins - b.mins);
    cards.forEach(c => flat.appendChild(c.clone));
    tiers.parentNode.insertBefore(flat, tiers.nextSibling);
    const syncLabel = () => {
      label.textContent = toggle.getAttribute('aria-pressed') === 'true' ? t('sortOff') : t('sortOn');
    };
    toggle.addEventListener('click', () => {
      const on = toggle.getAttribute('aria-pressed') === 'true';
      toggle.setAttribute('aria-pressed', String(!on));
      flat.hidden = on;
      tiers.hidden = !on;
      syncLabel();
    });
    document.addEventListener('langchange', syncLabel);
  })();


// Leaflet map init — deferred until #storymap nears the viewport (lazy
// bootstrapper at the end of this file). Leaflet (~145KB) plus its stylesheet
// and satellite tiles are only fetched by guests who actually reach the map.
   // Interactive European journey map using Leaflet + satellite imagery.
  function initInteractiveJourneyMap(){
    var mapEl = document.getElementById('journeyLeafletMap');
    if(!mapEl || typeof L === 'undefined') return;

    var places = [
      { name:'Swansea', sub:'Wales · beginning', coords:[51.6214, -3.9436] },
      { name:'Southampton', sub:'England · harbour', coords:[50.9097, -1.4044] },
      { name:'Reykjavík', sub:'Iceland · Atlantic', coords:[64.1466, -21.9426] },
      { name:'Geiranger', sub:'Norway · fjords', coords:[62.1015, 7.2078] }
    ];
    places[2].name = 'Reykjav' + String.fromCharCode(237) + 'k';
    places[0].label = 'SWANSEA'; places[0].flag = '🇬🇧';
    places[1].label = 'SOUTHAMPTON'; places[1].flag = '🇬🇧';
    places[2].label = 'REYKJAVIK'; places[2].flag = '🇮🇸';
    places[3].name = 'Geirangerfjord'; places[3].label = 'GEIRANGERFJORD'; places[3].flag = '🇳🇴';
    var map = L.map(mapEl, { zoomControl:true, scrollWheelZoom:false, doubleClickZoom:false, attributionControl:true, preferCanvas:true, zoomSnap:.1, zoomDelta:.25, zoomAnimation:false }).setView([56.2, -4.7], 4.2);
    // Leaflet loaded — swap the SVG illustrated map for the interactive satellite map.
    document.getElementById('storymap').classList.add('leaflet-ready');
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom:19, attribution:'&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    }).addTo(map);

    var routeStyle = { color:'#e7192c', weight:5, opacity:.96, dashArray:'1 0', lineCap:'round', lineJoin:'round' };
    var routeSegments = places.slice(0, -1).map(function(place, index){
      var start = place.coords;
      var end = places[index + 1].coords;
      var points = [];
      for(var pointIndex = 0; pointIndex <= 48; pointIndex++){
        var frac = pointIndex / 48;   // not "t": that would hide the t() translator
        points.push([start[0] + (end[0] - start[0]) * frac, start[1] + (end[1] - start[1]) * frac]);
      }
      return { points:points, layer:L.polyline([points[0]], routeStyle).addTo(map) };
    });

    // Tooltip card for each stop; the country line follows the page language.
    function labelHtml(index){
      var place = places[index];
      return '<div class="journey-map-label"><span class="journey-map-label-flag">' + place.flag + '</span><strong>' + place.label + '</strong><small>' + t('placeCountries')[index] + '</small></div>';
    }
    var markers = places.map(function(place, index){
      var pin = L.divIcon({ className:'journey-pin-wrap', html:'<div class="journey-map-pin"><span>' + (index + 1) + '</span></div>', iconSize:[32,32], iconAnchor:[16,16] });
      var marker = L.marker(place.coords, { icon:pin, keyboard:true, title:place.name }).addTo(map);
      marker.bindTooltip(labelHtml(index), { className:'journey-tooltip', direction:'top', offset:[0,-18], opacity:1 });
      marker.on('click', function(){ setStage(index, true); });
      return marker;
    });

    var vehicleIcons = {
      car:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16h14l-1.2-5.2a1.5 1.5 0 0 0-1.5-1.2H7.7a1.5 1.5 0 0 0-1.5 1.2L5 16Z"/><path d="M4 16v2.5M20 16v2.5M7 16h.1M17 16h.1M4 13h16"/></svg>',
      plane:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13.5 21 7l-2.4 4.2-5.1 2.1 1.9 5.3-1.8.7-3.2-4.8-4.7 1.9-2.4-1.1 3.7-2.2L3 13.5Z"/></svg>',
      cruise:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15h16l-2.5 4H6.5L4 15Z"/><path d="M8 15V9h6l2 6M10 9V6h3v3M3 21c1.3-.8 2.7-.8 4 0 1.3.8 2.7.8 4 0 1.3-.8 2.7-.8 4 0 1.3.8 2.7.8 4 0"/></svg>'
    };
    vehicleIcons.car = '<img src="Assets/Car%20Icon.webp" alt="" aria-hidden="true">';
    vehicleIcons.plane = '<img src="Assets/Airplane%20icon.webp" alt="" aria-hidden="true">';
    vehicleIcons.cruise = '<img src="Assets/Cruise%20Icon.webp" alt="" aria-hidden="true">';
    var vehicleConfigs = [
      { type:'car', label:'By car', segment:0, zoom:6.2 },
      { type:'plane', label:'By plane', segment:1, zoom:4.5 },
      { type:'cruise', label:'By cruise', segment:2, zoom:5.1 }
    ];
    var vehicles = vehicleConfigs.map(function(config){
      var icon = L.divIcon({ className:'journey-vehicle-wrap', html:'<div class="journey-vehicle-icon ' + config.type + '">' + vehicleIcons[config.type] + '</div>', iconSize:[42,42], iconAnchor:[21,21] });
      var vehicle = L.marker(places[config.segment].coords, { icon:icon, keyboard:false, interactive:false, zIndexOffset:600 }).addTo(map);
      vehicle.bindTooltip(t('vehicles')[vehicleConfigs.indexOf(config)], { direction:'top', offset:[0,-18], opacity:.9 });
      vehicle.setOpacity(0);
      return vehicle;
    });

    var activeIndex = -1;
    function setStage(index, focus){
      if(index < 0 || index >= places.length || index === activeIndex && !focus) return;
      activeIndex = index;
      var target = places[index];
      if(focus && !reducedMotion){ map.flyTo(target.coords, index < 2 ? 5 : 5.5, { duration:.9, easeLinearity:.25 }); }
      markers.forEach(function(marker, markerIndex){
        if(markerIndex === index) marker.openTooltip(); else marker.closeTooltip();
      });
      var caption = document.getElementById('journeyMapCaption');
      if(caption) caption.textContent = target.name + ' · ' + t('placeSubs')[index];
    }

    function clamp(value, min, max){ return Math.max(min, Math.min(max, value)); }
    function sectionProgress(){
      var section = document.getElementById('storymap');
      var rect = section.getBoundingClientRect();
      var viewport = window.innerHeight || 1;
      var travel = Math.max(1, rect.height - viewport * 0.46);
      return clamp((viewport * 0.20 - rect.top) / travel, 0, 1);
    }
    function renderJourneyProgress(progress){
      var journeyPosition = progress * routeSegments.length;
      var activeStage = Math.min(places.length - 1, Math.floor(journeyPosition));
      routeSegments.forEach(function(segment, index){
        var legProgress = clamp(journeyPosition - index, 0, 1);
        var pointCount = Math.max(1, Math.ceil(legProgress * (segment.points.length - 1)) + 1);
        segment.layer.setLatLngs(segment.points.slice(0, pointCount));
        segment.layer.setStyle({ opacity: legProgress > 0 ? .94 : .12 });
      });
      vehicleConfigs.forEach(function(config, vehicleIndex){
        var legProgress = clamp(journeyPosition - config.segment, 0, 1);
        var vehicle = vehicles[vehicleIndex];
        var points = routeSegments[config.segment].points;
        var pointIndex = Math.min(points.length - 1, Math.floor(legProgress * (points.length - 1)));
        vehicle.setLatLng(points[pointIndex]);
        vehicle.setOpacity(legProgress > 0 && legProgress < 1 ? 1 : 0);
      });
      markers.forEach(function(marker, index){ marker.setOpacity(index <= activeStage ? 1 : .34); });
      var cameraSegment = Math.min(routeSegments.length - 1, Math.floor(journeyPosition));
      var cameraProgress = clamp(journeyPosition - cameraSegment, 0, 1);
      var cameraPoints = routeSegments[cameraSegment].points;
      var cameraPoint = cameraPoints[Math.min(cameraPoints.length - 1, Math.floor(cameraProgress * (cameraPoints.length - 1)))];
      var currentZoom = vehicleConfigs[cameraSegment].zoom;
      var nextZoom = vehicleConfigs[Math.min(vehicleConfigs.length - 1, cameraSegment + 1)].zoom;
      var zoomTransition = smoothstep(clamp((cameraProgress - .68) / .32, 0, 1));
      var targetZoom = currentZoom + (nextZoom - currentZoom) * zoomTransition;
      if(progress < .10){
        var overviewProgress = smoothstep(progress / .10);
        cameraPoint = [
          56.2 + (places[0].coords[0] - 56.2) * overviewProgress,
          -4.7 + (places[0].coords[1] + 4.7) * overviewProgress
        ];
        targetZoom = 4.2 + (vehicleConfigs[0].zoom - 4.2) * overviewProgress;
      }
      if(renderedZoom === null || reducedMotion){
        renderedZoom = targetZoom;
        renderedCenter = cameraPoint.slice();
      } else {
        renderedZoom += (targetZoom - renderedZoom) * .18;
        renderedCenter[0] += (cameraPoint[0] - renderedCenter[0]) * .18;
        renderedCenter[1] += (cameraPoint[1] - renderedCenter[1]) * .18;
      }
      map.setView(renderedCenter || cameraPoint, renderedZoom, { animate:false });
      setStage(activeStage, false);
    }

    map.fitBounds(L.latLngBounds(places.map(function(place){ return place.coords; })), { padding:[34,34] });
    var ticking = false;
    var renderedZoom = null;
    var renderedCenter = null;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function smoothstep(value){ return value * value * (3 - 2 * value); }
    function requestJourneyRender(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ ticking = false; renderJourneyProgress(sectionProgress()); });
    }
    if(!reducedMotion){
      // Scroll-driven camera movement is motion; reduced-motion visitors get a
      // calm static map (the story cards still carry the journey).
      window.addEventListener('scroll', requestJourneyRender, { passive:true });
      window.addEventListener('resize', requestJourneyRender, { passive:true });
    }
    setTimeout(function(){ renderJourneyProgress(sectionProgress()); map.invalidateSize(); }, 120);

    var cards = Array.from(document.querySelectorAll('#storymap [data-stage-card]'));
    if(cards.length && 'MutationObserver' in window){
      var observer = new MutationObserver(function(){
        var active = cards.findIndex(function(card){ return card.classList.contains('is-active'); });
        if(active >= 0) setStage(active, false);
      });
      cards.forEach(function(card){ observer.observe(card, { attributes:true, attributeFilter:['class'] }); });
    }
    window.addEventListener('resize', function(){ map.invalidateSize(); }, { passive:true });
    document.addEventListener('langchange', function(){
      markers.forEach(function(marker, index){ marker.setTooltipContent(labelHtml(index)); });
      vehicles.forEach(function(vehicle, index){ vehicle.setTooltipContent(t('vehicles')[index]); });
      var caption = document.getElementById('journeyMapCaption');
      if(caption && activeIndex >= 0) caption.textContent = places[activeIndex].name + ' · ' + t('placeSubs')[activeIndex];
    });
  }


  // Lazy bootstrapper: load Leaflet's CSS + JS only when the story map approaches
  // the viewport. If it never loads (offline), the illustrated SVG map remains —
  // it is the default and needs no dependency.
  (function(){
    var section = document.getElementById('storymap');
    if(!section) return;
    var booted = false;
    function boot(){
      if(booted) return;
      booted = true;
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = function(){ try { initInteractiveJourneyMap(); } catch(e){ /* keep the SVG map */ } };
      s.onerror = function(){ /* offline: keep the SVG map */ };
      document.body.appendChild(s);
    }
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        if(entries.some(function(e){ return e.isIntersecting; })){ io.disconnect(); boot(); }
      }, { rootMargin: '600px 0px' });
      io.observe(section);
    } else {
      boot();
    }
  })();

  /* ============================================================
     START-UP — wire the nav flags, then paint the saved language.
     ============================================================ */
  document.querySelectorAll('.lang-switch [data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.setLang));
  });
  applyLang();
