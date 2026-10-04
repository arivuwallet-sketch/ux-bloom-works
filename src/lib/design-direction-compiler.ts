import { STYLE_NAMES, getStyleBlueprint } from "./style-blueprints";

export type DesignFamily =
  | "morphic-material"
  | "grid-system"
  | "graphic-brutalist"
  | "retro-digital"
  | "flat-system"
  | "atmospheric-accessible"
  | "motion-experimental"
  | "organic-calm"
  | "adaptive-agentic";

export type DesignPalette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
};

export type DesignDirectionIR = {
  version: 1;
  style: string;
  family: DesignFamily;
  blueprint: string;
  layout: {
    density: "compact" | "balanced" | "spacious";
    alignment: "rigid" | "asymmetric" | "fluid" | "spatial";
    composition: string;
  };
  geometry: {
    radius: string;
    borderWidth: string;
    borderStyle: "solid";
  };
  depth: {
    mode: "none" | "soft" | "hard" | "glow" | "glass" | "material";
    shadow: string;
    pressedShadow: string;
  };
  typography: {
    displayFamily: string;
    bodyFamily: string;
    displayWeight: number;
    tracking: string;
  };
  motion: {
    duration: string;
    easing: string;
    distance: string;
    reducedMotion: true;
  };
  palette: {
    light: DesignPalette;
    dark: DesignPalette;
  };
  implementation: {
    semanticApi: string[];
    utilityPrimitives: string[];
    rules: string[];
  };
};

type FamilyProfile = Omit<DesignDirectionIR, "style" | "blueprint" | "family" | "version">;

export const DESIGN_DIRECTION_COMPILER_VERSION = "2026-10-ir-v1";

export const STYLE_FAMILY: Readonly<Record<string, DesignFamily>> = Object.freeze({
  Glassmorphism: "morphic-material",
  "Neumorphism (Soft UI)": "morphic-material",
  Claymorphism: "morphic-material",
  "Liquid Glass": "morphic-material",
  Squirclemorphism: "morphic-material",
  Metalmorphism: "morphic-material",
  "AR-morphism": "morphic-material",
  "Skeuomorphism 2.0": "morphic-material",

  "Bento Grid": "grid-system",
  "Window Grids 2.0 / Windowing": "grid-system",
  "Swiss Design (International Typographic Style)": "grid-system",
  "Bauhaus Functionalism": "grid-system",
  "Asymmetric Grids": "grid-system",
  "100% Height / Full-Screen Viewports": "grid-system",
  "Card-Based UI / Modular Blocks": "grid-system",

  Brutalism: "graphic-brutalist",
  "Neo-Brutalism (Neubrutalism)": "graphic-brutalist",
  "Memphis Style": "graphic-brutalist",
  Risograph: "graphic-brutalist",
  "Art Deco": "graphic-brutalist",
  "Art Nouveau": "graphic-brutalist",
  "Psychedelic / Acid Graphic": "graphic-brutalist",
  "Pop Art": "graphic-brutalist",

  "Web 1.0 Retro": "retro-digital",
  "Pixel Art UI": "retro-digital",
  Vaporwave: "retro-digital",
  "Synthwave / Retrowave": "retro-digital",
  "Y2K Aesthetic": "retro-digital",
  "Frutiger Aero": "retro-digital",
  "Steampunk UI": "retro-digital",

  "Flat Design": "flat-system",
  "Flat 2.0 (Semi-Flat)": "flat-system",
  "Material Design": "flat-system",
  "Exaggerated Minimalism": "flat-system",
  "Monochromatic Design": "flat-system",
  "Color Blocking": "flat-system",
  "E-Ink / Utilitarian": "flat-system",

  "Dark Mode Maturity": "atmospheric-accessible",
  "Aurora UI": "atmospheric-accessible",
  "Inclusive / Accessibility-First": "atmospheric-accessible",
  "Sustainable / Green UX": "atmospheric-accessible",

  "Kinetic Typography": "motion-experimental",
  "Scrapbook Collage": "motion-experimental",
  "Glitch Art / Datamoshing": "motion-experimental",
  "Cinematic / Scrollytelling": "motion-experimental",
  "Experimental / Radical Navigation": "motion-experimental",
  "Infinite / Endless Galleries": "motion-experimental",
  "Scattered Galleries": "motion-experimental",
  "Gamified UX": "motion-experimental",

  "Biophilic UI": "organic-calm",
  "Biomimetic UI": "organic-calm",
  Japandi: "organic-calm",
  "Wabi-Sabi Aesthetic": "organic-calm",
  "Calm Design / Decompressed UI": "organic-calm",

  "Generative UI / Dynamic Component Assembly": "adaptive-agentic",
  "Agentic UX": "adaptive-agentic",
  "Conversational Layering / Chat-First UX": "adaptive-agentic",
  "Spatial UI": "adaptive-agentic",
  "Ambient AI / Intent UI": "adaptive-agentic",
  "Predictive / Anticipatory UX": "adaptive-agentic",
  "Intentional Imperfection (Anti-Perfect UI)": "adaptive-agentic",
});

