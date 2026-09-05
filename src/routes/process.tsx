import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/site/Section";
import { processSteps } from "@/data/site";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Process — Upload, pick a style, download | Rezyn" },
      {
        name: "description",
        content:
          "Three steps: upload your project files, pick the design style, then download every file redesigned as a ZIP.",
      },
      { property: "og:title", content: "Process — Upload, pick a style, download" },
      {
        property: "og:description",
        content: "How a Rezyn full-project redesign works, step by step.",
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
          label="How it works"
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
          Every file is rewritten in place, so you can diff it against the original and see exactly
          what changed — and what didn't.
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
