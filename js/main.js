/* ==========================================================================
   FOCUS360 STUDIO — site behaviour
   Navigation, contact links, portfolio (filters + project viewer),
   featured work, testimonials, contact form, scroll reveals.
   No libraries. Settings live in config.js, projects in projects.js.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.FOCUS360 || {};
  var PROJECTS = window.PROJECTS || [];
  var TESTIMONIALS = window.TESTIMONIALS || [];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ------------------------------------------------------------------ *
   * Contact details from config.js
   * ------------------------------------------------------------------ */
  function waLink(text) {
    var n = String(C.whatsappNumber || "").replace(/\D/g, "");
    return "https://wa.me/" + n + (text ? "?text=" + encodeURIComponent(text) : "");
  }
  $$("[data-whatsapp]").forEach(function (a) {
    a.href = waLink(C.whatsappMessage);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
  $$("[data-email]").forEach(function (a) {
    a.href = "mailto:" + (C.email || "");
    if (a.hasAttribute("data-email-text")) a.textContent = C.email || "";
  });
  $$("[data-phone-text]").forEach(function (el) { el.textContent = C.phoneDisplay || ""; });
  $$("[data-social]").forEach(function (a) {
    var url = (C.social || {})[a.getAttribute("data-social")];
    if (url) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else {
      (a.closest("li") || a).hidden = true;
    }
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ------------------------------------------------------------------ *
   * Responsive navigation
   * ------------------------------------------------------------------ */
  var toggle = $(".nav-toggle");
  var links = $("#nav-links");
  function setMenu(open) {
    if (!toggle || !links) return;
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("no-scroll", open);
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ------------------------------------------------------------------ *
   * Generated placeholder artwork (used when a project has no image)
   * ------------------------------------------------------------------ */
  function num(n) { return Math.round(n * 10) / 10; }

  var ART = {
    brand: function (W, H, bg, fg, ac, p) {
      var cx = W / 2, cy = H / 2 - 10, r = Math.min(240, H / 2 - 70);
      var L = esc((p.letter || p.title || "F").charAt(0).toUpperCase());
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + fg + '" stroke-opacity=".3" stroke-width="2"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r * 0.64) + '" fill="' + ac + '"/>' +
        '<text x="' + cx + '" y="' + (cy + r * 0.31) + '" text-anchor="middle" font-size="' + num(r * 0.95) + '" fill="' + bg + '">' + L + '</text>' +
        '<path d="M' + (cx - r - 60) + ' ' + cy + 'h50M' + (cx + r + 10) + ' ' + cy + 'h50M' + cx + ' ' + (cy - r - 60) + 'v50M' + cx + ' ' + (cy + r + 10) + 'v50" stroke="' + fg + '" stroke-width="2"/>';
    },
    pack: function (W, H, bg, fg, ac) {
      var x = W / 2, y = H / 2 - 20;
      return '<ellipse cx="' + x + '" cy="' + (y + 250) + '" rx="270" ry="26" fill="#000" opacity=".16"/>' +
        '<polygon points="' + (x - 190) + ',' + (y - 150) + ' ' + (x - 70) + ',' + (y - 190) + ' ' + (x + 190) + ',' + (y - 190) + ' ' + (x + 70) + ',' + (y - 150) + '" fill="' + fg + '" opacity=".7"/>' +
        '<polygon points="' + (x + 70) + ',' + (y - 150) + ' ' + (x + 190) + ',' + (y - 190) + ' ' + (x + 190) + ',' + (y + 190) + ' ' + (x + 70) + ',' + (y + 230) + '" fill="' + ac + '"/>' +
        '<rect x="' + (x - 190) + '" y="' + (y - 150) + '" width="260" height="380" fill="' + fg + '"/>' +
        '<circle cx="' + (x - 60) + '" cy="' + (y - 30) + '" r="66" fill="' + ac + '"/>' +
        '<circle cx="' + (x - 60) + '" cy="' + (y - 30) + '" r="30" fill="' + fg + '"/>' +
        '<rect x="' + (x - 160) + '" y="' + (y + 90) + '" width="200" height="9" fill="' + bg + '"/>' +
        '<rect x="' + (x - 160) + '" y="' + (y + 116) + '" width="130" height="9" fill="' + bg + '"/>' +
        '<rect x="' + (x - 160) + '" y="' + (y + 170) + '" width="70" height="30" fill="' + bg + '"/>';
    },
    campaign: function (W, H, bg, fg, ac) {
      return '<polygon points="0,' + H * 0.2 + ' ' + W + ',0 ' + W + ',' + H * 0.4 + ' 0,' + H * 0.62 + '" fill="' + fg + '"/>' +
        '<polygon points="0,' + H * 0.66 + ' ' + W + ',' + H * 0.44 + ' ' + W + ',' + H * 0.52 + ' 0,' + H * 0.74 + '" fill="' + ac + '"/>' +
        '<circle cx="' + W * 0.68 + '" cy="' + H * 0.78 + '" r="' + W * 0.2 + '" fill="' + ac + '"/>' +
        '<circle cx="' + W * 0.3 + '" cy="' + H * 0.3 + '" r="' + W * 0.09 + '" fill="' + bg + '"/>';
    },
    social: function (W, H, bg, fg, ac) {
      var s = 200, g = 24, x0 = (W - 3 * s - 2 * g) / 2, y0 = (H - 3 * s - 2 * g) / 2 - 20, o = "", i, x, y, h = s / 2;
      for (i = 0; i < 9; i++) {
        x = x0 + (i % 3) * (s + g); y = y0 + Math.floor(i / 3) * (s + g);
        switch (i) {
          case 0: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="' + fg + '"/>'; break;
          case 1: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="' + ac + '"/>'; break;
          case 2: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + fg + '" stroke-width="3"/><circle cx="' + (x + h) + '" cy="' + (y + h) + '" r="56" fill="' + fg + '"/>'; break;
          case 3: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + fg + '" stroke-width="3"/>' +
            [40, 80, 120, 160].map(function (d) { return '<rect x="' + (x + 24) + '" y="' + (y + d - 4) + '" width="' + (s - 48) + '" height="8" fill="' + fg + '"/>'; }).join(""); break;
          case 4: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="' + fg + '"/><circle cx="' + (x + h) + '" cy="' + (y + h) + '" r="64" fill="' + ac + '"/>'; break;
          case 5: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="' + ac + '"/><polygon points="' + (x + 40) + ',' + (y + s - 40) + ' ' + (x + s - 40) + ',' + (y + s - 40) + ' ' + (x + h) + ',' + (y + 40) + '" fill="' + fg + '"/>'; break;
          case 6: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + fg + '" stroke-width="3"/><path d="M' + (x + 30) + ' ' + (y + h) + 'a70 70 0 0 1 140 0z" fill="' + ac + '"/>'; break;
          case 7: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="' + fg + '"/><text x="' + (x + h) + '" y="' + (y + h + 38) + '" text-anchor="middle" font-size="120" fill="' + bg + '">Aa</text>'; break;
          default: o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="' + ac + '"/><circle cx="' + (x + h) + '" cy="' + (y + h) + '" r="48" fill="' + bg + '"/>';
        }
      }
      return o;
    },
    print: function (W, H, bg, fg, ac) {
      var m = 70, pw = (W - 2 * m) / 2, ph = H - 2 * m - 30, o = "", i;
      o += '<rect x="' + (m + 8) + '" y="' + (m + 12) + '" width="' + pw * 2 + '" height="' + ph + '" fill="#000" opacity=".12"/>';
      o += '<rect x="' + m + '" y="' + m + '" width="' + pw + '" height="' + ph + '" fill="' + fg + '"/>';
      o += '<rect x="' + (m + pw) + '" y="' + m + '" width="' + pw + '" height="' + ph + '" fill="#fffdf8"/>';
      o += '<text x="' + (m + 36) + '" y="' + (m + ph - 40) + '" font-size="' + Math.min(240, ph * 0.5) + '" fill="' + ac + '">04</text>';
      for (i = 0; i < 6; i++) {
        o += '<rect x="' + (m + pw + 40) + '" y="' + (m + ph * 0.4 + i * 26) + '" width="' + (pw - 80 - (i % 3) * 40) + '" height="7" fill="' + fg + '" opacity=".75"/>';
      }
      o += '<rect x="' + (m + pw + 40) + '" y="' + (m + 40) + '" width="' + (pw - 80) + '" height="' + ph * 0.22 + '" fill="' + ac + '"/>';
      o += '<line x1="' + (m + pw) + '" y1="' + m + '" x2="' + (m + pw) + '" y2="' + (m + ph) + '" stroke="#000" stroke-opacity=".3" stroke-width="2"/>';
      return o;
    },
    motion: function (W, H, bg, fg, ac) {
      var cx = W / 2, cy = H / 2 - 30, o = "", i, ty = H - 100;
      [310, 240, 170, 100].forEach(function (r, k) {
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + fg + '" stroke-opacity="' + (0.2 + k * 0.2) + '" stroke-width="2"/>';
      });
      o += '<circle cx="' + cx + '" cy="' + cy + '" r="70" fill="' + ac + '"/>';
      o += '<polygon points="' + (cx - 18) + ',' + (cy - 32) + ' ' + (cx - 18) + ',' + (cy + 32) + ' ' + (cx + 36) + ',' + cy + '" fill="' + bg + '"/>';
      o += '<line x1="80" y1="' + ty + '" x2="' + (W - 80) + '" y2="' + ty + '" stroke="' + fg + '" stroke-opacity=".5" stroke-width="2"/>';
      for (i = 0; i <= 12; i++) { o += '<line x1="' + (80 + i * ((W - 160) / 12)) + '" y1="' + (ty - 8) + '" x2="' + (80 + i * ((W - 160) / 12)) + '" y2="' + (ty + 8) + '" stroke="' + fg + '" stroke-opacity=".5" stroke-width="2"/>'; }
      o += '<line x1="' + W * 0.42 + '" y1="' + (ty - 24) + '" x2="' + W * 0.42 + '" y2="' + (ty + 24) + '" stroke="' + ac + '" stroke-width="4"/>';
      o += '<circle cx="' + W * 0.42 + '" cy="' + (ty - 24) + '" r="9" fill="' + ac + '"/>';
      return o;
    },
    type: function (W, H, bg, fg, ac, p) {
      var t = esc((p.words && p.words[0]) || "Aa");
      return '<text x="' + W / 2 + '" y="' + (H / 2 + 190) + '" text-anchor="middle" font-size="560" fill="' + fg + '" textLength="640" lengthAdjust="spacingAndGlyphs">' + t + '</text>' +
        '<circle cx="' + (W - 130) + '" cy="150" r="46" fill="' + ac + '"/>' +
        '<rect x="70" y="120" width="180" height="12" fill="' + ac + '"/><rect x="70" y="150" width="110" height="12" fill="' + fg + '" opacity=".6"/>';
    },
    poster: function (W, H, bg, fg, ac, p) {
      var words = p.words || ["Make", "the", "difference"], size = H < 700 ? 150 : 190, o = "";
      var lh = size * 0.88, y = (H - words.length * lh) / 2 + size * 0.78 - 20;
      words.forEach(function (w, i) {
        var tl = Math.min(W - 100, w.length * size * 0.44);
        o += '<text x="50" y="' + num(y + i * lh) + '" font-size="' + size + '" fill="' + (i === words.length - 1 ? ac : fg) + '" textLength="' + num(tl) + '" lengthAdjust="spacingAndGlyphs">' + esc(w.toUpperCase()) + '</text>';
      });
      o += '<circle cx="' + (W - 80) + '" cy="80" r="26" fill="' + ac + '"/>';
      return o;
    }
  };

  function art(p) {
    var W = 800, H = { portrait: 1000, square: 800, landscape: 600 }[p.ratio] || 800;
    var c = p.colors || ["#0c0c0b", "#f1eee6", "#ff4d1f"];
    var draw = ART[p.art] || ART.brand;
    var label = (String(p.category || "").toUpperCase() + " · SAMPLE");
    var lw = Math.round(label.length * 15.5 + 44);
    return '<svg class="art" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(p.title) + ' — sample artwork" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="' + W + '" height="' + H + '" fill="' + c[0] + '"/>' +
      draw(W, H, c[0], c[1], c[2], p) +
      '<rect x="36" y="' + (H - 120) + '" width="' + lw + '" height="46" fill="' + c[0] + '"/>' +
      '<text x="54" y="' + (H - 88) + '" font-size="26" letter-spacing="3" fill="' + c[1] + '">' + esc(label) + '</text></svg>';
  }

  function mediaFor(p) {
    return p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.title) + '" loading="lazy">'
      : art(p);
  }

  function card(p, reveal) {
    return '<a class="work work--' + esc(p.ratio || "portrait") + (reveal ? " reveal" : "") + '" href="portfolio.html#' + esc(p.id) + '" data-project="' + esc(p.id) + '" data-category="' + esc(p.category) + '">' +
      '<div class="work__media">' + (p.sample ? '<span class="work__badge">Sample project</span>' : "") + mediaFor(p) + '<span class="work__view" aria-hidden="true">View</span></div>' +
      '<div class="work__cap"><h3>' + esc(p.title) + '</h3><span class="work__meta">' + esc(p.category) + "</span></div></a>";
  }

  /* ------------------------------------------------------------------ *
   * Featured projects (home page)
   * ------------------------------------------------------------------ */
  var featBox = $("[data-featured]");
  if (featBox) {
    var feats = PROJECTS.filter(function (p) { return p.featured; }).slice(0, 4);
    if (feats.length < 4) {
      PROJECTS.forEach(function (p) { if (feats.length < 4 && feats.indexOf(p) === -1) feats.push(p); });
    }
    featBox.innerHTML = feats.map(function (p) { return card(p, true); }).join("");
  }

  /* ------------------------------------------------------------------ *
   * Testimonials (home page)
   * ------------------------------------------------------------------ */
  var quoteBox = $("[data-testimonials]");
  if (quoteBox && TESTIMONIALS.length) {
    function quote(t, big) {
      return '<figure class="quote ' + (big ? "quote--big" : "quote--small") + '">' +
        (t.sample ? '<span class="tag">Sample testimonial</span>' : "") +
        "<blockquote>" + esc(t.quote) + '</blockquote><figcaption><cite>' + esc(t.name) + " — " + esc(t.role) + "</cite></figcaption></figure>";
    }
    quoteBox.innerHTML = '<div class="reveal">' + quote(TESTIMONIALS[0], true) + "</div>" +
      '<div class="reveal">' + TESTIMONIALS.slice(1).map(function (t) { return quote(t, false); }).join("") + "</div>";
  }

  /* ------------------------------------------------------------------ *
   * Portfolio page: gallery, filters, project viewer
   * ------------------------------------------------------------------ */
  var gallery = $("[data-gallery]");
  var filterBox = $("[data-filters]");
  var countEl = $("[data-count]");
  var byId = {};
  PROJECTS.forEach(function (p) { byId[p.id] = p; });

  var modal = null, currentId = null, lastTrigger = null;

  function visibleIds() {
    if (!gallery) return PROJECTS.map(function (p) { return p.id; });
    var ids = $$(".work:not([hidden])", gallery).map(function (a) { return a.getAttribute("data-project"); });
    return ids.length ? ids : PROJECTS.map(function (p) { return p.id; });
  }

  function renderModal(id) {
    var p = byId[id];
    if (!p || !modal) return;
    currentId = id;
    var ids = visibleIds();
    if (ids.indexOf(id) === -1) ids = PROJECTS.map(function (x) { return x.id; });
    var many = ids.length > 1;
    var extra = (p.gallery || []).map(function (src) { return '<img src="' + esc(src) + '" alt="" loading="lazy">'; }).join("");
    modal.innerHTML =
      '<div class="modal__inner">' +
      '<button class="modal__close" type="button" data-close aria-label="Close project">&times;</button>' +
      '<div class="modal__media">' + mediaFor(p) + "</div>" +
      '<div class="modal__body">' +
      '<p class="eyebrow">' + esc(p.category) + (p.year ? " · " + esc(p.year) : "") + "</p>" +
      '<h2 id="modal-title" class="display h-md">' + esc(p.title) + "</h2>" +
      (p.sample ? '<p><span class="tag">Sample project — placeholder content</span></p>' : "") +
      '<p class="modal__sum">' + esc(p.summary) + "</p>" +
      "<p>" + esc(p.description) + "</p>" +
      '<dl class="specs">' +
      (p.client ? "<div><dt>Client</dt><dd>" + esc(p.client) + "</dd></div>" : "") +
      ((p.services || []).length ? "<div><dt>Scope</dt><dd>" + p.services.map(esc).join(" / ") + "</dd></div>" : "") +
      "</dl>" +
      (extra ? '<div class="modal__more">' + extra + "</div>" : "") +
      '<div class="modal__nav">' +
      (many ? '<button class="btn btn--sm" type="button" data-prev><span aria-hidden="true">←</span> Previous</button>' : "") +
      '<a class="btn btn--solid btn--sm" href="contact.html">Start a similar project</a>' +
      (many ? '<button class="btn btn--sm" type="button" data-next>Next <span aria-hidden="true">→</span></button>' : "") +
      "</div></div></div>";
    modal.scrollTop = 0;
  }

  function step(dir) {
    var ids = visibleIds();
    var i = ids.indexOf(currentId);
    if (i === -1) i = 0;
    var next = ids[(i + dir + ids.length) % ids.length];
    renderModal(next);
    history.replaceState(null, "", "#" + next);
    var btn = $(dir > 0 ? "[data-next]" : "[data-prev]", modal);
    if (btn) btn.focus();
  }

  function ensureModal() {
    if (modal) return;
    modal = document.createElement("dialog");
    modal.className = "modal";
    modal.setAttribute("aria-labelledby", "modal-title");
    document.body.appendChild(modal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) { modal.close(); return; }
      if (e.target.closest("[data-close]")) modal.close();
      else if (e.target.closest("[data-prev]")) step(-1);
      else if (e.target.closest("[data-next]")) step(1);
    });
    modal.addEventListener("close", function () {
      document.documentElement.classList.remove("no-scroll");
      currentId = null;
      history.replaceState(null, "", location.pathname + location.search);
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    });
  }

  function openProject(id, trigger) {
    if (!byId[id]) return;
    ensureModal();
    if (trigger) lastTrigger = trigger;
    renderModal(id);
    if (!modal.open) {
      if (typeof modal.showModal === "function") modal.showModal();
      else modal.setAttribute("open", "");
      document.documentElement.classList.add("no-scroll");
    }
    history.replaceState(null, "", "#" + id);
  }

  if (gallery) {
    gallery.innerHTML = PROJECTS.map(function (p) { return card(p, false); }).join("");

    var cats = ["All"];
    PROJECTS.forEach(function (p) { if (cats.indexOf(p.category) === -1) cats.push(p.category); });
    if (filterBox) {
      filterBox.innerHTML = cats.map(function (c, i) {
        return '<button class="chip" type="button" data-filter="' + esc(c) + '" aria-pressed="' + (i === 0) + '">' + esc(c) + "</button>";
      }).join("");
    }

    var applyFilter = function (cat) {
      var shown = 0;
      $$(".work", gallery).forEach(function (el) {
        var show = cat === "All" || el.getAttribute("data-category") === cat;
        el.hidden = !show;
        if (show) {
          shown++;
          el.classList.remove("fade-in");
          void el.offsetWidth;
          el.classList.add("fade-in");
        }
      });
      $$("[data-filter]", filterBox || document).forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === cat));
      });
      if (countEl) countEl.textContent = "Showing " + shown + (shown === 1 ? " project" : " projects") + (cat === "All" ? "" : " in " + cat);
    };

    if (filterBox) {
      filterBox.addEventListener("click", function (e) {
        var b = e.target.closest("[data-filter]");
        if (b) applyFilter(b.getAttribute("data-filter"));
      });
    }
    applyFilter("All");

    gallery.addEventListener("click", function (e) {
      var a = e.target.closest(".work");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      openProject(a.getAttribute("data-project"), a);
    });

    var fromHash = function () {
      var id = decodeURIComponent(location.hash.replace("#", ""));
      if (id && byId[id] && id !== currentId) {
        var cur = $$("[data-filter]", filterBox || document).filter(function (b) { return b.getAttribute("aria-pressed") === "true"; })[0];
        if (cur && cur.getAttribute("data-filter") !== "All" && cur.getAttribute("data-filter") !== byId[id].category) applyFilter("All");
        openProject(id);
      }
    };
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  /* ------------------------------------------------------------------ *
   * Contact form
   * ------------------------------------------------------------------ */
  var form = $("#contact-form");
  if (form) {
    var status = $(".form__status", form);
    var say = function (msg, cls) {
      status.textContent = msg;
      status.className = "form__status" + (cls ? " " + cls : "");
    };
    var field = function (n) { return form.elements[n] ? form.elements[n].value.trim() : ""; };
    var summary = function () {
      return "Hello Focus360 Studio,\n\n" + field("message") +
        "\n\nName: " + field("name") +
        (field("service") ? "\nService: " + field("service") : "") +
        (field("phone") ? "\nPhone: " + field("phone") : "") +
        "\nEmail: " + field("email");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (field("website")) return; // honeypot: bots fill this in, people never see it
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var mode = C.formMode || "mailto";

      if (mode === "formspree") {
        if (!C.formspreeId) { say("The form is not connected yet. Please use WhatsApp or email instead.", "err"); return; }
        say("Sending…");
        fetch("https://formspree.io/f/" + encodeURIComponent(C.formspreeId), { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error("bad"); form.reset(); say("Thank you — your message has been sent. We will reply soon.", "ok"); })
          .catch(function () { say("Something went wrong. Please try WhatsApp or email instead.", "err"); });
      } else if (mode === "netlify") {
        say("Sending…");
        fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() })
          .then(function (r) { if (!r.ok) throw new Error("bad"); form.reset(); say("Thank you — your message has been sent. We will reply soon.", "ok"); })
          .catch(function () { say("Something went wrong. Please try WhatsApp or email instead.", "err"); });
      } else {
        window.location.href = "mailto:" + (C.email || "") + "?subject=" + encodeURIComponent("Project enquiry from " + field("name")) + "&body=" + encodeURIComponent(summary());
        say("Your email app should open with your message ready to send. If it does not, email us directly at " + (C.email || "") + ".", "ok");
      }
    });

    var waSend = $("[data-whatsapp-send]");
    if (waSend) {
      waSend.addEventListener("click", function () {
        if (!form.reportValidity()) return;
        window.open(waLink(summary()), "_blank", "noopener");
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * Reveal on scroll
   * ------------------------------------------------------------------ */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
