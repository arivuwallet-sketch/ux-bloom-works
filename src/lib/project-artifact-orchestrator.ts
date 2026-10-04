import { ensureProjectArtifacts as ensureSeoArtifacts } from "@/lib/project-artifact-bootstrap";
import { getStyleBlueprint } from "@/lib/style-blueprints";
import {
  repairRedesignCssCompatibility,
  validateRedesignCssCompatibility,
} from "@/lib/css-redesign-validator";
import {
  applyCompiledDirectionFoundation,
  buildDirectionCompilerContext,
  compileDirectionCss,
  detectsTailwindV4,
  isCompilerStyleEntrypoint,
} from "@/lib/design-direction-compiler";

const MODELS = ["openai/gpt-6-astra", "google/gemini-2.5-flash"] as const;
const TRANSIENT = new Set([408, 429, 500, 502, 503, 504]);
const ALLOWED_DESIGN_EXT =
  /\.(?:css|scss|sass|less|ts|tsx|js|jsx|vue|svelte|astro|dart|swift|kt)$/i;
const DISALLOWED_PATH =
  /(^|\/)(?:routes?|pages?|api|server|actions?|node_modules|\.git|public|static)(?:\/|$)|(^|\/)(?:package|vite\.config|next\.config|nuxt\.config|astro\.config|svelte\.config|tsconfig|drizzle)\./i;
const SUPPORT_PATH_SIGNAL =
  /(?:components?|styles?|theme|tokens?|design[-_]?system|ui|layout|shell|primitives?|shared|foundation)/i;

type SourceMode = "original" | "redesigned";
type GatewayMessage = { role: "system" | "user"; content: string };

type FileRow = {
  id: string;
  name: string;
  source: string;
  content: string | null;
  redesigned_content: string | null;
  storage_path: string | null;
  target_style: string | null;
};

type SourceFile = {
  name: string;
  source: string;
  content: string;
  targetStyle: string | null;
};

type ProjectRow = {
  id: string;
  name: string;
  product_type: string | null;
  notes: string | null;
  target_style: string | null;
  style_mode: string;
  status: string;
};

type ProposedFile = {
  path: string;
  purpose: string;
  content: string;
};

type Result = {
  version: string;
  created: string[];
  skipped: string[];
  warnings: string[];
};

