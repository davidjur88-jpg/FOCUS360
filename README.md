# FOCUS360 STUDIO website

Plain HTML, CSS and JavaScript. No installs, no build step, no paid tools.

## 1. See it on your computer
Unzip the folder and double-click `index.html`. It opens in your browser.
(Optional local server: open a terminal in the folder and run `python -m http.server 8000`, then visit http://localhost:8000)

## 2. Replace the placeholders (10 minutes)
Open `js/config.js` in any text editor (Notepad, VS Code) and change:
- `whatsappNumber` — digits only, with country code. Ghana: 0244 123 456 becomes `233244123456`
- `email`, `phoneDisplay`
- `social` links (set one to `""` to hide it)
Then replace the draft text in `about.html` ("Our story") with your real story.

## 3. Add your real work
Open `js/projects.js`. The instructions are at the top of the file:
copy a project block, change the title/category, set `image: "assets/work/your-file.jpg"`, `sample: false`.
Put the images in `assets/work/`. New categories create new filter buttons automatically.
Set `featured: true` to show a project on the home page (first 4 featured).
Replace the sample testimonials at the bottom of that file with real quotes, or delete them.

## 4. Make the contact form work
Set `formMode` in `js/config.js`:
- `"mailto"` (default): opens the visitor's email app addressed to you. Works with zero setup.
- `"formspree"`: sign up free at formspree.io, create a form, paste its ID into `formspreeId`. Messages arrive in your inbox.
- `"netlify"`: only if you host on Netlify; messages appear in your Netlify dashboard (Forms).
Free plans have monthly limits; check current limits on their sites.
The "Send via WhatsApp" button always works.

## 5. Publish for free
**Netlify (easiest):** go to app.netlify.com/drop, drag the whole folder in. You get a free `something.netlify.app` address instantly. Rename it in Site settings.
**GitHub Pages:** create a free GitHub account and a new public repository, upload all files, then Settings > Pages > Deploy from branch > main > /(root). Your site appears at `username.github.io/repo-name`.
A custom domain (like focus360studio.com) is the only optional paid item; the free addresses above cost nothing.

## 6. After you have your web address
Replace `YOUR-DOMAIN.com` in `robots.txt` and `sitemap.xml` with your real address, then submit the sitemap in Google Search Console (free).

## Changing colours and fonts
Colours are variables at the top of `css/style.css` (`--ink`, `--bone`, `--accent`).
The navigation and footer are repeated in each page's HTML; if you change a link, change it in all five pages.
