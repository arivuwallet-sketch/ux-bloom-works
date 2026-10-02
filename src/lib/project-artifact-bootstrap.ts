import { getStyleBlueprint } from "@/lib/style-blueprints";
import { buildSeoT1T16Context, validateSeoTemplateArtifact } from "@/lib/seo-output-templates-t1-t16";
import { repairRedesignCssCompatibility, validateRedesignCssCompatibility } from "@/lib/css-redesign-validator";
import { buildDesignIntelligenceContext } from "@/lib/design-intelligence";

const TEXT_EXT = /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py|yaml|yml)$/i;
const PUBLIC_PAGE_EXT = /\.(html?|jsx|tsx|vue|svelte|astro|php|hbs|ejs|twig|mdx)$/i;
const AI_MODELS = ["openai/gpt-6-astra", "google/gemini-2.5-flash"] as const;
const TRANSIENT_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_CONTEXT_CHARS = 90_000;
const BOOTSTRAP_VERSION = "2026-10-artifacts-v1";

type ArtifactEngine = "seo" | "redesign";
type SourceMode = "original" | "redesigned";

type ProjectRow = {
  id: string;
  name: string;
  product_type: string | null;
  notes: string | null;
  target_style: string | null;
  style_mode: string;
};

type ProjectFileRow = {
  id: string;
  name: string;
  source: string;
  content: string | null;
  redesigned_content: string | null;
  storage_path: string | null;
  target_style: string | null;
  size_bytes: number | null;
  updated_at: string;
};

type SourceFile = {
  id: string;
  name: string;
  source: string;
  content: string;
  targetStyle: string | null;
};

type RuntimeKind =
  | "next"
  | "tanstack"
  | "vite-react"
  | "react"
  | "vue"
  | "nuxt"
  | "sveltekit"
  | "astro"
  | "gatsby"
  | "static-web"
  | "react-native"
  | "flutter"
  | "swiftui"
  | "compose"
  | "unknown";

type ArtifactSpec = {
  path: string;
  kind: "robots" | "sitemap" | "llms" | "openapi" | "design-foundation";
  reason: string;
  content: string | null;
  required: boolean;
};

type BootstrapResult = {
  version: string;
  created: string[];
  skipped: string[];
  warnings: string[];
};

type GatewayMessage = { role: "system" | "user"; content: string };

function normalizePath(value: string) {
  const parts: string[] = [];
  for (const piece of value.replace(/\\/g, "/").split("/")) {
    if (!piece || piece === ".") continue;
    if (piece === "..") {
      parts.pop();
      continue;
    }
    parts.push(piece);
  }
  return parts.join("/");
}

function dirname(value: string) {
  const normalized = normalizePath(value);
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}

function safeGeneratedPath(value: string) {
  const normalized = normalizePath(value);
  if (!normalized || normalized.startsWith("/") || normalized.includes("..")) return null;
  if (/(^|\/)(?:node_modules|\.git|\.next|dist|build|coverage)(?:\/|$)/i.test(normalized)) return null;
  if (!TEXT_EXT.test(normalized) && !/(^|\/)(?:robots\.txt|llms\.txt)$/i.test(normalized)) return null;
  return normalized;
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

function isTextFile(name: string) {
  return TEXT_EXT.test(name) || /(^|\/)(?:robots\.txt|llms\.txt)$/i.test(name);
}

function stripOuterFence(value: string) {
  return value.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "").trim();
}

