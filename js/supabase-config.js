// Supabase > Project Settings > API. Use the URL and the anon (public) key ONLY.
// Never put the service_role key in this repo.
(function () {
  var URL = 'https://YOUR-PROJECT-REF.supabase.co';
  var KEY = 'YOUR-ANON-KEY';
  var ok = window.supabase && !/YOUR-/.test(URL + KEY);
  window.sb = ok ? window.supabase.createClient(URL, KEY) : null; // null = site shows sample content
})();
