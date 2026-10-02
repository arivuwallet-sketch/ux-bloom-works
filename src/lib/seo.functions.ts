import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  auditSeoProject,
  buildSeoIntelligenceContext,
  isSeoBearingFile,
  type SeoAudit,
  type SeoAuditFile,
} from "@/lib/seo-intelligence";
import { validateSeoTemplateArtifact, type SeoTemplateId, type SeoT1T16CoverageStatus } from "@/lib/seo-output-templates-t1-t16";
import { isArticleLikePath } from "@/lib/seo-blog-writer";

const TEXT_EXT = /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|ya?ml|toml|webmanifest)$/i;
const MAX_PLAN_CONTEXT_CHARS = 140_000;
const MAX_FILE_CONTEXT_CHARS = 120_000;
const SEO_MODELS = ["openai/gpt-6-astra", "google/gemini-2.5-flash"] as const;
const TRANSIENT_STATUS = new Set([408, 429, 500, 502, 503, 504]);

type SourceMode = "original" | "redesigned";
type GatewayMessage = { role: "system" | "user" | "assistant"; content: string };

type ProjectSourceFile = {
  id: string;
  name: string;
  content: string | null;
  redesigned_content: string | null;
  storage_path: string | null;
  size_bytes: number | null;
  updated_at: string;
};

type HydratedSeoFile = {
  id: string;
  name: string;
  content: string;
  sourceMode: SourceMode;
};

export type SeoResultRow = {
  project_file_id: string;
  status: string;
  seo_content: string | null;
  error: string | null;
  source_signature: string;
};

export type SeoProjectPlan = {
  version: 2;
  summary: string;
  siteIdentity: {
    product: string;
    audience: string;
    primaryTopics: string[];
  };
  protectedInvariants: string[];
  technicalStrategy: {
    metadata: string[];
    crawlability: string[];
    indexability: string[];
    structuredData: string[];
    internalLinking: string[];
    semantics: string[];
    social: string[];
    accessibility: string[];
    performance: string[];
  };
  filePlans: Array<{
    file: string;
    intent: string;
    actions: string[];
    preserve: string[];
  }>;
  templateExecution: Array<{
    id: SeoTemplateId;
    status: SeoT1T16CoverageStatus;
    target: string | null;
    reason: string;
  }>;
  transformationOrder: string[];
  risks: string[];
};

export type SeoStatePlan = {
  status: string;
  source_mode: SourceMode;
  source_signature: string;
  plan: SeoProjectPlan | Record<string, never>;
  audit_before: SeoAudit | null;
  audit_after: SeoAudit | null;
  score_before: number | null;
  score_after: number | null;
  error: string | null;
  updated_at: string;
};

export type SeoProjectState = {
  schemaReady: boolean;
  plan: SeoStatePlan | null;
  files: SeoResultRow[];
  completed: number;
  totalResults: number;
  error: string | null;
};

type SeoQaResult = { pass: boolean; issues: string[] };

function isTextFile(name: string) {
  return TEXT_EXT.test(name) || /(^|\/)robots\.txt$/i.test(name);
}

function extensionOf(name: string) {
  return name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
}

function stripOuterFence(value: string) {
  return value.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "").trim();
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 80);
}

