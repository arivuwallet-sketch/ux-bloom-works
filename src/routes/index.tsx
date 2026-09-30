import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Boxes, Braces, Layers3, ScanLine, Sparkles, WandSparkles } from "lucide-react";
import { Reveal, Ticker } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading, ServiceRows } from "@/components/site/Section";
import { PreviewGroups } from "@/components/site/PreviewTile";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { processSteps, services, styleGroups } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rezyn — AI interface reconstruction studio" },
      {
        name: "description",
        content:
          "Upload an existing digital product, choose one of 61 directions, and reconstruct its UI/UX from scratch while preserving the functionality, content and logic underneath.",
      },
      { property: "og:title", content: "Rezyn — Existing product. New gravity." },
      {
        property: "og:description",
        content: "A full-project UI reconstruction system for websites, apps, SaaS products and storefronts.",
      },
    ],
  }),
  component: Index,
});

const engineSignals = [
  { icon: ScanLine, label: "Source read", value: "01" },
  { icon: Layers3, label: "Visual systems", value: "61" },
  { icon: Braces, label: "Logic preserved", value: "100%" },
  { icon: Boxes, label: "Delivery", value: "ZIP" },
];

function Index() {
  return (
    <main>
      <PageHero
        index="00"
        eyebrow="Interface reconstruction engine"
        title="Existing product."
        accent="New gravity."
        description="Rezyn reads the product you already built, keeps what it does, discards its existing presentation, and reconstructs the visual hierarchy, layout, interaction rhythm and interface system from a blank canvas."
        action={{ to: "/projects", label: "Reconstruct a project" }}
        aside={
          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="mb-auto grid grid-cols-2 gap-2 pt-10">
              {["UI", "UX", "3D", "AI"].map((item) => (
                <span key={item} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3 font-mono text-[9px] tracking-[0.12em] text-muted-foreground">
                  {item} / ACTIVE
                </span>
              ))}
            </div>
            <div className="mb-3 flex items-center gap-2 text-revision">
              <WandSparkles className="h-4 w-4" />
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase">Reconstruction core</span>
            </div>
            <strong>R3</strong>
            <span>full interface reconstruction</span>
          </div>
        }
      />

      <div className="wrap">
        <Ticker
          items={[
            "websites",
            "web apps",
            "mobile products",
            "SaaS systems",
            "commerce",
            "61 directions",
            "from-scratch UI",
            "logic preserved",
            "project export",
          ]}
          speed={34}
        />
      </div>

      <Section>
        <SectionHeading
          label="Reconstruction engine"
          title="We rebuild the layer people feel."
          description="The existing presentation is discarded. The functionality, data, content and product behavior beneath it survive."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {engineSignals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <Reveal key={signal.label} delay={index * 0.07}>
                <article className="glass group min-h-[220px] p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <Icon className="h-5 w-5 text-revision" />
                    <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">SYS / 0{index + 1}</span>
                  </div>
                  <div className="mt-16 font-serif text-[48px] leading-none tracking-[-0.06em]">{signal.value}</div>
                  <div className="mt-3 text-[12px] uppercase tracking-[0.12em] text-ink-soft">{signal.label}</div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tone="quiet">
        <SectionHeading
          label="Coverage"
          title="One engine for every interface surface."
          description="Marketing pages, operational products, commerce and dense software all move through the same reconstruction pipeline."
        />
        <Reveal>
          <ServiceRows items={services} />
        </Reveal>
      </Section>

      <Section tone="signal">
        <SectionHeading
          label="Flight path"
          title="From source files to a completely new visual system."
          description="The workflow is intentionally short. Complexity belongs in the engine, not in the experience."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {processSteps.map((step, index) => (
            <Reveal key={step.version} delay={index * 0.08}>
              <article className="glass relative min-h-[320px] p-7">
                <div className="absolute right-6 top-6 font-mono text-[9px] tracking-[0.16em] text-muted-foreground">{step.version}</div>
                <div className="mb-16 flex h-11 w-11 items-center justify-center rounded-2xl border border-revision/20 bg-revision/5 text-revision">
                  {index === 0 ? <Boxes className="h-5 w-5" /> : index === 1 ? <Sparkles className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                </div>
                <h3 className="mb-4 text-[34px] leading-[0.95]">{step.title}</h3>
                <p className="m-0 max-w-[40ch] text-[14px] leading-7 text-ink-soft">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          label="Direction library"
          title="A visual world, not a preset filter."
          description="Choose a direction and let the reconstruction engine rebuild hierarchy, layout, navigation, type, spacing, surfaces and interaction as one new connected system."
        />
        <PreviewGroups groups={styleGroups.slice(0, 2)} />
        <div className="mt-10 flex justify-end">
          <Link to="/styles" className="button-secondary">
            Explore all 61 directions <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Section last>
        <SectionHeading
          label="Before / after"
          title="Same product logic. Entirely different interface."
          description="The source tells Rezyn what the product must do. The selected direction decides how the rebuilt experience looks, feels and moves."
        />
        <Reveal>
          <BeforeAfter />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-8">
            <p className="m-0 max-w-[680px] text-[18px] leading-8 text-ink-soft">
              Your uploaded UI is not the template. Rezyn keeps the product behavior and reconstructs its presentation as if a different design team built it from scratch.
            </p>
            <Link to="/projects" className="button-primary">
              Start reconstruction <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
