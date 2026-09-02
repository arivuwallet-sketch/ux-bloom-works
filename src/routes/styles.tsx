import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/site/Section";
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
        content: "Pick a direction for your revision, from minimalism to neo-brutalism.",
      },
    ],
  }),
  component: StylesPage,
});

function StylesPage() {
  return (
    <main>
      <Section last>
        <SectionHeading
          label="Pick a direction"
          title="A style directory, grouped by what they have in common."
        />
        <PreviewGroups groups={styleGroups} />
        <div className="mt-12">
          <Link to="/trends" className="text-[15px] underline underline-offset-4">
            See the advanced patterns we build with
          </Link>
        </div>
      </Section>
    </main>
  );
}
