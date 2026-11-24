// Loads projects and testimonials from Supabase; falls back to samples if unavailable.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var safeUrl = function (u) { return /^https:\/\//i.test(u || '') ? u : ''; };
  var cats = (window.SITE && SITE.categories) || [];
  var SAMPLES = cats.slice(0, 6).map(function (c, i) {
    return { id: 'sample-' + i, title: 'Sample project ' + (i + 1), category: c, summary: 'Placeholder project shown until real work is uploaded.', client: 'Sample client', year: String(new Date().getFullYear()), featured: i < 4, sample: true };
  });
  var COLORS = ['#ff4d1f', '#1c1c1a', '#2b3a55', '#6b2d3a', '#2f5d50', '#8a6d1d'];
  var all = [];

  function media(p, i) {
    var u = safeUrl(p.image_url);
    if (u) return '<img src="' + esc(u) + '" alt="' + esc(p.title) + '" loading="lazy">';
    return '<svg class="art" viewBox="0 0 400 500" role="img" aria-label="' + esc(p.title) + '"><rect width="400" height="500" fill="' + COLORS[i % COLORS.length] + '"/><text x="30" y="440" font-size="150" fill="#f1eee6" fill-opacity=".9">' + esc((p.category || '').slice(0, 2).toUpperCase()) + '</text></svg>';
  }
  function card(p, i) {
    var shape = i % 3 === 1 ? 'work--landscape' : i % 3 === 2 ? 'work--square' : '';
    return '<a class="work ' + shape + '" href="#" role="button" data-id="' + esc(p.id) + '"><div class="work__media">' + media(p, i) +
      (p.sample ? '<span class="work__badge">Sample</span>' : '') + '<span class="work__view" aria-hidden="true">View</span></div>' +
      '<div class="work__cap"><h3>' + esc(p.title) + '</h3><span class="work__meta">' + esc(p.category) + '</span></div></a>';
  }

  function openModal(id) {
    var i = all.findIndex(function (p) { return String(p.id) === String(id); });
    if (i < 0) return;
    var p = all[i], d = $('dialog.modal');
    if (!d) { d = document.createElement('dialog'); d.className = 'modal'; d.setAttribute('aria-label', 'Project details'); document.body.appendChild(d);
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
      d.addEventListener('close', function () { document.documentElement.classList.remove('no-scroll'); }); }
    d.innerHTML = '<div class="modal__inner"><div class="modal__media">' + media(p, i) + '</div><div class="modal__body"><p class="work__meta">' + esc(p.category) + '</p><h2 class="display h-md">' + esc(p.title) + '</h2>' +
      (p.summary ? '<p class="modal__sum">' + esc(p.summary) + '</p>' : '') +
      '<dl class="specs">' + (p.client ? '<div><dt>Client</dt><dd>' + esc(p.client) + '</dd></div>' : '') + (p.year ? '<div><dt>Year</dt><dd>' + esc(p.year) + '</dd></div>' : '') + '</dl>' +
      '<div class="modal__nav"><button class="btn" type="button" data-step="-1">Previous</button><a class="btn btn--solid" href="contact.html">Start a project</a><button class="btn" type="button" data-step="1">Next</button></div></div>' +
      '<button class="modal__close" type="button" aria-label="Close">&times;</button></div>';
    d.querySelector('.modal__close').onclick = function () { d.close(); };
    d.querySelectorAll('[data-step]').forEach(function (b) { b.onclick = function () { openModal(all[(i + Number(b.dataset.step) + all.length) % all.length].id); }; });
    if (!d.open) { d.showModal(); document.documentElement.classList.add('no-scroll'); }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.work[data-id]');
    if (a) { e.preventDefault(); openModal(a.dataset.id); }
  });

  function renderGallery() {
    var box = $('[data-gallery]'), f = $('[data-filters]'), n = $('[data-count]');
    if (!box) return;
    var set = ['All'].concat(all.map(function (p) { return p.category; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    var cur = 'All';
    function draw() {
      var list = all.filter(function (p) { return cur === 'All' || p.category === cur; });
      box.innerHTML = list.map(function (p) { return card(p, all.indexOf(p)).replace('class="work ', 'class="work fade-in '); }).join('');
      if (n) n.textContent = list.length + (list.length === 1 ? ' project' : ' projects');
      f.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === cur)); });
    }
    f.innerHTML = set.map(function (c) { return '<button class="chip" type="button" data-c="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>'; }).join('');
    f.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) { cur = b.dataset.c; draw(); } });
    draw();
  }

  async function fetchRows(table, fallback) {
    if (!window.sb) return fallback;
    try {
      var r = await sb.from(table).select('*').eq('published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      return r.error || !r.data || !r.data.length ? fallback : r.data;
    } catch (e) { return fallback; }
  }

  async function init() {
    var needsProjects = $('[data-featured]') || $('[data-gallery]');
    if (needsProjects) {
      all = await fetchRows('projects', SAMPLES);
      var feat = $('[data-featured]');
      if (feat) {
        var f = all.filter(function (p) { return p.featured; }); if (!f.length) f = all;
        feat.innerHTML = f.slice(0, 4).map(function (p) { return card(p, all.indexOf(p)); }).join('');
        var note = $('#work .note'); if (note && !all[0].sample) note.hidden = true;
      }
      renderGallery();
    }
    var q = $('[data-testimonials]');
    if (q) {
      var t = await fetchRows('testimonials', []);
      if (!t.length) { var s = q.closest('section'); if (s) s.hidden = true; return; }
      var one = function (x, cls) { return '<figure class="quote ' + cls + '"><blockquote>' + esc(x.quote) + '</blockquote><cite>' + esc(x.author) + (x.role ? ', ' + esc(x.role) : '') + '</cite></figure>'; };
      q.innerHTML = one(t[0], 'quote--big') + '<div>' + t.slice(1, 4).map(function (x) { return one(x, 'quote--small'); }).join('') + '</div>';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