const semanticApi = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--radius",
] as const;

const FAMILY_PROFILES: Readonly<Record<DesignFamily, FamilyProfile>> = {
  "morphic-material": {
    layout: {
      density: "balanced",
      alignment: "fluid",
      composition:
        "Layered surfaces with material depth, tactile grouping and strong foreground/background separation.",
    },
    geometry: { radius: "1rem", borderWidth: "1px", borderStyle: "solid" },
    depth: {
      mode: "glass",
      shadow: "0 16px 40px rgb(15 23 42 / 0.16)",
      pressedShadow: "inset 2px 2px 0 rgb(15 23 42 / 0.18)",
    },
    typography: {
      displayFamily: "ui-sans-serif, system-ui, sans-serif",
      bodyFamily: "ui-sans-serif, system-ui, sans-serif",
      displayWeight: 750,
      tracking: "-0.02em",
    },
    motion: {
      duration: "160ms",
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      distance: "2px",
      reducedMotion: true,
    },
    palette: {
      light: {
        background: "#f6f7fb",
        foreground: "#111827",
        card: "#ffffff",
        cardForeground: "#111827",
        primary: "#1e3a5f",
        primaryForeground: "#ffffff",
        secondary: "#dbeafe",
        secondaryForeground: "#172554",
        muted: "#e5e7eb",
        mutedForeground: "#374151",
        accent: "#cffafe",
        accentForeground: "#164e63",
        destructive: "#9f1239",
        destructiveForeground: "#ffffff",
        border: "#64748b",
        input: "#64748b",
        ring: "#1d4ed8",
      },
      dark: {
        background: "#0b1020",
        foreground: "#f8fafc",
        card: "#151b2e",
        cardForeground: "#f8fafc",
        primary: "#93c5fd",
        primaryForeground: "#0b1020",
        secondary: "#86efac",
        secondaryForeground: "#052e16",
        muted: "#26324b",
        mutedForeground: "#e5e7eb",
        accent: "#f9a8d4",
        accentForeground: "#500724",
        destructive: "#fda4af",
        destructiveForeground: "#4c0519",
        border: "#94a3b8",
        input: "#cbd5e1",
        ring: "#93c5fd",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Depth effects may vary per direction but semantic colors and interaction boundaries remain compiler-owned.",
        "Do not invent alternate Tailwind theme infrastructure in page files.",
      ],
    },
  },
  "grid-system": {
    layout: {
      density: "balanced",
      alignment: "rigid",
      composition:
        "Grid-led information architecture with explicit spans, alignment and responsive reflow.",
    },
    geometry: { radius: "0.375rem", borderWidth: "1px", borderStyle: "solid" },
    depth: {
      mode: "none",
      shadow: "0 1px 0 rgb(17 24 39 / 0.14)",
      pressedShadow: "inset 0 2px 0 rgb(17 24 39 / 0.16)",
    },
    typography: {
      displayFamily: "Arial, Helvetica, sans-serif",
      bodyFamily: "Arial, Helvetica, sans-serif",
      displayWeight: 700,
      tracking: "-0.015em",
    },
    motion: { duration: "120ms", easing: "ease-out", distance: "1px", reducedMotion: true },
    palette: {
      light: {
        background: "#f7f5ef",
        foreground: "#111111",
        card: "#ffffff",
        cardForeground: "#111111",
        primary: "#1f2937",
        primaryForeground: "#ffffff",
        secondary: "#facc15",
        secondaryForeground: "#111111",
        muted: "#e7e5e4",
        mutedForeground: "#44403c",
        accent: "#bae6fd",
        accentForeground: "#0c4a6e",
        destructive: "#b91c1c",
        destructiveForeground: "#ffffff",
        border: "#57534e",
        input: "#57534e",
        ring: "#075985",
      },
      dark: {
        background: "#11100e",
        foreground: "#fafaf9",
        card: "#1c1917",
        cardForeground: "#fafaf9",
        primary: "#facc15",
        primaryForeground: "#111111",
        secondary: "#67e8f9",
        secondaryForeground: "#083344",
        muted: "#292524",
        mutedForeground: "#e7e5e4",
        accent: "#c4b5fd",
        accentForeground: "#2e1065",
        destructive: "#fda4af",
        destructiveForeground: "#4c0519",
        border: "#a8a29e",
        input: "#d6d3d1",
        ring: "#67e8f9",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Layout personality belongs in grid composition, not invalid CSS token variants.",
        "Responsive spans must collapse without horizontal overflow.",
      ],
    },
  },
  "graphic-brutalist": {
    layout: {
      density: "balanced",
      alignment: "asymmetric",
      composition:
        "Graphic blocks, hard edges, visible structure and strong physical interaction states.",
    },
    geometry: { radius: "0.25rem", borderWidth: "3px", borderStyle: "solid" },
    depth: {
      mode: "hard",
      shadow: "5px 5px 0 #111111",
      pressedShadow: "inset 2px 2px 0 rgb(17 17 17 / 0.35)",
    },
    typography: {
      displayFamily: "Arial Black, Arial, sans-serif",
      bodyFamily: "Arial, Helvetica, sans-serif",
      displayWeight: 900,
      tracking: "-0.025em",
    },
    motion: {
      duration: "110ms",
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      distance: "3px",
      reducedMotion: true,
    },
    palette: {
      light: {
        background: "#fff8dc",
        foreground: "#111111",
        card: "#ffffff",
        cardForeground: "#111111",
        primary: "#7c2d12",
        primaryForeground: "#ffffff",
        secondary: "#fde047",
        secondaryForeground: "#111111",
        muted: "#e7e5e4",
        mutedForeground: "#292524",
        accent: "#22d3ee",
        accentForeground: "#083344",
        destructive: "#991b1b",
        destructiveForeground: "#ffffff",
        border: "#111111",
        input: "#111111",
        ring: "#1d4ed8",
      },
      dark: {
        background: "#111111",
        foreground: "#ffffff",
        card: "#1c1917",
        cardForeground: "#ffffff",
        primary: "#fde047",
        primaryForeground: "#111111",
        secondary: "#22d3ee",
        secondaryForeground: "#083344",
        muted: "#292524",
        mutedForeground: "#f5f5f4",
        accent: "#f9a8d4",
        accentForeground: "#500724",
        destructive: "#fca5a5",
        destructiveForeground: "#450a0a",
        border: "#ffffff",
        input: "#ffffff",
        ring: "#fde047",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Hard shadows and thick borders are compiler primitives, not hand-authored variant classes.",
        "Pressed states use valid calc() translation and non-zero inset shadow.",
        "Global border resets cannot erase rezyn-border because border-style is explicit.",
      ],
    },
  },
  "retro-digital": {
    layout: {
      density: "compact",
      alignment: "asymmetric",
      composition:
        "Retro digital chrome, strong motif framing and deliberately period-specific module rhythm.",
    },
    geometry: { radius: "0.5rem", borderWidth: "2px", borderStyle: "solid" },
    depth: {
      mode: "glow",
      shadow: "0 0 22px rgb(109 40 217 / 0.28)",
      pressedShadow: "inset 2px 2px 0 rgb(49 46 129 / 0.45)",
    },
    typography: {
      displayFamily: "Trebuchet MS, Arial, sans-serif",
      bodyFamily: "Verdana, Arial, sans-serif",
      displayWeight: 800,
      tracking: "0.01em",
    },
    motion: { duration: "140ms", easing: "ease-out", distance: "2px", reducedMotion: true },
    palette: {
      light: {
        background: "#fff7ed",
        foreground: "#1f1235",
        card: "#ffffff",
        cardForeground: "#1f1235",
        primary: "#6d28d9",
        primaryForeground: "#ffffff",
        secondary: "#fde68a",
        secondaryForeground: "#422006",
        muted: "#ede9fe",
        mutedForeground: "#4c1d95",
        accent: "#67e8f9",
        accentForeground: "#164e63",
        destructive: "#be123c",
        destructiveForeground: "#ffffff",
        border: "#6b21a8",
        input: "#6b21a8",
        ring: "#5b21b6",
      },
      dark: {
        background: "#120c1f",
        foreground: "#faf5ff",
        card: "#211433",
        cardForeground: "#faf5ff",
        primary: "#f0abfc",
        primaryForeground: "#3b0764",
        secondary: "#67e8f9",
        secondaryForeground: "#083344",
        muted: "#312e81",
        mutedForeground: "#e0e7ff",
        accent: "#fde047",
        accentForeground: "#422006",
        destructive: "#fda4af",
        destructiveForeground: "#4c0519",
        border: "#c084fc",
        input: "#e9d5ff",
        ring: "#67e8f9",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Decorative glow/chrome/pixel motifs may vary, but semantic contrast and state mechanics are fixed.",
        "Animation is optional and always reduced-motion safe.",
      ],
    },
  },
  "flat-system": {
    layout: {
      density: "balanced",
      alignment: "rigid",
      composition:
        "Clear flat hierarchy driven by spacing, typography, color blocking and disciplined component roles.",
    },
    geometry: { radius: "0.625rem", borderWidth: "1px", borderStyle: "solid" },
    depth: {
      mode: "soft",
      shadow: "0 6px 18px rgb(15 23 42 / 0.10)",
      pressedShadow: "inset 0 2px 0 rgb(15 23 42 / 0.15)",
    },
    typography: {
      displayFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      bodyFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      displayWeight: 750,
      tracking: "-0.02em",
    },
    motion: { duration: "130ms", easing: "ease-out", distance: "1px", reducedMotion: true },
    palette: {
      light: {
        background: "#ffffff",
        foreground: "#111827",
        card: "#f8fafc",
        cardForeground: "#111827",
        primary: "#1e40af",
        primaryForeground: "#ffffff",
        secondary: "#dbeafe",
        secondaryForeground: "#1e3a8a",
        muted: "#f1f5f9",
        mutedForeground: "#475569",
        accent: "#dcfce7",
        accentForeground: "#14532d",
        destructive: "#b91c1c",
        destructiveForeground: "#ffffff",
        border: "#64748b",
        input: "#64748b",
        ring: "#1d4ed8",
      },
      dark: {
        background: "#0f172a",
        foreground: "#f8fafc",
        card: "#1e293b",
        cardForeground: "#f8fafc",
        primary: "#93c5fd",
        primaryForeground: "#172554",
        secondary: "#86efac",
        secondaryForeground: "#052e16",
        muted: "#334155",
        mutedForeground: "#e2e8f0",
        accent: "#fde68a",
        accentForeground: "#422006",
        destructive: "#fda4af",
        destructiveForeground: "#4c0519",
        border: "#94a3b8",
        input: "#cbd5e1",
        ring: "#93c5fd",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Flat directions can reduce or remove depth without changing the semantic API.",
        "Do not add decorative complexity that contradicts the selected flat/minimal direction.",
      ],
    },
  },
  "atmospheric-accessible": {
    layout: {
      density: "spacious",
      alignment: "fluid",
      composition:
        "Atmospheric fields with strong legibility, calm hierarchy and accessibility as a visible design feature.",
    },
    geometry: { radius: "0.875rem", borderWidth: "1px", borderStyle: "solid" },
    depth: {
      mode: "soft",
      shadow: "0 14px 36px rgb(2 6 23 / 0.16)",
      pressedShadow: "inset 0 2px 0 rgb(2 6 23 / 0.22)",
    },
    typography: {
      displayFamily: "ui-sans-serif, system-ui, sans-serif",
      bodyFamily: "ui-sans-serif, system-ui, sans-serif",
      displayWeight: 700,
      tracking: "-0.015em",
    },
    motion: { duration: "150ms", easing: "ease-out", distance: "1px", reducedMotion: true },
    palette: {
      light: {
        background: "#f8fafc",
        foreground: "#172033",
        card: "#ffffff",
        cardForeground: "#172033",
        primary: "#155e75",
        primaryForeground: "#ffffff",
        secondary: "#d1fae5",
        secondaryForeground: "#064e3b",
        muted: "#e2e8f0",
        mutedForeground: "#475569",
        accent: "#e9d5ff",
        accentForeground: "#581c87",
        destructive: "#9f1239",
        destructiveForeground: "#ffffff",
        border: "#64748b",
        input: "#64748b",
        ring: "#0369a1",
      },
      dark: {
        background: "#07111f",
        foreground: "#f8fafc",
        card: "#101c2c",
        cardForeground: "#f8fafc",
        primary: "#67e8f9",
        primaryForeground: "#083344",
        secondary: "#86efac",
        secondaryForeground: "#052e16",
        muted: "#26364d",
        mutedForeground: "#e2e8f0",
        accent: "#d8b4fe",
        accentForeground: "#3b0764",
        destructive: "#fda4af",
        destructiveForeground: "#4c0519",
        border: "#94a3b8",
        input: "#cbd5e1",
        ring: "#67e8f9",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Accessibility constraints outrank decorative atmosphere.",
        "Dark surfaces use calibrated, non-glare contrast rather than simple inversion.",
      ],
    },
  },
  "motion-experimental": {
    layout: {
      density: "balanced",
      alignment: "asymmetric",
      composition:
        "Editorial or spatial experimentation with clear orientation, stable interaction targets and motion as a secondary communication layer.",
    },
    geometry: { radius: "0.5rem", borderWidth: "2px", borderStyle: "solid" },
    depth: {
      mode: "hard",
      shadow: "4px 4px 0 rgb(17 24 39 / 0.38)",
      pressedShadow: "inset 2px 2px 0 rgb(17 24 39 / 0.28)",
    },
    typography: {
      displayFamily: "Arial Black, Impact, sans-serif",
      bodyFamily: "Arial, Helvetica, sans-serif",
      displayWeight: 850,
      tracking: "-0.03em",
    },
    motion: {
      duration: "180ms",
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      distance: "4px",
      reducedMotion: true,
    },
    palette: {
      light: {
        background: "#fffdf5",
        foreground: "#111827",
        card: "#ffffff",
        cardForeground: "#111827",
        primary: "#7f1d1d",
        primaryForeground: "#ffffff",
        secondary: "#fef08a",
        secondaryForeground: "#422006",
        muted: "#e5e7eb",
        mutedForeground: "#374151",
        accent: "#a7f3d0",
        accentForeground: "#064e3b",
        destructive: "#9f1239",
        destructiveForeground: "#ffffff",
        border: "#374151",
        input: "#374151",
        ring: "#1d4ed8",
      },
      dark: {
        background: "#0b0b10",
        foreground: "#fafafa",
        card: "#18181b",
        cardForeground: "#fafafa",
        primary: "#fca5a5",
        primaryForeground: "#450a0a",
        secondary: "#fde047",
        secondaryForeground: "#422006",
        muted: "#27272a",
        mutedForeground: "#e4e4e7",
        accent: "#6ee7b7",
        accentForeground: "#064e3b",
        destructive: "#fda4af",
        destructiveForeground: "#4c0519",
        border: "#a1a1aa",
        input: "#d4d4d8",
        ring: "#93c5fd",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Motion never carries essential information and must degrade to immediate static state feedback.",
        "Experimental navigation must preserve orientation, focus order and escape paths.",
      ],
    },
  },
  "organic-calm": {
    layout: {
      density: "spacious",
      alignment: "fluid",
      composition:
        "Organic rhythm, breathable spacing and natural grouping with low cognitive load.",
    },
    geometry: { radius: "1.125rem", borderWidth: "1px", borderStyle: "solid" },
    depth: {
      mode: "soft",
      shadow: "0 10px 28px rgb(42 54 44 / 0.12)",
      pressedShadow: "inset 0 2px 0 rgb(42 54 44 / 0.18)",
    },
    typography: {
      displayFamily: "Georgia, ui-serif, serif",
      bodyFamily: "ui-sans-serif, system-ui, sans-serif",
      displayWeight: 700,
      tracking: "-0.015em",
    },
    motion: { duration: "160ms", easing: "ease-out", distance: "1px", reducedMotion: true },
    palette: {
      light: {
        background: "#f7f5ed",
        foreground: "#223126",
        card: "#fffdf7",
        cardForeground: "#223126",
        primary: "#315c3b",
        primaryForeground: "#ffffff",
        secondary: "#dce8d5",
        secondaryForeground: "#24432b",
        muted: "#e8e5da",
        mutedForeground: "#4b5e50",
        accent: "#f3dfb3",
        accentForeground: "#553a0f",
        destructive: "#9f1239",
        destructiveForeground: "#ffffff",
        border: "#66776a",
        input: "#66776a",
        ring: "#315c3b",
      },
      dark: {
        background: "#0f1712",
        foreground: "#f3f7f2",
        card: "#18231b",
        cardForeground: "#f3f7f2",
        primary: "#86efac",
        primaryForeground: "#052e16",
        secondary: "#fde68a",
        secondaryForeground: "#422006",
        muted: "#26332a",
        mutedForeground: "#dce7de",
        accent: "#bfdbfe",
        accentForeground: "#172554",
        destructive: "#fda4af",
        destructiveForeground: "#4c0519",
        border: "#9cae9f",
        input: "#c4d0c6",
        ring: "#86efac",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Organic irregularity may affect shapes and layout but not focus visibility or readable text geometry.",
        "Calm directions minimize motion and simultaneous competing actions.",
      ],
    },
  },
  "adaptive-agentic": {
    layout: {
      density: "balanced",
      alignment: "spatial",
      composition:
        "Context-aware modular composition with explicit status, control, provenance and human override zones.",
    },
    geometry: { radius: "0.75rem", borderWidth: "1px", borderStyle: "solid" },
    depth: {
      mode: "material",
      shadow: "0 12px 30px rgb(15 23 42 / 0.14)",
      pressedShadow: "inset 0 2px 0 rgb(15 23 42 / 0.18)",
    },
    typography: {
      displayFamily: "ui-sans-serif, system-ui, sans-serif",
      bodyFamily: "ui-sans-serif, system-ui, sans-serif",
      displayWeight: 750,
      tracking: "-0.02em",
    },
    motion: { duration: "140ms", easing: "ease-out", distance: "2px", reducedMotion: true },
    palette: {
      light: {
        background: "#f8fafc",
        foreground: "#111827",
        card: "#ffffff",
        cardForeground: "#111827",
        primary: "#3730a3",
        primaryForeground: "#ffffff",
        secondary: "#cffafe",
        secondaryForeground: "#164e63",
        muted: "#e5e7eb",
        mutedForeground: "#374151",
        accent: "#dcfce7",
        accentForeground: "#14532d",
        destructive: "#9f1239",
        destructiveForeground: "#ffffff",
        border: "#64748b",
        input: "#64748b",
        ring: "#4338ca",
      },
      dark: {
        background: "#0b1020",
        foreground: "#f8fafc",
        card: "#161d31",
        cardForeground: "#f8fafc",
        primary: "#a5b4fc",
        primaryForeground: "#1e1b4b",
        secondary: "#67e8f9",
        secondaryForeground: "#083344",
        muted: "#29334a",
        mutedForeground: "#e5e7eb",
        accent: "#86efac",
        accentForeground: "#052e16",
        destructive: "#fda4af",
        destructiveForeground: "#4c0519",
        border: "#94a3b8",
        input: "#cbd5e1",
        ring: "#a5b4fc",
      },
    },
    implementation: {
      semanticApi: [...semanticApi],
      utilityPrimitives: ["rezyn-border", "rezyn-shadow", "rezyn-surface", "rezyn-pressable"],
      rules: [
        "Adaptive behavior never hides permissions, provenance, destructive actions or human control.",
        "Generated module composition still obeys the same semantic tokens and interaction primitives.",
      ],
    },
  },
};

