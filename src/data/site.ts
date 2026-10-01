import { MASTER_STYLE_GROUPS, MASTER_STYLE_NAMES } from "@/data/style-catalog";

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
    version: "01 — Upload",
    title: "Drop the whole project in",
    body: "Upload every file you want touched, or write new ones straight in the browser. Your originals are kept untouched alongside every redesigned version.",
  },
  {
    version: "02 — Pick a style",
    title: "Choose the visual world",
    body: "Choose one of sixty-one full reconstruction directions for the whole project, or assign a different direction per file.",
  },
  {
    version: "03 — Download",
    title: "Take the rebuilt files",
    body: "Presentation-bearing files are rebuilt in the chosen direction, checked, and returned as one ZIP. Review and test before shipping.",
  },
];

export type PreviewItem = { preview: string; name: string; desc: string };
export type PreviewGroup = { title: string; unit: string; items: PreviewItem[] };

/** The only active redesign direction catalog. */
export const styleGroups: PreviewGroup[] = MASTER_STYLE_GROUPS;
export const allStyleNames: string[] = MASTER_STYLE_NAMES;

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
