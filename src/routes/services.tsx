import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Cpu, Layers3, MonitorSmartphone, Orbit, Store } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading, ServiceRows } from "@/components/site/Section";
import { services } from "@/data/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Capabilities — interface transformation across product surfaces | Rezyn" },
      {
        name: "description",
        content: "Rezyn transforms websites, web apps, mobile products, SaaS systems and e-commerce interfaces while preserving underlying product logic.",
      },
    ],
  }),
  component: ServicesPage,
});

const surfaces = [MonitorSmartphone, Cpu, Orbit, Layers3, Store];

function ServicesPage() {
  return (
    <main>
      <PageHero
        index="01"
        eyebrow="Capabilities"
        title="Five surfaces."
        accent="One transformation engine."
        description="Different products create different interface pressure. Rezyn treats each surface as its own spatial system while keeping one consistent redesign pipeline underneath."
        stat="05"
        statLabel="product surfaces"
        action={{ to: "/projects", label: "Launch a project" }}
      />

      <Section>
        <SectionHeading
          label="Surface map"
          title="Designed around how the product is actually used."
          description="We are not applying the same landing-page treatment everywhere. Each product category gets a different hierarchy, density and interaction strategy."
        />
        <Reveal>
          <ServiceRows items={services} />
        </Reveal>
      </Section>

      <Section last tone="signal">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {services.map((service, index) => {
            const Icon = surfaces[index] ?? Orbit;
            return (
              <Reveal key={service.name} delay={index * 0.06}>
                <article className="glass flex min-h-[230px] flex-col p-5">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-revision" />
                    <span className="font-mono text-[8px] tracking-[0.14em] text-muted-foreground">0{index + 1}</span>
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
