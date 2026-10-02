import type { SeoKeywordCandidate } from "@/lib/seo-modules-m1-m8";

export type M1M8Layer = "crawl-index" | "page-content" | "entity-brand" | "ai-visibility" | "agent-readiness";
export type M1M8Category = "crawlability" | "indexability" | "metadata" | "semantics" | "structuredData" | "internalLinking" | "social" | "accessibility" | "performance";
export type M1M8Severity = "critical" | "high" | "medium" | "low";
export type M1M8Effort = "low" | "medium" | "high";
export type M1M8Confidence = "high" | "medium" | "low";
export type M1M8Module = "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8";

export type M1M8Finding = {
  module: M1M8Module;
  layer: M1M8Layer;
  category: M1M8Category;
  severity: M1M8Severity;
  file: string | null;
  message: string;
  evidence: string | null;
  recommendation: string;
  impact: string;
  effort: M1M8Effort;
  confidence: M1M8Confidence;
  provenance: "VERIFIED" | "DERIVED" | "ASSUMED" | "UNKNOWN";
};

export type M1M8ModuleCoverage = Record<M1M8Module, {
  status: "checked" | "partial" | "not-run";
  findings: number;
  note: string;
}>;

export type M1M8Analysis = {
  findings: M1M8Finding[];
  keywordCandidates: SeoKeywordCandidate[];
  moduleCoverage: M1M8ModuleCoverage;
  signals: {
    trustPages: string[];
    authorFiles: string[];
    hreflangFiles: string[];
    breadcrumbFiles: string[];
    questionAnswerFiles: string[];
    citableAssetFiles: string[];
  };
};

export type M1M8File = { name: string; content: string };

const PAGE_EXT = /\.(html?|jsx|tsx|vue|svelte|astro|php|hbs|ejs|twig|mdx)$/i;

