// Progressive enhancement gate
  // Progressive enhancement: opt reveal elements into their hidden/animated state only
  // when JS, IntersectionObserver, and motion are all available. Runs before the body
  // paints, so content is never hidden unless it can be reliably revealed.
  (function () {
    try {
      if ('IntersectionObserver' in window &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('js-reveal');
        // Play the one-time invitation opening (see .invitation-veil). Same gate:
        // only when JS + motion are available; the page is fully visible beneath it.
        document.documentElement.classList.add('invite');
      }
    } catch (e) { /* leave content visible */ }
  })();

// Navigation, countdown, scroll reveals, travel, dress, honeymoon, FAQ, copy postcode
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

  // Countdown to 29 April 2027, 13:30 local.
  // Days-only until the last week; hours/minutes appear at 7 days out;
  // seconds only on the wedding day itself. After the day it retires
  // gracefully instead of counting zeros forever.
  const weddingDate = new Date('2027-04-29T13:30:00');
  const countdownEl = document.getElementById('countdown');
  let cdTimer = null;
  function updateCountdown(){
    const now = new Date();
    let diff = weddingDate - now;
    if(diff <= 0){
      if(countdownEl){
        countdownEl.innerHTML = '<div class="unit"><div class="num">&hearts;</div><div class="label">Just married</div></div>';
      }
      if(cdTimer) clearInterval(cdTimer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-days').textContent = d;
    // Days-only until 7 days out; then hours; seconds only on the day.
    const showHours = d <= 7;
    const showSecs = d === 0;
    ['cd-hours','cd-mins','cd-secs'].forEach(function(id){
      var el = document.getElementById(id);
      var parent = el && el.parentNode;
      if(parent){
        if(id === 'cd-hours' && showHours) parent.style.display = '';
        else if(id === 'cd-mins' && showHours) parent.style.display = '';
        else if(id === 'cd-secs' && showSecs) parent.style.display = '';
        else parent.style.display = 'none';
      }
    });
    if(showHours){
      document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
      document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
    }
    if(showSecs) document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
  }
  updateCountdown();
  cdTimer = setInterval(updateCountdown, 1000);

  // Scroll reveal — progressive enhancement (see the html.js-reveal gate in <head>).
  // Content is visible by default; only animate when JS + motion opted in, and a failsafe
  // guarantees nothing stays hidden on headless renderers, background tabs, or no-scroll views.
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (revealEls.length && document.documentElement.classList.contains('js-reveal')) {
    const reveal = el => el.classList.add('in');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){ reveal(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
    // Failsafe: headless renderers, background tabs, or a no-scroll view must never see blank content
    const revealAll = () => revealEls.forEach(reveal);
    window.addEventListener('load', () => setTimeout(revealAll, 1000), { once: true });
    setTimeout(revealAll, 2600);
  }

  // Travel — safe scroll reveal (content is visible by default; animate only when JS + motion allow, and never stays hidden)
  const travelSection = document.getElementById('travel');
  if (travelSection && 'IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const trEls = Array.from(travelSection.querySelectorAll('[data-tr]'));
    travelSection.classList.add('js-reveal');
    const reveal = el => el.classList.add('in');
    const trObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { reveal(entry.target); trObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    trEls.forEach(el => trObserver.observe(el));
    // Failsafe: headless renderers, background tabs, or a no-scroll view must never see blank content
    const revealAll = () => trEls.forEach(reveal);
    window.addEventListener('load', () => setTimeout(revealAll, 1000), { once: true });
    setTimeout(revealAll, 2600);
  }

  // Dress code — safe scroll reveal (visible by default; animate only when JS + motion allow)
  const dressSection = document.getElementById('dress');
  if (dressSection && 'IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const drEls = Array.from(dressSection.querySelectorAll('[data-dr]'));
    dressSection.classList.add('js-reveal');
    const revealDr = el => el.classList.add('in');
    const drObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { revealDr(entry.target); drObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    drEls.forEach(el => drObserver.observe(el));
    // Failsafe: headless renderers, background tabs, or a no-scroll view must never see blank content
    const revealAllDr = () => drEls.forEach(revealDr);
    window.addEventListener('load', () => setTimeout(revealAllDr, 1000), { once: true });
    setTimeout(revealAllDr, 2600);
  }

  // Honeymoon — safe scroll reveal
  const honeymoonSection = document.getElementById('honeymoon');
  if (honeymoonSection && 'IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const hmEls = Array.from(honeymoonSection.querySelectorAll('[data-hm]'));
    honeymoonSection.classList.add('js-reveal');
    const revealHm = el => el.classList.add('in');
    const hmObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { revealHm(entry.target); hmObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    hmEls.forEach(el => hmObserver.observe(el));
    const revealAllHm = () => hmEls.forEach(revealHm);
    window.addEventListener('load', () => setTimeout(revealAllHm, 1000), { once: true });
    setTimeout(revealAllHm, 2600);
  }

  // FAQ — safe scroll reveal
  const faqSection = document.getElementById('faq');
  if (faqSection && 'IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const faqEls = Array.from(faqSection.querySelectorAll('[data-faq]'));
    faqSection.classList.add('js-reveal');
    const revealFaq = el => el.classList.add('in');
    const faqObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { revealFaq(entry.target); faqObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    faqEls.forEach(el => faqObserver.observe(el));

    const revealAllFaq = () => faqEls.forEach(revealFaq);
    window.addEventListener('load', () => setTimeout(revealAllFaq, 1000), { once: true });
    setTimeout(revealAllFaq, 2600);
  }

  // Travel — copy the venue postcode
  const copyBtn = document.getElementById('copyPostcode');
  if (copyBtn) {
    const label = copyBtn.querySelector('.copy-label');
    const original = label ? label.textContent : '';
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
      if (label) label.textContent = 'Copied';
      clearTimeout(copyBtn._resetTimer);
      copyBtn._resetTimer = setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (label) label.textContent = original;
      }, 1800);
    });
  }

  // RSVP form
  (function initRSVP(){
    const form = document.getElementById('rsvpForm');
    if(!form) return;

    // ── Connect responses ──────────────────────────────────────────────
    // Paste the Google Apps Script Web App URL (ends in /exec) between the
    // quotes to go live. While empty, the form runs in preview mode.
    
    const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzyGZG01id0VhLFkjGRDnaNHNZgHoKV2Kuj5-jA1JhYq87rOsoCjlXliChsdt3uLWjw/exec';
    const CONTACT = 'Diego.beth21@gmail.com';
    const nameInput = document.getElementById('rsvp-name');          // hidden — holds chosen name
    const pickerInput = document.getElementById('guest-picker-input');
    const pickerList = document.getElementById('guest-picker-list');
    const pickerNotFound = document.getElementById('guest-not-found');
    const pickerHint = document.getElementById('guest-picker-hint');
    const attendanceNote = document.getElementById('guest-attendance-note');
    const partnerField = document.getElementById('partnerField');
    const partnerNameEl = document.getElementById('partner-name');
    const soloNote = document.getElementById('soloNote');
    const alreadyRepliedNote = document.getElementById('alreadyRepliedNote');
    let GUEST_LIST = [];
    let selectedGuest = null;

    const emailInput = document.getElementById('rsvp-email');
    const party = document.getElementById('rsvpParty');
    const guestList = document.getElementById('guestList');
    const guestAdd = document.getElementById('guestAdd');
    const guestNote = document.getElementById('guestNote');
    const submitBtn = document.getElementById('rsvpSubmit');
    const submitLabel = submitBtn.querySelector('.btn-label');
    const note = document.getElementById('formNote');
    const success = document.getElementById('rsvpSuccess');
    const successTitle = document.getElementById('rsvpSuccessTitle');
    const successMsg = document.getElementById('rsvpSuccessMsg');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // The deadline is soft: late replies are still welcome, just flagged.
    const deadlineNote = document.getElementById('deadlinePassed');
    if(deadlineNote && new Date() > new Date('2027-02-28T23:59:59')) deadlineNote.hidden = false;

    // ── Safe scroll reveal (content visible by default; never ships blank) ──
    const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if('IntersectionObserver' in window && motionOK){
      const section = document.getElementById('rsvp');
      const items = Array.from(section.querySelectorAll('[data-rv]'));
      section.classList.add('js-reveal');
      const show = el => el.classList.add('in');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting){ show(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      items.forEach(el => obs.observe(el));
      window.addEventListener('load', () => setTimeout(() => items.forEach(show), 1000), { once:true });
      setTimeout(() => items.forEach(show), 2600);
    }

    // ── Attending: collapse party details on decline ──
    function isDeclining(){
      const sel = form.querySelector('input[name="attending"]:checked');
      return !!sel && sel.value === 'Regretfully declines';
    }
    function syncAttendance(){
      const declining = isDeclining();
      party.classList.toggle('collapsed', declining);
      party.toggleAttribute('inert', declining);
      party.setAttribute('aria-hidden', String(declining));
      party.querySelectorAll('input').forEach(i => { i.disabled = declining; });
      if(selectedGuest){
        if(selectedGuest.partner) partnerField.hidden = declining;
        else soloNote.hidden = declining;
      } else if(GUEST_LIST.length === 0){
        // Free-text mode: party size is unknown — don't presume "invitation for one".
        partnerField.hidden = true;
        soloNote.hidden = true;
      }
    }

    form.querySelectorAll('input[name="attending"]').forEach(i => i.addEventListener('change', syncAttendance));
    syncAttendance();

    // ── Load the guest list from the sheet ──
    // If it can't be fetched, the form degrades to honest free-text: validation
    // accepts the typed name instead of requiring a list pick that can never come.
    function enterFreeTextMode(){
      pickerInput.setAttribute('placeholder', 'Your full name');
      const hint = document.getElementById('guest-picker-hint');
      if(hint) hint.textContent = 'Type your full name as it appears on the invitation.';
      const errText = document.querySelector('#rsvp-name-err span');
      if(errText) errText.textContent = 'Please add your full name.';
      pickerNotFound.hidden = true;
    }
    async function loadGuests(){
      try {
        const res = await fetch(RSVP_ENDPOINT, { method: 'GET' });
        const data = await res.json();
        GUEST_LIST = data.guests || [];
      } catch (err) {
        console.warn('Could not load guest list — falling back to free-text.', err);
        enterFreeTextMode();
      }
    }
    loadGuests();

    // ── Guest picker (searchable dropdown) ──
    function normaliseName(s){ return (s || '').trim().toLowerCase(); }

    function findGuest(name){
      const q = normaliseName(name);
      return GUEST_LIST.find(g => normaliseName(g.name) === q);
    }

    // The Apps Script guest response includes the sheet's Attendance column as
    // `attendance`. Keep the wording guest-friendly and do not expose arbitrary
    // sheet text directly in the page.
    function updateAttendanceNote(g){
      if(!attendanceNote) return;
      const attendance = normaliseName(g && (g.attendance || g.Attendance));
      let message = '';
      if(attendance === 'full day' || attendance === 'full-day'){
        message = 'Your invitation is for the full day. We look forward to seeing you then.';
      } else if(attendance === 'evening only' || attendance === 'evening-only'){
        message = 'Your invitation is for the evening only. We look forward to seeing you then.';
      }
      attendanceNote.textContent = message;
      attendanceNote.hidden = !message;
    }

    function renderPickerResults(query){
      const q = normaliseName(query);
      const matches = q
        ? GUEST_LIST.filter(g => normaliseName(g.name).includes(q))
        : GUEST_LIST;

      pickerList.innerHTML = '';
      if(matches.length === 0){
        const li = document.createElement('li');
        li.className = 'picker-empty';
        li.textContent = 'No match. Check the spelling, or use the link below.';
        pickerList.appendChild(li);
        pickerNotFound.hidden = false;
        pickerList.hidden = false;
        pickerInput.setAttribute('aria-expanded', 'true');
        return;
      }

      pickerNotFound.hidden = true;
      const CAP = 6;
      matches.slice(0, CAP).forEach((g, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.dataset.name = g.name;
        if(i === 0) li.classList.add('is-active');
        if(g.responded) li.classList.add('is-responded');
        li.innerHTML = `<span>${g.name}</span>${g.responded ? '<span class="picker-tag">RSVP’d</span>' : ''}`;
        li.addEventListener('mousedown', (e) => { e.preventDefault(); pickGuest(g); });
        pickerList.appendChild(li);
      });
      if(matches.length > CAP){
        const more = document.createElement('li');
        more.className = 'picker-empty';
        more.textContent = 'And ' + (matches.length - CAP) + ' more. Keep typing…';
        pickerList.appendChild(more);
      }
      pickerList.hidden = false;
      pickerInput.setAttribute('aria-expanded', 'true');
    }

    function pickGuest(g){
      selectedGuest = g;
      pickerInput.value = g.name;
      nameInput.value = g.name;
      pickerList.hidden = true;
      pickerInput.setAttribute('aria-expanded', 'false');
      if(pickerHint) pickerHint.hidden = true;
      pickerInput.setAttribute('aria-invalid', 'false');
      document.getElementById('rsvp-name-err').hidden = true;

      // Handle partner
      const declining = isDeclining();
      if(g.partner){
        partnerNameEl.textContent = g.partner;
        partnerField.hidden = declining;
        soloNote.hidden = true;
      } else {
        partnerField.hidden = true;
        soloNote.hidden = declining;
      }

      // If they've already replied, gently flag it
      alreadyRepliedNote.hidden = !g.responded;
      updateAttendanceNote(g);
    }

    // Low threshold: short names ("Bo", "Amy") must be findable. Results are
    // capped so a two-letter query doesn't become a wall of guests.
    const MIN_CHARS = 2;
    pickerInput.addEventListener('focus', () => {
      if (pickerInput.value.trim().length >= MIN_CHARS) {
        renderPickerResults(pickerInput.value);
      }
    });
    pickerInput.addEventListener('input', () => {
      selectedGuest = null;
      nameInput.value = '';
      if(pickerHint) pickerHint.hidden = false;
      updateAttendanceNote(null);
      const q = pickerInput.value.trim();
      if (q.length >= MIN_CHARS) {
        renderPickerResults(pickerInput.value);
      } else if (q.length > 0 && GUEST_LIST.length) {
        pickerList.innerHTML = '';
        const li = document.createElement('li');
        li.className = 'picker-empty';
        li.textContent = 'Keep typing…';
        pickerList.appendChild(li);
        pickerList.hidden = false;
        pickerInput.setAttribute('aria-expanded', 'true');
        pickerNotFound.hidden = true;
      } else {
        pickerList.hidden = true;
        pickerInput.setAttribute('aria-expanded', 'false');
        pickerNotFound.hidden = true;
      }
    });
    
    pickerInput.addEventListener('keydown', (e) => {
      const items = Array.from(pickerList.querySelectorAll('li[role="option"]'));
      const activeIdx = items.findIndex(li => li.classList.contains('is-active'));
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        if(items.length){
          items.forEach(li => li.classList.remove('is-active'));
          items[Math.min(activeIdx + 1, items.length - 1)].classList.add('is-active');
          items[Math.min(activeIdx + 1, items.length - 1)].scrollIntoView({ block: 'nearest' });
        }
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        if(items.length){
          items.forEach(li => li.classList.remove('is-active'));
          items[Math.max(activeIdx - 1, 0)].classList.add('is-active');
          items[Math.max(activeIdx - 1, 0)].scrollIntoView({ block: 'nearest' });
        }
      } else if(e.key === 'Enter'){
        if(!pickerList.hidden && items[activeIdx]){
          e.preventDefault();
          const g = GUEST_LIST.find(x => x.name === items[activeIdx].dataset.name);
          if(g) pickGuest(g);
        }
      } else if(e.key === 'Escape'){
        pickerList.hidden = true;
        pickerInput.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', (e) => {
      if(!document.getElementById('guestPicker').contains(e.target)){
        pickerList.hidden = true;
        pickerInput.setAttribute('aria-expanded', 'false');
      }
    });

    // ── Custom styled dropdowns ──
    function initCustomSelects(){
      document.querySelectorAll('[data-custom-select]').forEach(select => {
        const hiddenInput = select.querySelector('input[type="hidden"]');
        const trigger = select.querySelector('.select-trigger');
        const selectedText = select.querySelector('#dietary-selected');
        const menu = select.querySelector('.select-menu');
        const options = Array.from(select.querySelectorAll('[role="option"]'));

        if(!hiddenInput || !trigger || !selectedText || !menu || !options.length) return;

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

          const value = option.getAttribute('data-value') || option.textContent.trim();
          hiddenInput.value = value;
          selectedText.textContent = option.textContent.trim();

          close();
          trigger.focus();
        }

        trigger.addEventListener('click', () => {
          if(select.classList.contains('open')){
            close();
          } else {
            open();
          }
        });

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

          if(event.key === 'Escape'){
            close();
          }
        });

        menu.addEventListener('keydown', event => {
          const activeIndex = options.findIndex(option => option.classList.contains('is-active'));
          let nextIndex = activeIndex >= 0 ? activeIndex : 0;

          if(event.key === 'ArrowDown'){
            event.preventDefault();
            nextIndex = Math.min(nextIndex + 1, options.length - 1);
          }

          if(event.key === 'ArrowUp'){
            event.preventDefault();
            nextIndex = Math.max(nextIndex - 1, 0);
          }

          if(event.key === 'Enter' || event.key === ' '){
            event.preventDefault();
            const active = options[nextIndex];
            if(active) choose(active);
            return;
          }

          if(event.key === 'Escape'){
            close();
            trigger.focus();
            return;
          }

          options.forEach(option => option.classList.remove('is-active'));
          options[nextIndex].classList.add('is-active');
        });

        document.addEventListener('click', event => {
          if(!select.contains(event.target)){
            close();
          }
        });
      });
    }

    initCustomSelects();
    
    // ── Validation ──
    function setError(input, errId, on){
      input.setAttribute('aria-invalid', on ? 'true' : 'false');
      const err = document.getElementById(errId);
      if(err) err.hidden = !on;
    }
    function validate(){
      let firstInvalid = null;
      let nameOk;
      if(GUEST_LIST.length === 0){
        // Free-text mode: the guest list never loaded, so the typed name is the reply.
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
      return firstInvalid;
    }

    nameInput.addEventListener('blur', () => { if(nameInput.getAttribute('aria-invalid') === 'true') setError(nameInput, 'rsvp-name-err', nameInput.value.trim().length === 0); });
    nameInput.addEventListener('input', () => { if(nameInput.getAttribute('aria-invalid') === 'true' && nameInput.value.trim()) setError(nameInput, 'rsvp-name-err', false); });
    emailInput.addEventListener('blur', () => { if(emailInput.getAttribute('aria-invalid') === 'true') setError(emailInput, 'rsvp-email-err', !emailRe.test(emailInput.value.trim())); });
    emailInput.addEventListener('input', () => { if(emailInput.getAttribute('aria-invalid') === 'true' && emailRe.test(emailInput.value.trim())) setError(emailInput, 'rsvp-email-err', false); });

    // ── Collect + submit ──
    function setNote(html, isError){
      note.classList.toggle('is-error', !!isError);
      note.innerHTML = html;
    }
    function collect(){
      const declining = isDeclining();
      const partnerRadio = form.querySelector('input[name="partnerAttending"]:checked');
      const partnerComing = !declining && selectedGuest && selectedGuest.partner
        && partnerRadio && partnerRadio.value === 'yes';
      return {
        submission_id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2),
        name: nameInput.value.trim(),
        attendance: selectedGuest
          ? String(selectedGuest.attendance || selectedGuest.Attendance || '').trim()
          : '',
        email: emailInput.value.trim(),
        attending: declining ? 'Regretfully declines' : 'Joyfully accepts',
        party_size: declining ? '0' : String(1 + (partnerComing ? 1 : 0)),
        guests: partnerComing ? selectedGuest.partner : '',
        dietary: declining ? '' : document.getElementById('rsvp-dietary').value.trim(),
        song: declining ? '' : document.getElementById('rsvp-song').value.trim(),
        message: document.getElementById('rsvp-message').value.trim(),
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
      // Google Apps Script Web App. A CORS-mode POST (URLSearchParams keeps it a
      // simple request, so there's no preflight, and the /exec response sends
      // Access-Control-Allow-Origin: *) lets us read the real status: a non-2xx
      // reply or a failed fetch now surfaces as an error, instead of every
      // resolved ping being silently treated as delivered.
      const res = await fetch(RSVP_ENDPOINT, { method: 'POST', body: new URLSearchParams(data) });
      if(!res.ok) throw new Error('RSVP endpoint replied ' + res.status);
      await res.text();
    }
    function showSuccess(data){
      form.hidden = true;
      success.hidden = false;
      if(data.attending === 'Regretfully declines'){
        successTitle.textContent = 'Thank you for letting us know.';
        successMsg.textContent = "We'll miss you on the day, but we're so grateful you replied. With love, Diego & Bethany.";
      } else {
        const first = data.name.split(' ')[0] || 'friend';
        const attendance = normaliseName(data.attendance);
        const timing = attendance === 'evening only' || attendance === 'evening-only'
          ? 'the evening'
          : attendance === 'full day' || attendance === 'full-day'
            ? 'the full day'
            : 'the day';
        successTitle.textContent = 'Thank you — your reply is in.';
        successMsg.textContent = "We can't wait to celebrate with you on 29 April at Southdowns Manor. We look forward to seeing you for " + timing + ', ' + first + '.';
      }
      success.classList.add('in');
      success.focus();
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstInvalid = validate();
      if(firstInvalid){
        setNote('Please check the highlighted fields above.', true);
        firstInvalid.focus();
        return;
      }
      const data = collect();
      submitBtn.disabled = true;
      submitBtn.classList.add('is-sending');
      submitLabel.textContent = 'Sending…';
      setNote('', false);
      try {
        await send(data);
        showSuccess(data);
      } catch(err){
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-sending');
        submitLabel.textContent = 'Send RSVP';
        setNote('We couldn\'t send that just now. Please try again, or email us at <a href="mailto:' + CONTACT + '?subject=Wedding%20RSVP">' + CONTACT + '</a>.', true);
      }
    });
  })();

// RSVP form
  // Overdrive scroll (C) — drifting petal field. Atmospheric depth rendered on a
  // canvas, gated on the same JS + IntersectionObserver + motion signal as the
  // reveals (html.js-reveal). Never runs for reduced-motion or no-JS visitors,
  // pauses when the tab is hidden, and stays pointer-events:none behind the nav.
  (function initPetals(){
    var root = document.documentElement;
    if(!root.classList.contains('js-reveal')) return;
    var canvas = document.getElementById('petalField');
    if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var petals = [], W = 0, H = 0, running = false, raf = 0, last = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Spring palette — powder/slate blues, a fresh green, and pale sky, to match the
    // re-themed accents and the flowering vine (previously stale warm tones).
    var COLORS = ['167,199,234', '201,220,241', '123,160,212', '154,196,124', '239,246,250'];
    function rnd(a, b){ return a + Math.random() * (b - a); }
    function resize(){
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function makePetal(fromBottom){
      var depth = Math.random();                 // 0 far … 1 near
      var r = rnd(4, 9) * (0.7 + depth);
      return {
        x: rnd(0, W), y: fromBottom ? H + rnd(10, 90) : rnd(0, H),
        r: r, vy: -(rnd(7, 15) * (0.5 + depth)),
        sway: rnd(6, 16) * (0.5 + depth), phase: rnd(0, Math.PI * 2),
        swaySpeed: rnd(0.3, 0.8), rot: rnd(0, Math.PI * 2), vr: rnd(-0.6, 0.6),
        alpha: 0.08 + depth * 0.20, color: COLORS[(Math.random() * COLORS.length) | 0]
      };
    }
    function seed(){
      petals = [];
      var count = Math.round(Math.min(28, Math.max(12, W / 78)));
      for(var i = 0; i < count; i++) petals.push(makePetal(false));
    }
    function frame(t){
      if(!running) return;
      var dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016; last = t;
      ctx.clearRect(0, 0, W, H);
      for(var i = 0; i < petals.length; i++){
        var p = petals[i];
        p.y += p.vy * dt;
        p.phase += p.swaySpeed * dt;
        p.x += Math.sin(p.phase) * p.sway * dt;
        p.rot += p.vr * dt;
        if(p.y < -24){ petals[i] = makePetal(true); continue; }
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha; ctx.fillStyle = 'rgba(' + p.color + ',1)';
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.quadraticCurveTo(p.r * 0.85, 0, 0, p.r);
        ctx.quadraticCurveTo(-p.r * 0.85, 0, 0, -p.r);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    }
    function start(){ if(running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop(){ running = false; if(raf) cancelAnimationFrame(raf); raf = 0; }
    resize(); seed(); canvas.classList.add('on'); start();
    var rto;
    window.addEventListener('resize', function(){
      clearTimeout(rto); rto = setTimeout(function(){ resize(); seed(); }, 200);
    }, { passive: true });
    document.addEventListener('visibilitychange', function(){ document.hidden ? stop() : start(); });
  })();

// Dietary select
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

    // Pin the inner content to the container's exact pixel height. Viewport
    // units (100dvh) can disagree with the fixed container on mobile browsers
    // (URL-bar collapse timing), which left the stem short of the bottom.
    function sizeVine(){
      vine.style.setProperty('--vine-h', vine.clientHeight + 'px');
    }
    sizeVine();
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

    function tick() {
      var scroller = document.scrollingElement || document.documentElement;
      var maxScroll = scroller.scrollHeight - scroller.clientHeight;
      var scrollTop = window.scrollY || scroller.scrollTop || 0;
      var progress = maxScroll > 0 ? clamp(scrollTop / maxScroll, 0, 1) : 0;
      vine.style.setProperty('--vine-reveal', (progress * 100).toFixed(3) + '%');

      // Stem: stroke-dashoffset from 1002 (hidden) → 0 (fully drawn);
      // the clip-path above keeps flowers and endpoint artifacts from outrunning the stem.
      if (stem) stem.style.strokeDashoffset = (1002 * (1 - progress)).toFixed(1);

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

    tick(); // set initial state
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', function(){ sizeVine(); tick(); }, { passive: true });
    window.addEventListener('orientationchange', function(){ sizeVine(); tick(); }, { passive: true });
  })();

// Schedule live
  // Invitation opening — remove the veil once it has played, with a fail-safe
  // timeout so the page can never be left covered even if animationend misfires.
  (function () {
    var root = document.documentElement;
    if (!root.classList.contains('invite')) return;
    var veil = document.getElementById('inviteVeil');
    if (!veil) { root.classList.remove('invite'); return; }
    var done = false;
    function finish(){
      if (done) return; done = true;
      root.classList.remove('invite');
      if (veil.parentNode) veil.parentNode.removeChild(veil);
    }
    var bottom = veil.querySelector('.veil-bottom');
    if (bottom) bottom.addEventListener('animationend', finish, { once:true });
    setTimeout(finish, 3000);
  })();

// Stay sort
  (function () {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const frame = document.querySelector('.hero-frame');
    if (!hero) return;

    let targetX = 0;
    let targetY = 0;

    hero.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5);
      targetY = (e.clientY / window.innerHeight - 0.5);

      // Frame reacts immediately to the pointer
      if (frame) {
        frame.style.transform = `rotateY(${targetX * 8}deg) rotateX(${targetY * -6}deg)`;
      }
    });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (frame) {
        frame.style.transform = 'rotateY(0deg) rotateX(0deg)';
      }
    });

    // Hero content eases toward the target every frame
    function animate() {
      if (heroContent) {
        heroContent.style.transform = `rotateY(${targetX * 6}deg) rotateX(${targetY * -4}deg)`;
      }
      requestAnimationFrame(animate);
    }
    animate();
  })();

