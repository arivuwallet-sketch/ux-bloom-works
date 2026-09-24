import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, SplitText } from "@/components/studio/motion";
import { Section } from "@/components/site/Section";
import { PreviewGroups } from "@/components/site/PreviewTile";
import { styleGroups } from "@/data/site";

export const Route = createFileRoute("/styles")({
  head: () => ({
    meta: [
      { title: "Style directory — 28 UI design directions | Rezyn" },
      {
        name: "description",
        content:
          "A directory of interface styles — minimal, expressive, glass, retro, tech, editorial — grouped by what they have in common.",
      },
      { property: "og:title", content: "Style directory — UI design directions" },
      {
        property: "og:description",
        content: "Pick a direction for your redesign, from minimalism to neo-brutalism.",
      },
    ],
  }),
  component: StylesPage,
});

function StylesPage() {
  const total = styleGroups.reduce((n, g) => n + g.items.length, 0);
  return (
    <main>
      <section className="relative pt-[64px] pb-[20px]">
        <div className="wrap">
          <span
            aria-hidden
            className="outline-text pointer-events-none absolute -top-[4vw] right-[-1vw] hidden font-serif text-[16vw] leading-none lg:block"
          >
            {total}
          </span>
          <div className="rise relative z-10">
            <div className="glass inline-flex items-center gap-3 px-4 py-2 text-[12px] tracking-[0.34em] text-revision uppercase">
              <span className="h-1.5 w-1.5 bg-revision shadow-[0_0_14px_var(--revision)]" />
              pick a direction
            </div>
            <h1 className="mt-7 max-w-[20ch] text-[11vw] leading-[0.92] sm:text-[6vw]">
              <SplitText text="A style directory," className="block" delay={0.05} />
              <SplitText
                text="grouped by what they share."
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
          <PreviewGroups groups={styleGroups} />
        </Reveal>
        <div className="mt-12">
          <Link to="/trends" className="text-[15px] underline underline-offset-4 hover:text-revision">
            See the advanced patterns we build with
          </Link>
        </div>
      </Section>
    </main>
  );
}
