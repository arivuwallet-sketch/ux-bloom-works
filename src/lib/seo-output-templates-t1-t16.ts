export type SeoTemplateId =
  | "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "T8"
  | "T9" | "T10" | "T11" | "T12" | "T13" | "T14" | "T15" | "T16";

export type SeoTemplateApplicability = "required" | "conditional" | "optional" | "volatile";

export type SeoTemplateDefinition = {
  id: SeoTemplateId;
  name: string;
  applicability: SeoTemplateApplicability;
  purpose: string;
  structure: string[];
  guardrails: string[];
};

export const SEO_T1_T16_VERSION = "2026-10-v1";

export const SEO_T1_T16_GLOBAL_RULES = [
  "Every placeholder token beginning with << is a template marker only. Never ship an output containing <<.",
  "Replace placeholders only with real site/project facts. If a fact is unknown, omit the field when optional or use null/UNKNOWN; never guess.",
  "Preserve provenance: VERIFIED for source/user/tool/official evidence, DERIVED for deterministic computation, ASSUMED for explicit inference, UNKNOWN for unavailable facts.",
  "Machine-readable output must parse before release: JSON/JSON-LD/OpenAPI as JSON, sitemap/SSML as XML, robots.txt as plain directives, YAML as valid YAML.",
  "Do not fabricate URLs, endpoints, search volume, difficulty, traffic, rankings, reviews, prices, authors, credentials, dates, locations, social profiles, bot capabilities or validation results.",
  "Volatile protocols, crawler names, Search features and agent-discovery formats must be verified against current official specifications before shipping.",
] as const;

