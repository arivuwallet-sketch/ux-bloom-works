export type SeoCategory =
  | "crawlability"
  | "indexability"
  | "metadata"
  | "semantics"
  | "structuredData"
  | "internalLinking"
  | "social"
  | "accessibility"
  | "performance";

export type SeoSeverity = "critical" | "high" | "medium" | "low";

export type SeoAuditIssue = {
  id: string;
  category: SeoCategory;
  severity: SeoSeverity;
  file: string | null;
  message: string;
  evidence?: string | null;
  recommendation: string;
};

export type SeoAuditFile = {
  name: string;
  content: string;
};

export type SeoAudit = {
  version: 1;
  score: number;
  categories: Record<SeoCategory, number>;
  issueCount: number;
  issues: SeoAuditIssue[];
  summary: {
    filesScanned: number;
    pageLikeFiles: number;
    hasRobots: boolean;
    hasSitemap: boolean;
  };
};

const severityPenalty: Record<SeoSeverity, number> = {
  critical: 16,
  high: 10,
  medium: 6,
  low: 3,
};

const categoryWeights: Record<SeoCategory, number> = {
  crawlability: 0.13,
  indexability: 0.13,
  metadata: 0.16,
  semantics: 0.13,
  structuredData: 0.08,
  internalLinking: 0.1,
  social: 0.07,
  accessibility: 0.1,
  performance: 0.1,
};

const PAGE_EXT = /\.(html?|jsx|tsx|vue|svelte|astro|php|hbs|ejs|twig|mdx)$/i;
const SCRIPT_EXT = /\.(js|ts)$/i;