// Vine, petals, invitation veil, gallery lightbox, journey map, journey planner, ICS calendar
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
    navPrev.setAttribute('aria-label', 'Previous photo');
    navPrev.innerHTML = '&#8249;';
    navPrev.addEventListener('click', function(e){ e.stopPropagation(); navigate(-1); });
    lightbox.querySelector('.gallery-lightbox-inner').appendChild(navPrev);

    navNext = document.createElement('button');
    navNext.className = 'gallery-lightbox-nav nav-next';
    navNext.setAttribute('aria-label', 'Next photo');
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

    const stageLabels = [
      'Swansea · our starting point',
      'Southampton · the harbour',
      'Iceland · across the Atlantic',
      'Norway · the fjords'
    ];

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
        caption.textContent = stageLabels[activeStage];
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
      caption.textContent = stageLabels[3];
      camera.style.transform = 'none';
      return;
    }

    window.addEventListener('scroll', requestUpdate, { passive:true });
    window.addEventListener('resize', requestUpdate, { passive:true });
    reduceMotion.addEventListener?.('change', requestUpdate);

    // Handles direct navigation / refresh midway through the page.
    update(sectionProgress());
  })();

  /* ============================================================
     LIVING SCHEDULE — on the wedding day the running order marks
     whatever is happening right now and keeps itself up to date.
     ============================================================ */
  (function(){
    const schedule = document.getElementById('schedule');
    const pill = document.getElementById('dayStatus');
    if(!schedule || !pill) return;
    const items = Array.from(schedule.querySelectorAll('.schedule-item'));
    if(!items.length) return;

    // 29 April 2027, local time
    const DAY = { y: 2027, m: 3, d: 29 };

    function minutesFor(item){ return Number(item.dataset.start || 0); }

    function paint(){
      const now = new Date();
      const isDay = now.getFullYear() === DAY.y && now.getMonth() === DAY.m && now.getDate() === DAY.d;
      items.forEach(i => i.classList.remove('is-now', 'is-done'));

      if(!isDay){
        const target = new Date(DAY.y, DAY.m, DAY.d, 13, 0, 0);
        pill.classList.remove('live');
        pill.innerHTML = now < target
          ? '<span class="dot"></span>This running order goes live on the day and will show you what&rsquo;s happening right now.'
          : '<span class="dot"></span>What a day that was. Thank you for celebrating with us.';
        return;
      }

      const mins = now.getHours() * 60 + now.getMinutes();
      let current = null;
      items.forEach(item => {
        const start = minutesFor(item);
        if(mins >= start){ item.classList.add('is-done'); current = item; }
      });

      if(current){
        current.classList.remove('is-done');
        current.classList.add('is-now');
        const name = current.querySelector('.schedule-name');
        pill.classList.add('live');
        pill.innerHTML = '<span class="dot"></span><strong>Happening now:</strong> ' + (name ? name.textContent : '');
        if(!schedule.dataset.scrolled){
          schedule.dataset.scrolled = '1';
        }
      } else {
        const first = items[0];
        const start = minutesFor(first);
        const h = String(Math.floor(start / 60)).padStart(2, '0');
        const m = String(start % 60).padStart(2, '0');
        pill.classList.add('live');
        pill.innerHTML = '<span class="dot"></span>Today is the day. Doors open at ' + h + ':' + m + '.';
      }
    }

    paint();
    setInterval(paint, 30000);
  })();

  /* ============================================================
     ADD TO CALENDAR — builds an .ics on the fly, running order in
     the notes, so guests can save the day in one tap.
     ============================================================ */
  (function(){
    const buttons = Array.from(document.querySelectorAll('[data-ics]'));
    if(!buttons.length) return;

    function build(){
      const rows = Array.from(document.querySelectorAll('#schedule .schedule-item')).map(item => {
        const t = item.querySelector('.schedule-time');
        const n = item.querySelector('.schedule-name');
        return (t ? t.textContent.trim() : '') + ': ' + (n ? n.textContent.trim() : '');
      });
      const desc = ['Running order (times approximate):', ...rows, '', 'Dress code: Garden Formal.', 'Southdowns Manor, Dumpford Lane, Petersfield GU31 5JN']
        .join('\\n');
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Diego and Bethany//Wedding//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:diego-bethany-wedding-20270429@southdownsmanor',
        'DTSTAMP:20260101T000000Z',
        'DTSTART:20270429T120000Z',
        'DTEND:20270429T220000Z',
        'SUMMARY:The wedding of Diego & Bethany',
        'LOCATION:Southdowns Manor\\, Dumpford Lane\\, Petersfield GU31 5JN',
        'DESCRIPTION:' + desc,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Diego & Bethany get married tomorrow',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ];
      return lines.join('\r\n');
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
          const original = label.textContent;
          label.textContent = 'Saved to your calendar';
          setTimeout(() => { label.textContent = original; }, 2600);
        }
      });
    });
  })();

  /* ============================================================
     PLAN MY JOURNEY — a guest types their town or postcode and gets
     a real drive time to the manor, plus the rail alternative.
     Geocoding: postcodes.io · Routing: OSRM (both open, no key).
     Falls back to a straight-line estimate if routing is unreachable.
     ============================================================ */
  (function(){
    const form = document.getElementById('journeyForm');
    if(!form) return;
    const input = document.getElementById('journeyFrom');
    const out = document.getElementById('journeyResult');
    const btn = document.getElementById('journeyBtn');

    const VENUE = { lat: 50.9522, lon: -0.8459 };
    const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

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
      if(m < 60) return m + ' min';
      const h = Math.floor(m / 60), r = m % 60;
      return h + ' hr' + (h > 1 ? 's' : '') + (r ? ' ' + r + ' min' : '');
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
      return { mins: j.routes[0].duration / 60, miles: j.routes[0].distance / 1609.34, estimated: false };
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = (input.value || '').trim();
      if(q.length < 2){
        say('Add a town or postcode and we&rsquo;ll work out the drive.', 'warn');
        input.focus();
        return;
      }
      btn.disabled = true;
      btn.classList.add('is-busy');
      say('<span class="journey-spin" aria-hidden="true"></span>Plotting your route to the manor&hellip;');

      try {
        const from = await geocode(q);
        let leg;
        try {
          leg = await route(from);
        } catch (err) {
          const km = haversine(from, VENUE);
          leg = { mins: (km / 62) * 60 * 1.28, miles: km * 0.621371 * 1.22, estimated: true };
        }
        const trainLine = leg.miles > 28
          ? 'Rather take the train? <strong>Petersfield</strong> is the nearest station, about 70 minutes from London Waterloo, then a 15-minute taxi to the manor. Pre-book the taxi.'
          : 'You&rsquo;re close enough that a local taxi is the easiest way home, so book it before the day.';
        say(
          '<p class="journey-from">From <strong>' + from.label + '</strong> to Southdowns Manor</p>' +
          '<div class="journey-stats">' +
            '<div class="journey-stat"><span class="jv">' + pretty(leg.mins) + '</span><span class="jl">Driving</span></div>' +
            '<div class="journey-stat"><span class="jv">' + Math.round(leg.miles) + '</span><span class="jl">Miles</span></div>' +
            '<div class="journey-stat"><span class="jv">' + pretty(leg.mins + 25) + '</span><span class="jl">Leave-by buffer</span></div>' +
          '</div>' +
          '<p class="journey-note">Aim to arrive by <strong>12:40 PM</strong> for a 1:30 PM ceremony; the final country lanes are slow going.' +
          (leg.estimated ? ' These figures are an estimate.' : '') + '</p>' +
          '<p class="journey-note">' + trainLine + '</p>' +
          '<a class="ext-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&origin=' +
            encodeURIComponent(q) + '&destination=Southdowns+Manor+GU31+5JN">Open this route in Google Maps' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg></a>',
          'ok'
        );
      } catch (err) {
        say('We couldn&rsquo;t find that one. Try a UK postcode (like <strong>GU32 3AP</strong>) or a town name, or just open <a class="ext-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=Southdowns+Manor+GU31+5JN">directions in Google Maps</a>.', 'warn');
      } finally {
        btn.disabled = false;
        btn.classList.remove('is-busy');
      }
    });
  })();

  /* ============================================================
     STAYS — "closest first" flattens every place to stay into one
     list ordered by drive time from the manor.
     ============================================================ */
  (function(){
    const toggle = document.getElementById('staySort');
    const tiers = document.querySelector('.stay-tiers');
    if(!toggle || !tiers) return;

    const flat = document.createElement('div');
    flat.className = 'stays stays--flat';
    flat.hidden = true;

    const cards = Array.from(tiers.querySelectorAll('.stay')).map(card => {
      const meta = card.querySelector('.stay-meta');
      const mins = meta ? Number((meta.textContent.match(/(\d+)\s*min/) || [])[1] || 999) : 999;
      const tierLabel = card.closest('.tier')?.querySelector('.tier-label')?.textContent || '';
      const clone = card.cloneNode(true);
      const tag = document.createElement('span');
      tag.className = 'stay-tier-tag';
      tag.textContent = tierLabel;
      clone.appendChild(tag);
      return { mins, clone };
    }).sort((a, b) => a.mins - b.mins);

    cards.forEach(c => flat.appendChild(c.clone));
    tiers.parentNode.insertBefore(flat, tiers.nextSibling);

    toggle.addEventListener('click', () => {
      const on = toggle.getAttribute('aria-pressed') === 'true';
      toggle.setAttribute('aria-pressed', String(!on));
      flat.hidden = on;
      tiers.hidden = !on;
      toggle.querySelector('.sort-label').textContent = on ? 'Closest to the venue first' : 'Group by style again';
    });
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
    places[0].label = 'SWANSEA'; places[0].country = 'WALES'; places[0].flag = '🇬🇧';
    places[1].label = 'SOUTHAMPTON'; places[1].country = 'ENGLAND'; places[1].flag = '🇬🇧';
    places[2].label = 'REYKJAVIK'; places[2].country = 'ICELAND'; places[2].flag = '🇮🇸';
    places[3].name = 'Geirangerfjord'; places[3].label = 'GEIRANGERFJORD'; places[3].country = 'NORWAY'; places[3].flag = '🇳🇴';
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
        var t = pointIndex / 48;
        points.push([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t]);
      }
      return { points:points, layer:L.polyline([points[0]], routeStyle).addTo(map) };
    });

    var markers = places.map(function(place, index){
      var pin = L.divIcon({ className:'journey-pin-wrap', html:'<div class="journey-map-pin"><span>' + (index + 1) + '</span></div>', iconSize:[32,32], iconAnchor:[16,16] });
      var marker = L.marker(place.coords, { icon:pin, keyboard:true, title:place.name }).addTo(map);
      marker.bindTooltip('<div class="journey-map-label"><span class="journey-map-label-flag">' + place.flag + '</span><strong>' + place.label + '</strong><small>' + place.country + '</small></div>', { className:'journey-tooltip', direction:'top', offset:[0,-18], opacity:1 });
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
      vehicle.bindTooltip(config.label, { direction:'top', offset:[0,-18], opacity:.9 });
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
      if(caption) caption.textContent = target.name + ' · ' + target.sub;
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
