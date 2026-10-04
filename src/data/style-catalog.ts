export type MasterStyleItem = { preview: string; name: string; desc: string };
export type MasterStyleGroup = { title: string; unit: string; items: MasterStyleItem[] };

export const MASTER_STYLE_GROUPS: MasterStyleGroup[] = [
  {
    title: "The Morphisms & Material Frameworks",
    unit: "directions",
    items: [
      {
        preview: "sp-glassmorphism",
        name: "Glassmorphism",
        desc: "Frosted translucent surfaces layered over luminous depth.",
      },
      {
        preview: "sp-neumorphism-soft",
        name: "Neumorphism (Soft UI)",
        desc: "Soft extruded controls shaped from a single surface.",
      },
      {
        preview: "sp-claymorphism",
        name: "Claymorphism",
        desc: "Puffy tactile forms with playful dimensional softness.",
      },
      {
        preview: "sp-liquid-glass",
        name: "Liquid Glass",
        desc: "Fluid refractive glass with flowing highlights and depth.",
      },
      {
        preview: "sp-squirclemorphism",
        name: "Squirclemorphism",
        desc: "Continuous rounded geometry built around squircle forms.",
      },
      {
        preview: "sp-metalmorphism",
        name: "Metalmorphism",
        desc: "Brushed metallic surfaces, reflections and engineered precision.",
      },
      {
        preview: "sp-ar-morphism",
        name: "AR-morphism",
        desc: "Spatial overlays and anchored interface layers inspired by AR.",
      },
      {
        preview: "sp-skeuomorphism-2",
        name: "Skeuomorphism 2.0",
        desc: "Modern tactile realism with believable digital materials.",
      },
    ],
  },
  {
    title: "Structural Layouts & Grid Paradigms",
    unit: "directions",
    items: [
      {
        preview: "sp-bento-grid",
        name: "Bento Grid",
        desc: "Asymmetric modular blocks organized like a bento tray.",
      },
      {
        preview: "sp-windowing",
        name: "Window Grids 2.0 / Windowing",
        desc: "Independent viewport panels arranged as an adaptive window system.",
      },
      {
        preview: "sp-swiss-design",
        name: "Swiss Design (International Typographic Style)",
        desc: "Rigorous typography and modular grids with disciplined hierarchy.",
      },
      {
        preview: "sp-bauhaus",
        name: "Bauhaus Functionalism",
        desc: "Geometry, primary structure and function-led visual order.",
      },
      {
        preview: "sp-asymmetric-grids",
        name: "Asymmetric Grids",
        desc: "Deliberately uneven composition balanced through scale and rhythm.",
      },
      {
        preview: "sp-fullscreen",
        name: "100% Height / Full-Screen Viewports",
        desc: "Immersive viewport-sized sections with bold spatial pacing.",
      },
      {
        preview: "sp-card-modular",
        name: "Card-Based UI / Modular Blocks",
        desc: "Composable card architecture with clear modular hierarchy.",
      },
    ],
  },
  {
    title: "The Historical Art Movements",
    unit: "directions",
    items: [
      {
        preview: "sp-brutalism-new",
        name: "Brutalism",
        desc: "Raw structure, hard rules and unapologetic typographic weight.",
      },
      {
        preview: "sp-neobrutalism-new",
        name: "Neo-Brutalism (Neubrutalism)",
        desc: "Bold outlines, flat color and offset-shadow graphic energy.",
      },
      {
        preview: "sp-memphis-style",
        name: "Memphis Style",
        desc: "Postmodern geometry, squiggles and playful color clashes.",
      },
      {
        preview: "sp-risograph",
        name: "Risograph",
        desc: "Layered spot colors, grain and imperfect print registration.",
      },
      {
        preview: "sp-art-deco",
        name: "Art Deco",
        desc: "Geometric symmetry, metallic ornament and theatrical elegance.",
      },
      {
        preview: "sp-art-nouveau",
        name: "Art Nouveau",
        desc: "Organic curves, botanical ornament and flowing decorative structure.",
      },
      {
        preview: "sp-psychedelic",
        name: "Psychedelic / Acid Graphic",
        desc: "Warped typography, saturated color and hallucinatory composition.",
      },
      {
        preview: "sp-pop-art",
        name: "Pop Art",
        desc: "Comic energy, halftones and high-impact graphic color.",
      },
    ],
  },
  {
    title: "Retro-Tech & Digital Nostalgia",
    unit: "directions",
    items: [
      {
        preview: "sp-web1",
        name: "Web 1.0 Retro",
        desc: "Early-web chrome, hyperlinks and intentionally primitive structure.",
      },
      {
        preview: "sp-pixel-art",
        name: "Pixel Art UI",
        desc: "Crisp pixel geometry, bitmap motifs and game-like interface logic.",
      },
      {
        preview: "sp-vaporwave-new",
        name: "Vaporwave",
        desc: "Dreamy neon nostalgia, synthetic horizons and digital surrealism.",
      },
      {
        preview: "sp-synthwave",
        name: "Synthwave / Retrowave",
        desc: "Neon grids, dark horizons and cinematic retro-future energy.",
      },
      {
        preview: "sp-y2k-new",
        name: "Y2K Aesthetic",
        desc: "Chrome, gloss and optimistic early-2000s digital styling.",
      },
      {
        preview: "sp-frutiger-aero",
        name: "Frutiger Aero",
        desc: "Bright skies, glossy nature-tech optimism and friendly depth.",
      },
      {
        preview: "sp-steampunk",
        name: "Steampunk UI",
        desc: "Mechanical brass, gauges and crafted industrial interface details.",
      },
    ],
  },
  {
    title: "Minimalism & Flat Architecture",
    unit: "directions",
    items: [
      {
        preview: "sp-flat-design",
        name: "Flat Design",
        desc: "Pure two-dimensional hierarchy built with color and spacing.",
      },
      {
        preview: "sp-flat-2",
        name: "Flat 2.0 (Semi-Flat)",
        desc: "Flat structure enhanced with restrained depth and elevation.",
      },
      {
        preview: "sp-material-design",
        name: "Material Design",
        desc: "Systematic surfaces, motion, elevation and component discipline.",
      },
      {
        preview: "sp-exaggerated-minimalism",
        name: "Exaggerated Minimalism",
        desc: "Extreme whitespace, giant type and a tiny number of focal elements.",
      },
      {
        preview: "sp-monochromatic",
        name: "Monochromatic Design",
        desc: "One hue family carries the entire hierarchy.",
      },
      {
        preview: "sp-color-blocking",
        name: "Color Blocking",
        desc: "Large graphic color fields define structure and navigation.",
      },
      {
        preview: "sp-eink",
        name: "E-Ink / Utilitarian",
        desc: "High-legibility monochrome utility with low-distraction density.",
      },
    ],
  },
  {
    title: "Modern System Modes & Experience States",
    unit: "directions",
    items: [
      {
        preview: "sp-dark-mode",
        name: "Dark Mode Maturity",
        desc: "Purpose-built dark surfaces with refined contrast and depth.",
      },
      {
        preview: "sp-aurora-ui",
        name: "Aurora UI",
        desc: "Atmospheric gradient meshes and luminous soft-focus color.",
      },
      {
        preview: "sp-accessibility",
        name: "Inclusive / Accessibility-First",
        desc: "Clarity, contrast and interaction affordances lead every decision.",
      },
      {
        preview: "sp-sustainable",
        name: "Sustainable / Green UX",
        desc: "Low-energy visual systems with restrained media and nature-led cues.",
      },
    ],
  },
  {
    title: "Mixed-Media, Cinematic & Motion UI",
    unit: "directions",
    items: [
      {
        preview: "sp-kinetic-type",
        name: "Kinetic Typography",
        desc: "Typography becomes the primary moving visual system.",
      },
      {
        preview: "sp-scrapbook",
        name: "Scrapbook Collage",
        desc: "Layered paper, tape and mixed-media composition.",
      },
      {
        preview: "sp-glitch",
        name: "Glitch Art / Datamoshing",
        desc: "Digital artifacts, signal breaks and deliberate visual corruption.",
      },
      {
        preview: "sp-cinematic-scroll",
        name: "Cinematic / Scrollytelling",
        desc: "Scene-based narrative composition designed around scroll progression.",
      },
      {
        preview: "sp-radical-nav",
        name: "Experimental / Radical Navigation",
        desc: "Navigation becomes an unconventional spatial interaction system.",
      },
      {
        preview: "sp-infinite-gallery",
        name: "Infinite / Endless Galleries",
        desc: "Continuous visual browsing built around endless content flow.",
      },
      {
        preview: "sp-scattered-gallery",
        name: "Scattered Galleries",
        desc: "Free-positioned media creates an exploratory gallery field.",
      },
      {
        preview: "sp-gamified",
        name: "Gamified UX",
        desc: "Progress, rewards and game mechanics drive interaction.",
      },
    ],
  },
  {
    title: "Natural, Organic & Wellness Aesthetics",
    unit: "directions",
    items: [
      {
        preview: "sp-biophilic",
        name: "Biophilic UI",
        desc: "Natural forms, daylight palettes and plant-inspired visual calm.",
      },
      {
        preview: "sp-biomimetic",
        name: "Biomimetic UI",
        desc: "Structures and interactions modeled on living systems.",
      },
      {
        preview: "sp-japandi",
        name: "Japandi",
        desc: "Japanese restraint meets Scandinavian warmth and utility.",
      },
      {
        preview: "sp-wabi-sabi",
        name: "Wabi-Sabi Aesthetic",
        desc: "Imperfection, texture and quiet asymmetry create character.",
      },
      {
        preview: "sp-calm",
        name: "Calm Design / Decompressed UI",
        desc: "Low-density composition with generous space and minimal cognitive load.",
      },
    ],
  },
  {
    title: "AI-Native & Spatial Realities",
    unit: "directions",
    items: [
      {
        preview: "sp-generative-ui",
        name: "Generative UI / Dynamic Component Assembly",
        desc: "Interfaces dynamically composed around context and task.",
      },
      {
        preview: "sp-agentic-ux",
        name: "Agentic UX",
        desc: "Goal-driven workflows centered on autonomous agent action.",
      },
      {
        preview: "sp-chat-first",
        name: "Conversational Layering / Chat-First UX",
        desc: "Conversation becomes the primary shell with contextual layers around it.",
      },
      {
        preview: "sp-spatial-ui",
        name: "Spatial UI",
        desc: "Depth, floating planes and spatial relationships organize the interface.",
      },
      {
        preview: "sp-ambient-ai",
        name: "Ambient AI / Intent UI",
        desc: "Quiet adaptive assistance appears when intent becomes clear.",
      },
      {
        preview: "sp-predictive-ux",
        name: "Predictive / Anticipatory UX",
        desc: "The interface surfaces likely next actions before they are requested.",
      },
      {
        preview: "sp-anti-perfect",
        name: "Intentional Imperfection (Anti-Perfect UI)",
        desc: "Human irregularity and deliberate roughness resist generic AI polish.",
      },
    ],
  },
];

export const MASTER_STYLE_NAMES = MASTER_STYLE_GROUPS.flatMap((group) =>
  group.items.map((item) => item.name),
);