const FAMILY_OVERRIDES: Readonly<
  Record<
    string,
    Partial<Pick<DesignDirectionIR["geometry"], "radius" | "borderWidth">> & {
      depthMode?: DesignDirectionIR["depth"]["mode"];
      density?: DesignDirectionIR["layout"]["density"];
      motionDistance?: string;
    }
  >
> = {
  Brutalism: {
    radius: "0rem",
    borderWidth: "2px",
    depthMode: "none",
    density: "compact",
    motionDistance: "0px",
  },
  "Neo-Brutalism (Neubrutalism)": {
    radius: "0.25rem",
    borderWidth: "3px",
    depthMode: "hard",
    density: "balanced",
    motionDistance: "3px",
  },
  "Pixel Art UI": {
    radius: "0rem",
    borderWidth: "2px",
    depthMode: "hard",
    density: "compact",
    motionDistance: "2px",
  },
  "Web 1.0 Retro": {
    radius: "0rem",
    borderWidth: "1px",
    depthMode: "none",
    density: "compact",
    motionDistance: "0px",
  },
  "Exaggerated Minimalism": {
    radius: "0.25rem",
    borderWidth: "1px",
    depthMode: "none",
    density: "spacious",
    motionDistance: "0px",
  },
  "E-Ink / Utilitarian": {
    radius: "0rem",
    borderWidth: "1px",
    depthMode: "none",
    density: "compact",
    motionDistance: "0px",
  },
  "Inclusive / Accessibility-First": {
    radius: "0.75rem",
    borderWidth: "2px",
    density: "spacious",
    motionDistance: "0px",
  },
  "Calm Design / Decompressed UI": {
    radius: "1rem",
    borderWidth: "1px",
    density: "spacious",
    motionDistance: "0px",
  },
};

