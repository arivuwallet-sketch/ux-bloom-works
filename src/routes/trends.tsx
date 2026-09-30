import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Radar } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";
import { PreviewGroups } from "@/components/site/PreviewTile";
import { trendGroups } from "@/data/site";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: "Signals — advanced interface patterns | Rezyn" },
      {
        name: "description",
        content: "Explore advanced interface patterns across navigation, heroes, inputs, data display, feedback, media and AI product experiences.",
      },
    ],
  }),
  component: TrendsPage,
});

const totalSignals = trendGroups.reduce((sum, group) => sum + group.items.length, 0);

function TrendsPage() {
  return (
    <main>
      <PageHero
        index="04"
        eyebrow="Interface observatory"
        title="Track the signals."
        accent="Ignore the noise."
        description="The useful future of UI is rarely one trend. It is a set of patterns becoming mature enough to improve a real product without turning it into a demo reel."
        stat={String(totalSignals).padStart(2, "0")}
        statLabel="patterns indexed"
        action={{ to: "/work", label: "See them in context" }}
      />

      <Section>
        <SectionHeading
          label="Signal index"
          title="Patterns grouped by where they earn attention."
          description="Use these as building blocks inside a broader visual direction—not as novelty for novelty's sake."
        />
        <Reveal>
          <PreviewGroups groups={trendGroups} />
        </Reveal>
      </Section>

      <Section last tone="signal">
        <div className="glass grid grid-cols-1 gap-8 p-7 sm:p-10 lg:grid-cols-[160px_1fr_auto] lg:items-center">
          <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border border-revision/20 bg-revision/5 text-revision">
            <Radar className="h-10 w-10" />
          </div>
          <div>
            <span className="eyebrow">Proof over novelty</span>
            <h2 className="mb-0 mt-4 max-w-[14ch] text-[clamp(38px,5vw,68px)] leading-[0.92]">A pattern matters when it improves the product.</h2>
          </div>
          <Link to="/work" className="button-secondary">
            View transformation proof <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </main>
  );
}
