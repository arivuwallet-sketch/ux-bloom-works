import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildDesignIntelligenceContext } from "@/lib/design-intelligence";
import { getStyleBlueprint } from "@/lib/style-blueprints";

const TEXT_EXT =
  /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py)$/i;

const DIRECT_PRESENTATION_EXT =
  /\.(html?|css|scss|sass|less|jsx|tsx|vue|svelte|astro|hbs|ejs|twig)$/i;

const MAX_SOURCE_CHARS = 300_000;
const REDESIGN_MODELS = ["openai/gpt-6-astra", "google/gemini-2.5-flash"] as const;
const REASONING_EFFORT = "high";
const TRANSIENT_STATUS = new Set([408, 429, 500, 502, 503, 504]);

type GatewayMessage = { role: "system" | "user" | "assistant"; content: string };

type ProjectVisualContext = {
  name: string;
  productType: string | null;
  notes: string | null;
  manifest: string[];
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

function validateFullReconstruction(name: string, source: string, candidate: string) {
  const output = stripOuterFence(candidate);
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

async function auditReconstruction(opts: {
  name: string;
  style: string;
  source: string;
  candidate: string;
  designIntelligence: string;
}) : Promise<DesignAuditResult> {
  const raw = await callGateway([
    {
      role: "system",
      content:
        "You are Rezyn Design QA. Audit a reconstructed UI source file rigorously and conservatively. Do not rewrite code and do not reveal chain-of-thought. Check that real behavior from the original is preserved, the old visual system was genuinely replaced, the chosen direction is unmistakable, and the applicable design-intelligence quality gates are satisfied. Treat accessibility, responsive behavior, interaction states, hierarchy, spacing, typography, contrast, forms, ethical UX, motion/reduced-motion, performance and relevant 2D/3D constraints as release blockers when materially wrong. Do not invent requirements that are absent from the file. Return ONLY JSON shaped exactly as {\"pass\":true|false,\"issues\":[\"concise actionable issue\"]}. Use at most 8 issues.",
    },
    {
      role: "user",
      content:
        `File: ${opts.name}\nTarget direction: ${opts.style}\n\n` +
        `${opts.designIntelligence}\n\n` +
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
  const projectManifest = opts.project.manifest.slice(0, 160).join("\n- ");
  const designIntelligence = buildDesignIntelligenceContext({
    fileName: opts.name,
    source: opts.source,
    style: opts.style,
  });

  const reconstructionContract =
    "You are Rezyn's full-reconstruction design engine: an elite product designer, UX architect, interaction designer, accessibility specialist, motion/visual designer, 2D/3D art director, and senior front-end engineer. " +
    "The uploaded source is a FUNCTIONAL SPECIFICATION, not a visual reference. Before writing code, mentally discard the existing UI/UX presentation and reconstruct the interface from a blank visual canvas. " +
    "The chosen design direction must control the NEW information architecture, visual hierarchy, composition, navigation treatment, section structure, component geometry, typography, spacing system, color system, surfaces, states, responsive behavior, and interaction character. " +
    "A theme swap, CSS patch, wrapper around the old UI, token substitution, or light restyle is a FAILURE. Do not preserve the old layout merely because it already exists. " +
    "You ARE allowed and expected to reorganize presentation markup, replace visual wrappers, rebuild grids/flex layouts, rewrite Tailwind/className styling, replace CSS declarations, introduce a new token system inside the file, change visual ordering where behavior is unaffected, and remove obsolete presentational markup. " +
    "You MUST preserve application behavior: routes, state, props, event handlers, API/data bindings, forms and submission behavior, business logic, content meaning, asset references, accessibility semantics, test/data hooks, IDs or selectors used functionally, and the source file's framework/language. " +
    "If a class/selector may be referenced across files or by JavaScript, keeping its identifier is acceptable for compatibility, but its PRESENTATION must be rebuilt rather than inherited. " +
    "For CSS/SCSS/LESS files, replace the visual system instead of appending override patches after the old rules. For JSX/TSX/Vue/Svelte/templates, recompose the rendered interface rather than retaining the same DOM hierarchy with new colors. " +
    "Use the supplied Design Intelligence Operating System as mandatory expert guidance. Apply all relevant skills, but never fabricate research findings, analytics, experiments, tool runs, user studies, eye tracking, biometric results, or performance measurements. " +
    "Do not create fake functionality, do not remove real functionality, and do not return explanations. Return ONLY the complete rewritten file contents, with no markdown fence.";

  const context =
    `Project: ${opts.project.name}\n` +
    `Product type: ${opts.project.productType ?? "Unknown"}\n` +
    `Project notes: ${opts.project.notes?.trim() || "None"}\n` +
    `Chosen direction: ${opts.style}\n` +
    `Direction blueprint: ${styleBlueprint}\n\n` +
    `${designIntelligence}\n\n` +
    `Project file manifest:\n- ${projectManifest || opts.name}\n\n` +
    `Current file: ${opts.name}\n\n` +
    "FULL REBUILD REQUIREMENT:\n" +
    "Treat the existing presentation as something to replace completely. Use the source only to learn what the product does, what content it contains, and what behavior must survive. The finished interface should look as if a different design team built the product from scratch in the chosen direction.\n\n" +
    "Before returning the file, perform an internal expert review against the Design Intelligence quality gates and fix accessibility, hierarchy, responsive, state, interaction, motion, performance, visual-system, and relevant 2D/3D defects. Do not report the review; return the corrected file only.\n\n" +
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
                `The previous result was rejected. Correct these release-blocking problems before regenerating: ${lastError}. Reconstruct the presentation from a blank canvas while preserving behavior. Re-run the full Design Intelligence quality review and correct every issue before output. Do not patch the previous design; replace it.`,
            },
          ];

    try {
      const raw = await callGateway(messages);
      const candidate = validateFullReconstruction(opts.name, opts.source, raw);
      const audit = await auditReconstruction({
        name: opts.name,
        style: opts.style,
        source: opts.source,
        candidate,
        designIntelligence,
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

/** Redesigns the next queued file and reports what is left. */
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

    // One purchased website credit unlocks this project (spent once, idempotent).
    const { data: unlocked, error: unlockError } = await supabase.rpc("unlock_project", { _project_id: data.projectId });
    if (unlockError) throw new Error(unlockError.message);
    if (!unlocked) throw new Error("NO_CREDITS: You need a website credit to redesign this project. Buy a pack on the Pricing page.");

    const { data: files, error: filesError } = await supabase
      .from("project_files")
      .select("id, name, source, content, storage_path, target_style, status")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: true });
    if (filesError) throw new Error(filesError.message);

    const queue = (files ?? []).filter((f) => f.status !== "done" && f.status !== "skipped");
    const file = queue[0];

    if (!file) {
      await supabase.from("projects").update({ status: "done" }).eq("id", data.projectId);
      return { done: true as const, remaining: 0, total: files?.length ?? 0, current: null };
    }

    await supabase.from("projects").update({ status: "redesigning" }).eq("id", data.projectId);
    await supabase
      .from("project_files")
      .update({ status: "redesigning", redesign_error: null })
      .eq("id", file.id);

    try {
      let source = file.content ?? "";
      if (!source && file.storage_path) {
        if (!isTextFile(file.name)) {
          await supabase
            .from("project_files")
            .update({ status: "skipped", redesign_error: "Not a text-based file" })
            .eq("id", file.id);
          return {
            done: false as const,
            remaining: queue.length - 1,
            total: files?.length ?? 0,
            current: file.name,
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
          name: file.name,
          style,
          source,
          project: {
            name: project.name,
            productType: project.product_type,
            notes: project.notes,
            manifest: (files ?? []).map((entry) => entry.name),
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
      remaining: queue.length - 1,
      total: files?.length ?? 0,
      current: file.name,
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
