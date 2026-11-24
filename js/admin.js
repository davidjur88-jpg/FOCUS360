/* ==========================================================================
   FOCUS360 STUDIO — admin page logic (Supabase)
   Login, projects (with image upload), testimonials, messages, password.
   You never need to edit this file. See ADMIN-SETUP.md.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.F360_SUPABASE || {};
  var app = document.getElementById("app");
  var toastEl = document.getElementById("toast");
  var BUCKET = "portfolio";
  var toastTimer = null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast " + (kind || "ok");
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, kind === "err" ? 8000 : 3500);
  }
  function friendly(err) {
    var m = (err && err.message) || String(err);
    if (/Invalid login/i.test(m)) return "Wrong email or password.";
    if (/permission denied|row-level security|42501/i.test(m)) return "Permission denied. Log in with the first account you created in Supabase, and make sure setup.sql has been run.";
    if (/relation .* does not exist|schema cache|PGRST205/i.test(m)) return "The database tables are missing. Run supabase/setup.sql in the Supabase SQL Editor (see ADMIN-SETUP.md).";
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "No connection. Check your internet and try again.";
    if (/Bucket not found/i.test(m)) return "The image storage is missing. Run supabase/setup.sql again.";
    return m;
  }
  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.innerHTML = label || "Please wait…"; btn.disabled = true; }
    else { btn.innerHTML = btn.dataset.label || btn.innerHTML; btn.disabled = false; }
  }
  function slugify(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "project";
  }
  function when(iso) {
    try { return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return iso; }
  }

  /* ---------------- Startup checks ---------------- */
  if (!CFG.url || !CFG.anonKey) {
    app.innerHTML =
      '<div class="adm-card"><h1 class="display h-md">Almost <span class="serif">there</span></h1>' +
      "<p>The admin page is not connected to Supabase yet. To connect it:</p>" +
      '<ol class="adm-steps"><li>Open <code>js/supabase-config.js</code></li><li>Paste your Supabase <strong>Project URL</strong> and <strong>anon / publishable key</strong></li><li>Save and upload the site again</li></ol>' +
      "<p>Full step-by-step instructions are in <code>ADMIN-SETUP.md</code>.</p></div>";
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    app.innerHTML = '<div class="adm-card"><h1 class="display h-md">Cannot <span class="serif">load</span></h1><p>The admin tools could not be loaded. Check your internet connection and refresh the page.</p></div>';
    return;
  }

  var sb = window.supabase.createClient(CFG.url, CFG.anonKey);
  var data = { projects: [], testimonials: [], messages: [] };
  var signedIn = false;

  /* ---------------- Auth ---------------- */
  sb.auth.onAuthStateChange(function (event, session) {
    setTimeout(function () {
      if (event === "PASSWORD_RECOVERY") { signedIn = true; renderPasswordForm(true); return; }
      if (event === "SIGNED_OUT" || !session) { signedIn = false; renderLogin(); return; }
      if (!signedIn) { signedIn = true; go("projects"); }
    }, 0);
  });

  function renderLogin() {
    app.innerHTML =
      '<div class="adm-card"><h1 class="display h-md">Studio <span class="serif">login</span></h1>' +
      '<form data-form="login" novalidate>' +
      '<label class="field"><span>Email</span><input type="email" name="email" autocomplete="username" required></label>' +
      '<label class="field"><span>Password</span><input type="password" name="password" autocomplete="current-password" required></label>' +
      '<div class="btn-row"><button class="btn btn--solid" type="submit">Log in</button></div>' +
      '<p style="margin-top:1.2rem"><button class="linkbtn" type="button" data-act="forgot">Forgot your password?</button></p>' +
      "</form></div>";
  }

  function renderPasswordForm(recovery) {
    var box = recovery ? app : null;
    var html =
      '<form class="adm-form" data-form="password" data-recovery="' + (recovery ? "1" : "") + '" novalidate>' +
      "<h2 class=\"display\">" + (recovery ? "Set a new <span class=\"serif\">password</span>" : "Change <span class=\"serif\">password</span>") + "</h2>" +
      '<label class="field"><span>New password (at least 8 characters)</span><input type="password" name="pw" minlength="8" autocomplete="new-password" required></label>' +
      '<label class="field"><span>Repeat new password</span><input type="password" name="pw2" minlength="8" autocomplete="new-password" required></label>' +
      '<div class="btn-row"><button class="btn btn--solid" type="submit">Save password</button></div></form>';
    if (box) app.innerHTML = '<div class="adm-card">' + html + "</div>";
    return html;
  }

  /* ---------------- Data ---------------- */
  function load(table) {
    var q = sb.from(table).select("*");
    if (table === "messages") q = q.order("created_at", { ascending: false });
    else q = q.order("sort_order", { ascending: true }).order("created_at", { ascending: table === "testimonials" });
    return q.then(function (r) {
      if (r.error) throw r.error;
      data[table] = r.data || [];
    });
  }

  function go(tab, opts) {
    app.innerHTML = '<p class="adm-loading">Loading…</p>';
    var need = ["messages"];
    if (tab === "projects" || tab === "project-form") need.push("projects");
    if (tab === "testimonials" || tab === "testimonial-form") need.push("testimonials");
    Promise.all(need.map(load)).then(function () {
      render(tab, opts || {});
    }).catch(function (e) {
      app.innerHTML = '<div class="adm-card"><h1 class="display h-md">Something <span class="serif">went wrong</span></h1><p>' + esc(friendly(e)) + '</p><div class="btn-row"><button class="btn" data-act="tab" data-id="' + esc(tab) + '">Try again</button><button class="btn" data-act="signout">Log out</button></div></div>';
    });
  }

  function tabsHtml(active) {
    var unread = data.messages.filter(function (m) { return !m.is_read; }).length;
    var base = active === "project-form" ? "projects" : active === "testimonial-form" ? "testimonials" : active;
    var items = [["projects", "Projects"], ["testimonials", "Testimonials"], ["messages", "Messages"], ["account", "Account"]];
    return '<nav class="adm-tabs" aria-label="Admin sections">' + items.map(function (t) {
      return '<button class="chip" type="button" data-act="tab" data-id="' + t[0] + '" aria-pressed="' + (t[0] === base) + '">' + t[1] +
        (t[0] === "messages" && unread ? '<span class="badge" aria-label="' + unread + ' unread">' + unread + "</span>" : "") + "</button>";
    }).join("") + "</nav>";
  }

  function render(tab, opts) {
    var body = "";
    if (tab === "projects") body = viewProjects();
    else if (tab === "project-form") body = viewProjectForm(opts.id ? find(data.projects, opts.id) : null);
    else if (tab === "testimonials") body = viewTestimonials();
    else if (tab === "testimonial-form") body = viewTestimonialForm(opts.id ? find(data.testimonials, opts.id) : null);
    else if (tab === "messages") body = viewMessages();
    else if (tab === "account") body = viewAccount();
    app.innerHTML = tabsHtml(tab) + body;
    window.scrollTo(0, 0);
  }

  /* ---------------- Projects ---------------- */
  function viewProjects() {
    var rows = data.projects.map(function (p, i) {
      return '<li class="row"><div class="row__thumb">' + (p.image_url ? '<img src="' + esc(p.image_url) + '" alt="">' : "") + "</div>" +
        '<div><div class="row__title">' + esc(p.title) + (p.featured ? '<span class="pill pill--on">Home page</span>' : "") + (!p.published ? '<span class="pill">Hidden</span>' : "") + "</div>" +
        '<div class="row__meta">' + esc(p.category) + (p.year ? " · " + esc(p.year) : "") + "</div></div>" +
        '<div class="row__actions">' +
        '<button class="mini" type="button" data-act="p-up" data-id="' + p.id + '" aria-label="Move up"' + (i === 0 ? " disabled" : "") + ">&uarr;</button>" +
        '<button class="mini" type="button" data-act="p-down" data-id="' + p.id + '" aria-label="Move down"' + (i === data.projects.length - 1 ? " disabled" : "") + ">&darr;</button>" +
        '<button class="mini" type="button" data-act="p-edit" data-id="' + p.id + '">Edit</button>' +
        '<button class="mini mini--danger" type="button" data-act="p-del" data-id="' + p.id + '">Delete</button></div></li>';
    }).join("");
    return '<div class="adm-head"><h1 class="display h-md">Projects</h1><button class="btn btn--solid" type="button" data-act="p-new">Add project</button></div>' +
      '<p class="adm-hint">Projects appear on your Portfolio page in this order (use the arrows). Projects marked <strong>Home page</strong> show in the featured area of the home page (the first four).</p>' +
      (rows ? '<ul class="rows">' + rows + "</ul>" : '<p class="adm-empty">No projects yet, so the website is showing its sample projects. Add your first project and the samples disappear automatically.</p>');
  }

  var fs = { gallery: [] }; // form state for the project being edited

  function viewProjectForm(p) {
    fs = { gallery: p && p.gallery ? p.gallery.slice() : [] };
    var cats = [];
    data.projects.forEach(function (x) { if (x.category && cats.indexOf(x.category) === -1) cats.push(x.category); });
    ["Brand Identity", "Packaging", "Advertising", "Social Media", "Print", "Motion", "Digital Content", "Creative Direction"].forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); });
    var v = p || { title: "", category: "", year: "", client: "", summary: "", description: "", services: "", ratio: "portrait", featured: false, published: true };
    return '<form class="adm-form" data-form="project" data-id="' + (p ? p.id : "") + '" novalidate>' +
      "<h2 class=\"display\">" + (p ? "Edit <span class=\"serif\">project</span>" : "New <span class=\"serif\">project</span>") + "</h2>" +
      '<label class="field"><span>Project title *</span><input type="text" name="title" maxlength="120" value="' + esc(v.title) + '" required></label>' +
      '<div class="field--2">' +
      '<label class="field"><span>Category *</span><input type="text" name="category" list="cats" maxlength="60" value="' + esc(v.category) + '" required><small>Pick one or type a new one. Each category becomes a filter button.</small></label>' +
      '<label class="field"><span>Year</span><input type="text" name="year" maxlength="20" value="' + esc(v.year) + '"></label></div>' +
      '<datalist id="cats">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join("") + "</datalist>" +
      '<label class="field"><span>Client</span><input type="text" name="client" maxlength="120" value="' + esc(v.client) + '"></label>' +
      '<label class="field"><span>One-line summary</span><input type="text" name="summary" maxlength="200" value="' + esc(v.summary) + '"></label>' +
      '<label class="field"><span>Description</span><textarea name="description">' + esc(v.description) + "</textarea><small>Tell the story: the brief, your approach, the result. Leave a blank line between paragraphs.</small></label>" +
      '<label class="field"><span>What you did</span><input type="text" name="services" maxlength="250" value="' + esc(v.services) + '"><small>Separate with commas, for example: Logo design, Brand guidelines, Packaging</small></label>' +
      '<div class="upload"><span class="upload__label">Main image ' + (p && p.image_url ? "" : "*") + "</span>" +
      '<div class="upload__preview" data-main-preview>' + (p && p.image_url ? '<figure><img src="' + esc(p.image_url) + '" alt="Current main image"></figure>' : "") + "</div>" +
      '<input type="file" name="main" accept="image/*"><small style="display:block;margin-top:.5rem;color:var(--mute)">' + (p && p.image_url ? "Choose a file only if you want to replace the current image. " : "") + "JPG, PNG or WebP. Photos are resized automatically.</small></div>" +
      '<div class="upload"><span class="upload__label">More images (optional)</span>' +
      '<div class="upload__preview" data-gallery-preview>' + fs.gallery.map(galleryFig).join("") + "</div>" +
      '<input type="file" name="gallery" accept="image/*" multiple><small style="display:block;margin-top:.5rem;color:var(--mute)">Shown under the description when a visitor opens the project.</small></div>' +
      '<label class="field"><span>Shape on the website</span><select name="ratio">' +
      ["auto|Automatic (recommended)", "portrait|Portrait (tall)", "square|Square", "landscape|Landscape (wide)"].map(function (o) { var a = o.split("|"); return '<option value="' + a[0] + '"' + (a[0] === "auto" ? " selected" : "") + ">" + a[1] + "</option>"; }).join("") + "</select></label>" +
      '<label class="check"><input type="checkbox" name="featured"' + (v.featured ? " checked" : "") + '><span>Show on the home page<small>The first four projects with this ticked appear in "Selected projects".</small></span></label>' +
      '<label class="check"><input type="checkbox" name="published"' + (v.published ? " checked" : "") + '><span>Visible on the website<small>Untick to hide it without deleting it.</small></span></label>' +
      '<div class="btn-row" style="margin-top:2rem"><button class="btn btn--solid" type="submit">Save project</button><button class="btn" type="button" data-act="tab" data-id="projects">Cancel</button></div></form>';
  }
  function galleryFig(url) {
    return '<figure data-url="' + esc(url) + '"><img src="' + esc(url) + '" alt=""><button class="mini mini--danger" type="button" data-act="g-remove">Remove</button></figure>';
  }

  /* images: resize + compress in the browser before upload */
  function ratioOf(w, h) {
    var r = w / h;
    return r < 0.894 ? "portrait" : r < 1.155 ? "square" : "landscape";
  }
  function processImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, 1800 / Math.max(w, h));
        var cw = Math.round(w * s), ch = Math.round(h * s);
        var c = document.createElement("canvas");
        c.width = cw; c.height = ch;
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cw, ch); ctx.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (!b) { reject(new Error("Could not read that image.")); return; }
          resolve({ blob: b, ratio: ratioOf(w, h) });
        }, "image/jpeg", 0.86);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That file does not look like an image. Please use JPG, PNG or WebP.")); };
      img.src = url;
    });
  }
  function uploadImage(blob) {
    var path = "projects/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
    return sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false }).then(function (r) {
      if (r.error) throw r.error;
      return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    });
  }
  function removeFiles(urls) {
    var marker = "/" + BUCKET + "/";
    var paths = urls.filter(Boolean).map(function (u) {
      var i = u.indexOf(marker);
      return i < 0 ? null : decodeURIComponent(u.slice(i + marker.length).split("?")[0]);
    }).filter(Boolean);
    if (!paths.length) return Promise.resolve();
    return Promise.resolve(sb.storage.from(BUCKET).remove(paths)).catch(function () {});
  }

  function saveProject(f) {
    var els = f.elements, id = f.getAttribute("data-id"), existing = id ? find(data.projects, id) : null;
    var title = els.title.value.trim(), category = els.category.value.trim();
    var mainFile = els.main.files[0], galleryFiles = Array.prototype.slice.call(els.gallery.files);
    if (!title || !category) { toast("Please fill in the title and category.", "err"); return; }
    if (!mainFile && !(existing && existing.image_url)) { toast("Please choose a main image.", "err"); return; }

    var btn = $("[type=submit]", f), detected = null, newMain = null, newGallery = [];
    busy(btn, true, "Saving…");
    var chain = Promise.resolve();
    if (mainFile) {
      chain = chain.then(function () { return processImage(mainFile); }).then(function (r) { detected = r.ratio; return uploadImage(r.blob); }).then(function (u) { newMain = u; });
    }
    galleryFiles.forEach(function (file) {
      chain = chain.then(function () { return processImage(file); }).then(function (r) { return uploadImage(r.blob); }).then(function (u) { newGallery.push(u); });
    });
    chain.then(function () {
      var sel = els.ratio.value;
      var ratio = sel !== "auto" ? sel : (detected || (existing ? existing.ratio : "portrait"));
      var payload = {
        title: title, category: category, year: els.year.value.trim(), client: els.client.value.trim(),
        summary: els.summary.value.trim(), description: els.description.value.trim(), services: els.services.value.trim(),
        image_url: newMain || existing.image_url, gallery: fs.gallery.concat(newGallery), ratio: ratio,
        featured: els.featured.checked, published: els.published.checked
      };
      if (existing) return sb.from("projects").update(payload).eq("id", existing.id);
      var min = data.projects.reduce(function (m, p) { return Math.min(m, p.sort_order); }, 0);
      payload.slug = slugify(title) + "-" + Math.random().toString(36).slice(2, 6);
      payload.sort_order = min - 10;
      return sb.from("projects").insert(payload);
    }).then(function (res) {
      if (res && res.error) throw res.error;
      var gone = [];
      if (existing) {
        if (newMain) gone.push(existing.image_url);
        (existing.gallery || []).forEach(function (u) { if (fs.gallery.indexOf(u) === -1) gone.push(u); });
      }
      return removeFiles(gone);
    }).then(function () {
      toast("Project saved. It is live on your website now.");
      go("projects");
    }).catch(function (e) {
      toast(friendly(e), "err");
      busy(btn, false);
    });
  }

  function reorder(table, list, id, dir) {
    var arr = list.slice(), i = -1, k;
    for (k = 0; k < arr.length; k++) if (arr[k].id === id) i = k;
    var j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    var jobs = [];
    arr.forEach(function (row, n) {
      if (row.sort_order !== n * 10) jobs.push(sb.from(table).update({ sort_order: n * 10 }).eq("id", row.id));
    });
    Promise.all(jobs).then(function (rs) {
      for (var q = 0; q < rs.length; q++) if (rs[q].error) throw rs[q].error;
      go(table === "projects" ? "projects" : "testimonials");
    }).catch(function (e) { toast(friendly(e), "err"); });
  }

  function remove(table, id, label) {
    if (!window.confirm("Delete " + label + "? This cannot be undone.")) return;
    var row = find(data[table], id);
    sb.from(table).delete().eq("id", id).then(function (r) {
      if (r.error) throw r.error;
      if (table === "projects" && row) return removeFiles([row.image_url].concat(row.gallery || []));
    }).then(function () {
      toast("Deleted.");
      go(table === "messages" ? "messages" : table);
    }).catch(function (e) { toast(friendly(e), "err"); });
  }

  /* ---------------- Testimonials ---------------- */
  function viewTestimonials() {
    var rows = data.testimonials.map(function (t, i) {
      return '<li class="row row--text"><div><div class="row__title">' + esc(t.name) + (t.role ? " — " + esc(t.role) : "") + (!t.published ? '<span class="pill">Hidden</span>' : "") + "</div>" +
        '<div class="row__meta">' + esc(t.quote.length > 140 ? t.quote.slice(0, 140) + "…" : t.quote) + "</div></div>" +
        '<div class="row__actions">' +
        '<button class="mini" type="button" data-act="t-up" data-id="' + t.id + '" aria-label="Move up"' + (i === 0 ? " disabled" : "") + ">&uarr;</button>" +
        '<button class="mini" type="button" data-act="t-down" data-id="' + t.id + '" aria-label="Move down"' + (i === data.testimonials.length - 1 ? " disabled" : "") + ">&darr;</button>" +
        '<button class="mini" type="button" data-act="t-edit" data-id="' + t.id + '">Edit</button>' +
        '<button class="mini mini--danger" type="button" data-act="t-del" data-id="' + t.id + '">Delete</button></div></li>';
    }).join("");
    return '<div class="adm-head"><h1 class="display h-md">Testimonials</h1><button class="btn btn--solid" type="button" data-act="t-new">Add testimonial</button></div>' +
      '<p class="adm-hint">Quotes from your clients, shown on the home page. Only add quotes you have permission to publish. With none added, the testimonials section is hidden.</p>' +
      (rows ? '<ul class="rows">' + rows + "</ul>" : '<p class="adm-empty">No testimonials yet. The website is not showing a testimonials section until you add one.</p>');
  }
  function viewTestimonialForm(t) {
    var v = t || { quote: "", name: "", role: "", published: true };
    return '<form class="adm-form" data-form="testimonial" data-id="' + (t ? t.id : "") + '" novalidate>' +
      "<h2 class=\"display\">" + (t ? "Edit <span class=\"serif\">testimonial</span>" : "New <span class=\"serif\">testimonial</span>") + "</h2>" +
      '<label class="field"><span>Quote *</span><textarea name="quote" maxlength="600" required>' + esc(v.quote) + "</textarea></label>" +
      '<div class="field--2"><label class="field"><span>Client name *</span><input type="text" name="name" maxlength="120" value="' + esc(v.name) + '" required></label>' +
      '<label class="field"><span>Company / role</span><input type="text" name="role" maxlength="120" value="' + esc(v.role) + '"></label></div>' +
      '<label class="check"><input type="checkbox" name="published"' + (v.published ? " checked" : "") + '><span>Visible on the website</span></label>' +
      '<div class="btn-row" style="margin-top:2rem"><button class="btn btn--solid" type="submit">Save testimonial</button><button class="btn" type="button" data-act="tab" data-id="testimonials">Cancel</button></div></form>';
  }
  function saveTestimonial(f) {
    var els = f.elements, id = f.getAttribute("data-id"), existing = id ? find(data.testimonials, id) : null;
    var quote = els.quote.value.trim(), name = els.name.value.trim();
    if (!quote || !name) { toast("Please fill in the quote and the client name.", "err"); return; }
    var btn = $("[type=submit]", f);
    busy(btn, true, "Saving…");
    var payload = { quote: quote, name: name, role: els.role.value.trim(), published: els.published.checked };
    var req;
    if (existing) req = sb.from("testimonials").update(payload).eq("id", existing.id);
    else {
      payload.sort_order = data.testimonials.reduce(function (m, t) { return Math.max(m, t.sort_order); }, -10) + 10;
      req = sb.from("testimonials").insert(payload);
    }
    req.then(function (r) {
      if (r.error) throw r.error;
      toast("Testimonial saved.");
      go("testimonials");
    }).catch(function (e) { toast(friendly(e), "err"); busy(btn, false); });
  }

  /* ---------------- Messages ---------------- */
  function viewMessages() {
    var items = data.messages.map(function (m) {
      var digits = String(m.phone || "").replace(/\D/g, "");
      if (digits.charAt(0) === "0") digits = "233" + digits.slice(1);
      return '<details class="msg' + (m.is_read ? "" : " msg--new") + '" data-id="' + m.id + '"><summary><div><div class="row__title">' + esc(m.name) + '</div><div class="row__meta">' +
        esc(m.service || "General enquiry") + " · " + esc(when(m.created_at)) + "</div></div><span class=\"mini\">Open</span></summary>" +
        '<div class="msg__body"><p class="msg__text">' + esc(m.message) + "</p>" +
        '<p class="row__meta">Email: <a href="mailto:' + esc(m.email) + '">' + esc(m.email) + "</a>" +
        (m.phone ? " · Phone: " + esc(m.phone) : "") + "</p>" +
        '<div class="row__actions" style="justify-content:flex-start">' +
        '<a class="mini" href="mailto:' + esc(m.email) + "?subject=" + encodeURIComponent("Re: your enquiry to FOCUS360 STUDIO") + '">Reply by email</a>' +
        (digits.length > 8 ? '<a class="mini" href="https://wa.me/' + digits + '" target="_blank" rel="noopener noreferrer">WhatsApp</a>' : "") +
        '<button class="mini" type="button" data-act="m-unread" data-id="' + m.id + '">Mark as unread</button>' +
        '<button class="mini mini--danger" type="button" data-act="m-del" data-id="' + m.id + '">Delete</button></div></div></details>';
    }).join("");
    return '<div class="adm-head"><h1 class="display h-md">Messages</h1></div>' +
      '<p class="adm-hint">Enquiries sent from the contact form on your website appear here. New ones have an orange dot. Supabase does not send an email alert, so check this page regularly.</p>' +
      (items ? '<div class="rows">' + items + "</div>" : '<p class="adm-empty">No messages yet.</p>');
  }

  /* ---------------- Account ---------------- */
  function viewAccount() {
    return '<div class="adm-head"><h1 class="display h-md">Account</h1></div>' +
      renderPasswordForm(false) +
      '<div class="btn-row" style="margin-top:3rem"><button class="btn" type="button" data-act="signout">Log out</button></div>';
  }

  /* ---------------- Events ---------------- */
  var actions = {
    tab: function (id) { go(id); },
    "p-new": function () { go("project-form"); },
    "p-edit": function (id) { go("project-form", { id: id }); },
    "p-del": function (id) { var p = find(data.projects, id); remove("projects", id, "“" + (p ? p.title : "this project") + "”"); },
    "p-up": function (id) { reorder("projects", data.projects, id, -1); },
    "p-down": function (id) { reorder("projects", data.projects, id, 1); },
    "g-remove": function (id, el) {
      var fig = el.closest("figure");
      var url = fig.getAttribute("data-url");
      fs.gallery = fs.gallery.filter(function (u) { return u !== url; });
      fig.remove();
    },
    "t-new": function () { go("testimonial-form"); },
    "t-edit": function (id) { go("testimonial-form", { id: id }); },
    "t-del": function (id) { remove("testimonials", id, "this testimonial"); },
    "t-up": function (id) { reorder("testimonials", data.testimonials, id, -1); },
    "t-down": function (id) { reorder("testimonials", data.testimonials, id, 1); },
    "m-del": function (id) { remove("messages", id, "this message"); },
    "m-unread": function (id) {
      sb.from("messages").update({ is_read: false }).eq("id", id).then(function (r) {
        if (r.error) throw r.error;
        go("messages");
      }).catch(function (e) { toast(friendly(e), "err"); });
    },
    signout: function () { sb.auth.signOut(); },
    forgot: function () {
      var f = $("[data-form=login]"), email = f ? f.elements.email.value.trim() : "";
      if (!email) { toast("Type your email in the box first, then click “Forgot your password?”.", "err"); return; }
      var back = window.location.href.split("#")[0].split("?")[0];
      sb.auth.resetPasswordForEmail(email, { redirectTo: back }).then(function (r) {
        if (r.error) throw r.error;
        toast("If that email has an account, a reset link is on its way.");
      }).catch(function (e) { toast(friendly(e), "err"); });
    }
  };

  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var fn = actions[el.getAttribute("data-act")];
    if (fn) fn(el.getAttribute("data-id"), el, e);
  });

  var forms = {
    login: function (f) {
      var email = f.elements.email.value.trim(), password = f.elements.password.value;
      if (!email || !password) { toast("Enter your email and password.", "err"); return; }
      var btn = $("[type=submit]", f);
      busy(btn, true, "Logging in…");
      sb.auth.signInWithPassword({ email: email, password: password }).then(function (r) {
        if (r.error) throw r.error;
      }).catch(function (e) { toast(friendly(e), "err"); busy(btn, false); });
    },
    project: saveProject,
    testimonial: saveTestimonial,
    password: function (f) {
      var a = f.elements.pw.value, b = f.elements.pw2.value, recovery = f.getAttribute("data-recovery") === "1";
      if (a.length < 8) { toast("Use at least 8 characters.", "err"); return; }
      if (a !== b) { toast("The two passwords do not match.", "err"); return; }
      var btn = $("[type=submit]", f);
      busy(btn, true, "Saving…");
      sb.auth.updateUser({ password: a }).then(function (r) {
        if (r.error) throw r.error;
        toast("Password updated.");
        f.reset();
        busy(btn, false);
        if (recovery) go("projects");
      }).catch(function (e) { toast(friendly(e), "err"); busy(btn, false); });
    }
  };
  app.addEventListener("submit", function (e) {
    e.preventDefault();
    var fn = forms[e.target.getAttribute("data-form")];
    if (fn) fn(e.target);
  });

  // opening a message marks it as read
  app.addEventListener("toggle", function (e) {
    var d = e.target;
    if (!d.classList || !d.classList.contains("msg") || !d.open || !d.classList.contains("msg--new")) return;
    var id = d.getAttribute("data-id");
    sb.from("messages").update({ is_read: true }).eq("id", id).then(function (r) {
      if (r.error) return;
      d.classList.remove("msg--new");
      var m = find(data.messages, id);
      if (m) m.is_read = true;
      var tabs = $(".adm-tabs");
      if (tabs) tabs.outerHTML = tabsHtml("messages");
    });
  }, true);

  // show the chosen main image straight away
  app.addEventListener("change", function (e) {
    var inp = e.target;
    if (inp.name !== "main" || !inp.files || !inp.files[0]) return;
    var box = $("[data-main-preview]");
    if (box) box.innerHTML = '<figure><img src="' + URL.createObjectURL(inp.files[0]) + '" alt="New main image"></figure>';
  });
})();
