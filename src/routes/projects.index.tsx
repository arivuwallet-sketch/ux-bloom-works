import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FolderOpen, Sparkles } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { Section, SectionHeading } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { productTypes, allStyleNames } from "@/data/site";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Your projects — Rezyn redesign workspace" },
      {
        name: "description",
        content:
          "Create a project, upload the files you want redesigned, and choose the design style.",
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
        <Reveal>
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
                className="field"
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
                className="field"
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
                className="field"
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

            <div className="md:col-span-2">
              <label htmlFor="pnotes" className="mb-[6px] block text-sm text-muted-foreground">
                What's going wrong? (optional)
              </label>
              <textarea
                id="pnotes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="field resize-y"
              />
            </div>

            {error ? <p className="text-[13px] text-destructive md:col-span-2">{error}</p> : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={createProject.isPending}
                className="glow-aurora inline-flex items-center gap-2 bg-revision px-[24px] py-[13px] text-[14px] font-semibold tracking-[0.06em] text-primary-foreground uppercase transition-transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {createProject.isPending ? "Creating…" : "Create project"}
              </button>
            </div>
          </form>
        </Reveal>
      </Section>

      <Section last>
        <SectionHeading label="Open projects" title="Everything you've handed us so far." />
        {projects.isLoading ? (
          <p className="text-ink-soft">Loading…</p>
        ) : (projects.data?.length ?? 0) === 0 ? (
          <div className="glass flex flex-col items-center gap-3 px-7 py-14 text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-ink-soft">No projects yet — create one above.</p>
          </div>
        ) : (
          <div className="border-b border-border">
            {projects.data?.map((project, i) => (
              <Reveal key={project.id} delay={Math.min(i, 6) * 0.05}>
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="group grid grid-cols-1 items-center gap-3 border-t border-border py-[22px] transition-colors hover:bg-foreground/[0.03] md:grid-cols-[1fr_180px_200px_28px]"
                >
                  <div className="font-serif text-[25px] tracking-[0.05em] transition-colors group-hover:text-revision">
                    {project.name}
                  </div>
                  <div className="text-[15px] text-ink-soft">{project.product_type}</div>
                  <div>
                    <span className="badge">
                      {project.style_mode === "project"
                        ? (project.target_style ?? "No style yet")
                        : "Per-file styles"}
                    </span>
                  </div>
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-revision md:block" />
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