export function isSeoBearingFile(name: string, content: string) {
  const lower = name.toLowerCase();
  if (/(^|\/)(robots\.txt|sitemap(?:[-_.][\w-]+)?\.xml|sitemap\.txt)$/i.test(lower)) return true;
  if (PAGE_EXT.test(lower)) return true;
  if (SCRIPT_EXT.test(lower)) {
    return /<(?:html|head|main|article|section|img|a|h1)\b|metadata\s*=|generateMetadata\s*\(|<Head\b|Helmet\b|application\/ld\+json|canonical|openGraph|twitter/i.test(content);
  }
  return false;
}

function isPageLike(name: string, content: string) {
  const lower = name.toLowerCase();
  if (!isSeoBearingFile(name, content)) return false;
  if (/robots\.txt|sitemap/i.test(lower)) return false;
  if (/\.(css|scss|sass|less)$/i.test(lower)) return false;
  if (/(^|\/)(page|index|layout|app|document|route|head)\.[a-z]+$/i.test(lower)) return true;
  return /<main\b|<article\b|<h1\b|<html\b|<head\b|metadata\s*=|generateMetadata\s*\(|<Head\b|Helmet\b/i.test(content);
}

function snippet(value: string, max = 180) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function addIssue(
  issues: SeoAuditIssue[],
  category: SeoCategory,
  severity: SeoSeverity,
  file: string | null,
  message: string,
  recommendation: string,
  evidence?: string | null,
) {
  issues.push({
    id: `${category}:${file ?? "project"}:${issues.length + 1}`,
    category,
    severity,
    file,
    message,
    recommendation,
    evidence: evidence ? snippet(evidence) : null,
  });
}

function hasTitle(source: string) {
  return /<title\b[^>]*>[^<]+<\/title>/i.test(source)
    || /\btitle\s*:\s*["'`][^"'`]+["'`]/i.test(source)
    || /<Helmet[\s\S]*?<title\b/i.test(source);
}

function hasDescription(source: string) {
  return /<meta\b[^>]*(?:name=["']description["']|content=["'][^"']+["'][^>]*name=["']description["'])/i.test(source)
    || /\bdescription\s*:\s*["'`][^"'`]+["'`]/i.test(source);
}

function hasCanonical(source: string) {
  return /<link\b[^>]*rel=["']canonical["']/i.test(source)
    || /\bcanonical\s*:/i.test(source)
    || /alternates\s*:\s*\{[\s\S]*?canonical\s*:/i.test(source);
}

function hasNoindex(source: string) {
  return /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(source)
    || /robots\s*:\s*\{[\s\S]*?index\s*:\s*false/i.test(source);
}

function hasOpenGraph(source: string) {
  return /property=["']og:(?:title|description|image|url)["']/i.test(source)
    || /\bopenGraph\s*:/i.test(source);
}

function hasTwitterMetadata(source: string) {
  return /name=["']twitter:(?:card|title|description|image)["']/i.test(source)
    || /\btwitter\s*:/i.test(source);
}

function h1Count(source: string) {
  return (source.match(/<h1\b/gi) ?? []).length;
}

function imageTags(source: string) {
  return source.match(/<img\b[^>]*>/gi) ?? [];
}

function hasJsonLd(source: string) {
  return /application\/ld\+json/i.test(source)
    || /schema\.org/i.test(source)
    || /"@context"\s*:\s*"https?:\/\/schema\.org"/i.test(source);
}

function hasLinks(source: string) {
  return /<a\b[^>]*href=/i.test(source) || /<Link\b[^>]*(?:to|href)=/i.test(source);
}

function hasLazyImages(source: string) {
  const imgs = imageTags(source);
  if (imgs.length === 0) return true;
  return imgs.some((tag) => /loading=["']lazy["']/i.test(tag));
}

export function auditSeoProject(files: SeoAuditFile[]): SeoAudit {
  const issues: SeoAuditIssue[] = [];
  const normalized = files.map((file) => ({ ...file, name: file.name.replace(/\\/g, "/") }));
  const hasRobots = normalized.some((file) => /(^|\/)robots\.txt$/i.test(file.name));
  const hasSitemap = normalized.some((file) => /(^|\/)sitemap(?:[-_.][\w-]+)?\.(?:xml|txt)$/i.test(file.name));
  const pageFiles = normalized.filter((file) => isPageLike(file.name, file.content));

  if (!hasRobots) {
    addIssue(
      issues,
      "crawlability",
      "medium",
      null,
      "No robots.txt file was found in the uploaded project.",
      "Add or verify an environment-appropriate robots.txt before production deployment. Do not block assets required for rendering.",
    );
  }

  if (!hasSitemap) {
    addIssue(
      issues,
      "crawlability",
      "medium",
      null,
      "No sitemap file was found in the uploaded project.",
      "Generate a sitemap from real indexable routes or configure the framework's sitemap generator. Do not invent URLs.",
    );
  }

  for (const file of pageFiles) {
    const source = file.content;
    if (!hasTitle(source)) {
      addIssue(issues, "metadata", "high", file.name, "No page title metadata was detected.", "Add a unique, concise title that accurately describes this page using only the page's real subject matter.");
    }
    if (!hasDescription(source)) {
      addIssue(issues, "metadata", "medium", file.name, "No meta description was detected.", "Add a useful description grounded in the actual page content; avoid keyword stuffing and unsupported claims.");
    }
    if (!hasCanonical(source)) {
      addIssue(issues, "indexability", "low", file.name, "No canonical declaration was detected.", "Add a canonical only when the framework and deployment URL strategy make the correct canonical target unambiguous.");
    }
    if (hasNoindex(source)) {
      addIssue(issues, "indexability", "high", file.name, "A noindex directive was detected on a page-like file.", "Verify that this page is intentionally excluded from search before retaining noindex.", "noindex");
    }
    if (!hasOpenGraph(source)) {
      addIssue(issues, "social", "low", file.name, "Open Graph metadata was not detected.", "Add accurate Open Graph metadata where the page is intended to be shared publicly.");
    }
    if (!hasTwitterMetadata(source)) {
      addIssue(issues, "social", "low", file.name, "Twitter/X card metadata was not detected.", "Add card metadata using the same truthful page title, description and representative image strategy.");
    }

    const headings = h1Count(source);
    if (headings === 0) {
      addIssue(issues, "semantics", "medium", file.name, "No H1 heading was detected.", "Give the primary page topic one clear semantic H1 without changing the visual hierarchy unnecessarily.");
    } else if (headings > 1) {
      addIssue(issues, "semantics", "low", file.name, `Multiple H1 elements were detected (${headings}).`, "Confirm the heading outline is intentional and simplify the primary topic hierarchy where appropriate.");
    }

    const imgs = imageTags(source);
    const missingAlt = imgs.filter((tag) => !/\balt\s*=/.test(tag));
    if (missingAlt.length > 0) {
      addIssue(
        issues,
        "accessibility",
        "medium",
        file.name,
        `${missingAlt.length} image element${missingAlt.length === 1 ? "" : "s"} appear to be missing alt attributes.`,
        "Add meaningful alt text for informative images and empty alt text for genuinely decorative images; do not fabricate visual details.",
        missingAlt[0],
      );
    }

    if (!hasLinks(source)) {
      addIssue(issues, "internalLinking", "low", file.name, "No internal link markup was detected in this page-like file.", "Review whether useful contextual internal links to real project routes should be added. Do not invent destinations.");
    }

    if (!hasJsonLd(source)) {
      addIssue(issues, "structuredData", "low", file.name, "No structured-data implementation was detected.", "Add JSON-LD only when the page's real content qualifies for a supported schema type. Never fabricate ratings, reviews, prices, authors or organization facts.");
    }

    if (!hasLazyImages(source) && imgs.length > 1) {
      addIssue(issues, "performance", "low", file.name, "Multiple images were detected without an obvious lazy-loading strategy.", "Lazy-load non-critical images where framework behavior and above-the-fold requirements allow it.");
    }
  }

  const categories = Object.keys(categoryWeights).reduce((acc, category) => {
    const key = category as SeoCategory;
    const penalty = issues
      .filter((issue) => issue.category === key)
      .reduce((sum, issue) => sum + severityPenalty[issue.severity], 0);
    acc[key] = Math.max(0, Math.min(100, 100 - penalty));
    return acc;
  }, {} as Record<SeoCategory, number>);

  const score = Math.round(
    (Object.keys(categoryWeights) as SeoCategory[]).reduce(
      (sum, category) => sum + categories[category] * categoryWeights[category],
      0,
    ),
  );

  return {
    version: 1,
    score,
    categories,
    issueCount: issues.length,
    issues,
    summary: {
      filesScanned: normalized.length,
      pageLikeFiles: pageFiles.length,
      hasRobots,
      hasSitemap,
    },
  };
}

export function buildSeoIntelligenceContext() {
  return [
    "SEO operating rules:",
    "- Preserve user-visible functionality, routes, APIs, state, forms, event handlers, IDs/test hooks and visual design unless a semantic HTML correction can be made without changing appearance.",
    "- Never invent search volume, ranking position, traffic, conversion data, competitors, customer research, reviews, ratings, awards, prices, authors, organization facts, locations, dates or schema properties that are not supported by source evidence.",
    "- Never keyword-stuff. Write for people first and use the page's real topic naturally.",
    "- Preserve existing URLs and route semantics by default. Do not rename slugs or remove indexable pages unless the plan explicitly identifies a safe reason based on source evidence.",
    "- Canonicals, hreflang, robots directives and sitemap URLs must be based on known deployment/route facts. If the correct absolute URL is unknown, preserve the existing strategy or leave a recommendation instead of inventing one.",
    "- Structured data must match visible/real content. Never fabricate Product ratings, Review values, AggregateRating, Offer price/availability, Article authorship, FAQ answers or Organization details.",
    "- Maintain accessible names, labels, keyboard behavior, focus order, semantic landmarks and useful alt text.",
    "- Prefer framework-native metadata APIs when the project already uses them.",
    "- Keep metadata unique, concise and truthful. Avoid boilerplate repetition across route-level pages.",
    "- Improve internal linking only with real known routes or anchors present in the project.",
    "- Avoid introducing render-blocking dependencies, large client-only SEO packages or duplicated head managers.",
    "- SEO-only mode must not restyle, relayout, rename visual classes, change spacing, colors, typography, animation, component geometry or interaction design.",
    "- Redesign + SEO mode receives already-redesigned code; SEO work must preserve that new visual system exactly.",
  ].join("\n");
}
