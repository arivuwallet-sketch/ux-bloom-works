import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Section, SectionHeading } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { productTypes, allStyleNames } from "@/data/site";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Your projects — Rezyn revision workspace" },
      {
        name: "description",
        content:
          "Create a project, upload the files you want redesigned, and choose the target style for the revision.",
      },
      { property: "og:title", content: "Your projects — Rezyn" },
      {
        property: "og:description",
        content: "Upload project files and pick the styles Rezyn should redesign them into.",
      },
    ],
  }),
  component: ProjectsPage,
});

const fieldClass =
  "w-full border border-border bg-foreground/[0.04] px-3 py-[11px] backdrop-blur-sm text-[15px] text-foreground focus:bg-background focus:outline-2 focus:outline-offset-1 focus:outline-revision";

function ProjectsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [productType, setProductType] = useState<string>(productTypes[0]);
  const [styleMode, setStyleMode] = useState<"project" | "file">("project");
  const [targetStyle, setTargetStyle] = useState<string>(allStyleNames[0] ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const projects = useQuery({
    queryKey: ["projects", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("projects")
        .select("id, name, product_type, style_mode, target_style, created_at")
        .order("created_at", { ascending: false });
      if (err) throw err;
      return data;
    },
  });

  const createProject = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { data, error: err } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: name.trim(),
          product_type: productType,
          style_mode: styleMode,
          target_style: styleMode === "project" ? targetStyle : null,
          notes: notes.trim() || null,
        })
        .select("id")
        .single();
      if (err) throw err;
      return data;
    },
    onSuccess: (data) => {
      setName("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/projects/$projectId", params: { projectId: data.id } });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not create project"),
  });

  if (loading || !user) {
    return (
      <main>
        <Section last>
          <p className="text-ink-soft">Loading your workspace…</p>
        </Section>
      </main>
    );
  }

  return (
    <main>
      <Section>
        <SectionHeading
          label="Workspace"
          title="Start a project, then upload the files we should redesign."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            if (name.trim().length < 2) {
              setError("Give the project a name.");
              return;
            }
            createProject.mutate();
          }}
          className="glass grid max-w-[720px] grid-cols-1 gap-5 p-7 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label htmlFor="pname" className="mb-[6px] block text-sm text-muted-foreground">
              Project name
            </label>
            <input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="Acme marketing site"
            />
          </div>

          <div>
            <label htmlFor="ptype" className="mb-[6px] block text-sm text-muted-foreground">
              What are we revising?
            </label>
            <select
              id="ptype"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className={fieldClass}
            >
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="smode" className="mb-[6px] block text-sm text-muted-foreground">
              How should styles be chosen?
            </label>
            <select
              id="smode"
              value={styleMode}
              onChange={(e) => setStyleMode(e.target.value as "project" | "file")}
              className={fieldClass}
            >
              <option value="project">One style for the whole project</option>
              <option value="file">A style per file</option>
            </select>
          </div>

          {styleMode === "project" ? (
            <div className="md:col-span-2">
              <label htmlFor="pstyle" className="mb-[6px] block text-sm text-muted-foreground">
                Target style
              </label>
              <select
                id="pstyle"
                value={targetStyle}
                onChange={(e) => setTargetStyle(e.target.value)}
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

          <div className="md:col-span-2">
            <label htmlFor="pnotes" className="mb-[6px] block text-sm text-muted-foreground">
              What's going wrong? (optional)
            </label>
            <textarea
              id="pnotes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${fieldClass} resize-y`}
            />
          </div>

          {error ? <p className="text-[13px] text-destructive md:col-span-2">{error}</p> : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createProject.isPending}
              className="border border-primary bg-primary px-[22px] py-[11px] text-[14.5px] font-medium text-primary-foreground transition-colors hover:bg-ink-soft disabled:opacity-60"
            >
              {createProject.isPending ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </Section>

      <Section last>
        <SectionHeading label="Open projects" title="Everything you've handed us so far." />
        {projects.isLoading ? (
          <p className="text-ink-soft">Loading…</p>
        ) : (projects.data?.length ?? 0) === 0 ? (
          <p className="text-ink-soft">No projects yet — create one above.</p>
        ) : (
          <div className="border-b border-border">
            {projects.data?.map((project) => (
              <Link
                key={project.id}
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                className="grid grid-cols-1 gap-2 border-t border-border py-[22px] transition-colors hover:bg-paper-dim md:grid-cols-[1fr_200px_180px]"
              >
                <div className="font-serif text-[25px] tracking-[0.05em]">{project.name}</div>
                <div className="text-[15px] text-ink-soft">{project.product_type}</div>
                <div className="text-[15px] text-muted-foreground">
                  {project.style_mode === "project"
                    ? (project.target_style ?? "No style yet")
                    : "Per-file styles"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