function normalizeName(value: string) {
  return value.replace(/\\/g, "/").replace(/^\.\//, "");
}

function stableHash(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${hash.toString(16).padStart(8, "0")}-${value.length.toString(16)}`;
}

function sourceSignature(files: HydratedSeoFile[], mode: SourceMode) {
  const payload = [
    `mode:${mode}`,
    ...files
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((file) => `${normalizeName(file.name)}:${stableHash(file.content)}`),
  ].join("\n");
  return stableHash(payload);
}

function redactSensitiveSource(value: string) {
  return value
    .replace(/((?:api[_-]?key|secret|token|password|private[_-]?key|service[_-]?role)[\w-]*\s*[:=]\s*["'`])([^"'`\n]+)(["'`])/gi, "$1[REDACTED]$3")
    .replace(/(Authorization\s*:\s*["'`]Bearer\s+)([^"'`\n]+)(["'`])/gi, "$1[REDACTED]$3");
}

function clipSource(value: string, limit: number) {
  const clean = redactSensitiveSource(value);
  if (clean.length <= limit) return clean;
  const head = Math.floor(limit * 0.72);
  const tail = limit - head;
  return `${clean.slice(0, head)}\n/* ... source clipped for AI context ... */\n${clean.slice(-tail)}`;
}

function visualFingerprint(source: string) {
  const visualLine = /class(Name)?\s*=|\bstyle\s*=|\bsx\s*=|styled\.|css`|@media|@container|--[\w-]+\s*:|\b(?:display|position|grid|flex|gap|padding|margin|width|height|min-width|max-width|min-height|max-height|color|background|font|line-height|letter-spacing|border|border-radius|box-shadow|filter|opacity|transform|transition|animation|align-items|justify-content|place-items|overflow)\s*:/i;
  return Array.from(
    new Set(
      source
        .split(/\r?\n/)
        .map((line) => line.trim().replace(/\s+/g, " "))
        .filter((line) => line.length >= 6 && line.length <= 700 && visualLine.test(line)),
    ),
  );
}

function visualCarryoverRatio(source: string, output: string) {
  const before = visualFingerprint(source);
  if (before.length < 8) return 1;
  const after = new Set(visualFingerprint(output));
  return before.filter((line) => after.has(line)).length / before.length;
}

function existingLinkTargets(source: string) {
  const values = new Set<string>();
  for (const match of source.matchAll(/(?:href|to)\s*=\s*["']([^"']+)["']/g)) {
    if (match[1]) values.add(match[1]);
  }
  return values;
}

function validateSeoOutput(name: string, source: string, candidate: string) {
  const output = stripOuterFence(candidate);
  if (!output) throw new Error("SEO agent returned an empty file");
  if (source.length > 4_000 && output.length < source.length * 0.7) {
    throw new Error("SEO agent output looks truncated");
  }
  if (/^(here(?:'s| is)|sure[,!]|i(?:'ve| have) (?:optimized|updated|rewritten))/i.test(output)) {
    throw new Error("SEO agent returned commentary instead of source code");
  }

  const ext = extensionOf(name);
  if (ext === "json") {
    try {
      JSON.parse(output);
    } catch {
      throw new Error("SEO agent returned invalid JSON");
    }
  }
  if (!["md", "mdx", "txt"].includes(ext) && /^```/.test(output)) {
    throw new Error("SEO agent returned markdown instead of source code");
  }

  validateSeoTemplateArtifact(name, output);

  const carryover = visualCarryoverRatio(source, output);
  if (carryover < 0.88) {
    throw new Error(`SEO-only safety gate detected too much presentation change (${Math.round(carryover * 100)}% visual-line carryover)`);
  }

  const beforeLinks = existingLinkTargets(source);
  if (beforeLinks.size >= 3) {
    const afterLinks = existingLinkTargets(output);
    const retained = [...beforeLinks].filter((target) => afterLinks.has(target)).length / beforeLinks.size;
    if (retained < 0.85) throw new Error("SEO agent removed or changed too many existing link destinations");
  }
  return output;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGateway(messages: GatewayMessage[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  let lastError = "SEO AI request failed";

  for (const model of SEO_MODELS) {
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
          lastError = response.status === 429 ? "SEO AI rate limit reached" : `SEO AI request failed (${response.status})`;
          if (TRANSIENT_STATUS.has(response.status) && attempt === 0) {
            await sleep(700);
            continue;
          }
          if ([400, 404, 422, 429, 500, 502, 503, 504].includes(response.status)) break;
          throw new Error(lastError);
        }
        const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = json.choices?.[0]?.message?.content?.trim() ?? "";
        if (!content) throw new Error("SEO AI returned an empty response");
        return content;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") lastError = "SEO AI request timed out";
        else if (error instanceof Error) lastError = error.message;
        if (lastError === "AI credits exhausted.") throw new Error(lastError);
        if (attempt === 0) {
          await sleep(500);
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

function normalizeSeoPlan(raw: string, files: HydratedSeoFile[], audit: SeoAudit): SeoProjectPlan {
  const known = new Set(files.map((file) => normalizeName(file.name)));
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(stripOuterFence(raw)) as Record<string, unknown>;
  } catch {
    throw new Error("SEO planner returned invalid JSON");
  }

  const identity = (parsed["siteIdentity"] && typeof parsed["siteIdentity"] === "object" ? parsed["siteIdentity"] : {}) as Record<string, unknown>;
  const strategy = (parsed["technicalStrategy"] && typeof parsed["technicalStrategy"] === "object" ? parsed["technicalStrategy"] : {}) as Record<string, unknown>;
  const rawPlans = Array.isArray(parsed["filePlans"]) ? parsed["filePlans"] : [];
  const filePlans: SeoProjectPlan["filePlans"] = [];
  for (const entry of rawPlans) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const file = normalizeName(safeString(row["file"]));
    if (!file || !known.has(file)) continue;
    filePlans.push({
      file,
      intent: safeString(row["intent"], "Preserve the page purpose while improving evidence-backed technical SEO."),
      actions: stringArray(row["actions"]),
      preserve: stringArray(row["preserve"]),
    });
  }

  const templateIds: SeoTemplateId[] = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12","T13","T14","T15","T16"];
  const allowedStatuses = new Set<SeoT1T16CoverageStatus>(["required", "applicable", "optional", "not-applicable", "verify-current-spec"]);
  const rawTemplateRows = Array.isArray(parsed["templateExecution"]) ? parsed["templateExecution"] : [];
  const templateRows = new Map<SeoTemplateId, Record<string, unknown>>();
  for (const entry of rawTemplateRows) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const id = safeString(row["id"]) as SeoTemplateId;
    if (templateIds.includes(id)) templateRows.set(id, row);
  }
  const templateExecution: SeoProjectPlan["templateExecution"] = templateIds.map((id) => {
    const row = templateRows.get(id);
    const fallback = audit.summary.templateCoverage[id];
    const requestedStatus = safeString(row?.["status"]) as SeoT1T16CoverageStatus;
    const status = allowedStatuses.has(requestedStatus) ? requestedStatus : fallback.status;
    const target = safeString(row?.["target"]);
    return {
      id,
      status,
      target: target && !target.includes("<<") ? target : null,
      reason: safeString(row?.["reason"], fallback.note),
    };
  });

  const requestedOrder = stringArray(parsed["transformationOrder"]).map(normalizeName).filter((file) => known.has(file));
  return {
    version: 2,
    summary: safeString(parsed["summary"], "Project-wide SEO plan grounded in the uploaded source and deterministic audit."),
    siteIdentity: {
      product: safeString(identity["product"], "Unknown product"),
      audience: safeString(identity["audience"], "Not safely inferable from source"),
      primaryTopics: stringArray(identity["primaryTopics"]),
    },
    protectedInvariants: stringArray(parsed["protectedInvariants"]),
    technicalStrategy: {
      metadata: stringArray(strategy["metadata"]),
      crawlability: stringArray(strategy["crawlability"]),
      indexability: stringArray(strategy["indexability"]),
      structuredData: stringArray(strategy["structuredData"]),
      internalLinking: stringArray(strategy["internalLinking"]),
      semantics: stringArray(strategy["semantics"]),
      social: stringArray(strategy["social"]),
      accessibility: stringArray(strategy["accessibility"]),
      performance: stringArray(strategy["performance"]),
    },
    filePlans,
    templateExecution,
    transformationOrder: Array.from(new Set([...requestedOrder, ...files.map((file) => normalizeName(file.name))])),
    risks: stringArray(parsed["risks"]),
  };
}

function planningSnapshot(files: HydratedSeoFile[]) {
  let used = 0;
  const parts: string[] = [];
  for (const file of files) {
    if (!file.content.trim() || used >= MAX_PLAN_CONTEXT_CHARS) continue;
    const remaining = MAX_PLAN_CONTEXT_CHARS - used;
    const excerpt = clipSource(file.content, Math.min(5_500, remaining));
    const section = `FILE: ${normalizeName(file.name)}\nSEO-BEARING: ${isSeoBearingFile(file.name, file.content) ? "yes" : "no"}\nSOURCE:\n${excerpt}`;
    parts.push(section);
    used += section.length;
  }
  return parts.join("\n\n---\n\n");
}

async function generateSeoPlan(opts: {
  project: { name: string; productType: string | null; notes: string | null };
  files: HydratedSeoFile[];
  audit: SeoAudit;
  sourceMode: SourceMode;
}) {
  const schema = `Return ONLY JSON in this shape:
{
  "version": 2,
  "summary": "short project SEO strategy",
  "siteIdentity": {"product":"source-grounded product identity","audience":"source-grounded audience or unknown","primaryTopics":["real topic"]},
  "protectedInvariants": ["existing routes/URLs/functional or visual SEO invariants"],
  "technicalStrategy": {
    "metadata": ["rule"], "crawlability": ["rule"], "indexability": ["rule"],
    "structuredData": ["rule"], "internalLinking": ["rule"], "semantics": ["rule"],
    "social": ["rule"], "accessibility": ["rule"], "performance": ["rule"]
  },
  "filePlans": [{"file":"known/file","intent":"real page/search intent inferred only from source","actions":["specific safe SEO action"],"preserve":["specific invariant"]}],
  "templateExecution": [{"id":"T1","status":"required","target":"project-plan or exact real/generated path or null","reason":"why this T1-T16 contract applies"}],
  "transformationOrder": ["known/file"],
  "risks": ["risk"]
}`;
  const baseMessages: GatewayMessage[] = [
    {
      role: "system",
      content:
        "You are Rezyn SEO Architect. Build one authoritative project-wide SEO plan before any SEO edits happen. Use only uploaded source, the deterministic audit and project metadata. Never claim rankings, search volume, traffic, competitors, user research or keyword demand unless supplied in source. Do not invent URLs, facts, reviews, ratings, prices, authors, FAQ answers, company details or structured-data properties. SEO-only work must preserve the visual design exactly; redesigned-source work must preserve the new visual design exactly. Prefer framework-native metadata patterns already present in the project. Do not reveal chain-of-thought. Return JSON only.\n\n" + buildSeoIntelligenceContext(),
    },
    {
      role: "user",
      content: [
        `PROJECT: ${opts.project.name}`,
        `PRODUCT TYPE: ${opts.project.productType ?? "Unknown"}`,
        `NOTES: ${opts.project.notes?.trim() || "None"}`,
        `SOURCE MODE: ${opts.sourceMode}`,
        "",
        "DETERMINISTIC SEO AUDIT:", JSON.stringify(opts.audit, null, 2),
        "", "PROJECT SOURCE EVIDENCE:", planningSnapshot(opts.files),
        "", schema,
      ].join("\n"),
    },
  ];

  let lastError = "SEO planning failed";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const messages = attempt === 0
        ? baseMessages
        : [...baseMessages, { role: "system" as const, content: `Previous output was invalid: ${lastError}. Return complete valid JSON using only known file paths.` }];
      return normalizeSeoPlan(await callGateway(messages), opts.files, opts.audit);
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }
  throw new Error(lastError);
}

async function seoQa(opts: { name: string; source: string; candidate: string; plan: SeoProjectPlan }): Promise<SeoQaResult> {
  const raw = await callGateway([
    {
      role: "system",
      content:
        "You are an independent SEO release reviewer. Reject if the candidate changes visual design, layout, styling, business logic, routes, working links, factual claims or user-facing meaning unnecessarily; invents SEO facts/schema data; keyword-stuffs; adds unsupported canonicals/hreflang/URLs; leaves unresolved template placeholders; or violates the project SEO plan or T1-T16 output contracts. Approve safe semantic HTML, metadata, accurate alt/accessibility improvements, framework-native SEO configuration and structured data strictly grounded in source. Return ONLY JSON: {\"pass\":true|false,\"issues\":[\"release blocker\"]}. Do not reveal chain-of-thought.\n\n" + buildSeoIntelligenceContext(),
    },
    {
      role: "user",
      content: `FILE: ${opts.name}\n\nPROJECT SEO PLAN:\n${JSON.stringify(opts.plan)}\n\nINPUT SOURCE:\n${clipSource(opts.source, 55_000)}\n\nCANDIDATE:\n${clipSource(opts.candidate, 55_000)}`,
    },
  ]);
  try {
    const parsed = JSON.parse(stripOuterFence(raw)) as { pass?: unknown; issues?: unknown };
    return { pass: parsed.pass === true, issues: stringArray(parsed.issues).slice(0, 12) };
  } catch {
    return { pass: false, issues: ["SEO QA returned invalid JSON"] };
  }
}

async function optimizeSeoFile(opts: {
  file: HydratedSeoFile;
  project: { name: string; productType: string | null; notes: string | null };
  plan: SeoProjectPlan;
  audit: SeoAudit;
}) {
  const fileName = normalizeName(opts.file.name);
  const filePlan = opts.plan.filePlans.find((entry) => entry.file === fileName);
  const relevantIssues = opts.audit.issues.filter((issue) => issue.file === fileName || issue.file === null);
  const articleDirective = isArticleLikePath(fileName)\n    ? "\\n\\nARTICLE CONTENT DIRECTIVE: This is an article/blog/guide-like file. Apply the full SEO/GEO/AEO Blog Writer Sections 1-16 from the shared intelligence context: answer-first structure, information gain, claims-ledger discipline, entity clarity, AEO patterns, source-grounded JSON-LD/metadata, internal linking, YMYL safeguards and editorial QA. Preserve the existing page/component visual system and do not invent research or facts."\n    : "";\n  const system =\n    "You are Rezyn SEO Updater. Modify this ONE file according to the authoritative project SEO plan and measured audit. This is not a redesign. Preserve visual design, classes, CSS, layout, spacing, typography, colors, motion, component geometry, behavior, routes, APIs, state, forms, event handlers, IDs/test hooks and existing valid links. Make only source-grounded SEO/AEO/GEO improvements that belong in this file. Never invent facts, URLs, keyword metrics, rankings, reviews, ratings, prices, authors, FAQ answers or schema data. Do not add structured data unless this source contains the real facts needed for it. If an absolute canonical or sitemap URL cannot be known from source, do not fabricate one. Return the COMPLETE updated source file only, with no markdown fences or commentary.\\n\\n" + buildSeoIntelligenceContext() + articleDirective;
  const context = [
    `PROJECT: ${opts.project.name}`,
    `PRODUCT TYPE: ${opts.project.productType ?? "Unknown"}`,
    `PROJECT NOTES: ${opts.project.notes?.trim() || "None"}`,
    `FILE: ${fileName}`,
    "", "AUTHORITATIVE PROJECT SEO PLAN:", JSON.stringify(opts.plan, null, 2),
    "", "THIS FILE'S PLAN:", JSON.stringify(filePlan ?? { file: fileName, actions: ["Apply only measured, safe SEO improvements relevant to this file."] }, null, 2),
    "", "MEASURED AUDIT ISSUES RELEVANT TO THIS FILE:", JSON.stringify(relevantIssues, null, 2),
    "", "SOURCE FILE:", clipSource(opts.file.content, MAX_FILE_CONTEXT_CHARS),
  ].join("\n");

  let lastError = "SEO agent could not produce a safe update";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const messages: GatewayMessage[] = [
      { role: "system", content: system },
      { role: "user", content: context },
    ];
    if (attempt > 0) {
      messages.push({ role: "system", content: `The previous update was rejected: ${lastError}. Correct only those issues, preserve the presentation exactly and return the complete source file.` });
    }
    try {
      const candidate = validateSeoOutput(fileName, opts.file.content, await callGateway(messages));
      const qa = await seoQa({ name: fileName, source: opts.file.content, candidate, plan: opts.plan });
      if (!qa.pass) throw new Error(qa.issues.join(" | ") || "Independent SEO QA rejected the update");
      return candidate;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }
  throw new Error(lastError);
}

async function hydrateSeoFiles(supabase: any, files: ProjectSourceFile[], sourceMode: SourceMode): Promise<HydratedSeoFile[]> {
  const result: HydratedSeoFile[] = [];
  for (const entry of files) {
    let original = entry.content ?? "";
    if (!original && entry.storage_path && isTextFile(entry.name)) {
      const dl = await supabase.storage.from("project-files").download(entry.storage_path);
      if (dl.error) throw new Error(`SEO planning could not read ${entry.name}: ${dl.error.message}`);
      original = await dl.data.text();
    }
    const selected = sourceMode === "redesigned" ? (entry.redesigned_content ?? original) : original;
    result.push({ id: entry.id, name: normalizeName(entry.name), content: selected, sourceMode });
  }
  return result;
}

function schemaUnavailable(message: string) {
  return /project_seo_(?:plans|files)|relation .* does not exist|schema cache/i.test(message);
}

export const getSeoProjectState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<SeoProjectState> => {
    const db = context.supabase as any;
    const [{ data: planData, error: planError }, { data: fileData, error: filesError }] = await Promise.all([
      db.from("project_seo_plans")
        .select("status, source_mode, source_signature, plan, audit_before, audit_after, score_before, score_after, error, updated_at")
        .eq("project_id", data.projectId)
        .maybeSingle(),
      db.from("project_seo_files")
        .select("project_file_id, status, seo_content, error, source_signature")
        .eq("project_id", data.projectId),
    ]);

    if (planError || filesError) {
      const message = planError?.message ?? filesError?.message ?? "SEO schema unavailable";
      if (schemaUnavailable(message)) {
        return {
          schemaReady: false,
          plan: null,
          files: [],
          completed: 0,
          totalResults: 0,
          error: `Apply migration 0008_create_seo_agent.sql: ${message}`,
        };
      }
      throw new Error(message);
    }

    const rows = (fileData ?? []) as SeoResultRow[];
    const rawPlan = planData as SeoStatePlan | null;
    const plan: SeoStatePlan | null = rawPlan
      ? {
          ...rawPlan,
          plan: (rawPlan.plan ?? {}) as SeoProjectPlan | Record<string, never>,
          audit_before: rawPlan.audit_before ?? null,
          audit_after: rawPlan.audit_after ?? null,
        }
      : null;

    return {
      schemaReady: true,
      plan,
      files: rows,
      completed: rows.filter((row) => row.status === "done" || row.status === "skipped").length,
      totalResults: rows.length,
      error: plan?.error ?? null,
    };
  });

export const seoNextFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid(), sourceMode: z.enum(["original", "redesigned"]) }).parse(data))
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    const { data: project, error: projectError } = await db.from("projects").select("id, name, product_type, notes").eq("id", data.projectId).maybeSingle();
    if (projectError) throw new Error(projectError.message);
    if (!project) throw new Error("Project not found");

    const { data: rawFiles, error: filesError } = await db
      .from("project_files")
      .select("id, name, content, redesigned_content, storage_path, size_bytes, updated_at")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: true });
    if (filesError) throw new Error(filesError.message);
    const files = (rawFiles ?? []) as ProjectSourceFile[];
    if (files.length === 0) return { done: true as const, remaining: 0, total: 0, current: null, score: 100, planCreated: false };

    const hydrated = await hydrateSeoFiles(db, files, data.sourceMode);
    const signature = sourceSignature(hydrated, data.sourceMode);
    const beforeAudit = auditSeoProject(hydrated.map((file) => ({ name: file.name, content: file.content })));

    const { data: storedPlan, error: planReadError } = await db
      .from("project_seo_plans")
      .select("status, source_mode, source_signature, plan, audit_before, audit_after, score_before, score_after, error")
      .eq("project_id", data.projectId)
      .maybeSingle();
    if (planReadError) {
      const suffix = schemaUnavailable(planReadError.message) ? " Apply migration 0008_create_seo_agent.sql." : "";
      throw new Error(`SEO planning schema is unavailable: ${planReadError.message}.${suffix}`);
    }

    const canReuse = storedPlan && storedPlan.source_signature === signature && storedPlan.source_mode === data.sourceMode && ["ready", "optimizing", "done"].includes(storedPlan.status) && storedPlan.plan && typeof storedPlan.plan === "object";
    let plan: SeoProjectPlan;
    let planCreated = false;

    if (canReuse) {
      plan = storedPlan.plan as SeoProjectPlan;
      if (plan.version !== 2 || !Array.isArray(plan.transformationOrder) || !Array.isArray(plan.templateExecution)) {
        planCreated = true;
        plan = await generateSeoPlan({ project: { name: project.name, productType: project.product_type, notes: project.notes }, files: hydrated, audit: beforeAudit, sourceMode: data.sourceMode });
      }
    } else {
      planCreated = true;
      await db.from("projects").update({ status: "seo_planning" }).eq("id", data.projectId);
      const { error: planningWriteError } = await db.from("project_seo_plans").upsert({
        project_id: data.projectId,
        user_id: context.userId,
        status: "planning",
        source_mode: data.sourceMode,
        source_signature: signature,
        plan: {},
        audit_before: beforeAudit,
        audit_after: null,
        score_before: beforeAudit.score,
        score_after: null,
        error: null,
        updated_at: new Date().toISOString(),
      });
      if (planningWriteError) {
        const suffix = schemaUnavailable(planningWriteError.message) ? " Apply migration 0008_create_seo_agent.sql." : "";
        throw new Error(`Could not start SEO planning: ${planningWriteError.message}.${suffix}`);
      }
      await db.from("project_seo_files").delete().eq("project_id", data.projectId);
      try {
        plan = await generateSeoPlan({ project: { name: project.name, productType: project.product_type, notes: project.notes }, files: hydrated, audit: beforeAudit, sourceMode: data.sourceMode });
      } catch (error) {
        const message = error instanceof Error ? error.message : "SEO planning failed";
        await db.from("project_seo_plans").update({ status: "failed", error: message, updated_at: new Date().toISOString() }).eq("project_id", data.projectId);
        await db.from("projects").update({ status: "failed" }).eq("id", data.projectId);
        throw new Error(`SEO_PLAN_FAILED: ${message}`);
      }
    }

    if (planCreated) {
      const { error: readyError } = await db.from("project_seo_plans").upsert({
        project_id: data.projectId,
        user_id: context.userId,
        status: "ready",
        source_mode: data.sourceMode,
        source_signature: signature,
        plan,
        audit_before: beforeAudit,
        audit_after: null,
        score_before: beforeAudit.score,
        score_after: null,
        error: null,
        updated_at: new Date().toISOString(),
      });
      if (readyError) throw new Error(`Could not save SEO plan: ${readyError.message}`);
    }

    const { data: resultRows, error: resultError } = await db
      .from("project_seo_files")
      .select("project_file_id, status, seo_content, error, source_signature")
      .eq("project_id", data.projectId);
    if (resultError) throw new Error(resultError.message);
    const typedRows = (resultRows ?? []) as SeoResultRow[];
    const currentResults = new Map<string, SeoResultRow>(
      typedRows.filter((row) => row.source_signature === signature).map((row) => [row.project_file_id, row] as const),
    );

    const orderedIds = new Set<string>();
    const ordered: HydratedSeoFile[] = [];
    const byName = new Map(hydrated.map((file) => [normalizeName(file.name), file] as const));
    for (const name of plan.transformationOrder) {
      const file = byName.get(normalizeName(name));
      if (file && !orderedIds.has(file.id)) {
        ordered.push(file);
        orderedIds.add(file.id);
      }
    }
    for (const file of hydrated) if (!orderedIds.has(file.id)) ordered.push(file);

    const pending = ordered.filter((file) => {
      const row = currentResults.get(file.id);
      return !row || (row.status !== "done" && row.status !== "skipped");
    });
    const file = pending[0];

    if (!file) {
      const finalAuditFiles: SeoAuditFile[] = hydrated.map((entry) => {
        const row = currentResults.get(entry.id);
        return { name: entry.name, content: row?.status === "done" && row.seo_content ? row.seo_content : entry.content };
      });
      const afterAudit = auditSeoProject(finalAuditFiles);
      await db.from("project_seo_plans").update({
        status: "done",
        audit_after: afterAudit,
        score_after: afterAudit.score,
        error: null,
        updated_at: new Date().toISOString(),
      }).eq("project_id", data.projectId);
      await db.from("projects").update({ status: "done" }).eq("id", data.projectId);
      return { done: true as const, remaining: 0, total: files.length, current: null, score: afterAudit.score, planCreated };
    }

    if (!file.content.trim() || !isSeoBearingFile(file.name, file.content)) {
      await db.from("project_seo_files").upsert({
        project_file_id: file.id,
        project_id: data.projectId,
        user_id: context.userId,
        source_signature: signature,
        status: "skipped",
        seo_content: null,
        error: file.content.trim() ? "No SEO-bearing markup or metadata detected" : "File is empty or non-text",
        updated_at: new Date().toISOString(),
      });
      return { done: false as const, remaining: pending.length - 1, total: files.length, current: file.name, score: beforeAudit.score, planCreated };
    }

    await db.from("projects").update({ status: "seo_optimizing" }).eq("id", data.projectId);
    await db.from("project_seo_plans").update({ status: "optimizing", error: null, updated_at: new Date().toISOString() }).eq("project_id", data.projectId);
    await db.from("project_seo_files").upsert({
      project_file_id: file.id,
      project_id: data.projectId,
      user_id: context.userId,
      source_signature: signature,
      status: "optimizing",
      seo_content: null,
      error: null,
      updated_at: new Date().toISOString(),
    });

    try {
      const seoContent = await optimizeSeoFile({
        file,
        project: { name: project.name, productType: project.product_type, notes: project.notes },
        plan,
        audit: beforeAudit,
      });
      await db.from("project_seo_files").update({ status: "done", seo_content: seoContent, error: null, updated_at: new Date().toISOString() }).eq("project_file_id", file.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "SEO optimization failed";
      await db.from("project_seo_files").update({ status: "failed", error: message, updated_at: new Date().toISOString() }).eq("project_file_id", file.id);
      await db.from("project_seo_plans").update({ status: "failed", error: message, updated_at: new Date().toISOString() }).eq("project_id", data.projectId);
      throw new Error(message);
    }

    return { done: false as const, remaining: pending.length - 1, total: files.length, current: file.name, score: beforeAudit.score, planCreated };
  });

export const resetSeoAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    const { error: deleteError } = await db.from("project_seo_files").delete().eq("project_id", data.projectId);
    if (deleteError && !schemaUnavailable(deleteError.message)) throw new Error(deleteError.message);
    const { error: planError } = await db.from("project_seo_plans").update({
      status: "ready",
      audit_after: null,
      score_after: null,
      error: null,
      updated_at: new Date().toISOString(),
    }).eq("project_id", data.projectId);
    if (planError && !schemaUnavailable(planError.message)) throw new Error(planError.message);
    await db.from("projects").update({ status: "queued" }).eq("id", data.projectId);
    return { ok: true };
  });