export const SEO_T1_T16_CATALOG: readonly SeoTemplateDefinition[] = [
  {
    id: "T1",
    name: "Site profile / intake object",
    applicability: "required",
    purpose: "One source-grounded project fact model that every SEO/GEO/AEO/AAO decision inherits.",
    structure: [
      "domain, canonical_host, cms_stack, rendering, business_model, vertical_notes",
      "offerings[{name,url,price,currency,availability}]",
      "audiences[{persona,jobs_to_be_done[],pains[]}]",
      "markets[{country,language,currency}], goals[], conversion_events[]",
      "brand{legal_name,display_name,tagline,descriptor,founding_year,address,contact{email,phone},logo_url,profiles[],authors[]}",
      "competitors[], existing_assets{top_pages[],content_inventory_url,gsc_access,ga4_access}",
      "constraints[], ai_bot_policy, data_available[]",
    ],
    guardrails: [
      "Unknown facts stay null/UNKNOWN; competitors are never invented.",
      "URLs must be real and absolute when the schema calls for absolute URLs.",
      "Brand, author, location, licensing and YMYL facts require source evidence.",
    ],
  },
  {
    id: "T2",
    name: "Keyword record + page-keyword map",
    applicability: "required",
    purpose: "Normalize query candidates and map intent to one defensible target page without cannibalization.",
    structure: [
      "keyword,type,intent,funnel_stage,cluster,entity,target_url,role,serp_features",
      "volume,difficulty,source,verified,priority_score,notes",
      "CSV header uses the exact same fields.",
      "Page map: URL | Page type | Primary keyword | Secondary keywords | Intent | Cluster | Cannibalization check | Action",
    ],
    guardrails: [
      "volume and difficulty are null unless a real tool/data source supplied them.",
      "Generated terms are candidates, not claimed demand.",
      "target_url may use NEW:/proposed-slug only when a genuinely new page is justified.",
    ],
  },
  {
    id: "T3",
    name: "Per-URL page brief",
    applicability: "required",
    purpose: "Define the complete SEO/content contract for each target URL before rewriting it.",
    structure: [
      "url,page_type,primary_keyword,secondary_keywords[],search_intent,audience,unique_angle",
      "title,meta_description,h1",
      "outline[{h2,answer_first,evidence}], required_entities_and_facts[], sources_to_cite[]",
      "internal_links_in[], internal_links_out[], schema_types[], faq_questions[]",
      "cta{primary,secondary,offer}, author_and_reviewer, update_cadence, kpis[]",
    ],
    guardrails: [
      "A unique angle must be evidence-backed; do not claim novelty without comparison data.",
      "Sources, authors/reviewers, FAQ demand and KPIs are only populated when real.",
      "Titles/descriptions use practical length targets, not hard truncation guarantees.",
    ],
  },
  {
    id: "T4",
    name: "HTML head baseline",
    applicability: "conditional",
    purpose: "Provide a complete page-head checklist or framework-native equivalent.",
    structure: [
      "lang, charset, viewport, title, description, canonical",
      "reciprocal hreflang+self+x-default only for real multilingual equivalents",
      "Open Graph type/title/description/url/image and twitter:card",
      "robots max-image-preview:large when appropriate, favicon, justified image preload",
      "real JSON-LD graph from T8 instead of a placeholder stub",
    ],
    guardrails: [
      "Canonical/OG URLs and images must be real absolute URLs.",
      "Do not add hreflang unless reciprocal locale equivalents actually exist.",
      "Do not preload arbitrary images or create duplicate/conflicting metadata systems.",
    ],
  },
  {
    id: "T5",
    name: "robots.txt policy",
    applicability: "conditional",
    purpose: "Choose exactly one owner-approved crawling/AI policy and render valid directives.",
    structure: [
      "Policy A: public search visibility; allow public crawl and disallow real private/utility paths.",
      "Policy B: search/citation allowed while training crawlers are blocked when the owner explicitly selects that policy.",
      "Policy C: block named AI crawlers only when the owner accepts reduced AI visibility.",
      "Absolute Sitemap directive only when a real sitemap URL is known.",
    ],
    guardrails: [
      "Never combine all policy variants into one generated file.",
      "Verify volatile crawler/token names against current vendor docs before shipping.",
      "robots.txt is not access control; CDN/WAF enforcement is required for hard privacy/security requirements.",
      "Never put noindex in robots.txt and never accidentally ship Disallow: / unless explicitly intended.",
    ],
  },
  {
    id: "T6",
    name: "XML sitemap / sitemap index",
    applicability: "conditional",
    purpose: "Expose only real canonical indexable URLs in a standards-compliant sitemap.",
    structure: [
      "Single sitemap: urlset with loc and truthful lastmod; optional real image and hreflang alternates.",
      "Sitemap index: split child maps by real content type when scale requires it.",
      "50,000 URLs or 50 MB maximum per child sitemap.",
    ],
    guardrails: [
      "No priority/changefreq.",
      "Only canonical, indexable URLs intended to return 200.",
      "Escape ampersands; lastmod must reflect a real modification.",
      "Multilingual alternates include self and x-default only when real.",
    ],
  },
  {
    id: "T7",
    name: "llms.txt",
    applicability: "optional",
    purpose: "Publish a concise curated site index for machine readers without claiming ranking benefits.",
    structure: [
      "H1 site/brand name, factual summary blockquote, optional organization/update notes",
      "Key pages, Guides, Documentation/API, Policies and optional lower-priority groups",
      "Each link includes a short factual description.",
    ],
    guardrails: [
      "Only real routes and factual descriptions.",
      "No claim that llms.txt is a Google ranking or AI-citation signal.",
      "Prefer absolute URLs when canonical host is known.",
    ],
  },
  {
    id: "T8",
    name: "JSON-LD graphs",
    applicability: "conditional",
    purpose: "Model site/page entities using one coherent source-grounded graph with stable identifiers.",
    structure: [
      "Site-wide: Organization + WebSite with reusable stable @ids.",
      "Article: WebPage + BreadcrumbList + ImageObject + Article + Person when facts exist.",
      "Product: Product + Brand + Offer; AggregateRating only for genuine visible reviews.",
      "LocalBusiness: subtype + NAP + PostalAddress + GeoCoordinates + openingHours only when verified.",
      "FAQPage: only visible Q&A; never promise Google FAQ rich results.",
    ],
    guardrails: [
      "Use schema.org context and stable absolute @ids tied to the real canonical host.",
      "Schema must match visible/verified facts exactly.",
      "Delete unsupported properties rather than filling them with invented values.",
      "Reuse entity @ids instead of creating conflicting duplicate Organization/Person/Product nodes.",
    ],
  },
  {
    id: "T9",
    name: "AEO answer blocks",
    applicability: "conditional",
    purpose: "Make real answers extractable while preserving human readability.",
    structure: [
      "Definition: question heading -> 1-2 sentence definition -> short sourced expansion.",
      "How-to: one-sentence summary -> numbered verb-led steps -> real tip/warning.",
      "Comparison: short answer -> consistent-attribute table -> decision guidance and failure cases.",
      "FAQ: real question -> direct 40-80 word answer -> deeper internal link when available.",
    ],
    guardrails: [
      "Questions are source/search/support evidence or explicitly labeled generated candidates.",
      "Do not invent rankings, prices, statistics or 'best' verdicts.",
      "Source and date factual/time-sensitive claims.",
    ],
  },
  {
    id: "T10",
    name: "SSML templates",
    applicability: "conditional",
    purpose: "Create voice-ready answers only when the product has a named target speech engine.",
    structure: [
      "speak root with locale, p/s sentence structure and conservative breaks.",
      "Optional say-as for dates, currency, tickers, units and telephone only if target engine supports it.",
      "Optional emphasis/prosody/phoneme only when target-engine support is verified.",
      "Always provide a plain-text transcript alongside SSML.",
    ],
    guardrails: [
      "Valid XML with escaped ampersands.",
      "Name the target engine and respect its supported tags/attributes/character limits.",
      "If the target engine is unknown, output an implementation plan rather than speculative SSML.",
    ],
  },
  {
    id: "T11",
    name: "OpenAPI 3.1 description",
    applicability: "conditional",
    purpose: "Describe only real public API operations so agents/tools can select and call them safely.",
    structure: [
      "openapi: 3.1.0; info{title,version,description,contact}; servers[]; security[]",
      "paths with real methods, operationId, summary, tool-selection description, parameters, responses",
      "components.securitySchemes and components.schemas matching actual request/response shapes",
      "Rate limits/auth/attribution only when verified.",
    ],
    guardrails: [
      "Never invent endpoints, parameters, auth, server URLs, rate limits or response fields.",
      "Validate with an OpenAPI linter and call/document real endpoints before publishing when execution access exists.",
    ],
  },
  {
    id: "T12",
    name: "Agent discovery / protocol plan",
    applicability: "volatile",
    purpose: "Plan A2A/MCP/WebMCP/commerce discovery only from current official specifications.",
    structure: [
      "A2A card: name, description, service URL, version, capabilities, input/output modes, skills, auth when current spec confirms fields.",
      "MCP discovery/server card: server URL, transport, capabilities and auth using current MCP guidance.",
      "WebMCP: safe in-page tools/forms only per current W3C Community Group draft.",
      "Commerce UCP/ACP: current platform catalog/checkout/payment integration requirements.",
    ],
    guardrails: [
      "Do not guess field names, file paths or discovery URLs.",
      "Fetch/verify the current official specification before code generation.",
      "If current specs cannot be verified, output a short AAO implementation plan instead of speculative code.",
    ],
  },
  {
    id: "T13",
    name: "Digital PR pitch + outreach",
    applicability: "optional",
    purpose: "Turn a real newsworthy asset, dataset or expert insight into relevant outreach.",
    structure: [
      "Specific subject/hook, personalized reference to recipient's work, two-sentence story/value",
      "Real dataset/chart/expert quote/interview offer, asset link, sender identity",
      "Follow-up after 4-7 days with one new fact; stop after two follow-ups; log outcomes.",
    ],
    guardrails: [
      "No fake personalization, data points, journalists, expert identities or publication claims.",
      "Lead with real reader value rather than a link request.",
    ],
  },
  {
    id: "T14",
    name: "Lead-generation funnel map",
    applicability: "optional",
    purpose: "Connect search intent to useful pages and conversion paths without harming trust.",
    structure: [
      "Stage | Query/intent | Page | Primary CTA | Offer | Form fields | Follow-up | KPI",
      "Stages: awareness, consideration, decision, retention.",
    ],
    guardrails: [
      "Use only real pages/offers/forms/follow-up capabilities.",
      "Keep form fields minimal and intent-appropriate; do not invent CRM/email automation.",
      "KPI baselines/targets are null until real analytics exist.",
    ],
  },
  {
    id: "T15",
    name: "Validation commands + release checklist",
    applicability: "required",
    purpose: "Record what was actually validated and what remains unverified.",
    structure: [
      "JSON/JSON-LD/OpenAPI syntax: JSON parser/jq equivalent.",
      "XML sitemap/SSML well-formedness.",
      "URL status sampling, robots fetch/header check, server-rendered-content check when network/runtime access exists.",
      "External checks when available: Rich Results Test, Schema Markup Validator, PageSpeed Insights, Search Console inspection/sitemaps, OpenAPI linter, link crawler.",
      "Every check records pass, fail or not-run.",
    ],
    guardrails: [
      "Never report a check as pass unless it actually ran or deterministic validation proved it.",
      "External tools unavailable to the runtime are explicitly not-run, not assumed.",
    ],
  },
  {
    id: "T16",
    name: "Final report + 30/60/90 roadmap",
    applicability: "required",
    purpose: "Summarize evidence, shipped artifacts, unresolved gaps and a prioritized follow-up roadmap.",
    structure: [
      "Summary: top finding, biggest opportunity, biggest risk, what shipped, what is next.",
      "Assumptions/data gaps with [ASSUMED] and [UNKNOWN].",
      "Findings table: ID | Layer | Evidence | Severity | Fix | Effort | Confidence.",
      "Artifacts table: File | Place at | Validation status.",
      "30 days foundation; 60 days content/authority; 90 days scale/agents.",
      "KPIs baseline -> target -> current; risks and decisions needed.",
    ],
    guardrails: [
      "Roadmap items must follow from the actual audit/site profile and must not imply guaranteed impact.",
      "KPIs remain null/UNKNOWN without real baseline data.",
      "Only list artifacts as shipped when they actually exist in the output project.",
    ],
  },
] as const;

