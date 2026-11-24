/* ==========================================================================
   FOCUS360 STUDIO — Supabase connection
   Paste the two values from Supabase > Project Settings > API:
     url      the "Project URL"            (looks like https://abcdxyz.supabase.co)
     anonKey  the "anon" public key, or the "publishable" key (starts with eyJ... or sb_publishable_...)
   These two values are SAFE to keep here: they are public by design, and the
   database rules in supabase/setup.sql control what anyone can do.
   NEVER paste a "service_role" or "secret" key anywhere in this site.
   Leave both empty ("") and the site simply uses the sample projects.
   ========================================================================== */
window.F360_SUPABASE = {
  url: "https://pajjrkiyfffygeuczawb.supabase.co",
  anonKey: "sb_publishable_rGIbCC5j8jLGEO6mG58fYQ_8o3GlzWs"
};
