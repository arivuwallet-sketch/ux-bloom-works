import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import { buildDesignIntelligenceContext, buildDesignQaContext } from "@/lib/design-intelligence";
import {
  buildProjectDependencyGraph,
  buildProjectPlanSignatures,
  formatProjectPlanForPrompt,
  parseProjectDesignPlan,
  type PlanningFile,
  type ProjectDependencyGraph,
  type ProjectDesignPlan,
} from "@/lib/project-design-plan";
import { getStyleBlueprint } from "@/lib/style-blueprints";
import { isSupportFile } from "@/lib/project-file-kinds";
import { repairRedesignCssCompatibility, validateRedesignCssCompatibility } from "@/lib/css-redesign-validator";
import { applyCompiledDirectionFoundation, buildDirectionCompilerContext, detectsTailwindV4, isCompilerStyleEntrypoint } from "@/lib/design-direction-compiler";

const TEXT_EXT =
  /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py)$/i;

const DIRECT_PRESENTATION_EXT =
  /\.(html?|css|scss|sass|less|jsx|tsx|vue|svelte|astro|hbs|ejs|twig)$/i;

const MAX_SOURCE_CHARS = 300_000;
const MAX_PLAN_CONTEXT_CHARS = 140_000;
const REDESIGN_MODELS = ["openai/gpt-6-astra", "google/gemini-2.5-flash"] as const;
const REASONING_EFFORT = "high";
const TRANSIENT_STATUS = new Set([408, 429, 500, 502, 503, 504]);

type GatewayMessage = { role: "system" | "user" | "assistant"; content: string };

type ProjectVisualContext = {
  name: string;
  productType: string | null;
  notes: string | null;
  manifest: string[];
  designPlan: ProjectDesignPlan;
  dependencyGraph: ProjectDependencyGraph;
  tailwindV4: boolean;
};

type DesignAuditResult = {
  pass: boolean;
  issues: string[];
};

function isTextFile(name: string) {
  return TEXT_EXT.test(name);
}

