export const SEO_MODULES_M1_M8_VERSION = "2026-10";

export const SEO_M1_M8_CAPABILITIES = {
  m1SearchAndAiAnswers: {
    classicPipeline: [
      "Discover through links and sitemaps, crawl, render, index/canonicalize/dedupe, then rank on relevance, quality, authority, page experience and freshness where applicable.",
      "Important public content, links, metadata and structured data should be available in initial/server-rendered HTML where practical because rendering can be delayed and many AI fetchers do not reliably execute JavaScript.",
      "Indexation and ranking for query-fan-out subqueries are prerequisites for strong GEO eligibility; do not treat GEO as a replacement for SEO.",
    ],
    generativeRetrieval: [
      "Model query fan-out: one conversational prompt may become many subqueries; optimize topical completeness, related constraints, comparisons and persona/use-case coverage instead of chasing one phrase.",
      "Treat third-party corroboration as an authority/trust input: consistent real claims across press, reviews, forums, directories, video and partner sources can help systems reconcile entities. Never fabricate corroboration.",
      "Different answer engines can use different indexes/crawlers. Preserve eligibility for Googlebot, Bingbot and owner-approved AI search crawlers while keeping training/search/user-triggered bot purposes distinct.",
    ],
    eeatTrust: [
      "Trust is the controlling E-E-A-T concern. Look for real authors, bios, credentials, sources, editorial/review policy, contact/ownership details, first-party evidence, dates and methodology.",
      "YMYL finance/health/legal/safety/civic content needs the highest sourcing, authorship, review and disclaimer discipline.",
    ],
    spamBlocks: [
      "Block scaled low-value content abuse, site-reputation abuse, expired-domain abuse, link spam, cloaking, doorway pages, hidden text, scraping, thin affiliate content, UGC spam and attempts to manipulate generative AI answers.",
    ],
  },
  m2TechnicalSeo: {
    crawlIndex: [
      "Indexable pages should resolve as 200, use the intended self-canonical, remain crawlable, and avoid noindex. Utility/private/filter pages may be noindex/disallowed only with a coherent crawl/index strategy.",
      "Never disallow a URL that must be crawled to observe a noindex directive.",
      "Use 301/308 for permanent moves, avoid chains/loops, update internal links to final targets, and use 404/410 for genuinely removed resources rather than soft-404 pages.",
      "Canonicals must be absolute, coherent with hreflang/sitemaps, and must not target redirected/noindex/blocked URLs. Paginated URLs generally self-canonicalize and must remain crawlable through real links.",
      "Faceted navigation should expose only facets with real search/user value and unique content; normalize parameter order and constrain crawl traps.",
      "Prefer SSR/SSG for public content, links, metadata and structured data. Internal navigation should expose real anchor href targets instead of click-handler-only navigation.",
      "Use HTTPS consistently, one canonical host, no mixed content, and appropriate HSTS at deployment/CDN level.",
      "Monitor 5xx, crawl stats, soft 404s and discovered/crawled-not-indexed patterns when Search Console/log data is actually available.",
    ],
    international: [
      "hreflang requires self-reference, reciprocal alternates, valid language-region codes and x-default where appropriate; it must agree with canonicalization.",
      "Use distinct locale URLs and avoid bot-blocking IP auto-redirects. Localize currency, units, examples, regulations and search language rather than mechanically translating thin pages.",
    ],
    architecture: [
      "Prefer a flat logical hierarchy, descriptive stable lowercase-hyphenated slugs, breadcrumbs, hubs linking cluster members, contextual descriptive anchors and no orphan pages.",
      "For large sites consider an HTML sitemap where it genuinely helps users/crawlers.",
    ],
    mobileAccessibility: [
      "Responsive pages should expose equivalent primary content on mobile/desktop, usable tap targets and readable text.",
      "Use semantic header/nav/main/article/section/footer structure, native labels for controls, meaningful alt text and ARIA only when native HTML cannot express the semantics.",
    ],
    migrations: [
      "For URL/site migrations map every old URL to the best new equivalent with 301 redirects, preserve equivalent intent/content, update internal links and sitemaps, and avoid stacking domain/design/URL changes when risk can be reduced.",
      "Keep an old sitemap available temporarily when useful and monitor coverage/traffic after launch when real measurement data is available.",
    ],
    logAnalysis: [
      "When logs exist, analyze crawl waste, bot distribution, 4xx/5xx to bots, orphan URLs being fetched and which AI bots request which sections. Do not invent log findings.",
    ],
  },
  m3OnPage: {
    titles: [
      "Unique per URL, intent-matched, roughly 50-60 characters/around 600px as a practical target, primary topic early, clear differentiator, brand last unless branded intent.",
      "Informational formula: {Topic}: {plain-language promise} ({Year only if truly time-sensitive and updated}).",
      "Commercial formula: Best {Category} for {Persona/Use case} ({Year only if current}) – Tested/Compared only when testing/comparison evidence really exists.",
      "Transactional formula: {Product} – {real key attribute}, {real price/offer if verified} | {Brand}.",
      "Tool formula: {Tool name}: Free {what it really computes} Calculator, only when free/calculator facts are true.",
    ],
    descriptions: [
      "Aim for roughly 120-160 characters, page-specific value + real proof/next step + soft CTA. Include the primary topic naturally. Search engines may rewrite descriptions.",
      "Do not emit meta keywords.",
    ],
    headingsContent: [
      "Use one clear H1 for topic/intent, H2s for real subquestions, H3s for detail. Keep headings descriptive.",
      "Answer the main question in the first screen, then add evidence, examples, original/first-hand information, comparisons, caveats and next steps.",
      "Seek information gain: original verified numbers, tested findings, expert quotes, templates, calculators or other genuinely differentiated value. Never fabricate it.",
      "Show updated dates only when meaningful content actually changed.",
    ],
    urlsMediaLinks: [
      "Use short readable stable URLs with lowercase/hyphens and avoid evergreen dates/session IDs unless architecture already requires otherwise.",
      "Images/video: descriptive filenames, truthful alt, width/height, modern formats where supported, captions/transcripts where useful, and video/image sitemap/schema only when relevant.",
      "Contextual internal links should connect hubs/siblings with descriptive anchors and fix orphaning; do not force arbitrary link-count targets where pages differ.",
      "Open Graph/Twitter metadata controls previews and can aid some agents but is not a direct Google ranking factor.",
      "Head baseline: html lang, charset, viewport, title, description, canonical when known, robots only when non-default, hreflang when real, OG/Twitter, JSON-LD when justified, critical preconnects only when needed, favicon.",
    ],
  },
  m4ContentStrategyEeat: {
    topicClusters: [
      "Model one pillar/hub plus supporting long-tail/question/comparison/tool/glossary pages around a coherent entity/topic, with bidirectional internal linking and revenue/user-value alignment.",
      "Do not force a fixed number of support pages; the source module's 8-30 range is a planning heuristic, not a quota.",
    ],
    intentTypes: [
      "Informational -> guides/glossaries/explainers/data studies; commercial -> comparisons/reviews/alternatives/case studies; transactional -> product/service/pricing/demo pages; navigational -> brand/login/support/docs.",
    ],
    briefs: [
      "Content brief fields: target query + intent, audience, unique angle, required entities/facts, sources, questions, outline, internal links, schema, CTA, author/reviewer and update cadence.",
    ],
    originalityScaleFreshness: [
      "Before publishing ask whether the page adds something not already present, has first-hand/expert review, sources every statistic/date, and remains useful without search-engine traffic.",
      "Scale research/drafting/QA cautiously; require real unique value and an editorial quality gate. If uniqueness cannot be stated in one sentence, do not recommend publishing.",
      "Refresh decaying facts such as prices/rules/versions/rankings on evidence-based schedules, keep URLs stable and make changelog/update dates honest.",
    ],
    trustYmyL: [
      "YMYL pages require named real credentialed authors/reviewers when available, primary sources, timestamps, risk disclosures, region-specific context and no individualized advice.",
      "Trust-page inventory can include About, Contact, Editorial policy, Authors, Privacy, Terms, ecommerce Returns/Shipping, Pricing, Security and Press when appropriate to the business.",
    ],
  },
  m5KeywordResearch: {
    hardConstraint:
      "The model can generate candidates, classify/cluster/map them, but search volume and difficulty must be null unless supplied by a real keyword/Search Console/rank data source.",
    sourcesInPriorityOrder: [
      "Search Console queries",
      "site-search logs/support tickets/sales calls/reviews",
      "Google autocomplete/related searches",
      "People Also Ask",
      "competitor ranking pages/headings",
      "forums/Reddit/Quora/niche communities/YouTube suggestions",
      "keyword tools/APIs",
      "real conversational AI prompts from customers",
    ],
    taxonomy: [
      "short-tail/head",
      "mid-tail",
      "long-tail",
      "question",
      "conversational prompt",
      "branded",
      "competitor-branded",
      "local",
      "comparison",
      "transactional",
      "navigational",
    ],
    expansion: {
      seeds: [
        "product/service",
        "problem",
        "outcome",
        "audience",
        "entity",
        "tool",
        "standard",
        "location",
      ],
      intentModifiers: [
        "what is",
        "meaning",
        "definition",
        "examples",
        "how to",
        "steps",
        "guide",
        "tutorial",
        "tips",
        "checklist",
        "template",
        "calculator",
        "formula",
        "cost",
        "price",
        "free",
        "best",
        "top",
        "vs",
        "alternative",
        "review",
        "comparison",
        "pros and cons",
        "worth it",
        "for beginners",
        "for persona",
        "for industry",
        "near me",
        "online",
        "app",
        "software",
        "tool",
        "course",
        "jobs",
        "salary",
        "mistakes",
        "problems",
        "not working",
        "why",
        "when",
        "who",
        "can I",
        "should I",
        "is it legal",
      ],
      time: [
        "today",
        "this week",
        "latest",
        "news",
        "2026",
        "update",
        "forecast",
        "schedule",
        "calendar",
      ],
      geo: ["country", "state", "city", "neighborhood", "native language variants", "currency"],
      funnel: ["awareness", "consideration", "decision", "retention"],
    },
    clusteringMapping: [
      "Use shared-SERP overlap when real SERP data exists (>=3 of top 10 URLs can be treated as strong evidence that queries may share one page); otherwise cluster by intent/entity from available evidence.",
      "Map one primary query/intent and a limited set of genuinely related secondary terms per page; record cannibalization conflicts.",
      "Prioritization without real data uses business value, intent match, winnability estimate only when evidence exists, and effort. Never fabricate volume/KD/rank.",
      "Quick-win logic using positions 8-20 or high-impression/low-CTR requires actual Search Console data.",
    ],
    outputFields: [
      "keyword",
      "type",
      "intent",
      "funnelStage",
      "cluster",
      "targetUrl",
      "role",
      "serpFeatures",
      "volume",
      "difficulty",
      "source",
      "priority",
    ],
    multilingual:
      "Research natively per language/locale; do not merely translate keywords. Use separate locale pages and real hreflang only when equivalents exist.",
  },
  m6StructuredData: {
    principles: [
      "Prefer server-rendered JSON-LD. Use one coherent @graph per page where practical and stable absolute @ids tied to the real canonical host/page.",
      "Markup must match visible/verified content. Use ISO 8601 dates, absolute URLs, real images/dimensions, sameAs only for official profiles and inLanguage where known.",
      "Google-supported rich-result types and broader schema.org entity modeling are different concerns; never claim a rich result merely because schema exists.",
    ],
    typeSelection: {
      everyPage: [
        "WebPage or subtype",
        "BreadcrumbList where breadcrumbs exist",
        "WebSite",
        "Organization reference",
      ],
      home: [
        "Organization",
        "WebSite",
        "LocalBusiness subtype only if the business is genuinely local and facts exist",
      ],
      blogNews: ["Article", "BlogPosting", "NewsArticle", "Person author"],
      aboutAuthor: ["AboutPage", "ProfilePage", "Person"],
      product: ["Product", "Offer", "Brand", "AggregateRating only for real visible reviews"],
      local: [
        "LocalBusiness subtype",
        "PostalAddress",
        "GeoCoordinates",
        "openingHoursSpecification",
      ],
      software: [
        "SoftwareApplication",
        "WebApplication",
        "Offer only when a real offer is visible",
      ],
      data: ["Dataset", "DataDownload"],
      video: ["VideoObject"],
      event: ["Event"],
      jobs: ["JobPosting only for real postings"],
      qa: ["FAQPage/QAPage only for visible Q&A; do not promise Google FAQ rich results"],
      steps: ["HowTo optional for other consumers; no Google rich-result promise"],
      review: ["Review only when genuine and not self-serving prohibited markup"],
    },
    avoid: [
      "aggregateRating without real visible reviews",
      "self-serving Review markup",
      "hidden/invented prices",
      "duplicate/conflicting Organization entities",
      "JSON-LD/microdata describing conflicting facts",
    ],
    validation: [
      "Google Rich Results Test for currently supported features",
      "Schema Markup Validator for schema.org",
      "Search Console enhancement reports where available",
      "crawl-wide consistency extraction",
    ],
  },
  m7Aeo: {
    goal: "Make correct source-grounded definitions, lists, steps, comparisons, numbers and yes/no answers easy to extract without degrading human readability.",
    patterns: {
      definition:
        "H2 question -> 1-2 sentence definition starting with the term, then context/examples/related terms.",
      howTo:
        "H2 how-to -> one-sentence summary, numbered verb-led steps, tools/time/warnings only when verified.",
      list: "H2 list -> short intro, concise labeled items with explanations; do not invent 'best' rankings without evidence.",
      comparison:
        "H2 A vs B -> source-grounded summary/verdict only when evidence supports it, then a consistent-attribute table and use-case guidance.",
      numberFact: "State verified value + unit + date/version + source in the first sentence.",
      yesNo: "Answer Yes/No only when source evidence supports it, then conditions/nuance.",
    },
    rules: [
      "Direct answer first is editorial clarity, not an AI trick. Do not artificially fragment/chunk prose.",
      "Match real question wording in headings where useful. Keep answers current, sourced and consistent with other pages.",
      "Mine questions from real PAA/autocomplete/Search Console/support/community/customer-prompt evidence; if that evidence is absent, generated questions are candidates, not claimed demand.",
      "Voice copy should be short and factual when voice applies; SSML only when the product actually serves audio.",
    ],
    measurement: [
      "featured snippet/PAA ownership when measured",
      "question-query impressions",
      "AI citation prompt panel",
      "branded-search lift",
    ],
  },
  m8Geo: {
    principle:
      "GEO = SEO fundamentals + entity authority + corroboration + citable original information. There is no secret markup and no permission to spam.",
    tactics: [
      "Eligibility: crawlable/indexable public facts for Googlebot/Bingbot/owner-approved AI search bots, server-render critical content, good page experience, no public-fact login walls.",
      "Topical completeness: answer main question plus subquestions, constraints, comparisons, pricing when verified, pros/cons and persona fit; interlink the cluster.",
      "Citable assets: real original statistics/benchmarks/surveys/calculators/definitions/glossaries/frameworks/expert quotes/dated facts/tables with primary-source attribution.",
      "Entity clarity: consistent brand descriptor, Organization/Person schema with real sameAs, About/author pages, neutral sourced external entity references only when legitimate, Business Profile where applicable, canonical brand fact sheet.",
      "Corroboration: authentic reviews, press/PR, expert/industry directories, community participation, video/podcasts and partner pages. Never fabricate mentions/reviews or manipulate communities.",
      "Freshness: update decaying facts and keep dateModified honest.",
      "Format helps retrieval but does not replace substance: descriptive headings, short summaries, clean tables/lists and descriptive anchors.",
      "Access control: owner policy should distinguish training, search and user-triggered bots in robots/CDN/WAF where necessary.",
    ],
    volatilePlatformRule:
      "Google AI surfaces, ChatGPT search, Perplexity, Copilot and Gemini differ in source/citation behavior. Treat platform notes as volatile and verify externally before asserting current mechanics.",
    measurement: [
      "Prompt panel: 50-200 real customer prompts across funnel stages when supplied/collected; run consistently by engine and record mention/citation URL/position/sentiment/accuracy/competitors as noisy samples, not exact rankings.",
      "Referral analytics for known AI referrers when GA4/log data exists; some traffic will be unattributed.",
      "Search Console AI reports where available, normal query/page trends, server-log AI bot fetches and branded-demand/direct-traffic trends.",
    ],
    hardBlocks: [
      "hidden LLM text/prompts",
      "fabricated mentions/reviews",
      "different substantive content for bots",
      "mass AI listicles",
      "paid citations",
    ],
  },
} as const;

