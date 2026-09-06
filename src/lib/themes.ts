/**
 * Perceptual OKLCH theme engine.
 * Seeds x accent-hue rotations generate 500+ live-switchable palettes.
 */

export type ThemeTokens = Record<string, string>;

export type Theme = {
  id: string;
  name: string;
  family: string;
  tokens: ThemeTokens;
  swatch: string[];
};

type Seed = {
  family: string;
  name: string;
  /** background lightness / chroma */
  bg: [number, number];
  surface: [number, number];
  fg: [number, number];
  /** base hue for neutrals */
  hue: number;
  borderL: number;
  accents: number[];
};

const SEEDS: Seed[] = [
  {
    family: "Cyberpunk Neon",
    name: "Neon",
    bg: [0.16, 0.03],
    surface: [0.23, 0.045],
    fg: [0.96, 0.01],
    hue: 275,
    borderL: 0.36,
    accents: [190, 210, 300, 330, 350, 145, 90, 260],
  },
  {
    family: "Dopamine Black",
    name: "Dopamine",
    bg: [0.1, 0.0],
    surface: [0.17, 0.01],
    fg: [0.98, 0.0],
    hue: 0,
    borderL: 0.32,
    accents: [195, 320, 130, 105, 30, 285, 240, 60],
  },
  {
    family: "Luxury Obsidian",
    name: "Obsidian",
    bg: [0.15, 0.012],
    surface: [0.21, 0.02],
    fg: [0.95, 0.015],
    hue: 60,
    borderL: 0.34,
    accents: [85, 70, 55, 40, 25, 300, 160, 220],
  },
  {
    family: "Glass Monochrome",
    name: "Frost",
    bg: [0.22, 0.012],
    surface: [0.29, 0.018],
    fg: [0.97, 0.005],
    hue: 250,
    borderL: 0.42,
    accents: [240, 220, 200, 180, 300, 340, 120, 20],
  },
  {
    family: "Pastel Clay",
    name: "Clay",
    bg: [0.95, 0.015],
    surface: [0.98, 0.012],
    fg: [0.26, 0.03],
    hue: 300,
    borderL: 0.86,
    accents: [340, 320, 280, 200, 165, 100, 45, 20],
  },
  {
    family: "Retro Arcade",
    name: "Arcade",
    bg: [0.13, 0.02],
    surface: [0.19, 0.035],
    fg: [0.93, 0.09],
    hue: 140,
    borderL: 0.33,
    accents: [140, 130, 110, 85, 60, 35, 195, 310],
  },
  {
    family: "Earthy Studio",
    name: "Studio",
    bg: [0.24, 0.02],
    surface: [0.3, 0.025],
    fg: [0.94, 0.02],
    hue: 70,
    borderL: 0.4,
    accents: [45, 30, 95, 140, 165, 200, 15, 300],
  },
  {
    family: "Vaporwave",
    name: "Vapor",
    bg: [0.18, 0.05],
    surface: [0.25, 0.07],
    fg: [0.96, 0.02],
    hue: 320,
    borderL: 0.38,
    accents: [330, 300, 275, 250, 200, 180, 20, 355],
  },
  {
    family: "Deep Ocean",
    name: "Abyss",
    bg: [0.17, 0.04],
    surface: [0.23, 0.055],
    fg: [0.95, 0.015],
    hue: 240,
    borderL: 0.36,
    accents: [200, 220, 175, 160, 260, 290, 320, 90],
  },
  {
    family: "Solar Paper",
    name: "Solar",
    bg: [0.97, 0.012],
    surface: [0.99, 0.008],
    fg: [0.22, 0.02],
    hue: 90,
    borderL: 0.88,
    accents: [55, 35, 20, 145, 195, 265, 315, 100],
  },
];

const ACCENT_NAMES: Record<number, string> = {
  15: "Ember",
  20: "Coral",
  25: "Rust",
  30: "Tangerine",
  35: "Marigold",
  40: "Bronze",
  45: "Amber",
  55: "Gold",
  60: "Citron",
  70: "Champagne",
  85: "Chartreuse",
  90: "Acid",
  95: "Olive",
  100: "Lime",
  105: "Spring",
  110: "Fern",
  120: "Emerald",
  130: "Matrix",
  140: "Jade",
  145: "Mint",
  160: "Sea",
  165: "Sage",
  175: "Teal",
  180: "Aqua",
  190: "Cyan",
  195: "Electric",
  200: "Azure",
  210: "Sky",
  220: "Cobalt",
  240: "Indigo",
  250: "Ultramarine",
  260: "Iris",
  265: "Violet",
  275: "Amethyst",
  280: "Lilac",
  285: "Orchid",
  290: "Plum",
  300: "Magenta",
  310: "Fuchsia",
  315: "Peony",
  320: "Rose",
  330: "Hot Pink",
  340: "Blush",
  350: "Crimson",
  355: "Scarlet",
};