function normalizePath(value: string) {
  const parts: string[] = [];
  for (const segment of value.replace(/\\/g, "/").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return parts.join("/");
}

function isTextPath(name: string) {
  return /\.(?:html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py|ya?ml)$/i.test(
    name,
  );
}

function redact(value: string) {
  return value
    .replace(
      /((?:api[_-]?key|secret|token|password|private[_-]?key|service[_-]?role)[\w-]*\s*[:=]\s*["'`])([^"'`\n]+)(["'`])/gi,
      "$1[REDACTED]$3",
    )
    .replace(/(Authorization\s*:\s*["'`]Bearer\s+)([^"'`\n]+)(["'`])/gi, "$1[REDACTED]$3");
}

function clip(value: string, limit = 5_500) {
  const clean = redact(value);
  if (clean.length <= limit) return clean;
  const head = Math.floor(limit * 0.72);
  return `${clean.slice(0, head)}\n/* ... clipped ... */\n${clean.slice(-(limit - head))}`;
}

function stripFence(value: string) {
  return value
    .replace(/^```[a-zA-Z0-9_-]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

function safePath(value: string) {
  const path = normalizePath(value);
  if (!path || path.startsWith("/") || path.includes("..")) return null;
  if (
    !ALLOWED_DESIGN_EXT.test(path) ||
    DISALLOWED_PATH.test(path) ||
    !SUPPORT_PATH_SIGNAL.test(path)
  )
    return null;
  return path;
}

function validateContent(path: string, value: string) {
  const content = stripFence(value);
  if (!content) throw new Error(`${path} was empty`);
  if (
    /\b(?:SUPABASE_SERVICE_ROLE_KEY|CASHFREE_SECRET_KEY|PRIVATE_KEY|PASSWORD)\b\s*[:=]\s*["'`][^"'`]+/i.test(
      content,
    )
  ) {
    throw new Error(`${path} contains a secret-like literal`);
  }
  if (
    /\b(?:fetch|axios\.|supabase\.|createServerFn|express\(|fastify\(|app\.(?:get|post|put|patch|delete))\b/i.test(
      content,
    )
  ) {
    throw new Error(`${path} attempted to introduce data/API behavior`);
  }
  return content;
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGateway(messages: GatewayMessage[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  let lastError = "Artifact architecture request failed";

  for (const model of MODELS) {
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
          lastError = `Artifact architecture request failed (${response.status})`;
          if (TRANSIENT.has(response.status) && attempt === 0) {
            await sleep(600);
            continue;
          }
          break;
        }
        const json = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content?.trim() ?? "";
        if (!content) throw new Error("Artifact architecture returned an empty response");
        return content;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError")
          lastError = "Artifact architecture request timed out";
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

async function hydrate(
  supabase: any,
  rows: FileRow[],
  sourceMode: SourceMode,
): Promise<SourceFile[]> {
  const result: SourceFile[] = [];
  for (const row of rows) {
    let original = row.content ?? "";
    if (!original && row.storage_path && isTextPath(row.name)) {
      const downloaded = await supabase.storage.from("project-files").download(row.storage_path);
      if (!downloaded.error) original = await downloaded.data.text();
    }
    result.push({
      name: normalizePath(row.name),
      source: row.source,
      content: sourceMode === "redesigned" ? (row.redesigned_content ?? original) : original,
      targetStyle: row.target_style,
    });
  }
  return result;
}

function projectUsesTailwindV4(files: SourceFile[]) {
  return files.some(
    (file) =>
      detectsTailwindV4(file.content) ||
      (/(^|\/)package\.json$/i.test(file.name) &&
        /"tailwindcss"\s*:\s*"[^"]*\b4\./i.test(file.content)),
  );
}

function compilerFoundationPath(files: SourceFile[]) {
  const names = files.map((file) => file.name);
  if (names.some((name) => name.startsWith("src/styles/"))) return "src/styles/rezyn-direction.css";
  if (names.some((name) => name.startsWith("src/"))) return "src/rezyn-direction.css";
  if (names.some((name) => name.startsWith("app/"))) return "app/rezyn-direction.css";
  if (names.some((name) => name.startsWith("styles/"))) return "styles/rezyn-direction.css";
  return "rezyn-direction.css";
}

function existingCompilerStyleEntrypoint(files: SourceFile[]) {
  return (
    files.find((file) => isCompilerStyleEntrypoint({ name: file.name, source: file.content })) ??
    null
  );
}

function snapshot(files: SourceFile[]) {
  const prioritized = [...files].sort((a, b) => {
    const score = (file: SourceFile) =>
      /(^|\/)(?:package\.json|app|root|layout|index|main|globals?|theme|tokens?|components?)/i.test(
        file.name,
      )
        ? 0
        : 1;
    return score(a) - score(b) || a.name.localeCompare(b.name);
  });
  let used = 0;
  const sections: string[] = [];
  for (const file of prioritized) {
    if (!file.content.trim() || used >= 85_000) continue;
    const excerpt = clip(file.content, Math.min(5_500, 85_000 - used));
    const section = `FILE: ${file.name}\nSOURCE: ${file.source}\n${excerpt}`;
    sections.push(section);
    used += section.length;
  }
  return sections.join("\n\n---\n\n");
}

function parseProposals(raw: string, existing: Set<string>): ProposedFile[] {
  const parsed = JSON.parse(stripFence(raw)) as { files?: unknown };
  if (!Array.isArray(parsed.files)) return [];
  const results: ProposedFile[] = [];
  const seen = new Set<string>();

  for (const item of parsed.files.slice(0, 3)) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const path = safePath(typeof row["path"] === "string" ? row["path"] : "");
    const purpose =
      typeof row["purpose"] === "string"
        ? row["purpose"].trim().slice(0, 500)
        : "Shared redesign support";
    const rawContent = typeof row["content"] === "string" ? row["content"] : "";
    if (!path || existing.has(path.toLowerCase()) || seen.has(path.toLowerCase())) continue;
    const content = validateContent(path, rawContent);
    seen.add(path.toLowerCase());
    results.push({ path, purpose, content });
  }
  return results;
}

async function proposeRedesignFiles(project: ProjectRow, files: SourceFile[]) {
  const styles =
    project.style_mode === "file"
      ? Array.from(
          new Set(
            files
              .map((file) => file.targetStyle)
              .filter((value): value is string => Boolean(value)),
          ),
        )
      : project.target_style
        ? [project.target_style]
        : [];
  const blueprints = styles.map((style) => `${style}: ${getStyleBlueprint(style)}`).join("\n\n");
  const tailwindV4 = projectUsesTailwindV4(files);
  const compilerContracts = styles
    .map((style) => buildDirectionCompilerContext(style, tailwindV4))
    .join("\n\n---\n\n");
  const manifest = files.map((file) => file.name).join("\n");

  const raw = await callGateway([
    {
      role: "system",
      content:
        'You are Rezyn\'s pre-planning artifact architect. Decide whether a full UI/UX reconstruction genuinely requires NEW shared support files that do not already exist. Create files only when editing existing files alone would produce a fragmented or invalid architecture. Allowed new files: shared visual tokens/theme/design-system styles, reusable PRESENTATIONAL primitives, or shared visual layout/shell support. Forbidden: routes/pages/screens, API/server files, state/stores, business logic, data fetching, authentication, analytics, fake content, fake features, package/config changes, new dependencies, generated images/binaries, or copies of files that already exist. Respect the project\'s current framework, language, aliases, folder conventions and dependencies. In Tailwind v4 projects, use valid CSS-first imports, keep runtime variables inside selectors, use @theme/@utility for variant-capable design primitives, preserve existing semantic variable APIs when applicable, keep --input visibly distinct from surfaces, and maintain accessible light/dark contrast. In per-file direction mode, shared files must remain neutral enough to support different page directions and must not impose one file\'s style globally. Return ONLY JSON: {"files":[{"path":"existing-convention/path.ext","purpose":"why this new file is required","content":"complete production-valid source"}]}. Maximum 3 files. If no new file is truly required, return {"files":[]}.',
    },
    {
      role: "user",
      content: [
        `PROJECT: ${project.name}`,
        `PRODUCT TYPE: ${project.product_type ?? "Unknown"}`,
        `STYLE MODE: ${project.style_mode}`,
        `PROJECT NOTES: ${project.notes?.trim() || "None"}`,
        "",
        "DIRECTION BLUEPRINTS:",
        blueprints ||
          "No fixed global direction; preserve compatibility with assigned per-file directions.",
        "",
        "REZYN DESIGN COMPILER CONTRACTS — CORE TOKENS/THEME/PRIMITIVES ARE ALREADY DEFINED BY THIS CONTRACT:",
        compilerContracts || "No compiler contract available.",
        "",
        "CURRENT MANIFEST — DO NOT DUPLICATE THESE PATHS:",
        manifest,
        "",
        "SOURCE EVIDENCE:",
        snapshot(files),
      ].join("\n"),
    },
  ]);

  return parseProposals(raw, new Set(files.map((file) => file.name.toLowerCase())));
}

async function ensureRedesignArtifacts(opts: {
  supabase: any;
  projectId: string;
  userId: string;
  sourceMode: SourceMode;
}): Promise<Result> {
  const created: string[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  const { data: projectData, error: projectError } = await opts.supabase
    .from("projects")
    .select("id, name, product_type, notes, target_style, style_mode, status")
    .eq("id", opts.projectId)
    .maybeSingle();
  if (projectError) throw new Error(projectError.message);
  if (!projectData) throw new Error("Project not found");
  const project = projectData as ProjectRow;

  // Discovery runs once at the beginning of a redesign/reset cycle. After the core engine
  // moves the project into planning/redesigning, subsequent file steps skip this AI pass.
  if (!["queued", "planning"].includes(project.status)) {
    return { version: "2026-10-artifact-orchestrator-v1", created, skipped, warnings };
  }

  const { data: rowData, error: rowsError } = await opts.supabase
    .from("project_files")
    .select("id, name, source, content, redesigned_content, storage_path, target_style")
    .eq("project_id", opts.projectId)
    .order("created_at", { ascending: true });
  if (rowsError) throw new Error(rowsError.message);
  const rows = (rowData ?? []) as FileRow[];
  if (rows.length === 0)
    return { version: "2026-10-artifact-orchestrator-v1", created, skipped, warnings };

  const files = await hydrate(opts.supabase, rows, opts.sourceMode);
  const tailwindV4 = projectUsesTailwindV4(files);
  const compilerOwnedFoundation =
    project.style_mode !== "file" && project.target_style && !existingCompilerStyleEntrypoint(files)
      ? {
          path: compilerFoundationPath(files),
          style: project.target_style,
          content: compileDirectionCss(project.target_style, tailwindV4),
        }
      : null;

  if (compilerOwnedFoundation) {
    const duplicate = rows.some(
      (row) => normalizePath(row.name).toLowerCase() === compilerOwnedFoundation.path.toLowerCase(),
    );
    if (!duplicate) {
      const { data: inserted, error: insertError } = await opts.supabase
        .from("project_files")
        .insert({
          project_id: opts.projectId,
          user_id: opts.userId,
          name: compilerOwnedFoundation.path,
          source: "generated-redesign-compiler",
          content: compilerOwnedFoundation.content,
          size_bytes: byteLength(compilerOwnedFoundation.content),
          target_style: compilerOwnedFoundation.style,
          status: "done",
          storage_path: null,
          redesigned_content: compilerOwnedFoundation.content,
          redesign_error: null,
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (insertError) warnings.push(`${compilerOwnedFoundation.path}: ${insertError.message}`);
      else if (inserted?.id) {
        created.push(compilerOwnedFoundation.path);
        files.push({
          name: compilerOwnedFoundation.path,
          source: "generated-redesign-compiler",
          content: compilerOwnedFoundation.content,
          targetStyle: compilerOwnedFoundation.style,
        });
      }
    }
  }

  let proposals: ProposedFile[] = [];
  try {
    proposals = await proposeRedesignFiles(project, files);
  } catch (error) {
    warnings.push(
      error instanceof Error ? error.message : "Could not discover redesign support artifacts",
    );
    return { version: "2026-10-artifact-orchestrator-v1", created, skipped, warnings };
  }

  for (const proposal of proposals) {
    try {
      const { data: duplicates, error: duplicateError } = await opts.supabase
        .from("project_files")
        .select("id, name")
        .eq("project_id", opts.projectId);
      if (duplicateError) throw new Error(duplicateError.message);
      if (
        (duplicates ?? []).some(
          (row: { name: string }) =>
            normalizePath(row.name).toLowerCase() === proposal.path.toLowerCase(),
        )
      ) {
        skipped.push(proposal.path);
        continue;
      }

      const fallbackStyle =
        project.style_mode === "file"
          ? null
          : (project.target_style ?? files.find((file) => file.targetStyle)?.targetStyle ?? null);
      let proposalContent = proposal.content;
      if (fallbackStyle && /\.(?:css|scss|sass|less)$/i.test(proposal.path)) {
        proposalContent = applyCompiledDirectionFoundation(
          proposalContent,
          fallbackStyle,
          tailwindV4,
        );
      }
      proposalContent = repairRedesignCssCompatibility({
        name: proposal.path,
        source: "",
        output: proposalContent,
        style: fallbackStyle,
      });
      validateRedesignCssCompatibility({
        name: proposal.path,
        source: "",
        output: proposalContent,
        style: fallbackStyle,
      });
      const { data: inserted, error: insertError } = await opts.supabase
        .from("project_files")
        .insert({
          project_id: opts.projectId,
          user_id: opts.userId,
          name: proposal.path,
          source: "generated-redesign",
          content: proposalContent,
          size_bytes: byteLength(proposalContent),
          target_style: fallbackStyle,
          status: project.style_mode === "file" ? "done" : "queued",
          storage_path: null,
          redesigned_content: project.style_mode === "file" ? proposalContent : null,
          redesign_error: null,
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (insertError) throw new Error(insertError.message);
      if (!inserted?.id) throw new Error(`Could not verify ${proposal.path}`);
      created.push(proposal.path);
    } catch (error) {
      warnings.push(
        `${proposal.path}: ${error instanceof Error ? error.message : "could not create artifact"}`,
      );
    }
  }

  return { version: "2026-10-artifact-orchestrator-v1", created, skipped, warnings };
}

export async function ensureProjectArtifacts(opts: {
  engine: "seo" | "redesign";
  supabase: any;
  projectId: string;
  userId: string;
  sourceMode?: SourceMode;
}): Promise<Result> {
  if (opts.engine === "seo") {
    return ensureSeoArtifacts({
      engine: "seo",
      supabase: opts.supabase,
      projectId: opts.projectId,
      userId: opts.userId,
      sourceMode: opts.sourceMode ?? "original",
    });
  }
  return ensureRedesignArtifacts({
    supabase: opts.supabase,
    projectId: opts.projectId,
    userId: opts.userId,
    sourceMode: opts.sourceMode ?? "original",
  });
}
