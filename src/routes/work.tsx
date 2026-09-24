import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, SplitText, Magnetic } from "@/components/studio/motion";
import { Section } from "@/components/site/Section";
import { BeforeAfter } from "@/components/site/BeforeAfter";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — The same screen, before and after | Rezyn" },
      {
        name: "description",
        content:
          "See what a redesign changes: hierarchy, spacing, and how many things compete for attention — with your content left intact.",
      },
      { property: "og:title", content: "Work — The same screen, before and after" },
      {
        property: "og:description",
        content: "A marked-up look at what a Rezyn redesign changes, and what it leaves alone.",
      },
    ],
  }),
  component: WorkPage,
});

const marks = [
  { label: "Kept", tone: "text-revision", body: "Your content, your brand, and the interactions your users already know." },
  { label: "Redesigned", tone: "text-revision", body: "Hierarchy, spacing, density, and the sequence people read the screen in." },
  { label: "Removed", tone: "text-redline", body: "Whatever competed for attention without earning it." },
] as const;

function WorkPage() {
  return (
    <main>
      <section className="relative pt-[64px] pb-[20px]">
        <div className="wrap">
          <span
            aria-hidden
            className="outline-text pointer-events-none absolute -top-[4vw] right-[-1vw] hidden font-serif text-[15vw] leading-none lg:block"
          >
            V2
          </span>
          <div className="rise relative z-10">
            <div className="glass inline-flex items-center gap-3 px-4 py-2 text-[12px] tracking-[0.34em] text-revision uppercase">
              <span className="h-1.5 w-1.5 bg-revision shadow-[0_0_14px_var(--revision)]" />
              show markup
            </div>
            <h1 className="mt-7 max-w-[20ch] text-[10.5vw] leading-[0.94] sm:text-[5.8vw]">
              <SplitText text="The same screen," className="block" delay={0.05} />
              <SplitText
                text="before and after."
                className="block"
                charClassName="aurora-text"
                delay={0.3}
              />
            </h1>
          </div>
        </div>
      </section>

      <Section last>
        <Reveal>
          <BeforeAfter />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-border pt-10 md:grid-cols-3">
          {marks.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.1}>
              <div className="mb-2 text-sm font-semibold">
                <span className={m.tone}>{m.label}</span>
              </div>
              <p className="text-[15px] text-ink-soft">{m.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.35}>
          <div className="mt-10">
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