function cloneProfile(profile: FamilyProfile): FamilyProfile {
  return JSON.parse(JSON.stringify(profile)) as FamilyProfile;
}

export function compileDesignDirection(style: string): DesignDirectionIR {
  const family = STYLE_FAMILY[style];
  if (!family) {
    throw new Error(`Unknown Rezyn design direction: ${style}`);
  }

  const profile = cloneProfile(FAMILY_PROFILES[family]);
  const override = FAMILY_OVERRIDES[style];
  if (override?.radius) profile.geometry.radius = override.radius;
  if (override?.borderWidth) profile.geometry.borderWidth = override.borderWidth;
  if (override?.depthMode) profile.depth.mode = override.depthMode;
  if (override?.density) profile.layout.density = override.density;
  if (override?.motionDistance) profile.motion.distance = override.motionDistance;

  return {
    version: 1,
    style,
    family,
    blueprint: getStyleBlueprint(style),
    ...profile,
  };
}

function tokenLines(p: DesignPalette) {
  return [
    `  --background: ${p.background};`,
    `  --foreground: ${p.foreground};`,
    `  --card: ${p.card};`,
    `  --card-foreground: ${p.cardForeground};`,
    `  --popover: ${p.card};`,
    `  --popover-foreground: ${p.cardForeground};`,
    `  --primary: ${p.primary};`,
    `  --primary-foreground: ${p.primaryForeground};`,
    `  --secondary: ${p.secondary};`,
    `  --secondary-foreground: ${p.secondaryForeground};`,
    `  --muted: ${p.muted};`,
    `  --muted-foreground: ${p.mutedForeground};`,
    `  --accent: ${p.accent};`,
    `  --accent-foreground: ${p.accentForeground};`,
    `  --destructive: ${p.destructive};`,
    `  --destructive-foreground: ${p.destructiveForeground};`,
    `  --border: ${p.border};`,
    `  --input: ${p.input};`,
    `  --ring: ${p.ring};`,
  ];
}

