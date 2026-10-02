const CSS_EXT = /\.(?:css|scss|sass|less)$/i;

const SEMANTIC_TOKEN = /^(?:background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|border|input|ring|radius|chart-[\w-]+)$/;

function customPropertyNames(source: string) {
  const names = new Set<string>();
  for (const match of source.matchAll(/--([\w-]+)\s*:/g)) {
    if (match[1]) names.add(match[1]);
  }
  return names;
}

function hasCustomPropertyDeclaration(source: string, name: string) {
  return new RegExp("--" + name + "\\s*:").test(source);
}

function findBalancedBlock(source: string, openBrace: number) {
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;
  let comment = false;

  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index] ?? "";
    const next = source[index + 1] ?? "";

    if (comment) {
      if (char === "*" && next === "/") {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (!quote && char === "/" && next === "*") {
      comment = true;
      index += 1;
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openBrace + 1, index);
    }
  }
  return null;
}

function findBlocks(source: string, pattern: RegExp) {
  const blocks: string[] = [];
  const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
  const regex = new RegExp(pattern.source, flags);
  for (const match of source.matchAll(regex)) {
    const start = (match.index ?? 0) + match[0].length;
    const brace = source.indexOf("{", start);
    if (brace < 0) continue;
    const body = findBalancedBlock(source, brace);
    if (body !== null) blocks.push(body);
  }
  return blocks;
}

function hasTopLevelCustomProperty(body: string) {
  let depth = 0;
  let segmentStart = 0;
  let quote: string | null = null;
  let escaped = false;
  let comment = false;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index] ?? "";
    const next = body[index + 1] ?? "";

    if (comment) {
      if (char === "*" && next === "/") {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (!quote && char === "/" && next === "*") {
      comment = true;
      index += 1;
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }
    if (char === "}") {
      depth = Math.max(0, depth - 1);
      if (depth === 0) segmentStart = index + 1;
      continue;
    }
    if (char === ";" && depth === 0) {
      const segment = body.slice(segmentStart, index).replace(/\/\*[\s\S]*?\*\//g, "").trim();
      if (/^--[\w-]+\s*:/.test(segment)) return true;
      segmentStart = index + 1;
    }
  }
  return false;
}

function parseVars(body: string) {
  const vars = new Map<string, string>();
  for (const match of body.matchAll(/--([\w-]+)\s*:\s*([^;{}]+);/g)) {
    if (match[1] && match[2]) vars.set(match[1], match[2].trim());
  }
  return vars;
}

function mergeVars(base: Map<string, string>, overrides: Map<string, string>) {
  const merged = new Map(base);
  for (const [key, value] of overrides) merged.set(key, value);
  return merged;
}

function resolveVar(name: string, vars: Map<string, string>, seen = new Set<string>()): string | null {
  if (seen.has(name)) return null;
  seen.add(name);
  const raw = vars.get(name)?.trim();
  if (!raw) return null;
  const match = raw.match(/^var\(\s*--([\w-]+)(?:\s*,[^)]*)?\s*\)$/);
  if (!match?.[1]) return raw;
  return resolveVar(match[1], vars, seen);
}

