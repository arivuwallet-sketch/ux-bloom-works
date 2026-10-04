import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  FileCode2,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { allStyleNames } from "@/data/site";
import { redesignNextFile, requeueFailedRedesign, resetRedesign } from "@/lib/redesign.functions";
import { getSeoProjectState, resetSeoAgent, seoNextFile } from "@/lib/seo.functions";
import type { SeoAudit, SeoCategory } from "@/lib/seo-intelligence";
import { uploadFileList } from "@/lib/upload-files";
import { downloadProjectZip } from "@/lib/download-zip";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Transformation console — Rezyn" },
      {
        name: "description",
        content:
          "Upload source files, redesign interfaces, run the AI SEO Agent and export the transformed project.",
      },
    ],
  }),
  component: ProjectDetailPage,
});

const statusBadge: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  queued: { label: "Queued", cls: "", icon: Clock },
  redesigning: { label: "Transforming", cls: "badge-active", icon: Loader2 },
  done: { label: "Done", cls: "badge-done", icon: CheckCircle2 },
  failed: { label: "Failed", cls: "badge-error", icon: XCircle },
  skipped: { label: "Skipped", cls: "", icon: XCircle },
};

type EngineMode = "redesign" | "seo" | "combined";
type SeoPlanState = {
  status: string;
  source_mode: "original" | "redesigned";
  source_signature: string;
  plan: unknown;
  audit_before: SeoAudit | null;
  audit_after: SeoAudit | null;
  score_before: number | null;
  score_after: number | null;
  error: string | null;
  updated_at: string;
};