function normalizeName(name: string) {
  return name.replace(/\\/g, "/").replace(/^\.\//, "");
}

function isPageLike(file: M1M8File) {
  const name = normalizeName(file.name).toLowerCase();
  if (!PAGE_EXT.test(name)) return false;
  if (/(^|\/)(robots\.txt|sitemap|openapi|package\.json)/i.test(name)) return false;
  return /<main\b|<article\b|<h1\b|<html\b|<head\b|metadata\s*=|generateMetadata\s*\(|<Head\b|Helmet\b|(^|\/)(page|index|layout|app|route|head)\./i.test(`${name}\n${file.content}`);
}

function clip(value: string, max = 220) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function finding(
  module: M1M8Module,
  layer: M1M8Layer,
  category: M1M8Category,
  severity: M1M8Severity,
  file: string | null,
  message: string,
  recommendation: string,
  impact: string,
  evidence?: string | null,
  effort: M1M8Effort = "low",
  confidence: M1M8Confidence = "high",
  provenance: M1M8Finding["provenance"] = "VERIFIED",
): M1M8Finding {
  return { module, layer, category, severity, file, message, recommendation, impact, evidence: evidence ? clip(evidence) : null, effort, confidence, provenance };
}

function literal(source: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return null;
}

function pageTitle(source: string) {
  return literal(source, [
    /<title\b[^>]*>([^<]+)<\/title>/i,
    /\btitle\s*:\s*["'`]([^"'`]+)["'`]/i,
  ]);
}

function h1Text(source: string) {
  return literal(source, [/<h1\b[^>]*>([\s\S]{1,240}?)<\/h1>/i]);
}

function stripMarkup(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\{[^}]+\}/g, " ").replace(/\s+/g, " ").trim();
}

function routeFromFile(name: string) {
  const n = normalizeName(name)
    .replace(/^src\/routes\//, "/")
    .replace(/^app\//, "/")
    .replace(/^pages\//, "/")
    .replace(/\.(?:tsx?|jsx?|vue|svelte|astro|php|mdx?)$/i, "")
    .replace(/\/(?:page|index)$/i, "")
    .replace(/\$/g, ":")
    .replace(/\[([^\]]+)\]/g, ":$1")
    .replace(/\.+/g, "/");
  if (!n.startsWith("/")) return null;
  return n === "" ? "/" : n.replace(/\/+/g, "/") || "/";
}

function classifyKeyword(value: string): SeoKeywordCandidate["type"] {
  const lower = value.toLowerCase();
  if (/\b(vs|versus|compare|comparison)\b/.test(lower)) return "comparison";
  if (/^(who|what|why|when|where|how|can|is|does|should|which)\b/.test(lower) || /\?$/.test(value)) return "question";
  if (/\b(buy|price|pricing|cost|demo|signup|sign up|download|book|order)\b/.test(lower)) return "transactional";
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  if (words >= 8) return "conversational";
  if (words >= 4) return "long-tail";
  if (words >= 2) return "mid-tail";
  return "short-tail";
}

function classifyIntent(value: string): SeoKeywordCandidate["intent"] {
  const lower = value.toLowerCase();
  if (/\b(buy|price|pricing|cost|demo|signup|sign up|download|book|order)\b/.test(lower)) return "transactional";
  if (/\b(best|vs|versus|compare|comparison|review|alternative|worth)\b/.test(lower)) return "commercial";
  if (/\b(login|support|docs|contact|official)\b/.test(lower)) return "navigational";
  return "informational";
}

function funnelForIntent(intent: SeoKeywordCandidate["intent"]): SeoKeywordCandidate["funnelStage"] {
  if (intent === "transactional") return "decision";
  if (intent === "commercial") return "consideration";
  if (intent === "navigational") return "retention";
  return "awareness";
}

function keywordCandidates(files: M1M8File[]) {
  const seen = new Set<string>();
  const candidates: SeoKeywordCandidate[] = [];
  for (const file of files.filter(isPageLike)) {
    const source = file.content;
    const route = routeFromFile(file.name);
    const raw = [pageTitle(source), h1Text(source)].filter((v): v is string => Boolean(v));
    for (const value of raw) {
      const keyword = stripMarkup(value).replace(/\s+[|–—-]\s+[^|–—]{1,60}$/, "").trim();
      if (keyword.length < 2 || keyword.length > 140) continue;
      const key = keyword.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const intent = classifyIntent(keyword);
      candidates.push({
        keyword,
        type: classifyKeyword(keyword),
        intent,
        funnelStage: funnelForIntent(intent),
        cluster: keyword.toLowerCase().split(/\s+/).slice(0, 3).join(" "),
        targetUrl: route,
        role: "candidate",
        serpFeatures: [],
        volume: null,
        difficulty: null,
        source: `DERIVED from ${normalizeName(file.name)} title/H1`,
        priority: null,
      });
    }
  }
  return candidates.slice(0, 160);
}

function staticJsonLd(source: string) {
  return [...source.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1]?.trim())
    .filter((v): v is string => typeof v === "string" && !/\$\{|\{\{|JSON\.stringify|dangerouslySetInnerHTML/i.test(v));
}

function coverage(findings: M1M8Finding[], keywordCount: number, files: M1M8File[]): M1M8ModuleCoverage {
  const modules: M1M8Module[] = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];
  const pageCount = files.filter(isPageLike).length;
  return Object.fromEntries(modules.map((module) => {
    const count = findings.filter((item) => item.module === module).length;
    let status: "checked" | "partial" | "not-run" = pageCount > 0 ? "checked" : "not-run";
    let note = pageCount > 0 ? "Source-level checks executed." : "No page-like source was available.";
    if (module === "M5") {
      status = keywordCount > 0 ? "partial" : "not-run";
      note = keywordCount > 0
        ? "Source-derived candidates generated; external volume, difficulty, SERP overlap and Search Console data were not available, so those fields remain null/not-run."
        : "No source-derived keyword candidates were available; external keyword data was not supplied.";
    }
    if (module === "M8") {
      status = pageCount > 0 ? "partial" : "not-run";
      note = pageCount > 0
        ? "On-site GEO eligibility/entity/citable-asset checks executed; off-site corroboration and live prompt-panel visibility require external data and remain not-run."
        : "No page source available for GEO eligibility analysis.";
    }
    return [module, { status, findings: count, note }];
  })) as M1M8ModuleCoverage;
}

export function analyzeM1M8(files: M1M8File[]): M1M8Analysis {
  const normalized = files.map((file) => ({ ...file, name: normalizeName(file.name) }));
  const pages = normalized.filter(isPageLike);
  const findings: M1M8Finding[] = [];
  const trustPages = normalized.filter((file) => /(^|\/)(about|contact|editorial|authors?|privacy|terms|security|press|returns?|shipping|pricing)(\/|\.|$)/i.test(file.name)).map((f) => f.name);
  const authorFiles = pages.filter((file) => /\b(author|reviewedBy|reviewer|byline|Person|profile)\b/i.test(file.content)).map((f) => f.name);
  const hreflangFiles = pages.filter((file) => /hreflang|hrefLang/i.test(file.content)).map((f) => f.name);
  const breadcrumbFiles = pages.filter((file) => /BreadcrumbList|breadcrumb/i.test(file.content)).map((f) => f.name);
  const questionAnswerFiles = pages.filter((file) => /<h[23][^>]*>\s*(?:What|Why|How|When|Where|Who|Can|Is|Does|Should|Which)\b/i.test(file.content)).map((f) => f.name);
  const citableAssetFiles = pages.filter((file) => /<table\b|\b(?:methodology|benchmark|survey|dataset|calculator|formula|research|source:|according to|tested)\b/i.test(file.content)).map((f) => f.name);

  // M1: search/AI retrieval eligibility, E-E-A-T and anti-spam signals.
  for (const file of pages) {
    const source = file.content;
    if (/onClick\s*=\s*\{[^}]+\}/i.test(source) && !/<a\b[^>]*href=|<Link\b[^>]*(?:href|to)=/i.test(source)) {
      findings.push(finding("M1", "crawl-index", "crawlability", "medium", file.name,
        "Page navigation appears to rely on JavaScript click handlers without an obvious crawlable anchor/link.",
        "Expose important navigation with real <a href> or framework links that render href targets, while preserving interaction behavior.",
        "Search and AI fetchers can miss destinations exposed only through client-side click handlers.", source.match(/onClick\s*=.{0,160}/i)?.[0], "medium", "medium"));
    }
    if (/\b(?:finance|stock|investment|loan|insurance|health|medical|legal|safety)\b/i.test(source) && !/\b(author|reviewedBy|reviewer|sources?|references?|disclaimer|dateModified|updated)\b/i.test(source)) {
      findings.push(finding("M1", "page-content", "semantics", "medium", file.name,
        "Potential YMYL content has weak source-level author/source/review/date trust signals.",
        "For genuine YMYL pages, add real credentialed authors/reviewers, primary sources, timestamps and appropriate risk/disclaimer context. Never invent experts.",
        "High-stakes topics require stronger trust evidence.", null, "medium", "low", "DERIVED"));
    }
  }

  // M2: technical SEO, international, architecture, accessibility and security hints.
  for (const file of pages) {
    const source = file.content;
    if (/<html\b/i.test(source) && !/<html\b[^>]*\blang=/i.test(source)) {
      findings.push(finding("M2", "page-content", "semantics", "low", file.name,
        "An <html> element was detected without a lang attribute.",
        "Set the real document language/locale; do not guess multilingual alternates.",
        "Language metadata improves accessibility and machine interpretation.", "<html>", "low"));
    }
    if (/<head\b/i.test(source) && !/<meta\b[^>]*name=["']viewport["']/i.test(source)) {
      findings.push(finding("M2", "page-content", "accessibility", "low", file.name,
        "A document head was detected without an obvious viewport meta tag.",
        "For traditional HTML documents, add a responsive viewport declaration when the framework does not inject one automatically.",
        "Missing viewport configuration can hurt mobile usability.", null, "low", "medium"));
    }
    if (/http:\/\//i.test(source) && /https:\/\//i.test(source)) {
      findings.push(finding("M2", "crawl-index", "indexability", "low", file.name,
        "Both HTTP and HTTPS absolute URLs appear in the source; review for mixed-content/canonical-host inconsistency.",
        "Use HTTPS for public production assets/links and one canonical host. Preserve intentional localhost/dev URLs outside production.",
        "Mixed or inconsistent protocol references can create security and canonicalization problems.", source.match(/http:\/\/[^\s"'`<)]+/i)?.[0], "low", "medium"));
    }
    for (const match of source.matchAll(/(?:hreflang|hrefLang)\s*=\s*["']([^"']+)["']/gi)) {
      const lang = match[1] ?? "";
      if (lang !== "x-default" && !/^[a-z]{2,3}(?:-[A-Z]{2}|-[A-Za-z]{4})?$/i.test(lang)) {
        findings.push(finding("M2", "crawl-index", "indexability", "medium", file.name,
          `Potentially invalid hreflang code detected: ${lang}.`,
          "Use valid language or language-region codes, reciprocal/self references and x-default only where real locale equivalents exist.",
          "Invalid hreflang can prevent alternate-language signals from being interpreted correctly.", match[0], "low", "high"));
      }
    }
    const controls = [...source.matchAll(/<(input|select|textarea)\b[^>]*>/gi)].map((m) => m[0]);
    const unlabeled = controls.filter((tag) => !/\b(?:aria-label|aria-labelledby|id)=/i.test(tag));
    if (unlabeled.length > 0 && !/<label\b/i.test(source)) {
      findings.push(finding("M2", "page-content", "accessibility", "medium", file.name,
        "Form controls were detected without obvious label/accessible-name wiring.",
        "Use native <label for> relationships or valid accessible-name mechanisms; preserve form behavior.",
        "Accessible forms are easier for users and agents to understand and operate.", unlabeled[0], "medium", "medium"));
    }
  }

  // M3: media/head/on-page implementation details.
  for (const file of pages) {
    const source = file.content;
    const images = source.match(/<img\b[^>]*>/gi) ?? [];
    const missingDimensions = images.filter((tag) => !/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag));
    if (missingDimensions.length > 0) {
      findings.push(finding("M3", "page-content", "performance", "low", file.name,
        `${missingDimensions.length} image element${missingDimensions.length === 1 ? "" : "s"} lack explicit width/height attributes in source.`,
        "Add real intrinsic dimensions or framework-native sizing where known; do not invent image dimensions.",
        "Known dimensions can reduce layout shift and improve media semantics.", missingDimensions[0], "low", "medium"));
    }
    if (/\b(?:updated on|last updated|dateModified)\b/i.test(source) && /new Date\(\)|Date\.now\(\)/i.test(source)) {
      findings.push(finding("M3", "page-content", "semantics", "medium", file.name,
        "A visible/structured update date appears to be generated from the current runtime time.",
        "Use a truthful content-modification date tied to real editorial changes rather than stamping every build as fresh.",
        "Fake freshness can mislead users and machines.", source.match(/(?:updated on|last updated|dateModified).{0,180}/i)?.[0], "low", "medium"));
    }
  }

  // M4: content strategy, originality and E-E-A-T/trust infrastructure.
  if (pages.length >= 5 && trustPages.length < 2) {
    findings.push(finding("M4", "entity-brand", "semantics", "low", null,
      "Few obvious trust/support pages were detected for a multi-page site.",
      "Where appropriate to the business, maintain real About/Contact/editorial/authors/privacy/terms/security/pricing/returns/support pages. Do not create irrelevant boilerplate trust pages.",
      "Clear ownership, policies and support information strengthen trust and entity understanding.", trustPages.join(", ") || null, "medium", "medium", "DERIVED"));
  }
  const editorialPages = pages.filter((file) => /article|blog|post|news|guide|review/i.test(file.name + file.content.slice(0, 1000)));
  if (editorialPages.length >= 3 && authorFiles.length === 0) {
    findings.push(finding("M4", "entity-brand", "semantics", "medium", null,
      "Editorial/content pages were detected but no obvious author/reviewer signals were found.",
      "Use real named authors/reviewers, bios and sourcing where the publishing model warrants it; never fabricate experts.",
      "Authorship and first-hand expertise can strengthen trust, especially for YMYL or review content.", editorialPages.slice(0, 6).map((f) => f.name).join(", "), "medium", "medium", "DERIVED"));
  }

  // M5: candidate generation only; metrics remain null without real tools.
  const candidates = keywordCandidates(normalized);
  if (candidates.length === 0 && pages.length > 0) {
    findings.push(finding("M5", "page-content", "metadata", "low", null,
      "No safe source-derived keyword candidates could be extracted from titles/H1s.",
      "Use real Search Console/site-search/support/PAA/keyword-tool evidence before building a keyword universe; generated ideas must remain candidates with null volume/difficulty.",
      "Keyword-to-page mapping cannot be grounded without page-topic or external query evidence.", null, "medium", "high", "UNKNOWN"));
  }

  // M6: structured-data graph consistency and stable identifiers.
  for (const file of pages) {
    const blocks = staticJsonLd(file.content);
    for (const block of blocks) {
      try {
        const parsed = JSON.parse(block) as any;
        const root = Array.isArray(parsed) ? parsed : [parsed];
        const serialized = JSON.stringify(parsed);
        if (/"@context"\s*:\s*"https?:\/\/schema\.org"/i.test(serialized) && !/"@id"\s*:/i.test(serialized) && /"@type"\s*:\s*"(?:Organization|WebSite|WebPage|Article|Product|Person)"/i.test(serialized)) {
          findings.push(finding("M6", "entity-brand", "structuredData", "low", file.name,
            "Structured data defines major entities without stable @id references.",
            "When the canonical host/page URL is known, use stable absolute @ids and reference entities rather than duplicating conflicting nodes.",
            "Stable identifiers help consumers connect Organization/WebSite/WebPage/Person/Product relationships.", block.slice(0, 180), "medium", "medium"));
        }
        void root;
      } catch {
        // Core analyzer already flags invalid JSON-LD.
      }
    }
  }

  // M7: AEO extraction readiness. Absence is not automatically an error; only flag obvious anti-patterns.
  for (const file of pages) {
    const source = file.content;
    if (/FAQPage|QAPage/i.test(source) && !/(?:<h[2-6][^>]*>[^<]*(?:What|Why|How|When|Where|Who|Can|Is|Does)|<details\b|question)/i.test(source)) {
      findings.push(finding("M7", "page-content", "structuredData", "medium", file.name,
        "FAQ/Q&A structured-data signals were detected without obvious visible question content in the same source.",
        "Keep FAQ/Q&A markup only when the visible page genuinely contains those questions and answers.",
        "Schema that does not match visible content is unreliable and can violate structured-data guidance.", source.match(/FAQPage|QAPage/i)?.[0], "low", "medium"));
    }
    if (/\b(best|top)\b/i.test(pageTitle(source) ?? "") && !/\b(?:tested|methodology|criteria|comparison|reviewed|data|source)\b/i.test(source)) {
      findings.push(finding("M7", "page-content", "semantics", "low", file.name,
        "A 'best/top' title was detected without obvious comparison methodology/evidence signals.",
        "If the page ranks or recommends options, show real criteria/evidence and avoid unsupported superlatives. Otherwise use a non-ranking title.",
        "Answer-engine extraction should not amplify unsupported rankings.", pageTitle(source), "medium", "medium"));
    }
  }

  // M8: GEO eligibility/entity/citable-asset and crawler-access signals.
  const robots = normalized.find((file) => /(^|\/)robots\.txt$/i.test(file.name));
  if (robots) {
    for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"]) {
      const block = new RegExp(`User-agent:\\s*${bot}[\\s\\S]{0,500}?Disallow:\\s*\\/\\s*(?:$|\\n)`, "i");
      if (block.test(robots.content)) {
        findings.push(finding("M8", "ai-visibility", "crawlability", "low", robots.name,
          `${bot} appears to be blocked site-wide.`,
          "Confirm this matches the site owner's AI-search access policy. Do not automatically unblock a bot when blocking is intentional.",
          "Blocking an AI search crawler can reduce eligibility for that crawler's search/citation surface.", `User-agent: ${bot} ... Disallow: /`, "low", "medium", "VERIFIED"));
      }
    }
  }
  if (pages.length >= 5 && citableAssetFiles.length === 0) {
    findings.push(finding("M8", "ai-visibility", "semantics", "low", null,
      "No obvious citable-asset signals (tables, methodology, benchmarks, datasets, calculators, sourced research) were detected.",
      "Where the business genuinely has original data/expertise, expose it clearly with dates/methodology/primary sources. Do not manufacture statistics just for GEO.",
      "Original, well-attributed information can be easier to cite and differentiate.", null, "high", "low", "DERIVED"));
  }

  return {
    findings,
    keywordCandidates: candidates,
    moduleCoverage: coverage(findings, candidates.length, normalized),
    signals: { trustPages, authorFiles, hreflangFiles, breadcrumbFiles, questionAnswerFiles, citableAssetFiles },
  };
}
