import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading, ServiceRows } from "@/components/site/Section";
import { services } from "@/data/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — UI/UX upgrades for existing products | Rezyn" },
      {
        name: "description",
        content:
          "Interface revisions for websites, web apps, mobile apps, SaaS products, and e-commerce stores — audit first, redesign second.",
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
      <Section last>
        <SectionHeading
          label="What we revise"
          title="Five kinds of interfaces, one review process."
        />
        <ServiceRows items={services} />
        <p className="mt-10 max-w-[560px] text-[15.5px] text-ink-soft">
          Every engagement starts the same way: a marked-up audit of the product as it exists
          today. Nothing gets thrown out that doesn't need to be.
        </p>
        <div className="mt-8 flex flex-wrap gap-[14px]">
          <Link
            to="/contact"
            className="border border-primary bg-primary px-[26px] py-[13px] text-[15px] font-medium text-primary-foreground transition-colors hover:bg-ink-soft"
          >
            Request an audit
          </Link>
          <Link
            to="/process"
            className="border border-primary px-[26px] py-[13px] text-[15px] font-medium text-foreground transition-colors hover:bg-paper-dim"
          >
            See the process
          </Link>
        </div>
      </Section>
    </main>
  );
}