function catalogText() {
  return SEO_T1_T16_CATALOG.map((template) => [
    `${template.id}. ${template.name} [${template.applicability}]`,
    `Purpose: ${template.purpose}`,
    "Required structure:",
    ...template.structure.map((item) => `- ${item}`),
    "Guardrails:",
    ...template.guardrails.map((item) => `- ${item}`),
  ].join("\n")).join("\n\n");
}

export function buildSeoT1T16Context() {
  return `REZYN SEO/GEO/AEO/AAO OUTPUT CONTRACTS — T1-T16 — ${SEO_T1_T16_VERSION}

GLOBAL OUTPUT RULES
${SEO_T1_T16_GLOBAL_RULES.map((rule) => `- ${rule}`).join("\n")}

EXECUTION ORDER
- Build T1 first as the authoritative site profile.
- Build T2 keyword/page mapping and T3 per-URL briefs from T1 plus real query/source evidence.
- Apply T4-T11 only where the project/source makes each artifact relevant.
- T12 is volatile: verify current official protocol specs before code; otherwise return an implementation plan.
- T13 and T14 are optional acquisition outputs and require real outreach/funnel facts.
- T15 is mandatory release validation and records pass/fail/not-run truthfully.
- T16 is the final evidence-based report/30-60-90 roadmap.
- When editing source, use these contracts to choose the correct framework-native file/path; do not create orphan artifacts that the runtime never serves.
- When a required fact is unavailable, preserve null/UNKNOWN and continue with the portions that can be safely implemented.

${catalogText()}`;
}

