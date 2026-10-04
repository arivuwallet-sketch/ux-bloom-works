import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Braces,
  Layers3,
  ScanLine,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Reveal, Ticker } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading, ServiceRows } from "@/components/site/Section";
import { PreviewGroups } from "@/components/site/PreviewTile";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { processSteps, services, styleGroups } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rezyn — AI UI redesign + SEO intelligence agent" },
      {
        name: "description",
        content:
          "Upload an existing website or product, reconstruct its UI/UX, improve technical and on-page SEO, strengthen content and structured data, optimize for answer engines and AI visibility, or run everything together while preserving functionality.",
      },
      {
        property: "og:title",
        content: "Rezyn — Redesign the interface. Rebuild search intelligence.",
      },
      {
        property: "og:description",
        content:
          "A full-project AI reconstruction and SEO intelligence system for websites, apps, SaaS products and storefronts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const engineSignals = [
  { icon: ScanLine, label: "Source read", value: "01" },
  { icon: Layers3, label: "Visual systems", value: "61" },
  { icon: Search, label: "Search + AI visibility", value: "SEO+" },
  { icon: Braces, label: "Deterministic + AI QA", value: "QA" },
  { icon: Boxes, label: "Delivery", value: "ZIP" },
];

const seoCapabilities = [
  {
    number: "01",
    title: "Search foundations",
    body: "Checks whether search engines can discover, crawl, render and index the right pages, then protects canonicals, redirects, hreflang and important URLs.",
  },
  {
    number: "02",
    title: "Technical SEO",
    body: "Improves robots rules, sitemaps, crawl paths, internal architecture, rendering strategy, mobile accessibility and performance-related implementation issues.",
  },
  {
    number: "03",
    title: "On-page optimization",
    body: "Strengthens titles, descriptions, headings, semantic HTML, image text, internal links, social metadata and answer-first page structure without keyword stuffing.",
  },
  {
    number: "04",
    title: "Content quality + trust",
    body: "Analyzes topical coverage, information gain, freshness, authorship, trust signals and E-E-A-T needs while avoiding fabricated expertise, reviews or claims.",
  },
  {
    number: "05",
    title: "Keyword-to-page mapping",
    body: "Maps real topics and search intent to the correct existing pages, reduces cannibalization and keeps search-volume or difficulty metrics unknown unless real data is provided.",
  },
  {
    number: "06",
    title: "Structured data",
    body: "Selects and implements appropriate schema such as Organization, WebSite, Article, Product, Breadcrumb or SoftwareApplication only when the project contains the facts required to support it.",
  },
  {
    number: "07",
    title: "Answer engine optimization",
    body: "Makes important information easier for search assistants and answer engines to extract through direct answers, clear comparisons, how-to structure, lists and factual page organization.",
  },
  {
    number: "08",
    title: "AI search + agent readiness",
    body: "Improves entity clarity, source attribution, machine-readable content, AI crawler access and agent-ready artifacts so the project is easier for modern search and AI systems to understand.",
  },
];

