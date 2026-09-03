import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Section, SectionHeading } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { allStyleNames } from "@/data/site";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project files — Rezyn revision workspace" },
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

const fieldClass =
  "w-full border border-border bg-paper-dim px-3 py-[11px] text-[15px] text-foreground focus:bg-background focus:outline-2 focus:outline-offset-1 focus:outline-revision";

const buttonClass =
  "border border-primary bg-primary px-[22px] py-[11px] text-[14.5px] font-medium text-primary-foreground transition-colors hover:bg-ink-soft disabled:opacity-60";

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newStyle, setNewStyle] = useState<string>(allStyleNames[0] ?? "");

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
        .select("id, name, source, status, size_bytes, target_style, storage_path, content")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (err) throw err;
      return data;
    },
  });

  const perFile = project.data?.style_mode === "file";

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });

  const uploadFiles = async (list: FileList | null) => {
    if (!list || !user) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(list)) {
        const path = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("project-files")
          .upload(path, file);
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
      }
      await invalidate();
      if (fileInput.current) fileInput.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
        <div className="max-w-[720px] border border-border p-7">
          {perFile ? (
            <div className="mb-5">
              <label htmlFor="upstyle" className="mb-[6px] block text-sm text-muted-foreground">
                Target style for these uploads
              </label>
              <select
                id="upstyle"
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                className={fieldClass}
              >
                {allStyleNames.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <input
            ref={fileInput}
            type="file"
            multiple
            onChange={(e) => void uploadFiles(e.target.files)}
            className="block w-full text-[15px]"
          />
          <p className="mt-3 text-[13px] text-muted-foreground">
            {uploading ? "Uploading…" : "Up to 20MB per file."}
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading label="New file" title="Or write one here." />
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
          className="grid max-w-[720px] grid-cols-1 gap-5 border border-border p-7"
        >
          <div>
            <label htmlFor="fname" className="mb-[6px] block text-sm text-muted-foreground">
              File name
            </label>
            <input
              id="fname"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={fieldClass}
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
              className={`${fieldClass} resize-y font-mono text-[13.5px]`}
              spellCheck={false}
            />
          </div>
          <div>
            <button type="submit" disabled={createFile.isPending} className={buttonClass}>
              {createFile.isPending ? "Saving…" : "Create file"}
            </button>
          </div>
        </form>
        {error ? <p className="mt-4 text-[13px] text-destructive">{error}</p> : null}
      </Section>

      <Section last>
        <SectionHeading label="Files" title="Everything queued for revision." />
        {files.isLoading ? (
          <p className="text-ink-soft">Loading…</p>
        ) : (files.data?.length ?? 0) === 0 ? (
          <p className="text-ink-soft">No files yet — upload or create one above.</p>
        ) : (
          <div className="border-b border-border">
            {files.data?.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-1 items-center gap-3 border-t border-border py-[18px] md:grid-cols-[1fr_140px_220px_90px]"
              >
                <div>
                  <div className="text-[16px]">{file.name}</div>
                  <div className="text-[13px] text-muted-foreground">
                    {file.source === "upload" ? "Uploaded" : "Created here"}
                    {file.size_bytes ? ` · ${Math.max(1, Math.round(file.size_bytes / 1024))} KB` : ""}
                  </div>
                </div>
                <div className="text-[14px] text-ink-soft">{file.status}</div>
                <div>
                  {perFile ? (
                    <select
                      value={file.target_style ?? ""}
                      onChange={(e) =>
                        setFileStyle.mutate({ id: file.id, style: e.target.value })
                      }
                      className={fieldClass}
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
                    className="text-[13px] text-destructive underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
