// Supabase > Project Settings > API. Use the URL and the anon (public) key ONLY.
// Never put the service_role key in this repo.
(function () {
  var URL = https://pajjrkiyfffygeuczawb.supabase.co;
  var KEY = 'sb_publishable_rGIbCC5j8jLGEO6mG58fYQ_8o3GlzWs;
  var ok = window.supabase && !/YOUR-/.test(URL + KEY);
  window.sb = ok ? window.supabase.createClient(URL, KEY) : null; // null = site shows sample content
})();
