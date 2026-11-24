# FOCUS360 STUDIO website

Static site (HTML/CSS/JS) with a Supabase backend.

## Setup
1. Supabase > SQL Editor: run `sql/schema.sql`.
2. Supabase > Authentication > Users: create your admin login, then run the last line of the SQL file (the `insert into public.admins` line) with your email. Turn off public sign-ups (Authentication > Providers > Email).
3. Put your Project URL and **anon** key in `js/supabase-config.js`. Never commit the service_role key.
4. Edit contact details and social links in `js/config.js`.
5. Open `admin.html` to add projects and read messages.

Testimonials: add rows to the `testimonials` table in the Supabase Table Editor. The section hides itself while the table is empty.

## Homepage CMS upgrade

After the original `sql/schema.sql` has been run, run `sql/upgrade-homepage.sql` in Supabase SQL Editor.
This creates the `site_content` table, enables public read access for published homepage copy, and restricts writes to authenticated admins.
The admin dashboard now includes a Homepage content editor. Homepage copy is loaded from Supabase with the original HTML as a fallback.

Before deploying:
- Add your Supabase Project URL and anon/public key to `js/supabase-config.js`.
- Confirm your signed-in user has a row in `public.admins`.
- Never use the Supabase `service_role` key in browser code.
- Test the public site and admin dashboard after deployment.
