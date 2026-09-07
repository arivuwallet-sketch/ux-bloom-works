import { createFileRoute, Link } from "@tanstack/react-router";
import { Magnetic, Reveal, SplitText, Ticker } from "@/components/studio/motion";
import { Section, SectionHeading, ServiceRows } from "@/components/site/Section";
import { PreviewGroups } from "@/components/site/PreviewTile";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { processSteps, services, styleGroups } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rezyn — Upload your project, pick a style, download the redesign" },
      {
        name: "description",
        content:
          "Upload your website, web app, mobile app, SaaS product or store files, choose a design style, and download every file redesigned as a ZIP.",
      },
      { property: "og:title", content: "Rezyn — Upload, pick a style, download the redesign" },
      {
        property: "og:description",
        content:
          "Full-project UI redesigns for websites, web apps, mobile apps, SaaS products and e-commerce stores — delivered as a downloadable ZIP.",
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
              full-project redesign studio
            </div>

            <h1 className="relative z-10 mt-7 max-w-[15ch] text-[16vw] leading-[0.86] sm:text-[11vw] lg:text-[9.2vw]">
              <SplitText text="Good enough" className="block" delay={0.05} />
              <SplitText text="is a design" className="aurora-text block" delay={0.3} />
              <SplitText text="problem." className="outline-text block" delay={0.6} />
            </h1>

            <div className="relative z-10 mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,46ch)_minmax(0,1fr)]">
              <p className="text-[19px] leading-[1.6] text-ink-soft">
                Upload your project — site, web app, mobile app, SaaS, storefront. Pick a design
                style. Every file comes back redesigned in it, zipped and ready to ship. Your
                structure and logic stay untouched.
              </p>
              <div className="glass ml-auto w-full max-w-[420px] p-7 lg:-mt-16 lg:rotate-[-1.4deg]">
                <div className="text-[12px] tracking-[0.3em] text-violet uppercase">the deal</div>
                <p className="mt-3 text-[16.5px] text-ink-soft">
                  Upload the files. Pick a direction from 28 styles. Download the whole project
                  redesigned — structure kept, taste replaced.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/60 pt-5 text-center">
                  {[
                    ["28", "styles"],
                    ["1", "zip"],
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
              <Magnetic>
                <Link
                  to="/projects"
                  className="glow-aurora inline-block bg-revision px-[32px] py-[16px] text-[13px] font-semibold tracking-[0.2em] text-primary-foreground uppercase transition-transform hover:scale-[1.03]"
                >
                  Upload a project
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  to="/process"
                  className="glass inline-block px-[32px] py-[16px] text-[13px] font-semibold tracking-[0.2em] text-foreground uppercase transition-colors hover:text-revision"
                >
                  See the process
                </Link>
              </Magnetic>
            </div>

            <div className="relative z-10 mt-14 flex flex-wrap gap-10 text-[12px] tracking-[0.26em] text-muted-foreground uppercase">
              <span>upload</span>
              <span className="text-revision">redesign</span>
              <span>download zip</span>
            </div>
          </div>
        </div>
      </section>



      <Section>
        <SectionHeading
          label="What we redesign"
          title="Five kinds of interface. One ruthless redesign."
        />
        <ServiceRows items={services} />
      </Section>

      <Section>
        <SectionHeading
          label="How it works"
          title="Three steps. Nothing wasted."
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