function Index() {
  return (
    <main>
      <PageHero
        index="00"
        eyebrow="AI reconstruction + search intelligence"
        title="Existing product."
        accent="New gravity."
        description="Rezyn understands the product you already built, preserves what it does, and can reconstruct the interface, strengthen technical SEO and content structure, improve answer-engine and AI-search visibility, or run the whole pipeline together as one project-aware system."
        action={{ to: "/projects", label: "Transform a project" }}
        aside={
          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="mb-auto grid grid-cols-2 gap-2 pt-10">
              {["UI", "UX", "SEO", "AI"].map((item) => (
                <span
                  key={item}
                  className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3 font-mono text-[9px] tracking-[0.12em] text-muted-foreground"
                >
                  {item} / ACTIVE
                </span>
              ))}
            </div>
            <div className="mb-3 flex items-center gap-2 text-revision">
              <WandSparkles className="h-4 w-4" />
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase">
                Project intelligence core
              </span>
            </div>
            <strong>R4</strong>
            <span>redesign + SEO/GEO/AEO/AAO</span>
          </div>
        }
      />

      <div className="wrap">
        <Ticker
          items={[
            "websites",
            "web apps",
            "SaaS systems",
            "commerce",
            "61 directions",
            "SEO Agent",
            "technical SEO",
            "on-page optimization",
            "content trust",
            "structured data",
            "keyword mapping",
            "answer engines",
            "AI search visibility",
            "project export",
          ]}
          speed={34}
        />
      </div>

      <Section>
        <SectionHeading
          label="Unified intelligence engine"
          title="Rebuild what people see — and what search systems understand."
          description="Choose UI/UX reconstruction, SEO Agent, or both. Rezyn plans at project level first, preserves functionality and routes, applies deterministic analysis before AI generation, and validates the transformed source before export."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {engineSignals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <Reveal key={signal.label} delay={index * 0.07}>
                <article className="glass group min-h-[220px] p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <Icon className="h-5 w-5 text-revision" />
                    <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
                      SYS / 0{index + 1}
                    </span>
                  </div>
                  <div className="mt-16 font-serif text-[48px] leading-none tracking-[-0.06em]">
                    {signal.value}
                  </div>
                  <div className="mt-3 text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                    {signal.label}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tone="quiet">
        <SectionHeading
          label="SEO intelligence"
          title="What the SEO Agent actually improves."
          description="No internal module names to decode. Rezyn audits the real project across eight practical areas, turns the findings into a coordinated plan, updates the right files, creates missing search artifacts when justified, and validates the result before export."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {seoCapabilities.map((capability, index) => (
            <Reveal key={capability.number} delay={index * 0.04}>
              <article className="glass min-h-[260px] p-6">
                <div className="font-mono text-[9px] tracking-[0.14em] text-revision">
                  SEO / {capability.number}
                </div>
                <h3 className="mb-4 mt-12 text-[30px] leading-[0.98]">{capability.title}</h3>
                <p className="m-0 text-[13px] leading-6 text-ink-soft">{capability.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="quiet">
        <SectionHeading
          label="Coverage"
          title="One project model across interface and search."
          description="Marketing sites, operational products, commerce and dense software can move through the same project-aware pipeline. Public website surfaces can also be audited and optimized for crawlability, indexability, semantics, structured data, internal linking, answer extraction and AI visibility."
        />
        <Reveal>
          <ServiceRows items={services} />
        </Reveal>
      </Section>

      <Section tone="signal">
        <SectionHeading
          label="Flight path"
          title="From source files to a redesigned and search-ready project."
          description="The workflow stays simple in the UI while the engine handles project hydration, technical and on-page SEO analysis, content and trust checks, keyword-to-page mapping, structured data, answer-engine readiness, AI visibility, transformation ordering, QA and export underneath."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <Reveal key={step.version} delay={index * 0.08}>
              <article className="glass relative min-h-[320px] p-7">
                <div className="absolute right-6 top-6 font-mono text-[9px] tracking-[0.16em] text-muted-foreground">
                  {step.version}
                </div>
                <div className="mb-16 flex h-11 w-11 items-center justify-center rounded-2xl border border-revision/20 bg-revision/5 text-revision">
                  {index === 0 ? (
                    <Boxes className="h-5 w-5" />
                  ) : index === 1 ? (
                    <Sparkles className="h-5 w-5" />
                  ) : index === 2 ? (
                    <Search className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
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
          description="For redesign mode, choose a direction and let the reconstruction engine rebuild hierarchy, layout, navigation, type, spacing, surfaces and interaction as one connected system. SEO mode can run independently without restyling that presentation."
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
          title="Same product logic. Better interface. Stronger search structure."
          description="The source tells Rezyn what the product must do. Design intelligence governs reconstruction; SEO intelligence governs search, answer and machine-readability improvements without inventing metrics, claims or structured-data facts."
        />
        <Reveal>
          <BeforeAfter />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-8">
            <p className="m-0 max-w-[680px] text-[18px] leading-8 text-ink-soft">
              Your uploaded UI is not the template, and SEO is not reduced to a generic prompt.
              Rezyn works from the real project, applies project-wide plans, preserves the original
              files for comparison, and keeps unknown search metrics unknown. Wondering why not just
              ask a chatbot?{" "}
              <Link to="/why-rezyn" className="underline underline-offset-4">
                Read the honest comparison
              </Link>
              .
            </p>
            <Link to="/projects" className="button-primary">
              Start transformation <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
