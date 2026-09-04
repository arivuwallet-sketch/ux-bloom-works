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
      <section className="relative flex min-h-[92vh] items-center pt-[80px] pb-[90px]">
        <div className="wrap">
          <div className="rise relative">
            {/* broken-grid ghost numeral */}
            <span
              aria-hidden
              className="outline-text pointer-events-none absolute -top-[6vw] right-[-2vw] hidden font-serif text-[24vw] leading-none lg:block"
            >
              V2
            </span>

            <div className="glass relative z-10 inline-flex items-center gap-3 px-4 py-2 text-[12px] tracking-[0.34em] text-revision uppercase">
              <span className="h-1.5 w-1.5 bg-revision shadow-[0_0_14px_var(--revision)]" />
              interface revision studio
            </div>

            <h1 className="relative z-10 mt-7 max-w-[15ch] text-[16vw] leading-[0.86] sm:text-[11vw] lg:text-[9.2vw]">
              <span className="block">Good enough</span>
              <span className="aurora-text block">is a design</span>
              <span className="outline-text block">problem.</span>
            </h1>

            <div className="relative z-10 mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,46ch)_minmax(0,1fr)]">
              <p className="text-[19px] leading-[1.6] text-ink-soft">
                We don't rebuild your product. We take the interface you already shipped — site,
                web app, mobile app, SaaS, storefront — and revise it until it looks like it was
                designed on purpose.
              </p>
              <div className="glass ml-auto w-full max-w-[420px] p-7 lg:-mt-16 lg:rotate-[-1.4deg]">
                <div className="text-[12px] tracking-[0.3em] text-violet uppercase">the deal</div>
                <p className="mt-3 text-[16.5px] text-ink-soft">
                  Upload the files. Pick a direction from 28 styles. Get every screen redrawn in
                  it — structure kept, taste replaced.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/60 pt-5 text-center">
                  {[
                    ["28", "styles"],
                    ["3", "passes"],
                    ["0", "rebuilds"],
                  ].map(([n, l]) => (
                    <div key={l}>
                      <div className="font-serif text-[34px] leading-none text-revision">{n}</div>
                      <div className="mt-1 text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                        {l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 flex flex-wrap items-center gap-[14px]">
              <Link
                to="/projects"
                className="glow-aurora bg-revision px-[32px] py-[16px] text-[13px] font-semibold tracking-[0.2em] text-primary-foreground uppercase transition-transform hover:scale-[1.03]"
              >
                Upload a project
              </Link>
              <Link
                to="/process"
                className="glass px-[32px] py-[16px] text-[13px] font-semibold tracking-[0.2em] text-foreground uppercase transition-colors hover:text-revision"
              >
                See the process
              </Link>
            </div>

            <div className="relative z-10 mt-14 flex flex-wrap gap-10 text-[12px] tracking-[0.26em] text-muted-foreground uppercase">
              <span>v1 audit</span>
              <span className="text-revision">v2 redesign</span>
              <span>v3 handoff</span>
            </div>
          </div>
        </div>
      </section>



      <Section>
        <SectionHeading
          label="What we revise"
          title="Five kinds of interface. One brutal review."
        />
        <ServiceRows items={services} />
      </Section>

      <Section>
        <SectionHeading
          label="How a revision works"
          title="Three passes. Nothing wasted."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {processSteps.map((step) => (
            <div key={step.version} className="glass px-7 py-8 transition-colors hover:border-amber/40">
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
          title="Twenty-eight directions. Pick your weapon."
        />
        <PreviewGroups groups={styleGroups.slice(0, 2)} />
        <div className="mt-12">
          <Link to="/styles" className="text-[15px] underline underline-offset-4">
            See all {styleGroups.reduce((n, g) => n + g.items.length, 0)} styles
          </Link>
        </div>
      </Section>

      <Section last>
        <SectionHeading label="Show markup" title="Same screen. Different century." />
        <BeforeAfter />
        <div className="mt-10">
          <Link
            to="/projects"
            className="glow-aurora bg-revision px-[32px] py-[16px] text-[13px] font-semibold tracking-[0.2em] text-primary-foreground uppercase transition-transform hover:scale-[1.03]"
          >
            Upload a project
          </Link>
        </div>
      </Section>
    </main>
  );
}
