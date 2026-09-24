import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  RotateCcw,
  Sparkles,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { Section, SectionHeading } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { allStyleNames } from "@/data/site";
import { redesignNextFile, resetRedesign } from "@/lib/redesign.functions";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project files — Rezyn redesign workspace" },
      {
        name: "description",
        content:
          "Upload the files you want redesigned, create new files in the browser, and set the target style for each one.",
      },
      { property: "og:title", content: "Project files — Rezyn" },
      {
        property: "og:description",
        content: "Upload, create, and style the files Rezyn will redesign.",
      },
    ],
  }),
  component: ProjectDetailPage,
});

const buttonClass =
  "inline-flex items-center gap-2 border border-primary bg-primary px-[22px] py-[11px] text-[14.5px] font-medium text-primary-foreground transition-colors hover:bg-ink-soft disabled:opacity-60";

const statusBadge: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  queued: { label: "Queued", cls: "", icon: Clock },
  redesigning: { label: "Redesigning", cls: "badge-active", icon: Loader2 },
  done: { label: "Done", cls: "badge-done", icon: CheckCircle2 },
  failed: { label: "Failed", cls: "badge-error", icon: XCircle },
  skipped: { label: "Skipped", cls: "", icon: XCircle },
};

// Archive handling for project uploads — grab every redesignable file out of a .zip.
const ZIP_EXT = /\.zip$/i;
const UNSUPPORTED_ARCHIVE_EXT = /\.(7z|rar)$/i;
// Keep this list in sync with the server's TEXT_EXT in src/lib/redesign.functions.ts —
// only files it can actually send to the AI are worth pulling out of an archive.
const REDESIGNABLE_EXT =
  /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py)$/i;
const JUNK_PATH_SEGMENTS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  ".turbo/",
  ".cache/",
  "coverage/",
  ".vercel/",
  ".netlify/",
  "out/",
];
const JUNK_BASENAMES = new Set([
  // lockfiles
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb",
  "composer.lock",
  "cargo.lock",
  "pipfile.lock",
  "poetry.lock",
  // manifests/config — technically text, but not UI to redesign
  "package.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "components.json",
  "composer.json",
]);
const MAX_EXTRACTED_FILES = 300;

const GENERATED_FILE_PATTERN = /(\.gen\.tsx?|\.d\.ts)$/i;

