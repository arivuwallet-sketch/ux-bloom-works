export type Service = { name: string; desc: string };

export const services: Service[] = [
  {
    name: "Website",
    desc: "Marketing sites that stopped converting somewhere along the way — usually the homepage, sometimes the whole funnel.",
  },
  {
    name: "Web app",
    desc: "Dashboards and internal tools that outgrew their first design and picked up features faster than structure.",
  },
  {
    name: "Mobile app",
    desc: "iOS and Android flows that need modernizing without breaking the habits your existing users already learned.",
  },
  {
    name: "SaaS product",
    desc: "Onboarding, information architecture, and the accumulated UI debt that's quietly costing you activation.",
  },
  {
    name: "E-commerce store",
    desc: "Product pages and checkout flows, rebuilt around where shoppers actually drop off.",
  },
];

export const productTypes = [
  "Website",
  "Web app",
  "Mobile app",
  "SaaS product",
  "E-commerce store",
] as const;

export const budgetRanges = [
  "Under $5k",
  "$5k – $15k",
  "$15k – $40k",
  "$40k+",
  "Not sure yet",
] as const;

export type ProcessStep = { version: string; title: string; body: string };

export const processSteps: ProcessStep[] = [
  {
    version: "v1 — Audit",
    title: "We mark up what's there",
    body: "A heuristic review of your current product, screen by screen, flagged issue by issue — not a redesign yet, just the diagnosis.",
  },
  {
    version: "v2 — Redesign",
    title: "We rebuild against the audit",
    body: "Screens revised one flow at a time, each change traceable back to a specific finding from v1.",
  },
  {
    version: "v3 — Handoff",
    title: "You ship it, or we do",
    body: "Production-ready files and specs, or our team implements the revision directly in your codebase.",
  },
];

export type PreviewItem = { preview: string; name: string; desc: string };
export type PreviewGroup = { title: string; unit: string; items: PreviewItem[] };

export const styleGroups: PreviewGroup[] = [
  {
    title: "Minimal & functional",
    unit: "styles",
    items: [
      { preview: "sp-minimalism", name: "Minimalism", desc: "Only what's necessary, nothing decorative left in." },
      { preview: "sp-swiss", name: "Swiss / International", desc: "Grid-based, sans-serif, and mathematically precise." },
      { preview: "sp-flat", name: "Flat design", desc: "No shadows or gradients — solid color blocks only." },
      { preview: "sp-neumorphism", name: "Neumorphism", desc: "Soft, embossed shapes carved from one background." },
      { preview: "sp-mono", name: "Monochrome UI", desc: "A single hue carrying the entire interface." },
    ],
  },
  {
    title: "Bold & expressive",
    unit: "styles",
    items: [
      { preview: "sp-brutalism", name: "Brutalism", desc: "Raw, unstyled-HTML aesthetic, worn on purpose." },
      { preview: "sp-neobrutalism", name: "Neo-brutalism", desc: "Brutalism with bright color and thick offset borders." },
      { preview: "sp-maximalism", name: "Maximalism", desc: "Layered pattern, color, and density, by design." },
      { preview: "sp-antidesign", name: "Anti-design", desc: "Deliberately breaks grid and hierarchy conventions." },
      { preview: "sp-zine", name: "Punk / zine", desc: "Collage, cut-paper, do-it-yourself print aesthetic." },
    ],
  },
  {
    title: "Glass & depth",
    unit: "styles",
    items: [
      { preview: "sp-glass", name: "Glassmorphism", desc: "Frosted, translucent panels over a blurred backdrop." },
      { preview: "sp-skeuomorphism", name: "Skeuomorphism", desc: "Interfaces that mimic real-world material and texture." },
      { preview: "sp-clay", name: "Claymorphism", desc: "Puffy, rounded shapes that look moldable." },
      { preview: "sp-depth", name: "Layered depth", desc: "Elevation built from stacked, diffused shadows." },
    ],
  },
  {
    title: "Retro & nostalgic",
    unit: "styles",
    items: [
      { preview: "sp-y2k", name: "Y2K", desc: "Chrome, bevels, and early-internet optimism." },
      { preview: "sp-vaporwave", name: "Vaporwave", desc: "Pink-cyan gradients, glitch, faux-retro type." },
      { preview: "sp-retrofuturism", name: "Retro-futurism", desc: "How the past imagined tomorrow would look." },
      { preview: "sp-memphis", name: "Memphis", desc: "Postmodern shapes, squiggles, primary color clashes." },
      { preview: "sp-artdeco", name: "Art deco revival", desc: "Geometric symmetry with metallic ornament." },
    ],
  },
  {
    title: "Tech & digital-native",
    unit: "styles",
    items: [
      { preview: "sp-darkui", name: "Dark UI", desc: "Interfaces built for low-light, high-contrast focus." },
      { preview: "sp-cyberpunk", name: "Cyberpunk", desc: "Neon-on-black, dense HUD-style information." },
      { preview: "sp-bento", name: "Bento grid", desc: "Asymmetric grid of boxed modules, like a tray." },
      { preview: "sp-aurora", name: "Gradient mesh / aurora", desc: "Soft, blurred color fields as backdrop." },
      { preview: "sp-3d", name: "Generative / 3D", desc: "Depth and motion built from rendered objects." },
    ],
  },
  {
    title: "Editorial & organic",
    unit: "styles",
    items: [
      { preview: "sp-editorial", name: "Editorial", desc: "Magazine layout logic: columns, captions, pull quotes." },
      { preview: "sp-broadsheet", name: "Broadsheet", desc: "Newspaper density, hairline rules, serif type." },
      { preview: "sp-organic", name: "Organic / hand-drawn", desc: "Imperfect lines and shapes standing in for polish." },
      { preview: "sp-playful", name: "Playful / illustrative", desc: "Custom illustration carrying the brand's personality." },
    ],
  },
];

