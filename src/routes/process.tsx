import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/site/Section";
import { processSteps } from "@/data/site";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Process — Audit, redesign, handoff | Rezyn" },
      {
        name: "description",
        content:
          "Three passes: a marked-up heuristic audit, a redesign traceable to each finding, then production-ready handoff or implementation.",
      },
      { property: "og:title", content: "Process — Audit, redesign, handoff" },
      {
        property: "og:description",
        content: "How a Rezyn interface revision works, one pass at a time.",
      },
    ],
  }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <main>
      <Section last>
        <SectionHeading
          label="How a revision works"
          title="Three passes. Nothing thrown out that doesn't need to be."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {processSteps.map((step) => (
            <div key={step.version} className="glass px-7 py-8 transition-colors hover:border-amber/40">
              <div className="mb-[14px] text-sm font-semibold text-revision">{step.version}</div>
              <h3 className="mb-[10px] text-[22px]">{step.title}</h3>
              <p className="text-[15px] text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-[560px] text-[15.5px] text-ink-soft">
          Each revision is versioned like a manuscript. You can see what changed, why it changed,
          and which audit finding it answers.
        </p>
        <div className="mt-8">
          <Link
            to="/projects"
            className="border border-primary bg-primary px-[26px] py-[13px] text-[15px] font-medium text-primary-foreground transition-colors hover:bg-ink-soft"
          >
            Upload a project
          </Link>
        </div>
      </Section>
    </main>
  );
}