function extensionOf(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function isPresentationBearingFile(name: string, source: string) {
  if (DIRECT_PRESENTATION_EXT.test(name)) return true;

  const lower = name.toLowerCase();
  if (/\.(js|ts)$/i.test(lower)) {
    return /className\s*=|styled\.|css`|createStyles\(|<[A-Z][A-Za-z0-9]*[\s/>]/.test(source);
  }
  if (/\.mdx$/i.test(lower)) return /<[A-Za-z][\w.-]*[\s/>]/.test(source);
  if (/\.php$/i.test(lower)) return /<(?:main|section|header|nav|footer|div|form|button|input)\b/i.test(source);
  if (/\.dart$/i.test(lower)) return /Widget\s+build\s*\(|Scaffold\s*\(|MaterialApp\s*\(/.test(source);
  if (/\.swift$/i.test(lower)) return /:\s*View\b|var\s+body\s*:\s*some\s+View/.test(source);
  if (/\.kt$/i.test(lower)) return /@Composable\b|Modifier\./.test(source);

  return false;
}

function stripOuterFence(value: string) {
  return value.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "").trim();
}

function visualFingerprint(source: string) {
  const visualLine =
    /class(Name)?\s*=|\bstyle\s*=|\bsx\s*=|\bcss\s*=|@media|@container|--[\w-]+\s*:|\b(?:display|position|grid|flex|gap|padding|margin|width|height|min-width|max-width|min-height|max-height|color|background|font|line-height|letter-spacing|border|border-radius|box-shadow|filter|opacity|transform|transition|animation|align-items|justify-content|place-items|overflow)\s*:/i;

  return Array.from(
    new Set(
      source
        .split(/\r?\n/)
        .map((line) => line.trim().replace(/\s+/g, " "))
        .filter((line) => line.length >= 6 && line.length <= 500 && visualLine.test(line)),
    ),
  );
}

function presentationCarryoverRatio(source: string, output: string) {
  const before = visualFingerprint(source);
  if (before.length < 8) return 0;
  const after = new Set(visualFingerprint(output));
  const unchanged = before.filter((line) => after.has(line)).length;
  return unchanged / before.length;
}

function validateFullReconstruction(
  name: string,
  source: string,
  candidate: string,
  style?: string | null,
  compiler?: { applyFoundation: boolean; tailwindV4: boolean },
) {
  let output = stripOuterFence(candidate);
  if (style && compiler?.applyFoundation) {
    output = applyCompiledDirectionFoundation(output, style, compiler.tailwindV4);
  }
  output = repairRedesignCssCompatibility({ name, source, output, style });
  if (!output) throw new Error("AI returned an empty file");
  if (output === source.trim()) throw new Error("AI returned the original UI unchanged");

  if (source.length > 5_000 && output.length < source.length * 0.12) {
    throw new Error("AI output looks truncated");
  }

  const ext = extensionOf(name);
  if (ext === "json") {
    try {
      JSON.parse(output);
    } catch {
      throw new Error("AI returned invalid JSON");
    }
  }

  if (!["md", "mdx", "txt"].includes(ext) && /^```/.test(output)) {
    throw new Error("AI returned markdown instead of source code");
  }

  if (/^(here(?:'s| is)|sure[,!]|i(?:'ve| have) (?:redesigned|updated|rewritten))/i.test(output)) {
    throw new Error("AI returned commentary instead of a complete source file");
  }

  validateRedesignCssCompatibility({ name, source, output, style });

  const carryover = presentationCarryoverRatio(source, output);
  if (carryover > 0.78) {
    throw new Error("AI preserved too much of the previous visual presentation");
  }

  return output;
}

function clipForAudit(value: string, limit = 80_000) {
  if (value.length <= limit) return value;
  const half = Math.floor(limit / 2);
  return `${value.slice(0, half)}\n\n/* ... middle clipped for QA context ... */\n\n${value.slice(-half)}`;
}

function buildPlanningSnapshot(files: PlanningFile[], graph: ProjectDependencyGraph) {
  const priority = new Map<string, number>();
  graph.sharedRoots.forEach((name, index) => priority.set(name, index));
  graph.entryCandidates.forEach((name, index) => {
    if (!priority.has(name)) priority.set(name, 100 + index);
  });

  const ordered = [...files].sort((a, b) => {
    const aRank = priority.get(a.name) ?? 10_000;
    const bRank = priority.get(b.name) ?? 10_000;
    return aRank - bRank || a.name.localeCompare(b.name);
  });

  let used = 0;
  const sections: string[] = [];
  for (const file of ordered) {
    if (!file.content.trim() || used >= MAX_PLAN_CONTEXT_CHARS) continue;
    const node = graph.nodes.find((candidate) => candidate.file === file.name);
    const remaining = MAX_PLAN_CONTEXT_CHARS - used;
    const excerptLimit = Math.min(6_000, remaining);
    const excerpt = file.content.length <= excerptLimit
      ? file.content
      : `${file.content.slice(0, Math.floor(excerptLimit * 0.7))}\n/* ... clipped ... */\n${file.content.slice(-Math.floor(excerptLimit * 0.3))}`;
    const section = [
      `FILE: ${file.name}`,
      `ROLE: ${node?.role ?? "unknown"}`,
      `INTERNAL DEPENDENCIES: ${node?.internalDependencies.join(", ") || "none resolved"}`,
      `DEPENDENTS: ${node?.dependents.join(", ") || "none resolved"}`,
      `SOURCE EXCERPT:\n${excerpt}`,
    ].join("\n");
    sections.push(section);
    used += section.length;
  }
  return sections.join("\n\n---\n\n");
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGateway(messages: GatewayMessage[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");

  let lastError = "AI request failed";

  for (const model of REDESIGN_MODELS) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      try {
        const body: Record<string, unknown> = { model, messages };
        if (model.startsWith("openai/")) body["reasoning_effort"] = REASONING_EFFORT;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (res.status === 402) throw new Error("AI credits exhausted.");
        if (!res.ok) {
          lastError = res.status === 429 ? "Rate limit reached — retrying." : `AI request failed (${res.status})`;

          if (TRANSIENT_STATUS.has(res.status) && attempt === 0) {
            await sleep(700);
            continue;
          }

          if ([400, 404, 422, 429, 500, 502, 503, 504].includes(res.status)) break;
          throw new Error(lastError);
        }

        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content?.trim() ?? "";
        if (!content) throw new Error("AI returned an empty response");
        return content;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          lastError = "AI request timed out";
          if (attempt === 0) {
            await sleep(500);
            continue;
          }
          break;
        }
        if (error instanceof Error && error.message === "AI credits exhausted.") throw error;
        lastError = error instanceof Error ? error.message : lastError;
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

async function generateProjectDesignPlan(opts: {
  project: {
    name: string;
    productType: string | null;
    notes: string | null;
    styleMode: string;
    targetStyle: string | null;
  };
  files: PlanningFile[];
  graph: ProjectDependencyGraph;
}) {
  const styleAssignments = opts.files
    .map((file) => `${file.name}: ${opts.project.styleMode === "file" ? (file.targetStyle ?? "unset") : (opts.project.targetStyle ?? "unset")}`)
    .join("\n");
  const uniqueStyles = Array.from(new Set(opts.files.map((file) =>
    opts.project.styleMode === "file" ? file.targetStyle : opts.project.targetStyle,
  ).filter((style): style is string => Boolean(style))));
  const styleBlueprints = uniqueStyles
    .map((style) => `${style}: ${getStyleBlueprint(style)}`)
    .join("\n\n");
  const projectTailwindV4 = opts.files.some((file) => detectsTailwindV4(file.content));
  const compilerContracts = uniqueStyles
    .map((style) => buildDirectionCompilerContext(style, projectTailwindV4))
    .join("\n\n---\n\n");
  const snapshot = buildPlanningSnapshot(opts.files, opts.graph);

  const systemPrompt =
    "You are Rezyn Project Architect. Before any file is transformed, create one authoritative project-level dependency and design plan for the entire uploaded product. " +
    "Base dependency decisions on the supplied static dependency graph and source excerpts; do not invent imports, routes, APIs, components or files. " +
    "Preserve the existing runtime architecture, behavior, routes, state, APIs and data contracts, while defining a coherent NEW presentation architecture for the selected design direction(s). " +
    "Plan layout primitives, typography, surfaces, component conventions, navigation treatment and responsive composition once at project scope so individual file transformations cannot drift. The supplied Rezyn Design Compiler contract is authoritative for core semantic tokens, color-pair safety, borders, shadows, motion primitives, reduced-motion and Tailwind/CSS infrastructure; do not invent a competing core token system. " +
    "Identify shared files/components and explicit coordination rules. Put shared foundations before dependent screens in transformationOrder when practical. " +
    "Do not reveal chain-of-thought. Return ONLY valid JSON and no markdown fences.";

  const schemaInstruction = `Return exactly this JSON shape:
{
  "version": 2,
  "summary": "short architecture/design summary",
  "architecture": {
    "framework": "observed framework/runtime and constraints",
    "appShell": "shell/layout architecture",
    "navigation": "navigation architecture and invariants",
    "stateAndDataFlow": "state/API/data contracts that must survive",
    "sharedStyleEntryPoints": ["known/file/path"]
  },
  "designSystem": {
    "directionStrategy": "how the selected direction(s) become one coherent product",
    "layoutSystem": "grid/container/layout rules",
    "typography": "type hierarchy rules",
    "color": "semantic palette/contrast rules",
    "spacing": "spacing/rhythm rules",
    "surfaces": "materials/elevation/border rules",
    "components": "shared component geometry/state rules",
    "motion": "motion/easing/reduced-motion rules",
    "accessibility": "keyboard/focus/contrast/labels/targets rules",
    "responsive": "mobile/tablet/desktop adaptation rules"
  },
  "sharedComponents": [{"name":"system name","role":"responsibility","files":["known/file"],"rules":["specific rule"]}],
  "filePlans": [{"file":"known/file","role":"role","redesignResponsibility":"what this file owns visually","preserve":["functional invariant"],"coordinateWith":["known/file"]}],
  "transformationOrder": ["known/file"],
  "risks": ["cross-file risk to avoid"]
}`;

  const userPrompt = [
    `PROJECT: ${opts.project.name}`,
    `PRODUCT TYPE: ${opts.project.productType ?? "Unknown"}`,
    `NOTES: ${opts.project.notes?.trim() || "None"}`,
    `STYLE MODE: ${opts.project.styleMode}`,
    "STYLE ASSIGNMENTS:",
    styleAssignments || "none",
    "",
    "STYLE BLUEPRINTS:",
    styleBlueprints || "No style selected",
    "",
    "DIRECTION COMPILER CONTRACTS:",
    compilerContracts || "No compiler contract available.",
    "",
    "STATIC DEPENDENCY GRAPH:",
    JSON.stringify(opts.graph, null, 2),
    "",
    "PROJECT SOURCE EVIDENCE:",
    snapshot || "No text source available.",
    "",
    schemaInstruction,
  ].join("\n");

  let lastError = "Project planning returned invalid JSON";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const messages: GatewayMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
      if (attempt > 0) {
        messages.push({ role: "system", content: `The previous plan was invalid: ${lastError}. Return complete JSON in the required schema using only known file paths.` });
      }
      const raw = await callGateway(messages);
      return parseProjectDesignPlan(raw, opts.files);
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }
  throw new Error(lastError);
}

async function auditReconstruction(opts: {
  name: string;
  style: string;
  source: string;
  candidate: string;
  qaContext: string;
  projectPlan: string;
}) : Promise<DesignAuditResult> {
  const raw = await callGateway([
    {
      role: "system",
      content:
        "You are Rezyn Design QA. Audit a reconstructed UI source file rigorously and conservatively. Do not rewrite code and do not reveal chain-of-thought. Check that real behavior from the original is preserved, the old visual system was genuinely replaced, the chosen direction is unmistakable, the file follows the authoritative project-level design plan, and the applicable design-intelligence quality gates are satisfied. Treat cross-file consistency, accessibility, responsive behavior, interaction states, hierarchy, spacing, typography, contrast, forms, ethical UX, motion/reduced-motion, performance and relevant 2D/3D constraints as release blockers when materially wrong. Do not invent requirements that are absent from the file or project plan. Return ONLY JSON shaped exactly as {\"pass\":true|false,\"issues\":[\"concise actionable issue\"]}. Use at most 8 issues.",
    },
    {
      role: "user",
      content:
        `File: ${opts.name}\nTarget direction: ${opts.style}\n\n` +
        `${opts.projectPlan}\n\n` +
        `${opts.qaContext}\n\n` +
        `ORIGINAL FUNCTIONAL SOURCE (may be clipped):\n${clipForAudit(opts.source)}\n\n` +
        `RECONSTRUCTED CANDIDATE (may be clipped):\n${clipForAudit(opts.candidate)}`,
    },
  ]);

  const cleaned = stripOuterFence(raw);
  try {
    const parsed = JSON.parse(cleaned) as { pass?: unknown; issues?: unknown };
    const issues = Array.isArray(parsed.issues)
      ? parsed.issues.filter((item): item is string => typeof item === "string").slice(0, 8)
      : [];
    if (typeof parsed.pass !== "boolean") {
      return { pass: false, issues: ["Design QA returned an invalid pass/fail result."] };
    }
    return { pass: parsed.pass, issues };
  } catch {
    return { pass: false, issues: ["Design QA returned invalid JSON."] };
  }
}

async function redesignSource(opts: {
  name: string;
  style: string;
  source: string;
  project: ProjectVisualContext;
}): Promise<string> {
  if (opts.source.length > MAX_SOURCE_CHARS) {
    throw new Error("This file is too large to reconstruct safely. Split it into smaller source files first.");
  }

  const styleBlueprint = getStyleBlueprint(opts.style);
  const directionCompiler = buildDirectionCompilerContext(opts.style, opts.project.tailwindV4);
  const compilerOwnsFoundation = isCompilerStyleEntrypoint({
    name: opts.name,
    source: opts.source,
    sharedStyleEntryPoints: opts.project.designPlan.architecture.sharedStyleEntryPoints,
  });
  const projectManifest = opts.project.manifest.slice(0, 160).join("\n- ");
  const designIntelligence = buildDesignIntelligenceContext({
    fileName: opts.name,
    source: opts.source,
    style: opts.style,
  });
  const qaContext = buildDesignQaContext({
    fileName: opts.name,
    source: opts.source,
    style: opts.style,
  });
  const projectPlan = formatProjectPlanForPrompt(opts.project.designPlan, opts.project.dependencyGraph, opts.name);

  const reconstructionContract =
    "You are Rezyn's full-reconstruction design engine: an elite product designer, UX architect, interaction designer, accessibility specialist, motion/visual designer, 2D/3D art director, and senior front-end engineer. " +
    "The uploaded source is a FUNCTIONAL SPECIFICATION, not a visual reference. Before writing code, mentally discard the existing UI/UX presentation and reconstruct the interface from a blank visual canvas. " +
    "The chosen design direction and the supplied PROJECT-LEVEL DESIGN PLAN must control the NEW information architecture, visual hierarchy, composition, navigation treatment, section structure, component geometry, typography, spacing system, color system, surfaces, states, responsive behavior, and interaction character. " +
    "A theme swap, CSS patch, wrapper around the old UI, token substitution, local one-off design system, or light restyle is a FAILURE. Do not preserve the old layout merely because it already exists. " +
    "You ARE allowed and expected to reorganize presentation markup, replace visual wrappers, rebuild grids/flex layouts, rewrite Tailwind/className styling, replace CSS declarations, introduce the planned token system inside the appropriate file, change visual ordering where behavior is unaffected, and remove obsolete presentational markup. " +
    "You MUST preserve application behavior: routes, state, props, event handlers, API/data bindings, forms and submission behavior, business logic, content meaning, asset references, accessibility semantics, test/data hooks, IDs or selectors used functionally, and the source file's framework/language. " +
    "If a class/selector may be referenced across files or by JavaScript, keeping its identifier is acceptable for compatibility, but its PRESENTATION must be rebuilt rather than inherited. " +
    "For CSS/SCSS/LESS files, replace the visual system instead of appending arbitrary override patches after the old rules. Core tokens, theme mappings, borders, shadows, press behavior and reduced-motion infrastructure are owned by the Rezyn Design Compiler; do not invent a second core theme system. For JSX/TSX/Vue/Svelte/templates, recompose the rendered interface rather than retaining the same DOM hierarchy with new colors, and consume the compiler semantic tokens/utilities rather than hard-coding a parallel visual foundation. " +
    "Use the supplied Design Intelligence Operating System as mandatory expert guidance. Apply all relevant skills, but never fabricate research findings, analytics, experiments, tool runs, user studies, eye tracking, biometric results, or performance measurements. " +
    "Do not create fake functionality, do not remove real functionality, do not contradict shared project decisions without a proven source constraint, and do not return explanations. Return ONLY the complete rewritten file contents, with no markdown fence.";

  const context =
    `Project: ${opts.project.name}\n` +
    `Product type: ${opts.project.productType ?? "Unknown"}\n` +
    `Project notes: ${opts.project.notes?.trim() || "None"}\n` +
    `Chosen direction: ${opts.style}\n` +
    `Direction blueprint: ${styleBlueprint}\n\n` +
    `${directionCompiler}\n\n` +
    `${projectPlan}\n\n` +
    `${designIntelligence}\n\n` +
    `Project file manifest:\n- ${projectManifest || opts.name}\n\n` +
    `Current file: ${opts.name}\n\n` +
    "FULL REBUILD REQUIREMENT:\n" +
    "Treat the existing presentation as something to replace completely. Use the source only to learn what the product does, what content it contains, and what behavior must survive. The finished interface should look as if one coordinated design team rebuilt the entire product from scratch in the chosen direction while following the shared project plan.\n\n" +
    "Before returning the file, perform an internal expert review against both the PROJECT-LEVEL DESIGN PLAN and Design Intelligence quality gates. Fix cross-file consistency, accessibility, hierarchy, responsive, state, interaction, motion, performance, visual-system, and relevant 2D/3D defects. Do not report the review; return the corrected file only.\n\n" +
    `SOURCE FILE:\n${opts.source}`;

  const baseMessages: GatewayMessage[] = [
    { role: "system", content: reconstructionContract },
    { role: "user", content: context },
  ];

  let lastError = "AI could not produce a sufficiently complete reconstruction";

  for (let reconstructionAttempt = 0; reconstructionAttempt < 2; reconstructionAttempt += 1) {
    const messages =
      reconstructionAttempt === 0
        ? baseMessages
        : [
            ...baseMessages,
            {
              role: "system" as const,
              content:
                `The previous result was rejected. Correct these release-blocking problems before regenerating: ${lastError}. Reconstruct the presentation from a blank canvas while preserving behavior and following the shared project plan exactly. Re-run the full Design Intelligence quality review and correct every issue before output. Do not patch the previous design; replace it.`,
            },
          ];

    try {
      const raw = await callGateway(messages);
      const candidate = validateFullReconstruction(opts.name, opts.source, raw, opts.style, {
        applyFoundation: compilerOwnsFoundation,
        tailwindV4: opts.project.tailwindV4,
      });
      const audit = await auditReconstruction({
        name: opts.name,
        style: opts.style,
        source: opts.source,
        candidate,
        qaContext,
        projectPlan,
      });
      if (!audit.pass) {
        throw new Error(audit.issues.length > 0 ? audit.issues.join(" | ") : "Design QA rejected the reconstruction.");
      }
      return candidate;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }

  throw new Error(lastError);
}

/** Builds/reuses the project-level plan, then redesigns the next dependency-ordered file. */
export const redesignNextFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, product_type, notes, target_style, style_mode, status")
      .eq("id", data.projectId)
      .maybeSingle();
    if (projectError) throw new Error(projectError.message);
    if (!project) throw new Error("Project not found");

    const { data: unlocked, error: unlockError } = await supabase.rpc("unlock_project", { _project_id: data.projectId });
    if (unlockError) throw new Error(unlockError.message);
    if (!unlocked) throw new Error("NO_CREDITS: You need a website credit to redesign this project. Buy a pack on the Pricing page.");

    const { data: files, error: filesError } = await supabase
      .from("project_files")
      .select("id, name, source, content, storage_path, target_style, status, size_bytes, updated_at")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: true });
    if (filesError) throw new Error(filesError.message);

    if (!files || files.length === 0) {
      await supabase.from("projects").update({ status: "done" }).eq("id", data.projectId);
      return { done: true as const, remaining: 0, total: 0, current: null, planCreated: false };
    }

    // Hydrate project source before planning. Planning is project-level and must see
    // actual source evidence, not merely file names.
    const planningFiles: PlanningFile[] = [];
    for (const entry of files) {
      let content = entry.content ?? "";
      if (!content && entry.storage_path && isTextFile(entry.name)) {
        const dl = await supabase.storage.from("project-files").download(entry.storage_path);
        if (dl.error) throw new Error(`Planning could not read ${entry.name}: ${dl.error.message}`);
        content = await dl.data.text();
      }
      planningFiles.push({
        id: entry.id,
        name: entry.name.replace(/\\/g, "/"),
        content,
        sizeBytes: entry.size_bytes,
        targetStyle: entry.target_style,
        updatedAt: entry.updated_at,
      });
    }

    const dependencyGraph = buildProjectDependencyGraph(planningFiles);
    const signatures = buildProjectPlanSignatures({
      projectId: project.id,
      styleMode: project.style_mode,
      targetStyle: project.target_style,
      files: planningFiles,
    });

    const { data: storedPlan, error: storedPlanError } = await supabase
      .from("project_design_plans")
      .select("status, source_signature, style_signature, dependency_graph, plan, error")
      .eq("project_id", data.projectId)
      .maybeSingle();
    if (storedPlanError) {
      throw new Error(`Project planning schema is unavailable: ${storedPlanError.message}. Apply migration 0007_create_project_design_plans.sql.`);
    }

    let designPlan: ProjectDesignPlan;
    let activeGraph = dependencyGraph;
    let planCreated = false;
    const canReuse =
      storedPlan?.status === "ready" &&
      storedPlan.source_signature === signatures.sourceSignature &&
      storedPlan.style_signature === signatures.styleSignature;

    if (canReuse) {
      try {
        designPlan = storedPlan.plan as unknown as ProjectDesignPlan;
        activeGraph = storedPlan.dependency_graph as unknown as ProjectDependencyGraph;
        if (designPlan.version !== 2 || activeGraph.version !== 1) throw new Error("stale plan version");
      } catch {
        planCreated = true;
        designPlan = await generateProjectDesignPlan({
          project: {
            name: project.name,
            productType: project.product_type,
            notes: project.notes,
            styleMode: project.style_mode,
            targetStyle: project.target_style,
          },
          files: planningFiles,
          graph: dependencyGraph,
        });
      }
    } else {
      planCreated = true;
      await supabase.from("projects").update({ status: "planning" }).eq("id", data.projectId);
      const { error: planningWriteError } = await supabase.from("project_design_plans").upsert({
        project_id: data.projectId,
        user_id: context.userId,
        status: "planning",
        source_signature: signatures.sourceSignature,
        style_signature: signatures.styleSignature,
        dependency_graph: dependencyGraph as unknown as Json,
        plan: {} as Json,
        error: null,
        updated_at: new Date().toISOString(),
      });
      if (planningWriteError) throw new Error(`Could not start project planning: ${planningWriteError.message}`);

      try {
        designPlan = await generateProjectDesignPlan({
          project: {
            name: project.name,
            productType: project.product_type,
            notes: project.notes,
            styleMode: project.style_mode,
            targetStyle: project.target_style,
          },
          files: planningFiles,
          graph: dependencyGraph,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Project planning failed";
        await supabase.from("project_design_plans").update({
          status: "failed",
          error: message,
          updated_at: new Date().toISOString(),
        }).eq("project_id", data.projectId);
        await supabase.from("projects").update({ status: "failed" }).eq("id", data.projectId);
        throw new Error(`PROJECT_PLAN_FAILED: ${message}`);
      }
    }

    if (planCreated) {
      const { error: readyError } = await supabase.from("project_design_plans").upsert({
        project_id: data.projectId,
        user_id: context.userId,
        status: "ready",
        source_signature: signatures.sourceSignature,
        style_signature: signatures.styleSignature,
        dependency_graph: dependencyGraph as unknown as Json,
        plan: designPlan as unknown as Json,
        error: null,
        updated_at: new Date().toISOString(),
      });
      if (readyError) throw new Error(`Could not save project design plan: ${readyError.message}`);
      activeGraph = dependencyGraph;
    }

    // Plan order is authoritative for queued files. Any file omitted by the AI is
    // appended deterministically so the queue can never strand source files.
    const pending = files.filter((entry) => entry.status !== "done" && entry.status !== "skipped");
    const byName = new Map(pending.map((entry) => [entry.name.replace(/\\/g, "/"), entry]));
    const orderedQueue = designPlan.transformationOrder
      .map((name) => byName.get(name.replace(/\\/g, "/")))
      .filter((entry): entry is (typeof pending)[number] => Boolean(entry));
    const orderedIds = new Set(orderedQueue.map((entry) => entry.id));
    orderedQueue.push(...pending.filter((entry) => !orderedIds.has(entry.id)));
    let file: (typeof orderedQueue)[number] | undefined = orderedQueue[0];
    let fastForwarded = 0;

    // Fast-forward consecutive files that provably need no AI reconstruction.
    // This preserves dependency order while avoiding one network round-trip per
    // config/support/non-presentation file in large projects.
    for (const candidate of orderedQueue) {
      const planningFile = planningFiles.find((entry) => entry.id === candidate.id);
      const candidateSource = planningFile?.content ?? candidate.content ?? "";

      if (isSupportFile(candidate.name)) {
        await supabase
          .from("project_files")
          .update({ status: "skipped", redesign_error: "Config/SEO support file — kept unchanged, not restyled" })
          .eq("id", candidate.id);
        fastForwarded += 1;
        file = undefined;
        continue;
      }

      if (candidateSource.trim() && !isPresentationBearingFile(candidate.name, candidateSource)) {
        await supabase
          .from("project_files")
          .update({ status: "done", redesigned_content: candidateSource, redesign_error: null })
          .eq("id", candidate.id);
        fastForwarded += 1;
        file = undefined;
        continue;
      }

      file = candidate;
      break;
    }

    if (!file) {
      const remainingAfterFastForward = Math.max(0, orderedQueue.length - fastForwarded);
      if (remainingAfterFastForward === 0) {
        await supabase.from("projects").update({ status: "done" }).eq("id", data.projectId);
        return { done: true as const, remaining: 0, total: files.length, current: null, planCreated };
      }
      return {
        done: false as const,
        remaining: remainingAfterFastForward,
        total: files.length,
        current: null,
        planCreated,
      };
    }

    await supabase.from("projects").update({ status: "redesigning" }).eq("id", data.projectId);
    await supabase
      .from("project_files")
      .update({ status: "redesigning", redesign_error: null })
      .eq("id", file.id);

    try {
      const planningFile = planningFiles.find((entry) => entry.id === file.id);
      let source = planningFile?.content ?? file.content ?? "";
      if (!source && file.storage_path) {
        if (!isTextFile(file.name)) {
          await supabase
            .from("project_files")
            .update({ status: "skipped", redesign_error: "Not a text-based file" })
            .eq("id", file.id);
          return {
            done: false as const,
            remaining: orderedQueue.length - 1,
            total: files.length,
            current: file.name,
            planCreated,
          };
        }
        const dl = await supabase.storage.from("project-files").download(file.storage_path);
        if (dl.error) throw new Error(dl.error.message);
        source = await dl.data.text();
      }
      if (!source.trim()) throw new Error("File is empty");

      const style =
        (project.style_mode === "file" ? file.target_style : project.target_style) ??
        file.target_style ??
        project.target_style;
      if (!style) throw new Error("No target style selected");

      if (!isPresentationBearingFile(file.name, source)) {
        await supabase
          .from("project_files")
          .update({ status: "done", redesigned_content: source, redesign_error: null })
          .eq("id", file.id);
      } else {
        const redesigned = await redesignSource({
          name: file.name.replace(/\\/g, "/"),
          style,
          source,
          project: {
            name: project.name,
            productType: project.product_type,
            notes: project.notes,
            manifest: files.map((entry) => entry.name.replace(/\\/g, "/")),
            designPlan,
            dependencyGraph: activeGraph,
            tailwindV4: planningFiles.some((entry) => detectsTailwindV4(entry.content)),
          },
        });

        await supabase
          .from("project_files")
          .update({ status: "done", redesigned_content: redesigned, redesign_error: null })
          .eq("id", file.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Redesign failed";
      await supabase
        .from("project_files")
        .update({ status: "failed", redesign_error: message })
        .eq("id", file.id);
      throw new Error(message);
    }

    return {
      done: false as const,
      remaining: Math.max(0, orderedQueue.length - fastForwarded - 1),
      total: files.length,
      current: file.name,
      planCreated,
    };
  });

/** Puts every file back in the queue so the whole project is redesigned again. */
export const resetRedesign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("project_files")
      .update({ status: "queued", redesigned_content: null, redesign_error: null })
      .eq("project_id", data.projectId);
    if (error) throw new Error(error.message);
    await context.supabase
      .from("projects")
      .update({ status: "queued" })
      .eq("id", data.projectId);
    return { ok: true };
  });