export const trendGroups: PreviewGroup[] = [
  {
    title: "Core architectural & visual styles",
    unit: "patterns",
    items: [
      { preview: "tp-webgl", name: "Immersive WebGL / Three.js", desc: "Full-viewport 3D worlds users navigate like a game." },
      { preview: "tp-liquidglass", name: "Liquid glass", desc: "Blurred glass with specular highlight and refraction." },
      { preview: "sp-neobrutalism", name: "Neo-brutalism & expressive layouts", desc: "High-contrast blocks, visible grid, oversized type." },
      { preview: "tp-spatial", name: "Spatial & layered UI", desc: "Floating panels casting depth-mapped shadows on scroll." },
    ],
  },
  {
    title: "Global backgrounds & cursor mechanics",
    unit: "patterns",
    items: [
      { preview: "tp-cursor", name: "Interactive 3D cursors", desc: "Custom cursors that morph and snap to elements." },
      { preview: "tp-kinetic", name: "Kinetic & generative backgrounds", desc: "Algorithmic gradients and particles that react to input." },
      { preview: "tp-parallax", name: "Scrollytelling parallax", desc: "Depth layers that shift independently as you scroll." },
    ],
  },
  {
    title: "Heroes & navigation systems",
    unit: "patterns",
    items: [
      { preview: "tp-cinematic", name: "Cinematic 3D hero", desc: "Rotatable product renders that respond to the cursor." },
      { preview: "tp-magneticmenu", name: "Floating magnetic menus", desc: "Pill-shaped nav that tracks the cursor, tucks away on scroll." },
      { preview: "tp-megamenu", name: "Mega menus", desc: "Multi-column navigation panels with previews." },
      { preview: "tp-dropdown", name: "Animated dropdowns", desc: "Staggered reveals with spring easing." },
    ],
  },
  {
    title: "Action elements & inputs",
    unit: "patterns",
    items: [
      { preview: "tp-magbutton", name: "Magnetic buttons", desc: "Buttons that lean toward the cursor before the click." },
      { preview: "tp-spotlight", name: "Spotlight search", desc: "Command-palette search with fuzzy match and shortcuts." },
      { preview: "tp-floatlabel", name: "Floating label forms", desc: "Inline validation with shake-on-error and step progress." },
    ],
  },
  {
    title: "Data display & layouts",
    unit: "patterns",
    items: [
      { preview: "tp-carousel", name: "3D carousels & coverflow", desc: "Card stacks with momentum and depth-of-field blur." },
      { preview: "sp-bento", name: "Bento grids & stacking cards", desc: "Modular blocks that scale and stack as you scroll." },
      { preview: "tp-table", name: "Dense data tables", desc: "Virtualized scrolling, sticky headers, inline sparklines." },
      { preview: "tp-calendar", name: "Interactive calendars", desc: "Sliding transitions and hover event-preview cards." },
    ],
  },
  {
    title: "Feedback, media & AI integration",
    unit: "patterns",
    items: [
      { preview: "tp-island", name: "Dynamic island alerts", desc: "Toasts that expand to show actions, then auto-dismiss." },
      { preview: "tp-loading", name: "Loading animations", desc: "Brand-specific particle loaders and shimmer skeletons." },
      { preview: "tp-aichat", name: "AI chat drawers", desc: "Glass panels with live waveform and markdown rendering." },
      { preview: "tp-media360", name: "360° & depth media", desc: "Interactive product viewers and comparison sliders." },
      { preview: "tp-morphicon", name: "Morphing icons", desc: "Icons that shift shape, like menu into close. Hover to try it." },
    ],
  },
];
