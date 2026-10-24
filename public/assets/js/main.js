(() => {
  'use strict';

  const config = window.PROSUN_CONFIG || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.hostname.endsWith('.localhost');

  /* ---------------------------------------------------------------------
   * Analytics hooks
   * Every interaction worth measuring is pushed to window.dataLayer.
   * Nothing is sent anywhere unless a GTM or GA4 ID is set in config.js.
   * ------------------------------------------------------------------- */
  window.dataLayer = window.dataLayer || [];
  function track(event, params = {}) {
    window.dataLayer.push({ event, ...params });
    if (typeof window.gtag === 'function' && !config.gtmId) window.gtag('event', event, params);
  }
  window.prosunTrack = track;

  if (config.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`;
    document.head.appendChild(s);
  } else if (config.ga4Id) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4Id)}`;
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.ga4Id);
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el) track(el.dataset.track, { label: el.dataset.trackLabel || '', link_url: el.getAttribute('href') || '' });
  });

  // Keep campaign parameters from the landing page so they can travel with the enquiry.
  try {
    const params = new URLSearchParams(location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach((k) => {
      if (params.get(k)) utm[k] = params.get(k);
    });
    if (Object.keys(utm).length) sessionStorage.setItem('prosun_utm', JSON.stringify(utm));
    if (!sessionStorage.getItem('prosun_landing')) sessionStorage.setItem('prosun_landing', location.pathname);
  } catch (_) { /* storage unavailable: ignore */ }

  const readSession = (key) => {
    try { return sessionStorage.getItem(key); } catch (_) { return null; }
  };

  /* ---------------------------------------------------------------------
   * Header & navigation
   * ------------------------------------------------------------------- */
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileCta = document.querySelector('[data-mobile-cta]');

  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setNavOpen(open) {
    if (!nav || !navToggle) return;
    if (open) {
      const top = header.getBoundingClientRect().bottom;
      nav.style.setProperty('--nav-top', `${Math.max(top, 0)}px`);
    }
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.querySelector('.nav-toggle__label').textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('nav-open', open);
    if (mobileCta) mobileCta.classList.toggle('is-hidden', open);
  }
  navToggle && navToggle.addEventListener('click', () => setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true'));

  const subWrap = document.querySelector('[data-sub-wrap]');
  const subToggle = document.querySelector('[data-sub-toggle]');
  function setSubOpen(open) {
    if (!subWrap) return;
    subWrap.classList.toggle('is-open', open);
    subToggle.setAttribute('aria-expanded', String(open));
  }
  subToggle && subToggle.addEventListener('click', () => setSubOpen(subToggle.getAttribute('aria-expanded') !== 'true'));

  const desktop = window.matchMedia('(min-width: 961px) and (hover: hover)');
  if (subWrap) {
    let closeTimer;
    subWrap.addEventListener('mouseenter', () => { if (desktop.matches) { clearTimeout(closeTimer); setSubOpen(true); } });
    subWrap.addEventListener('mouseleave', () => { if (desktop.matches) closeTimer = setTimeout(() => setSubOpen(false), 150); });
    subWrap.addEventListener('focusout', (e) => { if (desktop.matches && !subWrap.contains(e.relatedTarget)) setSubOpen(false); });
  }
  // Open the services submenu by default on mobile when on a service page.
  if (subWrap && subWrap.querySelector('[aria-current="page"]') && !desktop.matches) setSubOpen(true);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (subWrap && subWrap.classList.contains('is-open') && desktop.matches) { setSubOpen(false); subToggle.focus(); }
    if (nav && nav.classList.contains('is-open')) { setNavOpen(false); navToggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (subWrap && desktop.matches && !subWrap.contains(e.target)) setSubOpen(false);
  });
  nav && nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.hash && a.pathname === location.pathname) setNavOpen(false);
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setNavOpen(false); });

  /* ---------------------------------------------------------------------
   * WhatsApp (only when a confirmed number is configured)
   * ------------------------------------------------------------------- */
  const wa = String(config.whatsappNumber || '').replace(/\D/g, '');
  if (wa.length >= 10) {
    const text = encodeURIComponent('Hello Prosun, I would like to discuss a solar project.');
    document.querySelectorAll('[data-whatsapp]').forEach((el) => { el.hidden = false; });
    document.querySelectorAll('[data-whatsapp-link]').forEach((a) => {
      a.href = `https://wa.me/${wa}?text=${text}`;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------------------------------------------------------------------
   * Enquiry forms
   * ------------------------------------------------------------------- */
  const FIELD_LABELS = {
    customerType: 'Who the enquiry is for',
    name: 'Your name',
    phone: 'Phone number',
    location: 'Site location',
    email: 'Email',
  };

  function digitsOf(v) { return String(v || '').replace(/\D/g, ''); }

  function validate(form) {
    const data = new FormData(form);
    const errors = {};
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const email = String(data.get('email') || '').trim();

    if (!data.get('customerType')) errors.customerType = 'Please choose who the enquiry is for.';
    if (!name) errors.name = 'Please enter your name.';
    else if (name.length < 2) errors.name = 'Please enter your full name.';

    const d = digitsOf(phone);
    if (!phone) errors.phone = 'Please enter a phone number so we can call you back.';
    else if (/[^\d\s()+-]/.test(phone) || d.length < 10 || d.length > 13) {
      errors.phone = 'Please enter a valid phone number, e.g. 98765 43210 or +91 98765 43210.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = 'Please enter a valid email address, e.g. name@company.com, or leave it blank.';
    }
    return errors;
  }

  function showErrors(form, errors, { summary = true } = {}) {
    const all = ['customerType', 'name', 'phone', 'location', 'email'];
    all.forEach((key) => {
      const wrap = form.querySelector(`[data-field="${key}"]`);
      if (!wrap) return;
      const msg = wrap.querySelector('.field__error');
      const inputs = wrap.querySelectorAll('input, select, textarea');
      const has = Boolean(errors[key]);
      wrap.classList.toggle('has-error', has);
      inputs.forEach((i) => {
        if (has) i.setAttribute('aria-invalid', 'true');
        else i.removeAttribute('aria-invalid');
      });
      if (msg) { msg.hidden = !has; msg.textContent = errors[key] || ''; }
    });

    const box = form.querySelector('[data-error-summary]');
    const keys = Object.keys(errors);
    if (!summary) return;
    if (!keys.length) { box.hidden = true; return; }
    const ul = box.querySelector('ul');
    ul.innerHTML = '';
    keys.forEach((key) => {
      const target = key === 'customerType' ? form.querySelector('input[name="customerType"]') : form.querySelector(`[name="${key}"]`);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${target.id || ''}`;
      a.textContent = `${FIELD_LABELS[key] || key}: ${errors[key]}`;
      a.addEventListener('click', (e) => { e.preventDefault(); target.focus(); });
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.hidden = false;
    box.focus();
  }

  function payloadFrom(form) {
    const data = new FormData(form);
    const payload = {};
    ['customerType', 'name', 'phone', 'location', 'email', 'projectType', 'size', 'message'].forEach((k) => {
      payload[k] = String(data.get(k) || '').trim();
    });
    payload.formSource = form.dataset.source || 'website';
    payload.pageUrl = location.href;
    payload.landingPage = readSession('prosun_landing') || '';
    payload.submittedAt = new Date().toISOString();
    try { Object.assign(payload, JSON.parse(readSession('prosun_utm') || '{}')); } catch (_) { /* ignore */ }
    return payload;
  }

  function mailtoFor(p) {
    const optional = [
      ['Email', p.email],
      ['Location', p.location],
      ['Project type', p.projectType],
      ['System size / monthly bill', p.size],
      ['Message', p.message],
    ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    const lines = [
      'New solar enquiry from the Prosun website',
      '',
      `Enquiring for: ${p.customerType}`,
      `Name: ${p.name}`,
      `Phone: ${p.phone}`,
      ...optional,
      '',
      `Sent from: ${p.pageUrl}`,
    ];
    const subject = `Solar enquiry: ${p.customerType} – ${p.name}${p.location ? `, ${p.location}` : ''}`;
    return `mailto:${config.fallbackEmail || 'info@psun.in'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  async function send(payload) {
    const isJson = (config.formEncoding || 'json') === 'json';
    let body;
    if (isJson) body = JSON.stringify(payload);
    else { body = new FormData(); Object.entries(payload).forEach(([k, v]) => body.append(k, v)); }
    const res = await fetch(config.formEndpoint, {
      method: 'POST',
      headers: isJson ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body,
    });
    if (!res.ok) throw new Error(`Form endpoint responded with ${res.status}`);
  }

  function showSuccess(form, payload, mode) {
    const card = form.closest('[data-form-card]');
    const success = card.querySelector('[data-form-success]');
    const firstName = payload.name.split(/\s+/)[0];
    success.querySelector('[data-success-phone]').textContent = payload.phone;
    const title = success.querySelector('[data-success-title]');
    const sentBlock = success.querySelector('[data-success-sent]');
    const mailBlock = success.querySelector('[data-success-mailto]');

    if (mode === 'mailto') {
      title.textContent = `Thanks, ${firstName}. Your enquiry is almost on its way.`;
      sentBlock.hidden = true;
      mailBlock.hidden = false;
      const again = mailBlock.querySelector('[data-mailto-again]');
      again.href = mailtoFor(payload);
      if (isLocal && !success.querySelector('.dev-note')) {
        const note = document.createElement('p');
        note.className = 'dev-note';
        note.textContent = 'Developer note: no form endpoint is configured in assets/js/config.js, so this enquiry was handed to the visitor\'s email app instead of being submitted.';
        success.appendChild(note);
      }
    } else {
      title.textContent = `Thank you, ${firstName}. We've received your enquiry.`;
    }

    form.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  document.querySelectorAll('[data-enquiry-form]').forEach((form) => {
    const select = form.querySelector('select[name="projectType"]');
    const preset = form.dataset.preset;
    if (preset && select && [...select.options].some((o) => o.value === preset)) {
      select.value = preset;
      if (preset === 'Rooftop solar for home') {
        const home = form.querySelector('input[name="customerType"][value="Home"]');
        if (home) home.checked = true;
      }
    }

    // Progress bar: required fields count more than optional ones.
    const bar = form.querySelector('.form-progress');
    const weights = { customerType: 2, name: 2, phone: 2, location: 1, email: 1, projectType: 1, size: 1, message: 1 };
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    function updateProgress() {
      const data = new FormData(form);
      let score = 0;
      Object.entries(weights).forEach(([k, w]) => { if (String(data.get(k) || '').trim()) score += w; });
      bar && bar.style.setProperty('--progress', `${Math.round((score / total) * 100)}%`);
    }
    updateProgress();

    let started = false;
    let attempted = false;
    form.addEventListener('input', () => {
      if (!started) { started = true; track('form_start', { form_source: form.dataset.source || '' }); }
      updateProgress();
    });
    form.addEventListener('change', updateProgress);
    form.addEventListener('focusout', (e) => {
      if (!attempted || !e.target.name) return;
      showErrors(form, validate(form), { summary: false });
    });
    form.addEventListener('change', (e) => {
      if (attempted && e.target.name === 'customerType') showErrors(form, validate(form), { summary: false });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      attempted = true;
      const old = form.querySelector('.form-status-error');
      if (old) old.remove();

      const errors = validate(form);
      showErrors(form, errors);
      if (Object.keys(errors).length) {
        track('form_validation_error', { fields: Object.keys(errors).join(','), form_source: form.dataset.source || '' });
        return;
      }

      const payload = payloadFrom(form);

      // Bots fill the hidden field; show success without sending anything.
      if (form.querySelector('[name="company_website"]').value) { showSuccess(form, payload, 'sent'); return; }

      const btn = form.querySelector('[data-submit]');
      const label = form.querySelector('[data-submit-label]');
      const leadParams = {
        form_source: payload.formSource,
        customer_type: payload.customerType,
        project_type: payload.projectType || 'not specified',
      };

      if (!config.formEndpoint) {
        track('generate_lead', { ...leadParams, delivery: 'mailto_fallback' });
        window.location.href = mailtoFor(payload);
        showSuccess(form, payload, 'mailto');
        return;
      }

      btn.disabled = true;
      label.textContent = 'Sending…';
      try {
        await send(payload);
        track('generate_lead', { ...leadParams, delivery: 'endpoint' });
        showSuccess(form, payload, 'sent');
      } catch (err) {
        track('form_submit_error', { form_source: payload.formSource });
        const p = document.createElement('p');
        p.className = 'form-status-error';
        p.setAttribute('role', 'alert');
        p.innerHTML = 'Sorry, we couldn\'t send your enquiry just now. Your details are still here, so please try again, or call <a href="tel:18001023317">1800 102 3317</a> or email <a href="mailto:info@psun.in">info@psun.in</a>.';
        btn.insertAdjacentElement('afterend', p);
      } finally {
        btn.disabled = false;
        label.textContent = 'Send enquiry';
      }
    });
  });

  /* ---------------------------------------------------------------------
   * Projects filter
   * ------------------------------------------------------------------- */
  const filterWrap = document.querySelector('[data-filters]');
  if (filterWrap) {
    const cards = [...document.querySelectorAll('[data-category]')];
    const status = document.querySelector('[data-filter-status]');
    filterWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      const f = btn.dataset.filter;
      filterWrap.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let shown = 0;
      cards.forEach((c) => {
        const match = f === 'all' || c.dataset.category.split(' ').includes(f);
        c.hidden = !match;
        if (match) shown += 1;
      });
      if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'}${f === 'all' ? '' : `: ${btn.textContent.trim()}`}.`;
      track('project_filter', { filter: f });
    });
    // Links such as /projects/#utility open with that filter applied.
    const fromHash = filterWrap.querySelector(`[data-filter="${location.hash.slice(1)}"]`);
    if (fromHash) fromHash.click();
  }

  /* ---------------------------------------------------------------------
   * Subtle reveal on scroll, and hiding the sticky mobile CTA near forms
   * ------------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    if (!reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    } else {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }

    if (mobileCta) {
      const visible = new Set();
      const ioCta = new IntersectionObserver((entries) => {
        entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
        mobileCta.classList.toggle('is-hidden', visible.size > 0 || document.body.classList.contains('nav-open'));
      });
      document.querySelectorAll('[data-form-card], .footer-cta').forEach((el) => ioCta.observe(el));
    }
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }
})();