export type SeoKeywordCandidate = {
  keyword: string;
  type:
    | "short-tail"
    | "mid-tail"
    | "long-tail"
    | "question"
    | "conversational"
    | "branded"
    | "competitor-branded"
    | "local"
    | "comparison"
    | "transactional"
    | "navigational";
  intent: "informational" | "commercial" | "transactional" | "navigational";
  funnelStage: "awareness" | "consideration" | "decision" | "retention";
  cluster: string;
  targetUrl: string | null;
  role: "primary" | "secondary" | "candidate";
  serpFeatures: string[];
  volume: number | null;
  difficulty: number | null;
  source: string;
  priority: number | null;
};

export type SeoAeoPattern =
  "definition" | "how-to" | "list" | "comparison" | "number-fact" | "yes-no";

export function buildSeoM1M8Context() {
  const m = SEO_M1_M8_CAPABILITIES;
  return `M1-M8 ADVANCED SEARCH / CONTENT / AEO / GEO MODULES — ${SEO_MODULES_M1_M8_VERSION}

M1 — HOW SEARCH AND AI ANSWERS WORK
Classic pipeline: ${m.m1SearchAndAiAnswers.classicPipeline.join(" ")}
Generative retrieval: ${m.m1SearchAndAiAnswers.generativeRetrieval.join(" ")}
E-E-A-T/Trust: ${m.m1SearchAndAiAnswers.eeatTrust.join(" ")}
Spam blocks: ${m.m1SearchAndAiAnswers.spamBlocks.join(" ")}

M2 — TECHNICAL SEO
Crawl/index: ${m.m2TechnicalSeo.crawlIndex.join(" ")}
International: ${m.m2TechnicalSeo.international.join(" ")}
Architecture: ${m.m2TechnicalSeo.architecture.join(" ")}
Mobile/accessibility: ${m.m2TechnicalSeo.mobileAccessibility.join(" ")}
Migrations: ${m.m2TechnicalSeo.migrations.join(" ")}
Log analysis: ${m.m2TechnicalSeo.logAnalysis.join(" ")}

M3 — ON-PAGE SEO
Titles: ${m.m3OnPage.titles.join(" ")}
Descriptions: ${m.m3OnPage.descriptions.join(" ")}
Headings/content: ${m.m3OnPage.headingsContent.join(" ")}
URLs/media/internal links/head: ${m.m3OnPage.urlsMediaLinks.join(" ")}

M4 — CONTENT STRATEGY + E-E-A-T
Topic clusters: ${m.m4ContentStrategyEeat.topicClusters.join(" ")}
Intent/content types: ${m.m4ContentStrategyEeat.intentTypes.join(" ")}
Briefs: ${m.m4ContentStrategyEeat.briefs.join(" ")}
Originality/scale/freshness: ${m.m4ContentStrategyEeat.originalityScaleFreshness.join(" ")}
Trust/YMYL: ${m.m4ContentStrategyEeat.trustYmyL.join(" ")}

M5 — KEYWORD RESEARCH
Hard rule: ${m.m5KeywordResearch.hardConstraint}
Sources in priority order: ${m.m5KeywordResearch.sourcesInPriorityOrder.join(" -> ")}.
Taxonomy: ${m.m5KeywordResearch.taxonomy.join(", ")}.
Clustering/mapping: ${m.m5KeywordResearch.clusteringMapping.join(" ")}
Output fields: ${m.m5KeywordResearch.outputFields.join(", ")}. Multilingual: ${m.m5KeywordResearch.multilingual}
When generating keyword candidates without real tools, ALWAYS set volume=null, difficulty=null and do not imply observed SERP features/rankings.

M6 — STRUCTURED DATA
Principles: ${m.m6StructuredData.principles.join(" ")}
Type selection: ${JSON.stringify(m.m6StructuredData.typeSelection)}
Avoid: ${m.m6StructuredData.avoid.join("; ")}.
Validation: ${m.m6StructuredData.validation.join("; ")}.

M7 — AEO
Goal: ${m.m7Aeo.goal}
Patterns: ${JSON.stringify(m.m7Aeo.patterns)}
Rules: ${m.m7Aeo.rules.join(" ")}
Measurement only when real data exists: ${m.m7Aeo.measurement.join(", ")}.

M8 — GEO
Principle: ${m.m8Geo.principle}
Tactics: ${m.m8Geo.tactics.join(" ")}
Platform volatility: ${m.m8Geo.volatilePlatformRule}
Measurement: ${m.m8Geo.measurement.join(" ")}
Hard blocks: ${m.m8Geo.hardBlocks.join(", ")}.

EXECUTION REQUIREMENT
For every project, use M1 to model eligibility/query fan-out/trust, M2 for technical architecture and crawl/index safety, M3 for page implementation, M4 for content quality/E-E-A-T, M5 for candidate classification and page mapping, M6 for schema selection/validation, M7 for answer extraction patterns, and M8 for entity/corroboration/citable-asset strategy. Never silently skip a module: if a module cannot act because evidence/tools are missing, record it as NOT-RUN/UNKNOWN rather than fabricating data.`;
}