export function validateSeoTemplateArtifact(name: string, source: string) {
  if (source.includes("<<")) throw new Error(`${name} still contains unresolved SEO template placeholders`);
  const lower = name.toLowerCase();

  if (/\.json$/i.test(lower)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(source);
    } catch {
      throw new Error(`${name} is not valid JSON`);
    }
    if (/(^|\/)(?:openapi|swagger)\.json$/i.test(lower)) {
      const root = parsed as Record<string, unknown>;
      if (root["openapi"] !== "3.1.0") throw new Error(`${name} must use OpenAPI 3.1.0`);
      if (!root["paths"] || typeof root["paths"] !== "object") throw new Error(`${name} must contain a real paths object`);
    }
  }

  if (/(^|\/)robots\.txt$/i.test(lower)) {
    if (/^\s*noindex\s*:/im.test(source)) throw new Error("robots.txt must not contain a noindex directive");
    const policies = (source.match(/^User-agent:\s*\*/gim) ?? []).length;
    if (policies > 1) throw new Error("robots.txt appears to combine multiple wildcard policy variants");
  }

  if (/sitemap[^/]*\.xml$/i.test(lower)) {
    if (!/<(?:urlset|sitemapindex)\b[^>]*xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/i.test(source)) {
      throw new Error(`${name} is missing the standard sitemap namespace`);
    }
    if (/<(?:priority|changefreq)>/i.test(source)) throw new Error(`${name} must not emit priority/changefreq`);
    for (const match of source.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
      if (!/^https?:\/\//i.test((match[1] ?? "").trim())) throw new Error(`${name} contains a non-absolute sitemap URL`);
    }
  }

  if (/\.ssml$|ssml\.xml$/i.test(lower)) {
    if (!/<speak\b/i.test(source) || !/<\/speak>/i.test(source)) throw new Error(`${name} is missing a valid SSML speak root`);
  }

  return source;
}


