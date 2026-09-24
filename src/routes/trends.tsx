import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, SplitText } from "@/components/studio/motion";
import { Section } from "@/components/site/Section";
import { PreviewGroups } from "@/components/site/PreviewTile";
import { trendGroups } from "@/data/site";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: "Trends — Advanced UI patterns we build with | Rezyn" },
      {
        name: "description",
        content:
          "Advanced interface patterns grouped by where they show up: heroes, navigation, inputs, data display, feedback, media, and AI.",
      },
      { property: "og:title", content: "Trends — Advanced UI patterns we build with" },
      {
        property: "og:description",
        content: "Where interfaces are heading, and which patterns are worth adopting.",
      },
    ],
  }),
  component: TrendsPage,
});

function TrendsPage() {
  return (
    <main>
      <section className="relative pt-[64px] pb-[20px]">
        <div className="wrap">
          <span
            aria-hidden
            className="outline-text pointer-events-none absolute -top-[4vw] right-[-1vw] hidden font-serif text-[15vw] leading-none lg:block"
          >
            ∞
          </span>
          <div className="rise relative z-10">
            <div className="glass inline-flex items-center gap-3 px-4 py-2 text-[12px] tracking-[0.34em] text-revision uppercase">
              <span className="h-1.5 w-1.5 bg-revision shadow-[0_0_14px_var(--revision)]" />
              where interfaces are heading
            </div>
            <h1 className="mt-7 max-w-[20ch] text-[10.5vw] leading-[0.94] sm:text-[5.6vw]">
              <SplitText text="Advanced patterns" className="block" delay={0.05} />
              <SplitText
                text="we build with."
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
          <PreviewGroups groups={trendGroups} />
        </Reveal>
        <div className="mt-12">
          <Link to="/work" className="text-[15px] underline underline-offset-4 hover:text-revision">
            See a redesign, before and after
          </Link>
        </div>
      </Section>
    </main>
  );
}
