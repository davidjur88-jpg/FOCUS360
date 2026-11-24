// Site behaviour: nav, reveal-on-scroll, contact details, contact form -> Supabase.
(function () {
  'use strict';
  var S = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wa = function (t) { return 'https://wa.me/' + S.whatsapp + (t ? '?text=' + encodeURIComponent(t) : ''); };

  function init() {
    $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
    $$('[data-whatsapp]').forEach(function (a) { a.href = wa('Hello Focus360, I would like to discuss a project.'); });
    $$('[data-phone-text]').forEach(function (e) { e.textContent = S.phoneText; });
    $$('[data-email]').forEach(function (a) { a.href = 'mailto:' + S.email; });
    $$('[data-email-text]').forEach(function (e) { e.textContent = S.email; });
    $$('[data-social]').forEach(function (a) {
      var u = (S.social || {})[a.dataset.social];
      if (/^https:\/\//i.test(u || '')) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; } else (a.closest('li') || a).hidden = true;
    });

    var t = $('.nav-toggle'), links = $('#nav-links');
    if (t && links) {
      var set = function (o) { links.classList.toggle('open', o); t.setAttribute('aria-expanded', String(o)); t.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); };
      t.addEventListener('click', function () { set(!links.classList.contains('open')); });
      links.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    }

    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 }) : null;
    $$('.reveal').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

    var form = $('#contact-form');
    if (form) setupForm(form);
  }

  function setupForm(form) {
    var status = $('.form__status', form);
    var say = function (m, ok) { status.textContent = m; status.className = 'form__status ' + (ok ? 'ok' : 'err'); };
    var val = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };

    var send = $('[data-whatsapp-send]', form);
    if (send) send.addEventListener('click', function () {
      var m = 'Hello Focus360, my name is ' + (val('name') || '(name)') + '. ' + (val('service') ? 'I need: ' + val('service') + '. ' : '') + val('message');
      window.open(wa(m), '_blank', 'noopener');
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (val('website')) return say('Thank you. Your message was sent.', true); // honeypot: bots only
      if (!form.checkValidity()) { form.reportValidity(); return say('Please fill in your name, a valid email and your message.', false); }
      var btn = $('button[type=submit]', form); btn.disabled = true; say('Sending…', true);
      var row = { name: val('name'), email: val('email'), phone: val('phone') || null, service: val('service') || null, message: val('message') };
      try {
        if (window.sb) {
          var r = await sb.from('messages').insert(row);
          if (r.error) throw r.error;
        } else {
          var body = new URLSearchParams({ 'form-name': 'contact' }); Object.keys(row).forEach(function (k) { body.append(k, row[k] || ''); });
          var res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
          if (!res.ok) throw new Error('send failed');
        }
        form.reset(); say('Thank you. Your message was sent. We will reply soon.', true);
      } catch (err) {
        say('Your message could not be sent. Please use WhatsApp or email instead.', false);
      } finally { btn.disabled = false; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
