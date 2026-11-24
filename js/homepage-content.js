// Loads homepage copy/settings from Supabase. Static HTML remains the safe fallback.
(function () {
  'use strict';
  function apply(data) {
    if (!data || typeof data !== 'object') return;
    (window.HOME_FIELDS || []).forEach(function (f) {
      if (data[f.key] == null) return;
      var el = document.querySelector(f.selector);
      if (!el) return;
      if (f.key === 'marquee_services') {
        var items = String(data[f.key]).split(/\r?\n/).map(function(x){return x.trim();}).filter(Boolean);
        if (items.length) el.innerHTML = items.concat(items).map(function(x){var s=document.createElement('span');s.textContent=x;return s.outerHTML;}).join('');
      } else if (f.key === 'cta_button') {
        var label = Array.from(el.childNodes).find(function(n){return n.nodeType===Node.TEXT_NODE;});
        if (label) label.nodeValue = ' ' + data[f.key] + ' ';
        else el.insertBefore(document.createTextNode(data[f.key] + ' '), el.firstChild);
      } else {
        // Preserve decorative markup in headings; only replace text for simple content.
        if (f.key === 'work_title' || f.key === 'services_title' || f.key === 'why_title' || f.key === 'cta_title') {
          el.setAttribute('data-managed-copy', data[f.key]);
          el.textContent = data[f.key];
        } else el.textContent = data[f.key];
      }
    });
    if (data.hero_image_url && /^https:\/\//i.test(data.hero_image_url)) {
      document.querySelector('.hero').style.backgroundImage = 'linear-gradient(rgba(12,12,11,.78),rgba(12,12,11,.78)),url("' + data.hero_image_url.replace(/["\\]/g,'') + '")';
      document.querySelector('.hero').style.backgroundSize = 'cover';
      document.querySelector('.hero').style.backgroundPosition = 'center';
    }
    ['philosophy','work','services','why','testimonials','cta'].forEach(function(k){
      var el = document.querySelector('[data-home-section="'+k+'"]');
      if (el && data['show_'+k] === false) el.hidden = true;
    });
  }
  async function init() {
    if (!window.sb) return;
    try {
      var r = await window.sb.from('site_content').select('content').eq('content_key','homepage').maybeSingle();
      if (!r.error && r.data && r.data.content) apply(r.data.content);
    } catch(e) { /* retain static fallback */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
