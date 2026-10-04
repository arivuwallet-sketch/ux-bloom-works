import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Boxes, Download, ScanLine, Search, WandSparkles } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";
import { processSteps } from "@/data/site";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Process — AI redesign + SEO intelligence workflow | Rezyn" },
      {
        name: "description",
        content:
          "Upload a real project, choose Redesign, SEO Agent, or both, let Rezyn build project-level plans and M1–M8 analysis, then export the validated result.",
      },
    ],
  }),
  component: ProcessPage,
});

const stepIcons = [Boxes, WandSparkles, Search, Download];

function ProcessPage() {
  return (
    <main>
      <PageHero
        index="02"
        eyebrow="Transformation path"
        title="Four stages."
        accent="One continuous system."
        description="Ingest the real project, choose Redesign, SEO Agent, or both, build project-wide intelligence before edits begin, then export the validated final source as one coherent project."
        stat="04"
        statLabel="core stages"
        action={{ to: "/projects", label: "Start with your source" }}
      />

      <Section>
        <SectionHeading
          label="Sequence"
          title="Complexity stays inside the engine."
          description="Design planning, dependency awareness, M1–M8 SEO analysis, source-grounded generation and QA happen under the hood while the product keeps a short, understandable workflow."
        />
        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[10%] right-[10%] top-[52px] hidden h-px bg-gradient-to-r from-transparent via-revision/25 to-transparent lg:block" />
          {processSteps.map((step, index) => {
            const Icon = stepIcons[index] ?? ScanLine;
            return (
              <Reveal key={step.version} delay={index * 0.1}>
                <article className="glass relative min-h-[390px] p-7">
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-revision/20 bg-revision/5 text-revision">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground">
                      PASS / {step.version}
                    </span>
                  </div>
                  <div className="relative z-10 mt-28">
                    <h2 className="m-0 text-[44px] leading-[0.9]">{step.title}</h2>
                    <p className="mb-0 mt-5 max-w-[38ch] text-[14px] leading-7 text-ink-soft">
                      {step.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section last tone="quiet">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="eyebrow">Output principle</span>
            <h2 className="mt-5 max-w-[13ch] text-[clamp(44px,6vw,84px)] leading-[0.92]">
              Your product stays yours. The system around it gets stronger.
            </h2>
            <p className="mt-6 max-w-[680px] text-[16px] leading-8 text-ink-soft">
              Redesign mode can rebuild the presentation while preserving behavior. SEO mode can
              improve search-facing structure without redesigning the UI. Combined mode coordinates
              both, keeps unknown metrics unknown, and exports the best validated version of each
              file.
            </p>
          </div>
          <Link to="/projects" className="button-primary">
            Enter workspace <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </main>
  );
}
