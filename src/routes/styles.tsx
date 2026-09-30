import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";
import { PreviewGroups } from "@/components/site/PreviewTile";
import { styleGroups } from "@/data/site";

export const Route = createFileRoute("/styles")({
  head: () => ({
    meta: [
      { title: "Directions — 28 interface design systems | Rezyn" },
      {
        name: "description",
        content: "Explore 28 visual directions for interface transformation, from restrained systems to expressive spatial design.",
      },
    ],
  }),
  component: StylesPage,
});

function StylesPage() {
  const total = styleGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <main>
      <PageHero
        index="03"
        eyebrow="Direction library"
        title="Choose a language."
        accent="Not a skin."
        description="Each direction is treated as a system of hierarchy, proportion, typography, material and interaction—not a color preset dropped on top of the same layout."
        stat={String(total).padStart(2, "0")}
        statLabel="design directions"
        action={{ to: "/projects", label: "Apply a direction" }}
      />

      <Section>
        <SectionHeading
          label="Library"
          title="Different aesthetics. Consistent design logic."
          description="Use the directory to choose the emotional and structural character of the redesign before the engine applies it across the product."
        />
        <Reveal>
          <PreviewGroups groups={styleGroups} />
        </Reveal>
      </Section>

      <Section last tone="quiet">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="eyebrow">Beyond styles</span>
            <h2 className="mt-5 max-w-[12ch] text-[clamp(44px,6vw,82px)] leading-[0.92]">Patterns move faster than labels.</h2>
            <p className="mt-5 max-w-[650px] text-[16px] leading-8 text-ink-soft">
              The trends library tracks interaction and layout patterns that can be mixed into a direction when the product needs something more specific than a named aesthetic.
            </p>
          </div>
          <Link to="/trends" className="button-secondary">
            Explore interface signals <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </main>
  );
}