export type SeoT1T16CoverageStatus =
  | "required"
  | "applicable"
  | "optional"
  | "not-applicable"
  | "verify-current-spec";

export type SeoT1T16Coverage = Record<SeoTemplateId, {
  status: SeoT1T16CoverageStatus;
  note: string;
}>;

export function buildSeoT1T16Coverage(input: {
  pageCount: number;
  canonicalHost: string | null;
  hasPublicWebsite: boolean;
  hasRobots: boolean;
  hasSitemap: boolean;
  hasLlmsTxt: boolean;
  hasOpenApi: boolean;
  apiRouteCount: number;
  hasStructuredData: boolean;
  hasQuestionAnswerContent: boolean;
  hasVoiceSurface: boolean;
  hasConversionSurface: boolean;
}): SeoT1T16Coverage {
  const pages = input.pageCount > 0;
  const publicSite = input.hasPublicWebsite || pages;
  return {
    T1: { status: "required", note: "Site profile is the grounding object for every project." },
    T2: { status: "required", note: "Keyword/page mapping is required; metrics stay null without real data." },
    T3: { status: pages ? "required" : "not-applicable", note: pages ? "Create/update per-URL briefs for public target pages." : "No public page templates were detected." },
    T4: { status: pages ? "applicable" : "not-applicable", note: pages ? "Apply framework-native head/metadata baseline to public pages." : "No page head surface detected." },
    T5: { status: publicSite ? "applicable" : "not-applicable", note: input.hasRobots ? "Existing robots policy should be audited/updated rather than duplicated." : "Public website has no detected robots policy." },
    T6: { status: publicSite && input.canonicalHost ? "applicable" : publicSite ? "optional" : "not-applicable", note: input.hasSitemap ? "Existing sitemap should be audited/updated." : input.canonicalHost ? "A real canonical host is available for safe sitemap generation." : "Do not fabricate absolute sitemap URLs until canonical host is verified." },
    T7: { status: publicSite ? "optional" : "not-applicable", note: input.hasLlmsTxt ? "Existing llms.txt should be curated, not duplicated." : "Optional curated machine-readable index; no ranking/citation claims." },
    T8: { status: pages ? "applicable" : "not-applicable", note: input.hasStructuredData ? "Existing structured data should be validated and normalized." : "Generate schema only where verified page/entity facts support it." },
    T9: { status: input.hasQuestionAnswerContent ? "applicable" : pages ? "optional" : "not-applicable", note: input.hasQuestionAnswerContent ? "Existing question/answer content can use answer-first structures." : "Use only when real question intent is supported." },
    T10: { status: input.hasVoiceSurface ? "applicable" : "not-applicable", note: input.hasVoiceSurface ? "Voice surface detected; target speech engine still must be known." : "No voice/SSML surface detected." },
    T11: { status: input.apiRouteCount > 0 ? "applicable" : "not-applicable", note: input.hasOpenApi ? "Existing API description should be validated against real routes." : input.apiRouteCount > 0 ? "Real API routes detected; document only verified operations." : "No real API routes detected." },
    T12: { status: input.apiRouteCount > 0 || input.hasOpenApi ? "verify-current-spec" : "optional", note: "A2A/MCP/WebMCP/UCP/ACP formats are volatile; verify current official specs before code." },
    T13: { status: "optional", note: "Digital PR requires a real newsworthy asset, recipient and evidence; never fabricate outreach facts." },
    T14: { status: input.hasConversionSurface ? "applicable" : "optional", note: input.hasConversionSurface ? "Conversion surfaces detected; map intent to real CTAs/offers/forms." : "Use only when real funnel/conversion surfaces exist." },
    T15: { status: "required", note: "Every release records deterministic/external checks as pass, fail or not-run." },
    T16: { status: "required", note: "Every completed SEO project needs an evidence-based final report and 30/60/90 roadmap." },
  };
}
