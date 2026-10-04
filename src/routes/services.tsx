import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Cpu, Layers3, MonitorSmartphone, Orbit, Search, Store } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading, ServiceRows } from "@/components/site/Section";
import { services } from "@/data/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Capabilities — AI redesign + SEO intelligence | Rezyn" },
      {
        name: "description",
        content:
          "Rezyn transforms websites, web apps, mobile products, SaaS systems and e-commerce interfaces, and adds project-wide SEO/GEO/AEO/AAO intelligence for public web surfaces.",
      },
    ],
  }),
  component: ServicesPage,
});

const surfaces = [MonitorSmartphone, Cpu, Orbit, Layers3, Store, Search];

function ServicesPage() {
  return (
    <main>
      <PageHero
        index="01"
        eyebrow="Capabilities"
        title="Six surfaces."
        accent="One project intelligence engine."
        description="Rezyn can reconstruct interface systems and independently optimize public website surfaces for technical SEO, content structure, entity clarity, answer extraction and AI/agent readiness — or run both together."
        stat="06"
        statLabel="capability surfaces"
        action={{ to: "/projects", label: "Launch a project" }}
      />

      <Section>
        <SectionHeading
          label="Surface map"
          title="Designed around how the product is actually used and discovered."
          description="Rezyn does not apply one landing-page treatment everywhere. Product surfaces get the hierarchy, density and interaction strategy they need; search-facing surfaces also get source-grounded M1–M8 analysis instead of generic SEO text."
        />
        <Reveal>
          <ServiceRows items={services} />
        </Reveal>
      </Section>

      <Section last tone="signal">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {services.map((service, index) => {
            const Icon = surfaces[index] ?? Orbit;
            return (
              <Reveal key={service.name} delay={index * 0.06}>
                <article className="glass flex min-h-[230px] flex-col p-5">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-revision" />
                    <span className="font-mono text-[8px] tracking-[0.14em] text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-auto text-[27px] leading-[0.95]">{service.name}</h3>
                  <p className="mb-0 mt-3 text-[13px] leading-6 text-ink-soft">{service.desc}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-10 flex justify-end">
          <Link to="/process" className="button-secondary">
            See the transformation path <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </main>
  );
}