function isJunkArchivePath(path: string) {
  const lower = path.toLowerCase();
  if (JUNK_PATH_SEGMENTS.some((seg) => lower.includes(seg))) return true;
  if (GENERATED_FILE_PATTERN.test(lower)) return true;
  const base = lower.split("/").pop() ?? lower;
  return JUNK_BASENAMES.has(base);
}

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newStyle, setNewStyle] = useState<string>(allStyleNames[0] ?? "");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const runNext = useServerFn(redesignNextFile);
  const runReset = useServerFn(resetRedesign);


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
        .select("id, name, source, status, size_bytes, target_style, storage_path, content, redesigned_content, redesign_error")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (err) throw err;
      return data;
    },
  });

  const perFile = project.data?.style_mode === "file";

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });

  const uploadPlainFile = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("project-files").upload(path, file);
    if (upErr) throw upErr;
    const { error: rowErr } = await supabase.from("project_files").insert({
      project_id: projectId,
      user_id: user.id,
      name: file.name,
      source: "upload",
      storage_path: path,
      size_bytes: file.size,
      target_style: perFile ? newStyle : (project.data?.target_style ?? null),
    });
    if (rowErr) throw rowErr;
  };

  /** Extracts a .zip client-side and inserts one row per redesignable file inside it. */
  const uploadArchive = async (archive: File) => {
    if (!user) return;
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(archive);
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);

    // If everything lives under one shared top-level folder (the common case for a
    // downloaded repo zip), drop that folder name so paths read cleanly.
    const paths = entries.map((entry) => entry.name);
    const topLevelFolders = new Set(paths.map((p) => p.split("/")[0] ?? ""));
    const [onlyFolder] = topLevelFolders;
    const singleRoot = topLevelFolders.size === 1 && paths.every((p) => p.includes("/"));
    const stripPrefix = singleRoot ? `${onlyFolder}/` : "";

    type NewFileRow = {
      project_id: string;
      user_id: string;
      name: string;
      source: string;
      content: string;
      size_bytes: number;
      target_style: string | null;
    };
    const rows: NewFileRow[] = [];
    let skipped = 0;

    for (const entry of entries) {
      const cleanPath =
        stripPrefix && entry.name.startsWith(stripPrefix)
          ? entry.name.slice(stripPrefix.length)
          : entry.name;
      if (!cleanPath || isJunkArchivePath(entry.name) || !REDESIGNABLE_EXT.test(cleanPath)) {
        skipped += 1;
        continue;
      }
      if (rows.length >= MAX_EXTRACTED_FILES) {
        skipped += 1;
        continue;
      }
      const text = await entry.async("string");
      if (!text.trim()) {
        skipped += 1;
        continue;
      }
      rows.push({
        project_id: projectId,
        user_id: user.id,
        name: cleanPath,
        source: "upload",
        content: text,
        size_bytes: new Blob([text]).size,
        target_style: perFile ? newStyle : (project.data?.target_style ?? null),
      });
    }

    if (rows.length > 0) {
      const { error: rowErr } = await supabase.from("project_files").insert(rows);
      if (rowErr) throw rowErr;
    }

    const parts = [`Extracted ${rows.length} redesignable file${rows.length === 1 ? "" : "s"} from ${archive.name}`];
    if (skipped > 0) parts.push(`skipped ${skipped} (binaries, config, or lockfiles)`);
    if (rows.length >= MAX_EXTRACTED_FILES) parts.push(`capped at ${MAX_EXTRACTED_FILES} files`);
    setArchiveNotice(`${parts.join(" — ")}.`);
  };

  const uploadFiles = async (list: FileList | null) => {
    if (!list || !user) return;
    setUploadError(null);
    setArchiveNotice(null);
    setUploading(true);
    try {
      for (const file of Array.from(list)) {
        if (UNSUPPORTED_ARCHIVE_EXT.test(file.name)) {
          setUploadError(
            `${file.name}: 7z and RAR aren't supported yet — please re-zip as .zip, or upload the files individually.`,
          );
          continue;
        }
        if (ZIP_EXT.test(file.name)) {
          await uploadArchive(file);
          continue;
        }
        await uploadPlainFile(file);
      }
      await invalidate();
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
    onSuccess: invalidate,
  });

  const removeFile = useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string | null }) => {
      if (storagePath) await supabase.storage.from("project-files").remove([storagePath]);
      const { error: err } = await supabase.from("project_files").delete().eq("id", id);
      if (err) throw err;
    },
    onSuccess: invalidate,
  });

  const startRedesign = async () => {
    setError(null);
    setRunning(true);
    try {
      for (let i = 0; i < 200; i += 1) {
        const res = await runNext({ data: { projectId } });
        await invalidate();
        if (res.done) {
          setProgress("All files redesigned.");
          break;
        }
        const total = res.total;
        setProgress(`Redesigned ${total - res.remaining} of ${total} — ${res.current}`);
        if (res.remaining === 0) {
          setProgress("All files redesigned.");
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Redesign failed");
    } finally {
      setRunning(false);
      await invalidate();
    }
  };

  const restart = async () => {
    setError(null);
    setProgress(null);
    try {
      await runReset({ data: { projectId } });
      await invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset");
    }
  };

  const downloadZip = async () => {
    setZipping(true);
    setError(null);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const done = (files.data ?? []).filter((f) => f.redesigned_content);
      for (const file of done) zip.file(file.name, file.redesigned_content ?? "");
      if (done.length === 0) throw new Error("Nothing redesigned yet.");
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(project.data?.name ?? "project").replace(/[^a-z0-9-_]+/gi, "-")}-redesigned.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the ZIP");
    } finally {
      setZipping(false);
    }
  };

  const doneCount = (files.data ?? []).filter((f) => f.status === "done").length;
  const totalCount = files.data?.length ?? 0;
  const progressPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  if (loading || !user || project.isLoading) {
    return (
      <main>
        <Section last>
          <p className="text-ink-soft">Loading project…</p>
        </Section>
      </main>
    );
  }

  if (!project.data) {
    return (
      <main>
        <Section last>
          <p className="text-ink-soft">
            That project isn't available.{" "}
            <Link to="/projects" className="underline">
              Back to your projects
            </Link>
          </p>
        </Section>
      </main>
    );
  }

  return (
    <main>
      <Section>
        <SectionHeading label="Project" title={project.data.name} />
        <p className="max-w-[640px] text-[15px] text-ink-soft">
          {project.data.product_type} ·{" "}
          {perFile
            ? "You pick a target style per file."
            : `Whole project redesigned as ${project.data.target_style ?? "an unset style"}.`}
        </p>
        {project.data.notes ? (
          <p className="mt-3 max-w-[640px] text-[15px] text-muted-foreground">
            {project.data.notes}
          </p>
        ) : null}
      </Section>

      <Section>
        <SectionHeading label="Upload" title="Hand over the files we should redesign." />
        <Reveal>
          <div className="glass max-w-[720px] p-7">
            {perFile ? (
              <div className="mb-5">
                <label htmlFor="upstyle" className="mb-[6px] block text-sm text-muted-foreground">
                  Target style for these uploads
                </label>
                <select
                  id="upstyle"
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
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
              <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
              <p className="text-[15px]">
                {uploading ? "Uploading…" : "Drop files here, or click to browse"}
              </p>
              <p className="text-[13px] text-muted-foreground">
                Individual files, or a whole project as a .zip — we'll unzip it and pull out
                every redesignable file, folders and all.
              </p>
              <input
                ref={fileInput}
                type="file"
                multiple
                onChange={(e) => void uploadFiles(e.target.files)}
                aria-label="Upload files or a .zip archive"
              />
            </div>
            {archiveNotice ? <p className="mt-3 text-[13.5px] text-revision">{archiveNotice}</p> : null}
            {uploadError ? <p className="mt-3 text-[13px] text-destructive">{uploadError}</p> : null}
          </div>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading label="New file" title="Or write one here." />
        <Reveal>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              if (newName.trim().length < 1) {
                setError("Give the file a name.");
                return;
              }
              createFile.mutate();
            }}
            className="glass grid max-w-[720px] grid-cols-1 gap-5 p-7"
          >
            <div>
              <label htmlFor="fname" className="mb-[6px] block text-sm text-muted-foreground">
                File name
              </label>
              <input
                id="fname"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="field"
                placeholder="landing-page.html"
              />
            </div>
            <div>
              <label htmlFor="fbody" className="mb-[6px] block text-sm text-muted-foreground">
                Contents
              </label>
              <textarea
                id="fbody"
                rows={12}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="field resize-y font-mono text-[13.5px]"
                spellCheck={false}
              />
            </div>
            <div>
              <button type="submit" disabled={createFile.isPending} className={buttonClass}>
                {createFile.isPending ? "Saving…" : "Create file"}
              </button>
            </div>
          </form>
        </Reveal>
        {error ? <p className="mt-4 text-[13px] text-destructive">{error}</p> : null}
      </Section>

      <Section>
        <SectionHeading label="Redesign" title="Run it. Then take the ZIP." />
        <Reveal>
          <div className="glass max-w-[720px] p-7">
            <p className="text-[15px] text-ink-soft">
              {totalCount === 0
                ? "Add some files first."
                : `${doneCount} of ${totalCount} files redesigned.`}
            </p>
            {totalCount > 0 ? (
              <div className="progress-track mt-4">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            ) : null}
            {progress ? <p className="mt-3 text-[14px] text-revision">{progress}</p> : null}
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => void startRedesign()}
                disabled={running || totalCount === 0}
                className="glow-aurora inline-flex items-center gap-2 bg-revision px-[22px] py-[11px] text-[14.5px] font-semibold tracking-[0.04em] text-primary-foreground uppercase transition-transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-60"
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {running ? "Redesigning…" : "Start redesign"}
              </button>
              <button
                type="button"
                onClick={() => void downloadZip()}
                disabled={zipping || doneCount === 0}
                className="glass inline-flex items-center gap-2 px-[22px] py-[11px] text-[14.5px] font-medium text-foreground transition-colors hover:text-revision disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {zipping ? "Packing…" : "Download ZIP"}
              </button>
              {doneCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void restart()}
                  className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground underline hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Start over
                </button>
              ) : null}
            </div>
          </div>
        </Reveal>
      </Section>

      <Section last>
        <SectionHeading label="Files" title="Everything queued for redesign." />
        {files.isLoading ? (
          <p className="text-ink-soft">Loading…</p>
        ) : (files.data?.length ?? 0) === 0 ? (
          <p className="text-ink-soft">No files yet — upload or create one above.</p>
        ) : (
          <div className="border-b border-border">
            {files.data?.map((file) => {
              const st = statusBadge[file.status] ?? statusBadge["queued"]!;
              const StatusIcon = st.icon;
              return (
                <div
                  key={file.id}
                  className="grid grid-cols-1 items-center gap-3 border-t border-border py-[18px] md:grid-cols-[1fr_150px_220px_36px]"
                >
                  <div>
                    <div className="text-[16px]">{file.name}</div>
                    <div className="text-[13px] text-muted-foreground">
                      {file.source === "upload" ? "Uploaded" : "Created here"}
                      {file.size_bytes ? ` · ${Math.max(1, Math.round(file.size_bytes / 1024))} KB` : ""}
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${st.cls}`}>
                      <StatusIcon className={`h-3 w-3 ${file.status === "redesigning" ? "animate-spin" : ""}`} />
                      {st.label}
                    </span>
                    {file.redesign_error ? (
                      <div className="mt-1 text-[12px] text-destructive">{file.redesign_error}</div>
                    ) : null}
                  </div>
                  <div>
                    {perFile ? (
                      <select
                        value={file.target_style ?? ""}
                        onChange={(e) =>
                          setFileStyle.mutate({ id: file.id, style: e.target.value })
                        }
                        className="field"
                        aria-label={`Target style for ${file.name}`}
                      >
                        <option value="">Choose a style…</option>
                        {allStyleNames.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[14px] text-muted-foreground">
                        {project.data?.target_style ?? "Project style unset"}
                      </span>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        removeFile.mutate({ id: file.id, storagePath: file.storage_path })
                      }
                      aria-label={`Remove ${file.name}`}
                      className="text-destructive/70 transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </main>
  );
}
