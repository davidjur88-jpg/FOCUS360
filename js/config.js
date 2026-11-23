/* ==========================================================================
   FOCUS360 STUDIO — site settings
   Replace every value marked PLACEHOLDER with your real details.
   Everything on the site (buttons, footer, contact page) reads from here.
   ========================================================================== */
window.FOCUS360 = {
  // PLACEHOLDER — WhatsApp number in international format, digits only.
  // Ghana example: 0244 123 456  ->  "233244123456"  (drop the first 0, add 233)
  whatsappNumber: "233000000000",
  whatsappMessage: "Hello Focus360 Studio, I'd like to start a project.",

  // PLACEHOLDER — your email and the phone number shown on the site
  email: "hello@your-domain.com",
  phoneDisplay: "+233 00 000 0000",

  // PLACEHOLDER — your social profile links. Leave a value as "" to hide that button.
  social: {
    instagram: "https://www.instagram.com/your-handle",
    facebook: "https://www.facebook.com/your-page",
    linkedin: "https://www.linkedin.com/company/your-page",
    tiktok: "https://www.tiktok.com/@your-handle",
    behance: ""
  },

  // How the contact form sends messages (see README, "Make the contact form work"):
  //   "mailto"    -> opens the visitor's email app, addressed to you. Works instantly, no setup.
  //   "formspree" -> free form service. Paste your form ID below.
  //   "netlify"   -> only if you host on Netlify. Works with no extra setup.
  formMode: "mailto",
  formspreeId: "" // e.g. "xyzabcde"
};
