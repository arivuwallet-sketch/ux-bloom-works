import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading, ServiceRows } from "@/components/site/Section";
import { PreviewGroups } from "@/components/site/PreviewTile";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { processSteps, services, styleGroups } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rezyn — UI/UX revisions for products you already shipped" },
      {
        name: "description",
        content:
          "We audit and upgrade the interface you already have — website, web app, mobile app, SaaS product, or store — without starting from zero.",
      },
      { property: "og:title", content: "Rezyn — UI/UX revisions, not rebuilds" },
      {
        property: "og:description",
        content:
          "Interface audits and redesigns for existing websites, web apps, mobile apps, SaaS products, and e-commerce stores.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <section className="relative flex min-h-[86vh] items-center pt-[80px] pb-[90px]">
        <div className="wrap">
          <div className="rise max-w-[820px]">
            <div className="mb-6 inline-flex items-center gap-2 border border-border/70 bg-background/40 px-3 py-1.5 text-[12.5px] tracking-[0.2em] text-amber uppercase backdrop-blur-md">
              interface revision studio
            </div>
            <h1 className="text-[40px] tracking-[-0.015em] sm:text-[68px]">
              Your product doesn't need a <span className="strike">rebuild.</span>
              <br />
              <span className="mark-hand text-revision">it needs a revision.</span>
            </h1>
            <p className="mt-8 max-w-[520px] text-[17.5px] text-ink-soft">
              Rezyn audits and upgrades the interface you already have — website, web app, mobile
              app, SaaS product, or store — without asking you to start from zero.
            </p>
            <div className="mt-10 flex flex-wrap gap-[14px]">
              <Link
                to="/projects"
                className="glow-amber bg-amber px-[28px] py-[14px] text-[15px] font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Upload a project
              </Link>
              <Link
                to="/process"
                className="glass px-[28px] py-[14px] text-[15px] font-medium text-foreground transition-colors hover:text-amber"
              >
                See the process
              </Link>
            </div>
            <div className="mt-14 flex flex-wrap gap-10 text-[13px] tracking-[0.16em] text-muted-foreground uppercase">
              <span>v1 audit</span>
              <span className="text-amber">v2 redesign</span>
              <span>v3 handoff</span>
            </div>
          </div>
        </div>
      </section>


      <Section>
        <SectionHeading
          label="What we revise"
          title="Five kinds of interfaces, one review process."
        />
        <ServiceRows items={services} />
      </Section>

      <Section>
        <SectionHeading
          label="How a revision works"
          title="Three passes. Nothing thrown out that doesn't need to be."
        />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {processSteps.map((step) => (
            <div key={step.version} className="bg-background px-7 py-8">
              <div className="mb-[14px] text-sm font-semibold text-revision">{step.version}</div>
              <h3 className="mb-[10px] text-[22px]">{step.title}</h3>
              <p className="text-[15px] text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          label="Pick a direction"
          title="A style directory, grouped by what they have in common."
        />
        <PreviewGroups groups={styleGroups.slice(0, 2)} />
        <div className="mt-12">
          <Link to="/styles" className="text-[15px] underline underline-offset-4">
            See all {styleGroups.reduce((n, g) => n + g.items.length, 0)} styles
          </Link>
        </div>
      </Section>

      <Section last>
        <SectionHeading label="Show markup" title="The same screen, before and after a revision." />
        <BeforeAfter />
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