export function compileDirectionCss(style: string, tailwindV4 = true) {
  const ir = compileDesignDirection(style);
  const family = ir.family;
  const light = tokenLines(ir.palette.light).join("\n");
  const dark = tokenLines(ir.palette.dark).join("\n");
  const shared = `
/* REZYN DESIGN COMPILER ${DESIGN_DIRECTION_COMPILER_VERSION} | ${style} | ${family} */
:root {
${light}
  --chart-1: ${ir.palette.light.primary};
  --chart-2: ${ir.palette.light.secondaryForeground};
  --chart-3: ${ir.palette.light.accentForeground};
  --chart-4: ${ir.palette.light.destructive};
  --chart-5: ${ir.palette.light.mutedForeground};
  --radius: ${ir.geometry.radius};
  --rezyn-border-width: ${ir.geometry.borderWidth};
  --rezyn-shadow: ${ir.depth.shadow};
  --rezyn-pressed-shadow: ${ir.depth.pressedShadow};
  --rezyn-motion-distance: ${ir.motion.distance};
  --rezyn-motion-duration: ${ir.motion.duration};
  --rezyn-motion-ease: ${ir.motion.easing};
  --rezyn-display-font: ${ir.typography.displayFamily};
  --rezyn-body-font: ${ir.typography.bodyFamily};
}

.dark {
${dark}
  --chart-1: ${ir.palette.dark.primary};
  --chart-2: ${ir.palette.dark.secondary};
  --chart-3: ${ir.palette.dark.accent};
  --chart-4: ${ir.palette.dark.destructive};
  --chart-5: ${ir.palette.dark.mutedForeground};
}

@media (prefers-reduced-motion: reduce) {
  html:focus-within {
    scroll-behavior: auto !important;
  }

  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0s !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
`.trim();

  if (!tailwindV4) {
    return `${shared}

.rezyn-border {
  border-width: var(--rezyn-border-width);
  border-style: solid;
  border-color: var(--border);
}

.rezyn-shadow {
  box-shadow: var(--rezyn-shadow);
}

.rezyn-surface {
  color: var(--foreground);
  background: var(--card);
  border-color: var(--border);
}

.rezyn-pressable {
  transition: transform var(--rezyn-motion-duration) var(--rezyn-motion-ease), box-shadow var(--rezyn-motion-duration) var(--rezyn-motion-ease);
}

.rezyn-pressable:hover {
  transform: translate(calc(var(--rezyn-motion-distance) * -1), calc(var(--rezyn-motion-distance) * -1));
}

.rezyn-pressable:active {
  transform: translate(var(--rezyn-motion-distance), var(--rezyn-motion-distance));
  box-shadow: var(--rezyn-pressed-shadow);
}
`;
  }

  return `${shared}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 0.25rem);
  --radius-md: calc(var(--radius) - 0.125rem);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 0.25rem);
  --shadow-rezyn: var(--rezyn-shadow);
  --font-rezyn-display: var(--rezyn-display-font);
  --font-rezyn-body: var(--rezyn-body-font);
}

@utility rezyn-border {
  border-width: var(--rezyn-border-width);
  border-style: solid;
  border-color: var(--border);
}

@utility rezyn-shadow {
  box-shadow: var(--rezyn-shadow);
}

@utility rezyn-surface {
  color: var(--foreground);
  background: var(--card);
  border-color: var(--border);
}

@utility rezyn-pressable {
  transition-property: transform, box-shadow;
  transition-duration: var(--rezyn-motion-duration);
  transition-timing-function: var(--rezyn-motion-ease);
  &:hover {
    transform: translate(calc(var(--rezyn-motion-distance) * -1), calc(var(--rezyn-motion-distance) * -1));
  }
  &:active {
    transform: translate(var(--rezyn-motion-distance), var(--rezyn-motion-distance));
    box-shadow: var(--rezyn-pressed-shadow);
  }
}
`;
}