function redactSensitiveSource(value: string) {
  return value
    .replace(/((?:api[_-]?key|secret|token|password|private[_-]?key|service[_-]?role)[\w-]*\s*[:=]\s*["'`])([^"'`\n]+)(["'`])/gi, "$1[REDACTED]$3")
    .replace(/(Authorization\s*:\s*["'`]Bearer\s+)([^"'`\n]+)(["'`])/gi, "$1[REDACTED]$3");
}

function clip(value: string, max = 6_000) {
  const clean = redactSensitiveSource(value);
  if (clean.length <= max) return clean;
  const head = Math.floor(max * 0.72);
  return `${clean.slice(0, head)}\n/* ... clipped ... */\n${clean.slice(-(max - head))}`;
}

function packageJson(files: SourceFile[]) {
  const candidate = files.find((file) => /(^|\/)package\.json$/i.test(file.name));
  if (!candidate) return {} as Record<string, unknown>;
  try {
    return JSON.parse(candidate.content) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

function dependencyNames(files: SourceFile[]) {
  const pkg = packageJson(files);
  const dependencies = {
    ...((pkg["dependencies"] && typeof pkg["dependencies"] === "object" ? pkg["dependencies"] : {}) as Record<string, unknown>),
    ...((pkg["devDependencies"] && typeof pkg["devDependencies"] === "object" ? pkg["devDependencies"] : {}) as Record<string, unknown>),
  };
  return new Set(Object.keys(dependencies));
}

function detectRuntime(files: SourceFile[]): RuntimeKind {
  const deps = dependencyNames(files);
  const names = files.map((file) => file.name.toLowerCase());
  if (deps.has("react-native") || names.some((name) => /(^|\/)android\/|(^|\/)ios\//.test(name)) && deps.has("react")) return "react-native";
  if (files.some((file) => /(^|\/)pubspec\.yaml$/i.test(file.name)) || files.some((file) => file.name.endsWith(".dart"))) return "flutter";
  if (files.some((file) => file.name.endsWith(".swift"))) return "swiftui";
  if (files.some((file) => file.name.endsWith(".kt")) && files.some((file) => /@Composable\b|androidx\.compose/i.test(file.content))) return "compose";
  if (deps.has("next")) return "next";
  if (deps.has("@tanstack/react-start") || deps.has("@tanstack/start")) return "tanstack";
  if (deps.has("nuxt")) return "nuxt";
  if (deps.has("@sveltejs/kit")) return "sveltekit";
  if (deps.has("astro")) return "astro";
  if (deps.has("gatsby")) return "gatsby";
  if (deps.has("vite") && deps.has("react")) return "vite-react";
  if (deps.has("vue")) return "vue";
  if (deps.has("react")) return "react";
  if (files.some((file) => /(^|\/)index\.html?$/i.test(file.name))) return "static-web";
  return "unknown";
}

function publicRoot(runtime: RuntimeKind, files: SourceFile[]) {
  if (files.some((file) => file.name.startsWith("public/"))) return "public";
  if (files.some((file) => file.name.startsWith("static/"))) return "static";
  if (runtime === "sveltekit") return "static";
  if (["next", "tanstack", "vite-react", "react", "vue", "nuxt", "astro", "gatsby"].includes(runtime)) return "public";
  return "";
}

function publicPath(root: string, file: string) {
  return root ? `${root}/${file}` : file;
}

function findSiteOrigin(files: SourceFile[]) {
  const patterns = [
    /<link\b[^>]*rel=["']canonical["'][^>]*href=["'](https?:\/\/[^"'\/]+(?:\:\d+)?)[^"']*["']/i,
    /metadataBase\s*:\s*new\s+URL\(\s*["'](https?:\/\/[^"']+)["']/i,
    /\b(?:siteUrl|siteURL|SITE_URL|PUBLIC_SITE_URL|NEXT_PUBLIC_SITE_URL|VITE_SITE_URL)\b\s*[:=]\s*["'](https?:\/\/[^"']+)["']/i,
  ];
  for (const file of files) {
    for (const pattern of patterns) {
      const match = file.content.match(pattern);
      if (!match?.[1]) continue;
      try {
        const parsed = new URL(match[1]);
        if (!/^https?:$/.test(parsed.protocol) || /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(parsed.hostname)) continue;
        return parsed.origin;
      } catch {
        // Ignore malformed source literals.
      }
    }
  }

  const pkg = packageJson(files);
  const homepage = typeof pkg["homepage"] === "string" ? pkg["homepage"] : null;
  if (homepage) {
    try {
      const parsed = new URL(homepage);
      if (/^https?:$/.test(parsed.protocol) && !/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(parsed.hostname)) return parsed.origin;
    } catch {
      // Ignore malformed package metadata.
    }
  }
  return null;
}

function routeFromFile(name: string, runtime: RuntimeKind) {
  const n = normalizePath(name);
  const lower = n.toLowerCase();
  if (/\$|\[[^\]]+\]|\[\.\.\.|\[\[/.test(n)) return null;
  if (/(^|\/)(api|server|actions?)\//i.test(n) || /\/route\.(?:ts|js)$/i.test(lower)) return null;

  if (runtime === "next") {
    const app = n.match(/^(?:src\/)?app\/(.*)\/page\.(?:tsx?|jsx?)$/i) ?? n.match(/^(?:src\/)?app\/page\.(?:tsx?|jsx?)$/i);
    if (app) {
      const raw = app[1] ?? "";
      const cleaned = raw.split("/").filter((part) => part && !/^\(.+\)$/.test(part)).join("/");
      return cleaned ? `/${cleaned}` : "/";
    }
    const pages = n.match(/^(?:src\/)?pages\/(.+)\.(?:tsx?|jsx?)$/i);
    if (pages?.[1] && !/^_(?:app|document|error)$/i.test(pages[1])) {
      const cleaned = pages[1].replace(/\/index$/i, "").replace(/^index$/i, "");
      return cleaned ? `/${cleaned}` : "/";
    }
  }

  if (runtime === "tanstack") {
    const match = n.match(/^src\/routes\/(.+)\.(?:tsx?|jsx?)$/i);
    if (match?.[1] && match[1] !== "__root") {
      const cleaned = match[1]
        .replace(/(^|\/)index$/i, "")
        .replace(/\._?index$/i, "")
        .replace(/\./g, "/")
        .replace(/(^|\/)_[^/]+/g, "");
      return cleaned ? `/${cleaned.replace(/^\/+/, "")}` : "/";
    }
  }

  if (runtime === "sveltekit") {
    const match = n.match(/^src\/routes\/(.*?)\+page\.(?:svelte|ts|js)$/i);
    if (match) return match[1] ? `/${match[1].replace(/\/$/, "")}` : "/";
  }

  if (runtime === "astro") {
    const match = n.match(/^src\/pages\/(.+)\.astro$/i);
    if (match?.[1]) {
      const cleaned = match[1].replace(/\/index$/i, "").replace(/^index$/i, "");
      return cleaned ? `/${cleaned}` : "/";
    }
  }

  if (["vite-react", "react", "vue", "static-web", "unknown"].includes(runtime)) {
    if (/(^|\/)index\.html?$/i.test(n)) return "/";
  }

  return null;
}

function discoverStaticRoutes(files: SourceFile[], runtime: RuntimeKind) {
  const routes = new Set<string>();
  for (const file of files) {
    const route = routeFromFile(file.name, runtime);
    if (!route) continue;
    if (/\/(?:api|admin|account|dashboard|login|logout|signin|sign-in|signup|sign-up)(?:\/|$)/i.test(route)) continue;
    routes.add(route.replace(/\/+/g, "/"));
  }
  if (routes.size === 0 && files.some((file) => /(^|\/)index\.html?$/i.test(file.name))) routes.add("/");
  return [...routes].sort((a, b) => a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)).slice(0, 2_000);
}

function pageDescription(files: SourceFile[]) {
  for (const file of files) {
    const meta = file.content.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      ?? file.content.match(/\bdescription\s*:\s*["'`]([^"'`]{10,240})["'`]/i);
    if (meta?.[1]) return meta[1].trim().replace(/\s+/g, " ").slice(0, 220);
  }
  return null;
}

function robotsExists(files: SourceFile[]) {
  return files.some((file) => /(^|\/)robots\.(?:txt|ts|tsx|js)$/i.test(file.name));
}

function sitemapExists(files: SourceFile[]) {
  return files.some((file) => /(^|\/)sitemap(?:[-_.][\w-]+)?\.(?:xml|txt|ts|tsx|js)$/i.test(file.name));
}

function llmsExists(files: SourceFile[]) {
  return files.some((file) => /(^|\/)llms\.txt$/i.test(file.name));
}

function openApiExists(files: SourceFile[]) {
  return files.some((file) => /(^|\/)(?:openapi|swagger)\.(?:json|ya?ml)$/i.test(file.name));
}

function publicPageFiles(files: SourceFile[]) {
  return files.filter((file) => PUBLIC_PAGE_EXT.test(file.name) && /<main\b|<article\b|<h1\b|<html\b|<head\b|metadata\s*=|generateMetadata\s*\(|<Head\b|Helmet\b/i.test(file.content));
}

function apiFiles(files: SourceFile[]) {
  return files.filter((file) => {
    const lower = file.name.toLowerCase();
    return /(^|\/)(?:api|server\/api|routes\/api)\//.test(lower)
      || /\/route\.(?:ts|js)$/.test(lower)
      || /\b(?:app|router)\.(?:get|post|put|patch|delete)\s*\(/i.test(file.content)
      || /export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE)\b/.test(file.content);
  });
}

function projectSnapshot(files: SourceFile[], limit = MAX_CONTEXT_CHARS) {
  let used = 0;
  const sections: string[] = [];
  const prioritized = [...files].sort((a, b) => {
    const rank = (file: SourceFile) => /package\.json$|(^|\/)(?:app|layout|root|index|main|routes?|pages?)\./i.test(file.name) ? 0 : 1;
    return rank(a) - rank(b) || a.name.localeCompare(b.name);
  });
  for (const file of prioritized) {
    if (!file.content.trim() || used >= limit) continue;
    const remaining = limit - used;
    const excerpt = clip(file.content, Math.min(5_500, remaining));
    const section = `FILE: ${file.name}\nSOURCE: ${file.source}\n${excerpt}`;
    sections.push(section);
    used += section.length;
  }
  return sections.join("\n\n---\n\n");
}

function sitemapXml(origin: string, routes: string[]) {
  const entries = routes
    .map((route) => `  <url><loc>${origin}${route === "/" ? "/" : route}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function llmsText(project: ProjectRow, routes: string[], description: string | null, origin: string | null) {
  const intro = description ?? `${project.name} project index generated from the source routes available to Rezyn.`;
  const routeLines = routes.slice(0, 80).map((route) => {
    const label = route === "/" ? "Home" : route.split("/").filter(Boolean).map((part) => part.replace(/[-_]+/g, " ")).join(" / ");
    const href = origin ? `${origin}${route === "/" ? "/" : route}` : route;
    return `- [${label}](${href})`;
  });
  return [`# ${project.name}`, `> ${intro}`, "", "## Important pages", ...(routeLines.length ? routeLines : ["- No public route list could be derived safely from source."]), "", "<!-- llms.txt is an optional curated index; it does not guarantee ranking or AI citation. -->", ""].join("\n");
}

function obviousPrivatePrefixes(routes: string[]) {
  const prefixes = new Set<string>();
  for (const route of routes) {
    const match = route.match(/^\/(admin|account|dashboard|login|signin|sign-in|signup|sign-up)(?:\/|$)/i);
    if (match?.[1]) prefixes.add(`/${match[1]}/`);
  }
  return [...prefixes];
}

function robotsText(origin: string | null, sitemapPath: string | null, routes: string[]) {
  const lines = ["User-agent: *", "Allow: /"];
  for (const prefix of obviousPrivatePrefixes(routes)) lines.push(`Disallow: ${prefix}`);
  if (origin && sitemapPath) lines.push(`Sitemap: ${origin}/sitemap.xml`);
  return `${lines.join("\n")}\n`;
}

function findCentralDesignFile(files: SourceFile[], runtime: RuntimeKind) {
  if (runtime === "flutter") return files.some((file) => /(^|\/)(?:theme|app_theme|design_system|tokens)[^/]*\.dart$/i.test(file.name));
  if (runtime === "swiftui") return files.some((file) => /(^|\/)(?:theme|designsystem|designtokens|rezyn)[^/]*\.swift$/i.test(file.name.replace(/[-_]/g, "")));
  if (runtime === "compose") return files.some((file) => /\/ui\/theme\/.*\.kt$/i.test(file.name) || /(?:Theme|MaterialTheme)\s*\(/.test(file.content));
  if (runtime === "react-native") return files.some((file) => /(^|\/)(?:theme|tokens|design-system|designsystem)\.(?:ts|tsx|js)$/i.test(file.name));
  return files.some((file) => /(^|\/)(?:globals?|index|app|theme|tokens|design-system|designsystem|styles?)\.(?:css|scss|sass|less)$/i.test(file.name));
}

function designFoundationPath(files: SourceFile[], runtime: RuntimeKind) {
  const hasSrc = files.some((file) => file.name.startsWith("src/"));
  if (runtime === "flutter") return "lib/rezyn_theme.dart";
  if (runtime === "swiftui") {
    const first = files.find((file) => file.name.endsWith(".swift"));
    return first ? `${dirname(first.name) ? `${dirname(first.name)}/` : ""}RezynDesignSystem.swift` : "RezynDesignSystem.swift";
  }
  if (runtime === "compose") {
    const themeFile = files.find((file) => /\/ui\/theme\/.*\.kt$/i.test(file.name));
    if (themeFile) return `${dirname(themeFile.name)}/RezynTheme.kt`;
    const first = files.find((file) => file.name.endsWith(".kt"));
    return first ? `${dirname(first.name) ? `${dirname(first.name)}/` : ""}RezynTheme.kt` : "RezynTheme.kt";
  }
  if (runtime === "react-native") return hasSrc ? "src/theme/rezyn-theme.ts" : "theme/rezyn-theme.ts";
  if (runtime === "next") {
    if (files.some((file) => file.name.startsWith("src/app/"))) return "src/app/rezyn-design-system.css";
    if (files.some((file) => file.name.startsWith("app/"))) return "app/rezyn-design-system.css";
  }
  if (runtime === "vue") return hasSrc ? "src/assets/rezyn-design-system.css" : "assets/rezyn-design-system.css";
  if (runtime === "sveltekit") return "src/lib/rezyn-design-system.css";
  return hasSrc ? "src/styles/rezyn-design-system.css" : "styles/rezyn-design-system.css";
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGateway(messages: GatewayMessage[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  let lastError = "Artifact generation failed";
  for (const model of AI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);
      try {
        const body: Record<string, unknown> = { model, messages };
        if (model.startsWith("openai/")) body["reasoning_effort"] = "high";
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (response.status === 402) throw new Error("AI credits exhausted.");
        if (!response.ok) {
          lastError = `Artifact AI request failed (${response.status})`;
          if (TRANSIENT_STATUS.has(response.status) && attempt === 0) {
            await sleep(600);
            continue;
          }
          break;
        }
        const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = json.choices?.[0]?.message?.content?.trim() ?? "";
        if (!content) throw new Error("Artifact AI returned an empty response");
        return content;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") lastError = "Artifact AI request timed out";
        else if (error instanceof Error) lastError = error.message;
        if (lastError === "AI credits exhausted.") throw new Error(lastError);
        if (attempt === 0) {
          await sleep(450);
          continue;
        }
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }
  throw new Error(lastError);
}

function validateGeneratedContent(path: string, content: string) {
  const output = stripOuterFence(content);
  if (!output) throw new Error(`Generated ${path} is empty`);
  if (/\b(?:SUPABASE_SERVICE_ROLE_KEY|CASHFREE_SECRET_KEY|PRIVATE_KEY|PASSWORD)\b\s*[:=]\s*["'`][^"'`]+/i.test(output)) {
    throw new Error(`Generated ${path} contains a secret-like value`);
  }
  if (/\.json$/i.test(path)) {
    try {
      JSON.parse(output);
    } catch {
      throw new Error(`Generated ${path} is invalid JSON`);
    }
  }
  if (/sitemap.*\.xml$/i.test(path) && !/<urlset\b|<sitemapindex\b/i.test(output)) {
    throw new Error(`Generated ${path} is not a sitemap document`);
  }
  return output;
}

async function generateOpenApi(files: SourceFile[], origin: string | null) {
  const api = apiFiles(files).slice(0, 20);
  const snapshot = api.map((file) => `FILE: ${file.name}\n${clip(file.content, 8_000)}`).join("\n\n---\n\n");
  const raw = await callGateway([
    {
      role: "system",
      content:
        "Generate a valid OpenAPI 3.1 JSON document from the supplied REAL API route source only. Document only endpoints, methods, parameters, request bodies, responses and auth that are explicitly supported by the code. Never invent an endpoint, host, secret, rate limit, schema field or example fact. Use concise operationIds and tool-selection-friendly descriptions. If a server URL is not verified, omit servers. Return JSON only, no markdown.\n\n" + buildSeoT1T16Context(),
    },
    {
      role: "user",
      content: `Verified site origin: ${origin ?? "UNKNOWN — omit servers"}\n\nAPI SOURCE:\n${snapshot}`,
    },
  ]);
  const output = validateSeoTemplateArtifact("openapi.json", validateGeneratedContent("openapi.json", raw));
  const parsed = JSON.parse(output) as { openapi?: unknown; paths?: unknown };
  if (typeof parsed.openapi !== "string" || !parsed.openapi.startsWith("3.1")) throw new Error("Generated OpenAPI document is not 3.1");
  if (!parsed.paths || typeof parsed.paths !== "object") throw new Error("Generated OpenAPI document has no paths object");
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

async function generateDesignFoundation(opts: {
  project: ProjectRow;
  files: SourceFile[];
  runtime: RuntimeKind;
  path: string;
}) {
  const style = opts.project.target_style ?? opts.files.find((file) => file.targetStyle)?.targetStyle ?? null;
  const blueprint = style ? getStyleBlueprint(style) : "No single project direction is available. Build a neutral reusable foundation that the project planner can adapt without inventing product behavior.";
  const raw = await callGateway([
    {
      role: "system",
      content:
        "Create ONE new shared design-foundation source file for an existing project before Rezyn's full redesign planner runs. The file must be production-valid for the supplied runtime and exact path, contain only reusable visual tokens/theme primitives/reduced-motion/accessibility-safe foundations, and introduce NO routes, API calls, business logic, fake components, fake content, analytics, dependencies or secrets. It is a support file that later redesign passes can import/wire into existing presentation files. For Tailwind v4, obey CSS-first @import/@theme/@utility/layer rules, preserve any semantic variable API visible in the source evidence, and keep light/dark contrast accessible. Return the complete raw file only, no markdown or explanation.\n\n" + buildDesignIntelligenceContext({ fileName: opts.path, source: projectSnapshot(opts.files, 35_000), style }),
    },
    {
      role: "user",
      content: [
        `PROJECT: ${opts.project.name}`,
        `RUNTIME: ${opts.runtime}`,
        `TARGET PATH: ${opts.path}`,
        `TARGET DIRECTION: ${style ?? "per-file / not globally fixed"}`,
        `DIRECTION BLUEPRINT: ${blueprint}`,
        "",
        "SOURCE EVIDENCE:",
        projectSnapshot(opts.files, 55_000),
      ].join("\n"),
    },
  ]);
  let output = validateGeneratedContent(opts.path, raw);
  output = repairRedesignCssCompatibility({ name: opts.path, source: "", output, style });
  validateRedesignCssCompatibility({ name: opts.path, source: "", output, style });
  return output;
}

async function hydrateSourceFiles(supabase: any, rows: ProjectFileRow[], sourceMode: SourceMode): Promise<SourceFile[]> {
  const result: SourceFile[] = [];
  for (const row of rows) {
    let original = row.content ?? "";
    if (!original && row.storage_path && isTextFile(row.name)) {
      const dl = await supabase.storage.from("project-files").download(row.storage_path);
      if (!dl.error) original = await dl.data.text();
    }
    const selected = sourceMode === "redesigned" ? (row.redesigned_content ?? original) : original;
    result.push({
      id: row.id,
      name: normalizePath(row.name),
      source: row.source,
      content: selected,
      targetStyle: row.target_style,
    });
  }
  return result;
}

function planSeoArtifacts(project: ProjectRow, files: SourceFile[], runtime: RuntimeKind): ArtifactSpec[] {
  const pages = publicPageFiles(files);
  if (pages.length === 0 || ["flutter", "swiftui", "compose", "react-native"].includes(runtime)) return [];

  const root = publicRoot(runtime, files);
  const origin = findSiteOrigin(files);
  const routes = discoverStaticRoutes(files, runtime);
  const specs: ArtifactSpec[] = [];
  const sitemapPath = sitemapExists(files) ? null : publicPath(root, "sitemap.xml");

  if (!robotsExists(files)) {
    specs.push({
      path: publicPath(root, "robots.txt"),
      kind: "robots",
      reason: "No framework-native or static robots policy exists for the public site.",
      content: robotsText(origin, origin && routes.length > 0 && sitemapPath ? sitemapPath : null, routes),
      required: true,
    });
  }

  if (!sitemapExists(files) && origin && routes.length > 0) {
    specs.push({
      path: sitemapPath ?? publicPath(root, "sitemap.xml"),
      kind: "sitemap",
      reason: "No sitemap exists and Rezyn verified a canonical origin plus static public routes from source.",
      content: sitemapXml(origin, routes),
      required: true,
    });
  }

  if (!llmsExists(files) && routes.length > 0) {
    specs.push({
      path: publicPath(root, "llms.txt"),
      kind: "llms",
      reason: "Optional curated AI-readable project index is missing; Rezyn can generate it without claiming ranking/citation impact.",
      content: llmsText(project, routes, pageDescription(files), origin),
      required: false,
    });
  }

  if (!openApiExists(files) && apiFiles(files).length > 0) {
    specs.push({
      path: publicPath(root, "openapi.json"),
      kind: "openapi",
      reason: "Real API routes exist but no OpenAPI description is present.",
      content: null,
      required: false,
    });
  }

  return specs;
}

function planRedesignArtifacts(project: ProjectRow, files: SourceFile[], runtime: RuntimeKind): ArtifactSpec[] {
  const hasPresentation = files.some((file) => PUBLIC_PAGE_EXT.test(file.name) || /className\s*=|Widget\s+build\s*\(|:\s*View\b|@Composable\b/.test(file.content));
  if (!hasPresentation || findCentralDesignFile(files, runtime)) return [];
  const path = designFoundationPath(files, runtime);
  return [{
    path,
    kind: "design-foundation",
    reason: "The project has presentation-bearing source but no shared theme/token/global-style foundation. Rezyn will create one before project-level redesign planning.",
    content: null,
    required: true,
  }];
}

async function materializeArtifact(opts: {
  engine: ArtifactEngine;
  spec: ArtifactSpec;
  project: ProjectRow;
  files: SourceFile[];
  runtime: RuntimeKind;
  supabase: any;
  projectId: string;
  userId: string;
}) {
  const path = safeGeneratedPath(opts.spec.path);
  if (!path) throw new Error(`Unsafe generated artifact path: ${opts.spec.path}`);
  const existing = opts.files.find((file) => file.name.toLowerCase() === path.toLowerCase());
  if (existing) return { created: false, path };

  let content = opts.spec.content;
  if (opts.spec.kind === "openapi") {
    content = await generateOpenApi(opts.files, findSiteOrigin(opts.files));
  } else if (opts.spec.kind === "design-foundation") {
    content = await generateDesignFoundation({ project: opts.project, files: opts.files, runtime: opts.runtime, path });
  }
  if (!content) throw new Error(`No generated content for ${path}`);
  const baseValidated = validateGeneratedContent(path, content);
  const validated = opts.engine === "seo" ? validateSeoTemplateArtifact(path, baseValidated) : baseValidated;

  // Re-check immediately before insert so concurrent requests cannot intentionally create duplicate names.
  const { data: duplicate, error: duplicateError } = await opts.supabase
    .from("project_files")
    .select("id, name")
    .eq("project_id", opts.projectId);
  if (duplicateError) throw new Error(duplicateError.message);
  if ((duplicate ?? []).some((row: { name: string }) => normalizePath(row.name).toLowerCase() === path.toLowerCase())) {
    return { created: false, path };
  }

  const fallbackStyle = opts.project.target_style ?? opts.files.find((file) => file.targetStyle)?.targetStyle ?? null;
  const { data: inserted, error } = await opts.supabase
    .from("project_files")
    .insert({
      project_id: opts.projectId,
      user_id: opts.userId,
      name: path,
      source: opts.engine === "seo" ? "generated-seo" : "generated-redesign",
      content: validated,
      size_bytes: byteLength(validated),
      target_style: opts.engine === "redesign" ? fallbackStyle : null,
      status: "queued",
      storage_path: null,
      redesigned_content: null,
      redesign_error: null,
      updated_at: new Date().toISOString(),
    })
    .select("id, name")
    .single();
  if (error) throw new Error(`Could not create ${path}: ${error.message}`);
  if (!inserted?.id) throw new Error(`Could not verify generated file ${path}`);
  return { created: true, path };
}

export async function ensureProjectArtifacts(opts: {
  engine: ArtifactEngine;
  supabase: any;
  projectId: string;
  userId: string;
  sourceMode?: SourceMode;
}): Promise<BootstrapResult> {
  const warnings: string[] = [];
  const created: string[] = [];
  const skipped: string[] = [];

  const { data: projectData, error: projectError } = await opts.supabase
    .from("projects")
    .select("id, name, product_type, notes, target_style, style_mode")
    .eq("id", opts.projectId)
    .maybeSingle();
  if (projectError) throw new Error(projectError.message);
  if (!projectData) throw new Error("Project not found");
  const project = projectData as ProjectRow;

  const { data: fileData, error: fileError } = await opts.supabase
    .from("project_files")
    .select("id, name, source, content, redesigned_content, storage_path, target_style, size_bytes, updated_at")
    .eq("project_id", opts.projectId)
    .order("created_at", { ascending: true });
  if (fileError) throw new Error(fileError.message);
  const rows = (fileData ?? []) as ProjectFileRow[];
  if (rows.length === 0) return { version: BOOTSTRAP_VERSION, created, skipped, warnings };

  const files = await hydrateSourceFiles(opts.supabase, rows, opts.sourceMode ?? "original");
  const runtime = detectRuntime(files);
  const specs = opts.engine === "seo"
    ? planSeoArtifacts(project, files, runtime)
    : planRedesignArtifacts(project, files, runtime);

  for (const spec of specs.slice(0, 8)) {
    try {
      const result = await materializeArtifact({
        engine: opts.engine,
        spec,
        project,
        files,
        runtime,
        supabase: opts.supabase,
        projectId: opts.projectId,
        userId: opts.userId,
      });
      if (result.created) {
        created.push(result.path);
        files.push({ id: `generated:${result.path}`, name: result.path, source: `generated-${opts.engine}`, content: spec.content ?? "", targetStyle: project.target_style });
      } else {
        skipped.push(result.path);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Could not create ${spec.path}`;
      warnings.push(`${spec.required ? "Required" : "Optional"} artifact ${spec.path}: ${message}`);
      // Do not destroy an otherwise valid transformation because an optional support artifact could not be generated.
      // The downstream audit/plan still sees the missing capability and can handle it in existing files.
    }
  }

  return { version: BOOTSTRAP_VERSION, created, skipped, warnings };
}
