import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Boxes, FolderOpen, Plus, Sparkles } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { productTypes, allStyleNames } from "@/data/site";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Workspace — Rezyn interface transformation" },
      {
        name: "description",
        content: "Create transformation projects, upload product source files and manage visual directions from the Rezyn workspace.",
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
      <main className="system-state">
        <div className="system-state__card">
          <span className="eyebrow">Workspace handshake</span>
          <h1>Loading your transformation space.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-28 pt-[130px] sm:pt-[150px]">
      <div className="wrap">
        <Reveal>
          <section className="mb-16 grid grid-cols-1 gap-8 border-b border-border pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="eyebrow">Workspace / projects</span>
                <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">
                  {projects.data?.length ?? 0} ACTIVE RECORDS
                </span>
              </div>
              <h1 className="m-0 max-w-[10ch] text-[clamp(58px,8vw,118px)] leading-[0.84]">Build the next version.</h1>
            </div>
            <div className="glass min-w-[240px] p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">ENGINE STATUS</span>
                <span className="signal-dot" />
              </div>
              <div className="mt-10 text-[30px] font-medium tracking-[-0.05em]">Ready</div>
              <div className="mt-1 text-[12px] text-ink-soft">Create a project to begin.</div>
            </div>
          </section>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,680px)_1fr]">
          <Reveal>
            <section className="glass p-6 sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <span className="eyebrow">New transformation</span>
                  <h2 className="mb-0 mt-4 text-[38px] leading-none">Create project</h2>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-revision/20 bg-revision/5 text-revision">
                  <Plus className="h-5 w-5" />
                </span>
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
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
              >
                <div className="md:col-span-2">
                  <label htmlFor="pname" className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                    Project name
                  </label>
                  <input
                    id="pname"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="field"
                    placeholder="Acme product redesign"
                  />
                </div>

                <div>
                  <label htmlFor="ptype" className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                    Product surface
                  </label>
                  <select id="ptype" value={productType} onChange={(event) => setProductType(event.target.value)} className="field">
                    {productTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="smode" className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                    Direction control
                  </label>
                  <select
                    id="smode"
                    value={styleMode}
                    onChange={(event) => setStyleMode(event.target.value as "project" | "file")}
                    className="field"
                  >
                    <option value="project">One direction for the project</option>
                    <option value="file">Direction per file</option>
                  </select>
                </div>

                {styleMode === "project" ? (
                  <div className="md:col-span-2">
                    <label htmlFor="pstyle" className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                      Target direction
                    </label>
                    <select id="pstyle" value={targetStyle} onChange={(event) => setTargetStyle(event.target.value)} className="field">
                      {allStyleNames.map((style) => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="md:col-span-2">
                  <label htmlFor="pnotes" className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                    Transformation brief / optional
                  </label>
                  <textarea
                    id="pnotes"
                    rows={4}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="field resize-y"
                    placeholder="What currently feels wrong, dated or difficult?"
                  />
                </div>

                {error ? <p className="m-0 text-[13px] text-destructive md:col-span-2">{error}</p> : null}

                <div className="md:col-span-2">
                  <button type="submit" disabled={createProject.isPending} className="button-primary disabled:opacity-50">
                    <Sparkles className="h-4 w-4" />
                    {createProject.isPending ? "Creating…" : "Create transformation"}
                  </button>
                </div>
              </form>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <span className="eyebrow">Project archive</span>
                  <h2 className="mb-0 mt-4 text-[38px] leading-none">Open projects</h2>
                </div>
                <Boxes className="h-5 w-5 text-revision" />
              </div>

              {projects.isLoading ? (
                <div className="glass p-8 text-ink-soft">Loading projects…</div>
              ) : (projects.data?.length ?? 0) === 0 ? (
                <div className="glass flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="text-[18px] font-medium">No project records yet.</div>
                    <p className="mb-0 mt-2 text-[13px] text-ink-soft">Create the first transformation from the panel beside this one.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.data?.map((project, index) => (
                    <Link
                      key={project.id}
                      to="/projects/$projectId"
                      params={{ projectId: project.id }}
                      className="glass group grid grid-cols-[44px_1fr_auto] items-center gap-4 p-4 text-inherit no-underline transition-transform hover:-translate-y-0.5"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] font-mono text-[9px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[16px] font-semibold tracking-[-0.02em] group-hover:text-revision">{project.name}</div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] tracking-[0.08em] text-muted-foreground uppercase">
                          <span>{project.product_type}</span>
                          <span>•</span>
                          <span>{project.style_mode === "project" ? (project.target_style ?? "No direction") : "Per-file directions"}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-revision" />
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