const seoCategoryLabels: Record<SeoCategory, string> = {
  crawlability: "Crawlability",
  indexability: "Indexability",
  metadata: "Metadata",
  semantics: "Semantics",
  structuredData: "Structured data",
  internalLinking: "Internal linking",
  social: "Social metadata",
  accessibility: "Accessibility SEO",
  performance: "Performance SEO",
};

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const staleFailureCleanup = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newStyle, setNewStyle] = useState<string>(allStyleNames[0] ?? "");
  const [engineMode, setEngineMode] = useState<EngineMode>("redesign");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const runNext = useServerFn(redesignNextFile);
  const requeueFailed = useServerFn(requeueFailedRedesign);
  const runReset = useServerFn(resetRedesign);
  const runSeoNext = useServerFn(seoNextFile);
  const runSeoReset = useServerFn(resetSeoAgent);
  const fetchSeoState = useServerFn(getSeoProjectState);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const project = useQuery({
    queryKey: ["project", projectId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("projects")
        .select("id, name, product_type, style_mode, target_style, notes")
        .eq("id", projectId)
        .maybeSingle();
      if (err) throw err;
      return data;
    },
  });

  const files = useQuery({
    queryKey: ["project-files", projectId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("project_files")
        .select(
          "id, name, source, status, size_bytes, target_style, storage_path, content, redesigned_content, redesign_error",
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (err) throw err;
      return data;
    },
  });

  const seoState = useQuery({
    queryKey: ["project-seo-state", projectId],
    enabled: Boolean(user),
    queryFn: () => fetchSeoState({ data: { projectId } }),
  });

  useEffect(() => {
    if (!user || !files.isFetched || staleFailureCleanup.current) return;
    staleFailureCleanup.current = true;

    const legacyCompilerError =
      /(Fix Tailwind v4 syntax|nested dark: block inside @theme|Register reusable Neo effects|--input resolves to the same color|prefers-reduced-motion override)/i;
    const hasLegacyFailure = (files.data ?? []).some(
      (file) => file.status === "failed" && legacyCompilerError.test(file.redesign_error ?? ""),
    );
    if (!hasLegacyFailure) return;

    void requeueFailed({ data: { projectId, legacyCompilerOnly: true } })
      .then((result) => {
        if (result.requeued > 0) {
          return queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
        }
        return undefined;
      })
      .catch(() => {
        staleFailureCleanup.current = false;
      });
  }, [files.data, files.isFetched, projectId, queryClient, requeueFailed, user]);

  const perFile = project.data?.style_mode === "file";

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
  const invalidateSeo = () =>
    queryClient.invalidateQueries({ queryKey: ["project-seo-state", projectId] });

  const uploadFiles = async (list: FileList | null) => {
    if (!list || !user) return;
    setUploadError(null);
    setArchiveNotice(null);
    setUploading(true);
    try {
      const result = await uploadFileList({
        list,
        userId: user.id,
        projectId,
        targetStyle: perFile ? newStyle : (project.data?.target_style ?? null),
      });
      if (result.archiveNotice) setArchiveNotice(result.archiveNotice);
      if (result.error) setUploadError(result.error);
      await invalidate();
      await invalidateSeo();
      if (fileInput.current) fileInput.current.value = "";
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const createFile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error: err } = await supabase.from("project_files").insert({
        project_id: projectId,
        user_id: user.id,
        name: newName.trim(),
        source: "created",
        content: newContent,
        size_bytes: new Blob([newContent]).size,
        target_style: perFile ? newStyle : (project.data?.target_style ?? null),
      });
      if (err) throw err;
    },
    onSuccess: async () => {
      setNewName("");
      setNewContent("");
      await invalidate();
      await invalidateSeo();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not create file"),
  });

  const setFileStyle = useMutation({
    mutationFn: async ({ id, style }: { id: string; style: string }) => {
      const { error: err } = await supabase
        .from("project_files")
        .update({ target_style: style })
        .eq("id", id);
      if (err) throw err;
    },
    onSuccess: async () => {
      await invalidate();
      await invalidateSeo();
    },
  });

  const removeFile = useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string | null }) => {
      if (storagePath) await supabase.storage.from("project-files").remove([storagePath]);
      const { error: err } = await supabase.from("project_files").delete().eq("id", id);
      if (err) throw err;
    },
    onSuccess: async () => {
      await invalidate();
      await invalidateSeo();
    },
  });

  const runRedesignPhase = async () => {
    for (let i = 0; i < 250; i += 1) {
      const res = await runNext({ data: { projectId } });
      void invalidate();
      if (res.done) return;
      const complete = res.total - res.remaining;
      setProgress(`Redesigning ${Math.min(complete, res.total)} of ${res.total} — ${res.current}`);
      if (res.remaining === 0) return;
    }
    throw new Error("Redesign queue exceeded the safe step limit.");
  };

  const runSeoPhase = async (sourceMode: "original" | "redesigned") => {
    for (let i = 0; i < 250; i += 1) {
      const res = await runSeoNext({ data: { projectId, sourceMode } });
      void invalidateSeo();
      if (res.done) {
        setProgress(`SEO optimization complete — measured score ${res.score}/100.`);
        return;
      }
      const complete = res.total - res.remaining;
      setProgress(`SEO Agent ${Math.min(complete, res.total)} of ${res.total} — ${res.current}`);
      if (res.remaining === 0) continue;
    }
    throw new Error("SEO queue exceeded the safe step limit.");
  };

  const startTransformation = async () => {
    setError(null);
    setProgress(null);
    setRunning(true);
    try {
      if (engineMode === "redesign") {
        const retry = await requeueFailed({ data: { projectId } });
        if (retry.requeued > 0) {
          setProgress(
            `Retrying ${retry.requeued} previously failed redesign file${retry.requeued === 1 ? "" : "s"} with the current compiler.`,
          );
          await invalidate();
        }
        await runRedesignPhase();
        setProgress("Redesign complete.");
      } else if (engineMode === "seo") {
        await runSeoPhase("original");
      } else {
        setProgress("Stage 1/2 — reconstructing the interface from the project design plan.");
        const retry = await requeueFailed({ data: { projectId } });
        if (retry.requeued > 0) {
          setProgress(
            `Stage 1/2 — retrying ${retry.requeued} previously failed redesign file${retry.requeued === 1 ? "" : "s"} with the current compiler.`,
          );
          await invalidate();
        }
        await runRedesignPhase();
        setProgress("Stage 2/2 — auditing and optimizing the redesigned project for SEO.");
        await runSeoPhase("redesigned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transformation failed");
    } finally {
      setRunning(false);
      await invalidate();
      await invalidateSeo();
    }
  };

  const restart = async () => {
    setError(null);
    setProgress(null);
    try {
      if (engineMode === "redesign" || engineMode === "combined") {
        await runReset({ data: { projectId } });
      }
      if (engineMode === "seo" || engineMode === "combined") {
        await runSeoReset({ data: { projectId } });
      }
      await invalidate();
      await invalidateSeo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset");
    }
  };

  const seoPlanState = (seoState.data?.plan ?? null) as SeoPlanState | null;
  const expectedSeoSourceMode = engineMode === "combined" ? "redesigned" : "original";
  const seoResultsAreCurrent =
    engineMode !== "redesign" && seoPlanState?.source_mode === expectedSeoSourceMode;
  const seoRows = seoState.data?.files ?? [];
  const seoByFile = useMemo(
    () => new Map(seoRows.map((row) => [row.project_file_id, row])),
    [seoRows],
  );

  const downloadZip = async () => {
    setZipping(true);
    setError(null);
    try {
      await downloadProjectZip({
        projectName: project.data?.name ?? "project",
        files: (files.data ?? []).map((file) => ({
          ...file,
          seo_content: seoResultsAreCurrent ? (seoByFile.get(file.id)?.seo_content ?? null) : null,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the ZIP");
    } finally {
      setZipping(false);
    }
  };

  const redesignDoneCount = (files.data ?? []).filter(
    (file) => file.status === "done" || file.status === "skipped",
  ).length;
  const totalCount = files.data?.length ?? 0;
  const seoDoneCount = seoResultsAreCurrent ? (seoState.data?.completed ?? 0) : 0;
  // Combined mode has two passes over the same project files. Keep the user-facing
  // denominator equal to the real project file count instead of misleadingly doubling it.
  const combinedWork = redesignDoneCount + seoDoneCount;
  const completedUnits =
    engineMode === "redesign"
      ? redesignDoneCount
      : engineMode === "seo"
        ? seoDoneCount
        : Math.floor(combinedWork / 2);
  const totalUnits = totalCount;
  const progressPct =
    totalCount === 0
      ? 0
      : engineMode === "combined"
        ? Math.round((combinedWork / (totalCount * 2)) * 100)
        : Math.round((completedUnits / totalCount) * 100);
  const canExport = engineMode === "redesign" ? redesignDoneCount > 0 : seoDoneCount > 0;
  const activeAudit = (seoPlanState?.audit_after ??
    seoPlanState?.audit_before ??
    null) as SeoAudit | null;
  const scoreBefore = seoPlanState?.score_before ?? null;
  const scoreAfter = seoPlanState?.score_after ?? null;

  if (loading || !user || project.isLoading) {
    return (
      <main className="system-state">
        <div className="system-state__card">
          <span className="eyebrow">Opening console</span>
          <h1>Synchronizing project state.</h1>
        </div>
      </main>
    );
  }

  if (!project.data) {
    return (
      <main className="system-state">
        <div className="system-state__card">
          <span className="eyebrow">Project unavailable</span>
          <h1>This transformation record is not accessible.</h1>
          <Link to="/projects" className="button-secondary">
            Back to workspace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-28 pt-[128px] sm:pt-[148px]">
      <div className="wrap">
        <Reveal>
          <header className="mb-10 border-b border-border pb-10">
            <Link
              to="/projects"
              className="mb-8 inline-flex items-center gap-2 text-[12px] text-muted-foreground no-underline transition-colors hover:text-revision"
            >
              <ArrowLeft className="h-4 w-4" /> Workspace
            </Link>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="eyebrow">Transformation console</span>
                <h1 className="mb-0 mt-6 max-w-[11ch] text-[clamp(54px,7vw,104px)] leading-[0.86]">
                  {project.data.name}
                </h1>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="badge">{project.data.product_type}</span>
                  <span className="badge badge-active">
                    {perFile
                      ? "Per-file direction"
                      : (project.data.target_style ?? "Direction unset")}
                  </span>
                  <span className="badge">
                    {engineMode === "redesign"
                      ? "Redesign"
                      : engineMode === "seo"
                        ? "SEO Agent"
                        : "Redesign + SEO"}
                  </span>
                </div>
                {project.data.notes ? (
                  <p className="mb-0 mt-6 max-w-[720px] text-[15px] leading-7 text-ink-soft">
                    {project.data.notes}
                  </p>
                ) : null}
              </div>
              <div className="glass min-w-[250px] p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">
                    TRANSFORMATION
                  </span>
                  <span
                    className={running ? "signal-dot" : "h-[7px] w-[7px] rounded-full bg-white/20"}
                  />
                </div>
                <div className="mt-9 flex items-end gap-3">
                  <strong className="font-serif text-[52px] leading-none tracking-[-0.07em]">
                    {progressPct}%
                  </strong>
                  <span className="pb-1 text-[12px] text-ink-soft">
                    {completedUnits}/{totalUnits} units
                  </span>
                </div>
                <div className="progress-track mt-4">
                  <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </header>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <Reveal>
            <section className="glass p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <span className="eyebrow">01 / ingest</span>
                  <h2 className="mb-0 mt-4 text-[38px] leading-none">Source files</h2>
                </div>
                <UploadCloud className="h-5 w-5 text-revision" />
              </div>

              {perFile ? (
                <div className="mb-5">
                  <label
                    htmlFor="upstyle"
                    className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase"
                  >
                    Direction for this upload
                  </label>
                  <select
                    id="upstyle"
                    value={newStyle}
                    onChange={(event) => setNewStyle(event.target.value)}
                    className="field"
                  >
                    {allStyleNames.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="dropzone">
                <UploadCloud className="h-7 w-7 text-revision" aria-hidden />
                <p className="mb-0 text-[15px] font-medium">
                  {uploading ? "Reading source…" : "Drop source files or a project ZIP"}
                </p>
                <p className="mb-0 max-w-[52ch] text-[12px] leading-6 text-muted-foreground">
                  Individual files or a complete project archive. Rezyn extracts project files while
                  keeping folder structure intact.
                </p>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  onChange={(event) => void uploadFiles(event.target.files)}
                  aria-label="Upload files or a zip archive"
                />
              </div>
              {archiveNotice ? (
                <p className="mb-0 mt-3 text-[13px] text-revision">{archiveNotice}</p>
              ) : null}
              {uploadError ? (
                <p className="mb-0 mt-3 text-[13px] text-destructive">{uploadError}</p>
              ) : null}
            </section>
          </Reveal>

          <Reveal delay={0.06}>
            <section className="glass flex h-full flex-col p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <span className="eyebrow">02 / transform</span>
                  <h2 className="mb-0 mt-4 text-[38px] leading-none">AI engine</h2>
                </div>
                {engineMode === "seo" ? (
                  <Search className="h-5 w-5 text-revision" />
                ) : (
                  <Sparkles className="h-5 w-5 text-revision" />
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="engine-mode"
                  className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase"
                >
                  Engine mode
                </label>
                <select
                  id="engine-mode"
                  value={engineMode}
                  disabled={running}
                  onChange={(event) => setEngineMode(event.target.value as EngineMode)}
                  className="field"
                >
                  <option value="redesign">Redesign — UI/UX reconstruction only</option>
                  <option value="seo">SEO Agent — preserve design, optimize SEO</option>
                  <option value="combined">Redesign + SEO — reconstruct, then optimize</option>
                </select>
              </div>

              <p className="mb-6 text-[14px] leading-7 text-ink-soft">
                {totalCount === 0
                  ? "Add source files before starting the transformation."
                  : engineMode === "redesign"
                    ? `${redesignDoneCount} of ${totalCount} files currently redesigned.`
                    : engineMode === "seo"
                      ? `${seoDoneCount} of ${totalCount} files processed by the SEO Agent.`
                      : `${redesignDoneCount}/${totalCount} redesign + ${seoDoneCount}/${totalCount} SEO.`}
              </p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              {progress ? (
                <p className="mb-0 mt-3 font-mono text-[10px] tracking-[0.06em] text-revision">
                  {progress}
                </p>
              ) : null}
              {error ? (
                <p className="mb-0 mt-3 text-[13px] text-destructive">
                  {error.replace(/^NO_CREDITS:\s*/, "")}
                </p>
              ) : null}
              {engineMode !== "redesign" && seoState.data?.schemaReady === false ? (
                <p className="mb-0 mt-3 text-[12px] leading-6 text-destructive">
                  SEO Agent database schema is not installed. Apply{" "}
                  <code>0008_create_seo_agent.sql</code> to the connected Supabase project.
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void startTransformation()}
                  disabled={
                    running ||
                    totalCount === 0 ||
                    (engineMode !== "redesign" && seoState.data?.schemaReady === false)
                  }
                  className="button-primary disabled:opacity-50"
                >
                  {running ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : engineMode === "seo" ? (
                    <Search className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {running
                    ? "Running…"
                    : engineMode === "redesign"
                      ? "Run redesign"
                      : engineMode === "seo"
                        ? "Run SEO Agent"
                        : "Run redesign + SEO"}
                </button>
                <button
                  type="button"
                  onClick={() => void downloadZip()}
                  disabled={zipping || !canExport}
                  className="button-secondary disabled:opacity-50"
                >
                  <Download className="h-4 w-4" /> {zipping ? "Packing…" : "Export ZIP"}
                </button>
              </div>

              <div className="mt-auto pt-8">
                <Link
                  to="/projects/$projectId/chat"
                  params={{ projectId }}
                  className="group flex items-center justify-between gap-4 border-t border-border pt-5 text-inherit no-underline"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet/25 bg-violet/5 text-violet">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span>
                      <strong className="block text-[14px]">Open conversational redesign</strong>
                      <span className="text-[11px] text-muted-foreground">
                        Describe visual changes instead of choosing a direction.
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-revision" />
                </Link>
                {completedUnits > 0 ? (
                  <button
                    type="button"
                    onClick={() => void restart()}
                    className="mt-5 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[11px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset current engine queue
                  </button>
                ) : null}
              </div>
            </section>
          </Reveal>
        </div>

        {engineMode !== "redesign" ? (
          <Reveal className="mt-5" delay={0.07}>
            <section className="glass p-6 sm:p-8">
              <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-[620px]">
                  <span className="eyebrow">SEO Intelligence</span>
                  <div className="mt-4 flex items-end gap-4">
                    <h2 className="mb-0 text-[42px] leading-none">Measured project audit</h2>
                    {scoreBefore !== null ? (
                      <span className="badge badge-active">
                        {scoreBefore}
                        {scoreAfter !== null ? ` → ${scoreAfter}` : ""} / 100
                      </span>
                    ) : null}
                  </div>
                  <p className="mb-0 mt-5 text-[13px] leading-6 text-ink-soft">
                    Deterministic checks first, AI planning second. Rezyn does not invent rankings,
                    search volume, reviews, ratings, traffic or unsupported schema facts.
                  </p>
                  {seoPlanState?.error ? (
                    <p className="mb-0 mt-4 text-[12px] text-destructive">{seoPlanState.error}</p>
                  ) : null}
                </div>

                {activeAudit ? (
                  <div className="grid w-full max-w-[620px] grid-cols-2 gap-2 sm:grid-cols-3">
                    {(Object.keys(seoCategoryLabels) as SeoCategory[]).map((category) => (
                      <div
                        key={category}
                        className="rounded-xl border border-border bg-white/[0.02] p-3"
                      >
                        <span className="block font-mono text-[8px] tracking-[0.08em] text-muted-foreground uppercase">
                          {seoCategoryLabels[category]}
                        </span>
                        <strong className="mt-2 block text-[24px] leading-none">
                          {activeAudit.categories[category]}
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-w-[520px] text-[12px] leading-6 text-muted-foreground">
                    Run the SEO Agent to create the project-wide SEO constitution, baseline audit,
                    file plan and post-update validation report.
                  </div>
                )}
              </div>

              {activeAudit?.issues?.length ? (
                <div className="mt-7 border-t border-border pt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                      Measured findings
                    </span>
                    <span className="badge">{activeAudit.issueCount} issues</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                    {activeAudit.issues.slice(0, 8).map((issue) => (
                      <div key={issue.id} className="rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-[12px]">{issue.file ?? "Project-wide"}</strong>
                          <span className="font-mono text-[8px] uppercase text-muted-foreground">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="mb-0 mt-2 text-[11px] leading-5 text-ink-soft">
                          {issue.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </Reveal>
        ) : null}

        <Reveal className="mt-5" delay={0.08}>
          <section className="glass p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <span className="eyebrow">03 / author</span>
                <h2 className="mb-0 mt-4 text-[38px] leading-none">Create a source file</h2>
              </div>
              <Code2 className="h-5 w-5 text-revision" />
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setError(null);
                if (newName.trim().length < 1) {
                  setError("Give the file a name.");
                  return;
                }
                createFile.mutate();
              }}
              className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]"
            >
              <div>
                <label
                  htmlFor="fname"
                  className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase"
                >
                  File name
                </label>
                <input
                  id="fname"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  className="field"
                  placeholder="landing-page.tsx"
                />
                {perFile ? (
                  <div className="mt-4">
                    <label
                      htmlFor="newstyle"
                      className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase"
                    >
                      Target direction
                    </label>
                    <select
                      id="newstyle"
                      value={newStyle}
                      onChange={(event) => setNewStyle(event.target.value)}
                      className="field"
                    >
                      {allStyleNames.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={createFile.isPending}
                  className="button-secondary mt-5 w-full disabled:opacity-50"
                >
                  <FileCode2 className="h-4 w-4" />{" "}
                  {createFile.isPending ? "Saving…" : "Add source file"}
                </button>
              </div>
              <div>
                <label
                  htmlFor="fbody"
                  className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase"
                >
                  Source contents
                </label>
                <textarea
                  id="fbody"
                  rows={10}
                  value={newContent}
                  onChange={(event) => setNewContent(event.target.value)}
                  className="field resize-y font-mono text-[12px]"
                  spellCheck={false}
                />
              </div>
            </form>
          </section>
        </Reveal>

        <Reveal className="mt-14" delay={0.1}>
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Project manifest</span>
                <h2 className="mb-0 mt-4 text-[42px] leading-none">Files / {totalCount}</h2>
              </div>
              <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">
                LIVE SOURCE INDEX
              </span>
            </div>

            {files.isLoading ? (
              <div className="glass p-7 text-ink-soft">Reading project files…</div>
            ) : totalCount === 0 ? (
              <div className="glass p-10 text-center text-ink-soft">
                No source files yet. Add files above to build the project manifest.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {files.data?.map((file, index) => {
                  const status = statusBadge[file.status] ?? statusBadge["queued"]!;
                  const StatusIcon = status.icon;
                  const seoRow = seoResultsAreCurrent ? seoByFile.get(file.id) : undefined;
                  return (
                    <article
                      key={file.id}
                      className="glass grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-[46px_1fr_150px_minmax(180px,240px)_40px]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] font-mono text-[9px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-medium">{file.name}</div>
                        <div className="mt-1 font-mono text-[9px] tracking-[0.06em] text-muted-foreground uppercase">
                          {file.source === "upload" ? "Uploaded" : "Created"}
                          {file.size_bytes
                            ? ` / ${Math.max(1, Math.round(file.size_bytes / 1024))} KB`
                            : ""}
                        </div>
                        {file.redesign_error ? (
                          <div className="mt-1 text-[11px] text-destructive">
                            {file.status === "failed" ? (
                              <details>
                                <summary className="cursor-pointer">
                                  Previous redesign attempt failed — it will retry on the next run.
                                </summary>
                                <div className="mt-1 max-w-3xl whitespace-pre-wrap text-[10px] opacity-75">
                                  {file.redesign_error}
                                </div>
                              </details>
                            ) : (
                              file.redesign_error
                            )}
                          </div>
                        ) : null}
                        {seoRow?.error ? (
                          <div className="mt-1 text-[11px] text-destructive">
                            SEO: {seoRow.error}
                          </div>
                        ) : null}
                        {seoRow ? (
                          <div className="mt-1 font-mono text-[8px] tracking-[0.08em] text-muted-foreground uppercase">
                            SEO / {seoRow.status}
                          </div>
                        ) : null}
                      </div>
                      <span className={`badge ${status.cls}`}>
                        <StatusIcon
                          className={`h-3 w-3 ${file.status === "redesigning" ? "animate-spin" : ""}`}
                        />{" "}
                        {status.label}
                      </span>
                      <div>
                        {perFile ? (
                          <select
                            value={file.target_style ?? ""}
                            onChange={(event) =>
                              setFileStyle.mutate({ id: file.id, style: event.target.value })
                            }
                            className="field"
                            aria-label={`Target direction for ${file.name}`}
                          >
                            <option value="">Choose direction…</option>
                            {allStyleNames.map((style) => (
                              <option key={style} value={style}>
                                {style}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">
                            {project.data?.target_style ?? "Project direction unset"}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeFile.mutate({ id: file.id, storagePath: file.storage_path })
                        }
                        aria-label={`Remove ${file.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/15 bg-destructive/5 text-destructive/70 transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </main>
  );
}