const START = "/* REZYN:DESIGN-COMPILER:START */";
const END = "/* REZYN:DESIGN-COMPILER:END */";

export function applyCompiledDirectionFoundation(
  source: string,
  style: string,
  tailwindV4: boolean,
) {
  const block = `${START}\n${compileDirectionCss(style, tailwindV4).trim()}\n${END}`;
  const pattern =
    /\/\* REZYN:DESIGN-COMPILER:START \*\/[\s\S]*?\/\* REZYN:DESIGN-COMPILER:END \*\//;
  if (pattern.test(source)) return source.replace(pattern, block);
  return source.trimEnd() + "\n\n" + block + "\n";
}

export function buildDirectionCompilerContext(style: string, tailwindV4: boolean) {
  const ir = compileDesignDirection(style);
  return [
    `REZYN DESIGN COMPILER — ${DESIGN_DIRECTION_COMPILER_VERSION}`,
    `Direction: ${ir.style}`,
    `Family: ${ir.family}`,
    `Creative blueprint: ${ir.blueprint}`,
    "",
    "COMPILER-OWNED CONTRACT",
    `- Geometry: radius ${ir.geometry.radius}; border ${ir.geometry.borderWidth} ${ir.geometry.borderStyle}.`,
    `- Depth: ${ir.depth.mode}; canonical shadow: ${ir.depth.shadow}.`,
    `- Motion: ${ir.motion.duration}, ${ir.motion.easing}, movement ${ir.motion.distance}; reduced-motion is mandatory.`,
    `- Layout: ${ir.layout.density} density; ${ir.layout.alignment} alignment; ${ir.layout.composition}`,
    `- Typography: display ${ir.typography.displayFamily}; body ${ir.typography.bodyFamily}.`,
    "- Semantic API is compiler-owned: " + ir.implementation.semanticApi.join(", ") + ".",
    "- Reusable primitives are compiler-owned: " +
      ir.implementation.utilityPrimitives.join(", ") +
      ".",
    ...ir.implementation.rules.map((rule) => "- " + rule),
    "",
    tailwindV4
      ? "TAILWIND V4 RULE: Do not invent or duplicate core @theme, dark-mode token aliases, input/ring semantics, or reusable border/shadow/press utilities. Use the compiler-owned semantic variables and rezyn-* utilities; preserve any compatible project aliases."
      : "CSS RULE: Do not invent a second core token system. Use the compiler-owned semantic variables and .rezyn-* primitives while preserving compatible project aliases.",
  ].join("\n");
}