function srgbChannel(value: number) {
  const x = value / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function luminanceFromHex(value: string) {
  const clean = value.trim().replace(/^#/, "");
  const hex = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  const r = srgbChannel(parseInt(hex.slice(0, 2), 16));
  const g = srgbChannel(parseInt(hex.slice(2, 4), 16));
  const b = srgbChannel(parseInt(hex.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function luminanceFromOklch(value: string) {
  const match = value.trim().match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.-]+)/i);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  const L = match[1].endsWith("%") ? Number.parseFloat(match[1]) / 100 : Number.parseFloat(match[1]);
  const C = Number.parseFloat(match[2]);
  const h = Number.parseFloat(match[3]) * Math.PI / 180;
  if (![L, C, h].every(Number.isFinite)) return null;

  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l0 = L + 0.3963377774 * a + 0.2158037573 * b;
  const m0 = L - 0.1055613458 * a - 0.0638541728 * b;
  const s0 = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l0 ** 3;
  const m = m0 ** 3;
  const s = s0 ** 3;

  const r = Math.min(1, Math.max(0, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s));
  const g = Math.min(1, Math.max(0, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s));
  const blue = Math.min(1, Math.max(0, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s));
  return 0.2126 * r + 0.7152 * g + 0.0722 * blue;
}

function colorLuminance(value: string | null) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "white") return 1;
  if (normalized === "black") return 0;
  if (normalized.startsWith("#")) return luminanceFromHex(normalized);
  if (normalized.startsWith("oklch(")) return luminanceFromOklch(normalized);
  const rgb = normalized.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (rgb?.[1] && rgb[2] && rgb[3]) {
    const r = srgbChannel(Number.parseFloat(rgb[1]));
    const g = srgbChannel(Number.parseFloat(rgb[2]));
    const b = srgbChannel(Number.parseFloat(rgb[3]));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return null;
}

function contrastRatio(a: string | null, b: string | null) {
  const l1 = colorLuminance(a);
  const l2 = colorLuminance(b);
  if (l1 === null || l2 === null) return null;
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

function checkSemanticContrast(vars: Map<string, string>, mode: string) {
  const errors: string[] = [];
  const pairs: Array<[string, string, number]> = [
    ["background", "foreground", 4.5],
    ["card", "card-foreground", 4.5],
    ["popover", "popover-foreground", 4.5],
    ["primary", "primary-foreground", 4.5],
    ["secondary", "secondary-foreground", 4.5],
    ["muted", "muted-foreground", 4.5],
    ["accent", "accent-foreground", 4.5],
    ["destructive", "destructive-foreground", 4.5],
    ["background", "ring", 3],
  ];

  for (const [surface, foreground, minimum] of pairs) {
    if (!vars.has(surface) || !vars.has(foreground)) continue;
    const ratio = contrastRatio(resolveVar(surface, vars), resolveVar(foreground, vars));
    if (ratio !== null && ratio + 0.01 < minimum) {
      errors.push(mode + " --" + foreground + " vs --" + surface + " contrast is " + ratio.toFixed(2) + ":1; require at least " + minimum + ":1");
    }
  }
  return errors;
}

function normalizedResolved(name: string, vars: Map<string, string>) {
  return resolveVar(name, vars)?.replace(/\s+/g, " ").trim().toLowerCase() ?? null;
}

function validateTailwindCss(source: string, output: string, style: string | null | undefined) {
  const errors: string[] = [];
  const tailwindV4 = /@import\s+["']tailwindcss(?:\/[^"']*)?["']|@theme\b|@utility\b|@custom-variant\b|@source\b/.test(source + "\n" + output);
  if (!tailwindV4) return errors;

  if (/@import\s+["']tailwindcss(?:\/[^"']*)?["'][^;]*\blayer\(\s*[^)]*,[^)]*\)/i.test(output)) {
    errors.push("Tailwind v4 layer() imports accept one layer name only; use @import \"tailwindcss\" or separate theme/base/utilities imports");
  }

  for (const block of findBlocks(output, /@layer\s+base\s*/i)) {
    if (hasTopLevelCustomProperty(block)) {
      errors.push("Custom-property declarations cannot sit directly inside @layer base; move runtime tokens into :root/.dark selectors");
      break;
    }
  }

  const sourceSemantic = [...customPropertyNames(source)].filter((name) => SEMANTIC_TOKEN.test(name));
  if (sourceSemantic.length >= 3) {
    const missing = sourceSemantic.filter((name) => !hasCustomPropertyDeclaration(output, name));
    if (missing.length > 0) {
      errors.push("Preserve the original semantic CSS-variable API; missing declarations: " + missing.slice(0, 16).map((name) => "--" + name).join(", "));
    }
  }

  const rootBlock = findBlocks(output, /:root\s*/i)[0] ?? "";
  const rootVars = parseVars(rootBlock);
  const darkBlocks = findBlocks(output, /\.dark\s*/i);
  const darkOverrides = darkBlocks.length > 0 ? parseVars(darkBlocks.join("\n")) : new Map<string, string>();
  const darkVars = mergeVars(rootVars, darkOverrides);

  errors.push(...checkSemanticContrast(rootVars, "Light/base mode"));
  if (darkOverrides.size > 0) errors.push(...checkSemanticContrast(darkVars, "Dark mode"));

  for (const [name, value] of darkOverrides) {
    if (!/(?:text-light|text-primary|body-text|heading-text|foreground)$/i.test(name)) continue;
    const varMatch = value.match(/^var\(\s*--([\w-]+)\s*\)$/);
    const resolved = varMatch?.[1] ? resolveVar(varMatch[1], darkVars) : value;
    const lum = colorLuminance(resolved);
    if (lum !== null && lum < 0.2) {
      errors.push("Dark-mode text token --" + name + " resolves near-black; text/heading/sidebar foreground tokens need a light readable value on dark surfaces");
    }
  }

  for (const vars of [rootVars, darkVars]) {
    for (const inputName of ["input", "color-input"]) {
      if (!vars.has(inputName)) continue;
      const input = normalizedResolved(inputName, vars);
      if (!input) continue;
      for (const surfaceName of ["background", "card", "color-background", "color-card"]) {
        if (!vars.has(surfaceName)) continue;
        if (input === normalizedResolved(surfaceName, vars)) {
          errors.push("--" + inputName + " resolves to the same color as --" + surfaceName + "; control boundaries must stay visibly distinct from their surface");
          break;
        }
      }
    }
  }

  const isNeo = /neo\s*[- ]?brut|neubrut/i.test(style ?? "");
  if (isNeo) {
    const plainNeoUtility = /@layer\s+base\s*\{[\s\S]*?\.neo-(?:border|shadow|font)(?:\b|[-_])/i.test(output);
    const variantAwareNeo = /@utility\s+neo-(?:border|shadow|font)|--(?:shadow|font)-neo(?:\b|[-_])/i.test(output);
    if (plainNeoUtility && !variantAwareNeo) {
      errors.push("Neo border/shadow/font primitives must use Tailwind v4 @utility and/or @theme namespaces so hover/focus/responsive variants work and utility-layer precedence is correct");
    }
  }

  return Array.from(new Set(errors));
}

export function validateRedesignCssCompatibility(opts: {
  name: string;
  source: string;
  output: string;
  style?: string | null;
}) {
  if (!CSS_EXT.test(opts.name)) return;
  const errors = validateTailwindCss(opts.source, opts.output, opts.style);
  if (errors.length > 0) throw new Error(errors.join(" | "));
}
