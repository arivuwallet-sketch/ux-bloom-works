import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, SplitText, Magnetic } from "@/components/studio/motion";
import { Section, ServiceRows } from "@/components/site/Section";
import { services } from "@/data/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — UI/UX upgrades for existing products | Rezyn" },
      {
        name: "description",
        content:
          "Full-project UI redesigns for websites, web apps, mobile apps, SaaS products, and e-commerce stores — upload first, download second.",
      },
      { property: "og:title", content: "Services — UI/UX upgrades for existing products" },
      {
        property: "og:description",
        content:
          "Five kinds of interfaces, one review process: website, web app, mobile app, SaaS product, e-commerce store.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <main>
      <section className="relative pt-[64px] pb-[20px]">
        <div className="wrap">
          <span
            aria-hidden
            className="outline-text pointer-events-none absolute -top-[4vw] right-[-1vw] hidden font-serif text-[16vw] leading-none lg:block"
          >
            5
          </span>
          <div className="rise relative z-10">
            <div className="glass inline-flex items-center gap-3 px-4 py-2 text-[12px] tracking-[0.34em] text-revision uppercase">
              <span className="h-1.5 w-1.5 bg-revision shadow-[0_0_14px_var(--revision)]" />
              services
            </div>
            <h1 className="mt-7 max-w-[16ch] text-[13vw] leading-[0.9] sm:text-[7.4vw]">
              <SplitText text="Five kinds of interface." className="block" delay={0.05} />
              <SplitText
                text="One redesign pipeline."
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
          <ServiceRows items={services} />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-10 max-w-[560px] text-[15.5px] text-ink-soft">
            Every project runs the same way: upload the files, pick a style, download the
            redesigned project. Nothing gets thrown out that doesn't need to be.
          </p>
          <div className="mt-8 flex flex-wrap gap-[14px]">
            <Magnetic>
              <Link
                to="/projects"
                className="glow-aurora inline-block bg-revision px-[28px] py-[13px] text-[14px] font-semibold tracking-[0.1em] text-primary-foreground uppercase transition-transform hover:scale-[1.03]"
              >
                Upload a project
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                to="/process"
                className="glass inline-block px-[28px] py-[13px] text-[14px] font-semibold tracking-[0.1em] text-foreground uppercase transition-colors hover:text-revision"
              >
                See the process
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
