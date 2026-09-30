import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Boxes, ScanLine, WandSparkles } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";
import { processSteps } from "@/data/site";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Process — source to transformed interface | Rezyn" },
      {
        name: "description",
        content: "Upload a real project, choose a visual direction, and let Rezyn transform its interface while keeping its structure and logic intact.",
      },
    ],
  }),
  component: ProcessPage,
});

const stepIcons = [Boxes, ScanLine, WandSparkles];

function ProcessPage() {
  return (
    <main>
      <PageHero
        index="02"
        eyebrow="Transformation path"
        title="Three passes."
        accent="One continuous system."
        description="The workflow stays simple on purpose: ingest the real product, define the visual direction, then regenerate the presentation layer as a connected whole."
        stat="03"
        statLabel="core passes"
        action={{ to: "/projects", label: "Start with your source" }}
      />

      <Section>
        <SectionHeading
          label="Sequence"
          title="Complexity stays inside the engine."
          description="Every step exposes just enough control to move forward without turning the redesign process into another design tool to learn."
        />
        <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="absolute left-[12%] right-[12%] top-[52px] hidden h-px bg-gradient-to-r from-transparent via-revision/25 to-transparent lg:block" />
          {processSteps.map((step, index) => {
            const Icon = stepIcons[index] ?? ScanLine;
            return (
              <Reveal key={step.version} delay={index * 0.1}>
                <article className="glass relative min-h-[390px] p-7">
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-revision/20 bg-revision/5 text-revision">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground">PASS / {step.version}</span>
                  </div>
                  <div className="relative z-10 mt-28">
                    <h2 className="m-0 text-[44px] leading-[0.9]">{step.title}</h2>
                    <p className="mb-0 mt-5 max-w-[38ch] text-[14px] leading-7 text-ink-soft">{step.body}</p>
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
            <h2 className="mt-5 max-w-[13ch] text-[clamp(44px,6vw,84px)] leading-[0.92]">Your product stays yours. The perception changes.</h2>
            <p className="mt-6 max-w-[680px] text-[16px] leading-8 text-ink-soft">
              The transformation targets layout, visual hierarchy, spacing, typography, surface treatment, responsiveness and interaction states. Product meaning and working behavior remain the anchor.
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