const ok = (l: number, c: number, h: number) =>
  `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;

/** Chroma / lightness variations per seed, giving each family many members. */
const VARIANTS: { suffix: string; dl: number; dc: number; ac: number; al: number }[] = [
  { suffix: "", dl: 0, dc: 0, ac: 0.16, al: 0.75 },
  { suffix: "Deep", dl: -0.03, dc: 0.01, ac: 0.19, al: 0.7 },
  { suffix: "Soft", dl: 0.03, dc: -0.008, ac: 0.11, al: 0.8 },
  { suffix: "Vivid", dl: -0.015, dc: 0.02, ac: 0.24, al: 0.72 },
  { suffix: "Muted", dl: 0.015, dc: -0.012, ac: 0.08, al: 0.78 },
  { suffix: "Contrast", dl: -0.05, dc: 0, ac: 0.21, al: 0.83 },
  { suffix: "Hazy", dl: 0.05, dc: 0.012, ac: 0.14, al: 0.68 },
];

function buildTheme(seed: Seed, accentHue: number, v: (typeof VARIANTS)[number]): Theme {
  const light = seed.fg[0] < 0.5; // light background theme
  const bgL = Math.min(0.99, Math.max(0.06, seed.bg[0] + (light ? -v.dl : v.dl)));
  const surfaceL = Math.min(0.99, Math.max(0.08, seed.surface[0] + (light ? -v.dl : v.dl)));
  const accentL = light ? Math.max(0.45, v.al - 0.2) : v.al;
  const accent = ok(accentL, v.ac, accentHue);
  const accent2Hue = (accentHue + 55) % 360;
  const accent2 = ok(accentL, v.ac * 0.9, accent2Hue);
  const fg = ok(seed.fg[0], seed.fg[1], seed.hue);
  const bg = ok(bgL, Math.max(0, seed.bg[1] + v.dc), seed.hue);
  const surface = ok(surfaceL, Math.max(0, seed.surface[1] + v.dc), seed.hue);
  const border = ok(seed.borderL, Math.max(0, seed.bg[1] + 0.01), seed.hue);
  const onAccent = ok(light ? 0.99 : Math.min(0.24, bgL + 0.05), 0.02, seed.hue);
  const accentName = ACCENT_NAMES[accentHue] ?? `H${accentHue}`;

  return {
    id: `${seed.name}-${accentHue}-${v.suffix || "base"}`.toLowerCase(),
    family: seed.family,
    name: `${seed.name} ${accentName}${v.suffix ? ` ${v.suffix}` : ""}`,
    swatch: [bg, accent, accent2, fg],
    tokens: {
      "--background": bg,
      "--foreground": fg,
      "--paper-dim": surface,
      "--ink-soft": ok(
        light ? seed.fg[0] + 0.18 : seed.fg[0] - 0.14,
        seed.fg[1],
        seed.hue,
      ),
      "--card": surface,
      "--card-foreground": fg,
      "--popover": surface,
      "--popover-foreground": fg,
      "--secondary": surface,
      "--secondary-foreground": fg,
      "--muted": surface,
      "--muted-foreground": ok(light ? 0.5 : 0.68, 0.012, seed.hue),
      "--primary": accent,
      "--primary-foreground": onAccent,
      "--accent": ok(light ? 0.93 : surfaceL + 0.04, v.ac * 0.35, accent2Hue),
      "--accent-foreground": accent2,
      "--amber": accent,
      "--violet": accent,
      "--revision": accent2,
      "--revision-bg": ok(light ? 0.94 : surfaceL + 0.03, v.ac * 0.3, accent2Hue),
      "--redline": ok(0.7 , 0.18, 15),
      "--destructive": ok(0.68, 0.19, 22),
      "--destructive-foreground": onAccent,
      "--border": border,
      "--input": border,
      "--ring": accent,
    },
  };
}

export const THEMES: Theme[] = SEEDS.flatMap((seed) =>
  seed.accents.flatMap((hue) => VARIANTS.map((v) => buildTheme(seed, hue, v))),
);

export const THEME_FAMILIES = Array.from(new Set(THEMES.map((t) => t.family)));

export const DEFAULT_THEME_ID = THEMES[0]!.id;

export function findTheme(id: string | null | undefined): Theme | undefined {
  if (!id) return undefined;
  return THEMES.find((t) => t.id === id);
}

/* ---------- typography presets ---------- */

export type FontPreset = { id: string; name: string; display: string; body: string };

export const FONT_PRESETS: FontPreset[] = [
  { id: "bebas", name: "Bebas / Barlow", display: '"Bebas Neue", sans-serif', body: '"Barlow", sans-serif' },
  { id: "syne", name: "Syne / Jakarta", display: '"Syne", sans-serif', body: '"Plus Jakarta Sans", sans-serif' },
  { id: "grotesk", name: "Space Grotesk / Inter", display: '"Space Grotesk", sans-serif', body: '"Inter", sans-serif' },
  { id: "outfit", name: "Outfit / Inter", display: '"Outfit", sans-serif', body: '"Inter", sans-serif' },
  { id: "mono", name: "Technical Mono", display: '"JetBrains Mono", monospace', body: '"JetBrains Mono", monospace' },
  { id: "serif", name: "Cormorant / Jakarta", display: '"Cormorant Garamond", serif', body: '"Plus Jakarta Sans", sans-serif' },
];

/* ---------- full customizer config ---------- */

export type StudioConfig = {
  themeId: string;
  fontId: string;
  glassBlur: number;
  glassOpacity: number;
  borderOpacity: number;
  radius: number;
  grain: number;
  motion: number;
  uppercaseHeadings: boolean;
  brutalist: boolean;
  cursor: boolean;
};

export const DEFAULT_CONFIG: StudioConfig = {
  themeId: DEFAULT_THEME_ID,
  fontId: "bebas",
  glassBlur: 16,
  glassOpacity: 7,
  borderOpacity: 10,
  radius: 0,
  grain: 5,
  motion: 1,
  uppercaseHeadings: true,
  brutalist: false,
  cursor: true,
};

export const STUDIO_STORAGE_KEY = "rezyn.studio.config.v1";
