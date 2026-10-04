import { MASTER_STYLE_GROUPS, MASTER_STYLE_NAMES } from "@/data/style-catalog";

export type Service = { name: string; desc: string };

export const services: Service[] = [
  {
    name: "Website",
    desc: "Marketing sites that need a stronger interface plus search-ready metadata, semantics, crawl/index hygiene and AI-answer visibility.",
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
    desc: "Onboarding, information architecture, accumulated UI debt and public product pages that need clearer search intent and entity structure.",
  },
  {
    name: "E-commerce store",
    desc: "Product and commerce experiences rebuilt around clarity, accessibility, real structured data and trustworthy search presentation.",
  },
  {
    name: "SEO + AI search optimization",
    desc: "Project-wide technical and on-page SEO, content trust analysis, structured data, keyword-to-page mapping, answer-engine optimization and AI-search readiness without fabricated metrics.",
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
    body: "Upload the complete project or selected source files. Rezyn hydrates the real source, preserves folder structure, keeps originals intact and builds one project-wide model before edits begin.",
  },
  {
    version: "02 — Choose engine",
    title: "Redesign, SEO, or both",
    body: "Run UI/UX reconstruction, the SEO Agent, or Redesign + SEO. The SEO path covers search visibility, technical SEO, on-page optimization, content quality and trust, keyword-to-page mapping, structured data, answer engines and AI-search readiness.",
  },
  {
    version: "03 — Analyze + transform",
    title: "Plan the system before editing",
    body: "Rezyn creates project-level design and/or SEO plans, measures deterministic issues first, then transforms files in coordinated order with source-grounded AI generation and independent QA.",
  },
  {
    version: "04 — Export",
    title: "Take the validated project",
    body: "Download one ZIP containing the best final version of every file — SEO-optimized output first when available, then redesigned source, then untouched originals for anything that did not need modification.",
  },
];

export type PreviewItem = { preview: string; name: string; desc: string };
export type PreviewGroup = { title: string; unit: string; items: PreviewItem[] };

/** The only active redesign direction catalog. */
export const styleGroups: PreviewGroup[] = MASTER_STYLE_GROUPS;
export const allStyleNames: string[] = MASTER_STYLE_NAMES;

/**
 * Signals intentionally reuse the active Direction Library website thumbnails.
 * Never point this list back to the legacy tp-* / old abstract sp-* previews;
 * keeping these IDs inside MASTER_STYLE_GROUPS guarantees both libraries render
 * the same current screenshot-style thumbnail system.
 */
export const trendGroups: PreviewGroup[] = [
  {
    title: "Core architectural & visual styles",
    unit: "patterns",
    items: [
      {
        preview: "sp-spatial-ui",
        name: "Immersive WebGL / Three.js",
        desc: "Full-viewport 3D worlds users navigate like a game.",
      },
      {
        preview: "sp-liquid-glass",
        name: "Liquid glass",
        desc: "Blurred glass with specular highlight and refraction.",
      },
      {
        preview: "sp-neobrutalism-new",
        name: "Neo-brutalism & expressive layouts",
        desc: "High-contrast blocks, visible grid, oversized type.",
      },
      {
        preview: "sp-ar-morphism",
        name: "Spatial & layered UI",
        desc: "Floating panels casting depth-mapped shadows on scroll.",
      },
    ],
  },
  {
    title: "Global backgrounds & cursor mechanics",
    unit: "patterns",
    items: [
      {
        preview: "sp-generative-ui",
        name: "Interactive 3D cursors",
        desc: "Custom cursors that morph and snap to elements.",
      },
      {
        preview: "sp-kinetic-type",
        name: "Kinetic & generative backgrounds",
        desc: "Algorithmic gradients and particles that react to input.",
      },
      {
        preview: "sp-cinematic-scroll",
        name: "Scrollytelling parallax",
        desc: "Depth layers that shift independently as you scroll.",
      },
    ],
  },
  {
    title: "Heroes & navigation systems",
    unit: "patterns",
    items: [
      {
        preview: "sp-fullscreen",
        name: "Cinematic 3D hero",
        desc: "Rotatable product renders that respond to the cursor.",
      },
      {
        preview: "sp-radical-nav",
        name: "Floating magnetic menus",
        desc: "Pill-shaped nav that tracks the cursor, tucks away on scroll.",
      },
      {
        preview: "sp-windowing",
        name: "Mega menus",
        desc: "Multi-column navigation panels with previews.",
      },
      {
        preview: "sp-material-design",
        name: "Animated dropdowns",
        desc: "Staggered reveals with spring easing.",
      },
    ],
  },
  {
    title: "Action elements & inputs",
    unit: "patterns",
    items: [
      {
        preview: "sp-squirclemorphism",
        name: "Magnetic buttons",
        desc: "Buttons that lean toward the cursor before the click.",
      },
      {
        preview: "sp-agentic-ux",
        name: "Spotlight search",
        desc: "Command-palette search with fuzzy match and shortcuts.",
      },
      {
        preview: "sp-accessibility",
        name: "Floating label forms",
        desc: "Inline validation with shake-on-error and step progress.",
      },
    ],
  },
  {
    title: "Data display & layouts",
    unit: "patterns",
    items: [
      {
        preview: "sp-infinite-gallery",
        name: "3D carousels & coverflow",
        desc: "Card stacks with momentum and depth-of-field blur.",
      },
      {
        preview: "sp-bento-grid",
        name: "Bento grids & stacking cards",
        desc: "Modular blocks that scale and stack as you scroll.",
      },
      {
        preview: "sp-eink",
        name: "Dense data tables",
        desc: "Virtualized scrolling, sticky headers, inline sparklines.",
      },
      {
        preview: "sp-card-modular",
        name: "Interactive calendars",
        desc: "Sliding transitions and hover event-preview cards.",
      },
    ],
  },
  {
    title: "Feedback, media & AI integration",
    unit: "patterns",
    items: [
      {
        preview: "sp-liquid-glass",
        name: "Dynamic island alerts",
        desc: "Toasts that expand to show actions, then auto-dismiss.",
      },
      {
        preview: "sp-aurora-ui",
        name: "Loading animations",
        desc: "Brand-specific particle loaders and shimmer skeletons.",
      },
      {
        preview: "sp-chat-first",
        name: "AI chat drawers",
        desc: "Glass panels with live waveform and markdown rendering.",
      },
      {
        preview: "sp-spatial-ui",
        name: "360° & depth media",
        desc: "Interactive product viewers and comparison sliders.",
      },
      {
        preview: "sp-ambient-ai",
        name: "Morphing icons",
        desc: "Icons that shift shape, like menu into close. Hover to try it.",
      },
    ],
  },
];
