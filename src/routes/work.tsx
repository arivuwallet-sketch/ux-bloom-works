import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/site/Section";
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

function WorkPage() {
  return (
    <main>
      <Section last>
        <SectionHeading label="Show markup" title="The same screen, before and after the redesign." />
        <BeforeAfter />
        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-border pt-10 md:grid-cols-3">
          <div>
            <div className="mb-2 text-sm font-semibold text-revision">Kept</div>
            <p className="text-[15px] text-ink-soft">
              Your content, your brand, and the interactions your users already know.
            </p>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-revision">Redesigned</div>
            <p className="text-[15px] text-ink-soft">
              Hierarchy, spacing, density, and the sequence people read the screen in.
            </p>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-redline">Removed</div>
            <p className="text-[15px] text-ink-soft">
              Whatever competed for attention without earning it.
            </p>
          </div>
        </div>
        <div className="mt-10">
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
