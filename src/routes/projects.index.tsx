import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FolderOpen, Sparkles } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { productTypes, allStyleNames } from "@/data/site";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Workspace — Rezyn interface transformation" },
      { name: "description", content: "Create transformation projects, upload product source files and manage visual directions from the Rezyn workspace." },
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
      <main className="system-state">
        <div className="system-state__card">
          <span className="eyebrow">Workspace / loading</span>
          <h1>Opening your project archive.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="archive-workspace-page">
      <div className="wrap">
        <div className="archive-workspace-page__topline">
          <span>REZYN / PROJECT ARCHIVE</span>
          <span>{String(projects.data?.length ?? 0).padStart(2, "0")} ACTIVE RECORDS</span>
        </div>

        <Reveal>
          <header className="archive-workspace-page__hero">
            <div>
              <span className="archive-workspace-page__index">06 / WORKSPACE</span>
              <h1>Build the next version.</h1>
            </div>
            <aside>
              <span>ENGINE STATUS</span>
              <strong>READY</strong>
              <p>Create a record, attach source files, choose a visual direction and transform.</p>
            </aside>
          </header>
        </Reveal>

        <div className="archive-workspace-page__grid">
          <Reveal>
            <section className="archive-project-form">
              <div className="archive-project-form__head">
                <span>01 / NEW TRANSFORMATION</span>
                <span>CREATE RECORD</span>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setError(null);
                  if (name.trim().length < 2) {
                    setError("Give the project a name.");
                    return;
                  }
                  createProject.mutate();
                }}
              >
                <div className="archive-form-field archive-form-field--full">
                  <label htmlFor="pname">Project name</label>
                  <input id="pname" value={name} onChange={(event) => setName(event.target.value)} className="field" placeholder="Acme product redesign" />
                </div>

                <div className="archive-project-form__columns">
                  <div className="archive-form-field">
                    <label htmlFor="ptype">Product surface</label>
                    <select id="ptype" value={productType} onChange={(event) => setProductType(event.target.value)} className="field">
                      {productTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>

                  <div className="archive-form-field">
                    <label htmlFor="smode">Direction control</label>
                    <select id="smode" value={styleMode} onChange={(event) => setStyleMode(event.target.value as "project" | "file")} className="field">
                      <option value="project">One direction for project</option>
                      <option value="file">Direction per file</option>
                    </select>
                  </div>
                </div>

                {styleMode === "project" ? (
                  <div className="archive-form-field archive-form-field--full">
                    <label htmlFor="pstyle">Target direction</label>
                    <select id="pstyle" value={targetStyle} onChange={(event) => setTargetStyle(event.target.value)} className="field">
                      {allStyleNames.map((style) => <option key={style} value={style}>{style}</option>)}
                    </select>
                  </div>
                ) : null}

                <div className="archive-form-field archive-form-field--full">
                  <label htmlFor="pnotes">Transformation brief / optional</label>
                  <textarea id="pnotes" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} className="field resize-y" placeholder="What currently feels wrong, dated or difficult?" />
                </div>

                {error ? <p className="archive-project-form__error">{error}</p> : null}

                <button type="submit" disabled={createProject.isPending} className="button-primary archive-project-form__submit">
                  <Sparkles className="h-4 w-4" />
                  {createProject.isPending ? "Creating…" : "Create transformation"}
                </button>
              </form>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section className="archive-project-list">
              <div className="archive-project-list__head">
                <span>02 / PROJECT RECORDS</span>
                <span>OPEN ARCHIVE</span>
              </div>

              {projects.isLoading ? (
                <div className="archive-project-list__empty">Loading project archive…</div>
              ) : (projects.data?.length ?? 0) === 0 ? (
                <div className="archive-project-list__empty">
                  <FolderOpen className="h-8 w-8" />
                  <strong>No project records yet.</strong>
                  <p>Create the first transformation from the form beside this index.</p>
                </div>
              ) : (
                <div className="archive-project-list__rows">
                  <div className="archive-project-list__columns">
                    <span>No.</span><span>Project</span><span>Direction</span><span>Open</span>
                  </div>
                  {projects.data?.map((project, index) => (
                    <Link key={project.id} to="/projects/$projectId" params={{ projectId: project.id }} className="archive-project-row">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{project.name}</strong>
                        <small>{project.product_type}</small>
                      </div>
                      <em>{project.style_mode === "project" ? (project.target_style ?? "No direction") : "Per-file directions"}</em>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
