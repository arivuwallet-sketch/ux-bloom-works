import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, SplitText, Magnetic } from "@/components/studio/motion";
import { Section } from "@/components/site/Section";
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
      <section className="relative pt-[64px] pb-[20px]">
        <div className="wrap">
          <span
            aria-hidden
            className="outline-text pointer-events-none absolute -top-[4vw] right-[-1vw] hidden font-serif text-[16vw] leading-none lg:block"
          >
            03
          </span>
          <div className="rise relative z-10">
            <div className="glass inline-flex items-center gap-3 px-4 py-2 text-[12px] tracking-[0.34em] text-revision uppercase">
              <span className="h-1.5 w-1.5 bg-revision shadow-[0_0_14px_var(--revision)]" />
              how it works
            </div>
            <h1 className="mt-7 max-w-[18ch] text-[12vw] leading-[0.9] sm:text-[6.6vw]">
              <SplitText text="Three passes." className="block" delay={0.05} />
              <SplitText
                text="Nothing thrown out"
                className="block"
                charClassName="aurora-text"
                delay={0.3}
              />
              <SplitText text="that doesn't need to be." className="block" delay={0.55} />
            </h1>
          </div>
        </div>
      </section>

      <Section last>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {processSteps.map((step, i) => (
            <Reveal key={step.version} delay={i * 0.1}>
              <div className="glass group h-full px-7 py-8 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40">
                <div className="mb-[14px] flex items-center justify-between">
                  <span className="text-sm font-semibold text-revision">{step.version}</span>
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-border transition-colors group-hover:bg-revision group-hover:shadow-[0_0_10px_var(--revision)]"
                  />
                </div>
                <h3 className="mb-[10px] text-[22px]">{step.title}</h3>
                <p className="text-[15px] text-ink-soft">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <p className="mt-10 max-w-[560px] text-[15.5px] text-ink-soft">
            Every file is rewritten in place, so you can diff it against the original and see
            exactly what changed — and what didn't.
          </p>
          <div className="mt-8">
            <Magnetic>
              <Link
                to="/projects"
                className="glow-aurora inline-block bg-revision px-[28px] py-[13px] text-[14px] font-semibold tracking-[0.1em] text-primary-foreground uppercase transition-transform hover:scale-[1.03]"
              >
                Upload a project
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
