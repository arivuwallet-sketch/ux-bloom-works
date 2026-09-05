import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/site/Section";
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
      <Section last>
        <SectionHeading
          label="Where interfaces are heading"
          title="Advanced patterns we build with, grouped by where they show up."
        />
        <PreviewGroups groups={trendGroups} />
        <div className="mt-12">
          <Link to="/work" className="text-[15px] underline underline-offset-4">
            See a redesign, before and after
          </Link>
        </div>
      </Section>
    </main>
  );
}
