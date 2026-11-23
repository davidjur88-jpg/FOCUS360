/* ==========================================================================
   FOCUS360 STUDIO — portfolio data
   ---------------------------------------------------------------------------
   HOW TO ADD YOUR OWN PROJECT
   1. Put your image in  assets/work/  (JPG, PNG or WebP, ~1600px wide, under 400 KB).
   2. Copy one block below, paste it at the top of the list, and change:
        id          short unique name, lowercase, no spaces (e.g. "mama-tea-packaging")
        title       project name
        category    one of the categories already used, or a new one — filters update by themselves
        image       "assets/work/your-file.jpg"
        ratio       "portrait" | "square" | "landscape"  (shape of the picture)
        sample      false   (removes the "Sample project" label)
        featured    true    (shows it on the home page — the first 4 featured projects appear)
   3. Delete the sample blocks you no longer want. Save. Done.

   Projects without an "image" show generated placeholder artwork (art + colors).
   Everything below marked sample:true is placeholder content, NOT real client work.
   ========================================================================== */
window.PROJECTS = [
  {
    id: "sample-brand-identity",
    title: "Brand Identity System",
    category: "Brand Identity",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: true,
    ratio: "landscape",
    art: "brand",
    colors: ["#0c0c0b", "#f1eee6", "#ff4d1f"],
    services: ["Logo design", "Colour & typography", "Brand guidelines"],
    summary: "A complete visual identity, from logo to guidelines.",
    description: "Placeholder entry. Replace this text with the brief, your thinking and the result: who the client is, what problem the identity had to solve, and how the final system works across touchpoints."
  },
  {
    id: "sample-packaging-tea",
    title: "Packaging Concept",
    category: "Packaging",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: true,
    ratio: "portrait",
    art: "pack",
    colors: ["#e6dcc3", "#0c0c0b", "#ff4d1f"],
    services: ["Packaging design", "Label system", "Print-ready artwork"],
    summary: "Shelf-ready packaging designed to be picked first.",
    description: "Placeholder entry. Describe the product, the shelf it competes on, the design decisions that make it stand out, and the materials or print finishes used."
  },
  {
    id: "sample-campaign",
    title: "Campaign Key Visual",
    category: "Advertising",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: false,
    ratio: "portrait",
    art: "campaign",
    colors: ["#ff4d1f", "#0c0c0b", "#f1eee6"],
    services: ["Campaign concept", "Key visual", "Outdoor & digital adaptations"],
    summary: "One bold idea, adapted across every channel.",
    description: "Placeholder entry. Explain the campaign idea, the audience, where it ran and how the visual system was adapted for billboards, print and social."
  },
  {
    id: "sample-social",
    title: "Social Media Series",
    category: "Social Media",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: true,
    ratio: "square",
    art: "social",
    colors: ["#1f3cff", "#f1eee6", "#ffd23f"],
    services: ["Content series", "Templates", "Carousel design"],
    summary: "A consistent, recognisable feed that is easy to keep up.",
    description: "Placeholder entry. Show the grid or carousel, explain how templates keep the feed consistent, and what the client can update on their own."
  },
  {
    id: "sample-print",
    title: "Editorial Publication",
    category: "Print",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: true,
    ratio: "landscape",
    art: "print",
    colors: ["#f1eee6", "#0c0c0b", "#1f3cff"],
    services: ["Layout design", "Typography", "Print production"],
    summary: "Print design with rhythm, hierarchy and breathing room.",
    description: "Placeholder entry. Describe the publication, page count, paper and finishing, and how the layout guides the reader."
  },
  {
    id: "sample-motion",
    title: "Logo in Motion",
    category: "Motion",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: false,
    ratio: "square",
    art: "motion",
    colors: ["#0c0c0b", "#f1eee6", "#ff4d1f"],
    services: ["Logo animation", "Motion graphics"],
    summary: "Short-form motion that gives a brand movement and personality.",
    description: "Placeholder entry. Add a still frame here, describe the animation and where it is used. (To add video, link to your YouTube or Vimeo page in this text.)"
  },
  {
    id: "sample-digital-content",
    title: "Launch Week Content",
    category: "Digital Content",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: false,
    ratio: "portrait",
    art: "type",
    words: ["Aa"],
    colors: ["#12372a", "#f1eee6", "#ffd23f"],
    services: ["Social graphics", "Banners", "Email graphics"],
    summary: "A set of digital assets built for one launch moment.",
    description: "Placeholder entry. Describe the launch, the formats you produced and how the assets worked together."
  },
  {
    id: "sample-creative-direction",
    title: "Creative Direction Board",
    category: "Creative Direction",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: false,
    ratio: "landscape",
    art: "poster",
    words: ["Make", "the", "difference"],
    colors: ["#d9c7a3", "#0c0c0b", "#ff4d1f"],
    services: ["Creative direction", "Campaign planning", "Art direction"],
    summary: "The big idea, the look and the plan behind a brand's marketing.",
    description: "Placeholder entry. Explain the strategy, the creative platform and how you directed the work from idea to delivery."
  },
  {
    id: "sample-packaging-range",
    title: "Product Range Packaging",
    category: "Packaging",
    year: "Sample",
    client: "Sample concept — not a real client",
    sample: true,
    featured: false,
    ratio: "portrait",
    art: "pack",
    colors: ["#12372a", "#f1eee6", "#ff4d1f"],
    services: ["Range system", "Packaging design"],
    summary: "A flexible packaging system for a whole product range.",
    description: "Placeholder entry. Describe the range, how colour and type separate the products, and how the system can grow."
  }
];

/* Testimonials — placeholders only. Replace with real client quotes (with permission). */
window.TESTIMONIALS = [
  {
    sample: true,
    quote: "Replace this with a real quote from a client about working with Focus360 Studio, what they needed, and what changed for their brand.",
    name: "Client name",
    role: "Company · Role"
  },
  {
    sample: true,
    quote: "A second client quote goes here. Short and specific works best.",
    name: "Client name",
    role: "Company · Role"
  },
  {
    sample: true,
    quote: "A third quote goes here. Ask happy clients for one or two sentences.",
    name: "Client name",
    role: "Company · Role"
  }
];