export function certifyAllDesignDirections() {
  const problems: string[] = [];
  if (STYLE_NAMES.length !== 61) {
    problems.push(`Expected 61 registered directions, found ${STYLE_NAMES.length}`);
  }

  const known = new Set(STYLE_NAMES);
  for (const style of STYLE_NAMES) {
    if (!STYLE_FAMILY[style]) {
      problems.push(`${style}: missing compiler family`);
      continue;
    }
    try {
      const ir = compileDesignDirection(style);
      const css = compileDirectionCss(style, true);
      if (ir.style !== style) problems.push(`${style}: IR identity mismatch`);
      if (!css.includes("@theme inline")) problems.push(`${style}: missing Tailwind theme mapping`);
      if (!css.includes("@utility rezyn-border")) problems.push(`${style}: missing border utility`);
      if (!css.includes("border-style: solid"))
        problems.push(`${style}: border utility is not explicit solid`);
      if (!css.includes("prefers-reduced-motion: reduce"))
        problems.push(`${style}: missing reduced-motion contract`);
      if (/\bdark\s*:\s*\{/.test(css)) problems.push(`${style}: nested dark syntax detected`);
      if (/@custom-variant/.test(css))
        problems.push(`${style}: compiler should not invent variant declarations`);
      if (/translate(?:X|Y)?\(\s*var\([^)]*\)\s*\*/i.test(css))
        problems.push(`${style}: invalid custom-property arithmetic detected`);
      for (const token of semanticApi) {
        if (!css.includes(token + ":")) problems.push(`${style}: missing semantic token ${token}`);
      }
    } catch (error) {
      problems.push(`${style}: ${error instanceof Error ? error.message : "compiler failure"}`);
    }
  }

  for (const style of Object.keys(STYLE_FAMILY)) {
    if (!known.has(style))
      problems.push(`${style}: compiler mapping has no direction registry entry`);
  }

  if (problems.length > 0) {
    throw new Error("Rezyn 61-direction certification failed:\n" + problems.join("\n"));
  }

  return {
    version: DESIGN_DIRECTION_COMPILER_VERSION,
    directions: STYLE_NAMES.length,
    families: 9,
    passed: true as const,
  };
}

export function detectsTailwindV4(source: string) {
  return /@import\s+["']tailwindcss(?:\/[^"']*)?["']|@theme\b|@utility\b|@custom-variant\b|@source\b/i.test(
    source,
  );
}

export function isCompilerStyleEntrypoint(opts: {
  name: string;
  source: string;
  sharedStyleEntryPoints?: string[];
}) {
  if (!/\.(?:css|scss|sass|less)$/i.test(opts.name)) return false;
  const normalized = opts.name.replace(/\\/g, "/");
  const shared = new Set(
    (opts.sharedStyleEntryPoints ?? []).map((value) => value.replace(/\\/g, "/")),
  );
  if (shared.has(normalized)) return true;
  if (detectsTailwindV4(opts.source)) return true;
  if (
    /(^|\/)(?:globals?|index|main|app|theme|tokens?|design[-_]?system|styles?)\.(?:css|scss|sass|less)$/i.test(
      normalized,
    )
  )
    return true;
  const semanticCount = (
    opts.source.match(
      /--(?:background|foreground|primary|secondary|muted|accent|border|input|ring|radius)\s*:/g,
    ) ?? []
  ).length;
  return semanticCount >= 4;
}
