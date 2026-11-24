# Admin page setup (Supabase) — about 15 minutes, no coding

After this you can add projects, upload images, add testimonials and read contact-form messages from `yoursite.com/admin.html`.
Supabase is free (Free plan: 500 MB database, 1 GB image storage, 2 projects at the time of writing; check supabase.com/pricing for current limits).

## Step 1 — Create your Supabase project
1. Go to **supabase.com** and sign up (free).
2. Click **New project**. Name it `focus360`. Choose a strong database password and save it somewhere safe. Pick the region closest to you (a European region is usually fastest for Ghana).
3. Wait about 2 minutes while it sets up.

## Step 2 — Create the database (copy and paste once)
1. In Supabase, open **SQL Editor** (left menu) and click **New query**.
2. Open the file `supabase/setup.sql` from this folder in Notepad, select everything, copy, and paste it into the query box.
3. Click **Run**. You should see "Success". (If you ever run it again, nothing breaks.)

## Step 3 — Create YOUR admin account
1. In Supabase, open **Authentication** > **Users** > **Add user** > **Create new user**.
2. Enter your email and a strong password. Tick **Auto Confirm User**.
3. **Important:** this must be the first account in the project. The first account is the only one allowed to change anything.

## Step 4 — Lock the door (recommended)
1. Authentication > **Sign In / Providers** (or **Settings**): turn **OFF** "Allow new users to sign up".
2. This stops strangers from creating accounts. Even if left on, they still could not edit anything, but it is tidier to turn it off.

## Step 5 — Connect the website
1. In Supabase open **Project Settings** > **API** (or **API Keys**).
2. Copy the **Project URL** and the **anon / publishable** key.
3. Open `js/supabase-config.js` in Notepad and paste them between the quotes:
```
window.F360_SUPABASE = {
  url: "https://abcdxyz.supabase.co",
  anonKey: "eyJ...your key..."
};
```
4. Save. **Never paste the "service_role" or "secret" key** anywhere. The anon/publishable key is meant to be public.

## Step 6 — Publish
Upload the site again (Netlify: drag the folder onto your site's **Deploys** page. GitHub Pages: upload the changed files).

## Step 7 — Set your web address for password-reset emails
Supabase > Authentication > **URL Configuration**: set **Site URL** to your live website address, and add `https://your-site-address/admin.html` under **Redirect URLs**. This makes "Forgot your password?" work.

## Using the admin page
Go to `your-site-address/admin.html` and log in.
- **Projects:** Add project, fill the form, choose an image, Save. It is live immediately. Use the arrows to reorder. Tick "Show on the home page" for your best four.
- While you have zero projects the site shows its labelled sample projects. Add your first real project and the samples disappear.
- **Testimonials:** add real quotes (with the client's permission). With none added, that section is hidden.
- **Messages:** enquiries from the contact form appear here with an orange dot until opened. Supabase does not email you, so check this page regularly. WhatsApp enquiries still arrive on your phone.
- **Account:** change your password.

Images are resized in your browser to about 1800 px and compressed before uploading, so large phone photos are fine and the site stays fast.

## Good to know
- **Free projects pause after about a week of low activity.** Supabase emails you a warning first. A paused site falls back to its sample projects until you click **Resume project** in the Supabase dashboard (your data is kept). Visiting admin.html or getting a few visitors a week normally prevents this.
- **Back up:** now and then use Database > Backups or export your projects table as CSV (Table Editor > Export).
- **Costs nothing** unless you choose to upgrade.

## If something goes wrong
| Message | Fix |
|---|---|
| "Wrong email or password" | Use the account from Step 3. Use "Forgot your password?" |
| "Permission denied" | Log in with the FIRST account created. Re-run `setup.sql` |
| "The database tables are missing" | Run `setup.sql` (Step 2) |
| Admin shows "Almost there" | Fill `js/supabase-config.js` (Step 5) and upload again |
| Website shows sample projects | You have no published projects yet, or the project is paused |
