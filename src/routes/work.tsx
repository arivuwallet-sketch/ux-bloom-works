import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Minus, RefreshCcw } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";
import { BeforeAfter } from "@/components/site/BeforeAfter";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Proof — before and after interface transformation | Rezyn" },
      {
        name: "description",
        content:
          "See how Rezyn changes visual hierarchy, spacing, density and interface perception while keeping the product content and behavior anchored.",
      },
    ],
  }),
  component: WorkPage,
});

const changes = [
  {
    icon: Check,
    label: "Preserved",
    body: "Content, product meaning, routes and familiar interactions stay anchored.",
  },
  {
    icon: RefreshCcw,
    label: "Transformed",
    body: "Hierarchy, spacing, visual density, typography, surfaces and interaction rhythm are rebuilt.",
  },
  {
    icon: Minus,
    label: "Reduced",
    body: "Competing visual noise and low-value decoration lose priority so the core product reads faster.",
  },
];

function WorkPage() {
  return (
    <main>
      <PageHero
        index="05"
        eyebrow="Transformation proof"
        title="Same product."
        accent="Different perception."
        description="A useful redesign does not need to disguise the product. It changes what people notice first, how information groups together and how confidently the interface responds."
        stat="V2"
        statLabel="same source / new system"
        action={{ to: "/projects", label: "Transform your product" }}
      />

      <Section>
        <SectionHeading
          label="Visual delta"
          title="The difference should be obvious. The product should still be yours."
          description="Move between the original and transformed states to see where hierarchy, depth and rhythm change."
        />
        <Reveal>
          <BeforeAfter />
        </Reveal>
      </Section>

      <Section last tone="quiet">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {changes.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.label} delay={index * 0.08}>
                <article className="glass min-h-[300px] p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-revision/20 bg-revision/5 text-revision">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-20 text-[34px] leading-[0.95]">{item.label}</h3>
                  <p className="mb-0 mt-4 max-w-[36ch] text-[14px] leading-7 text-ink-soft">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-12 flex justify-end">
          <Link to="/projects" className="button-primary">
            Build the next version <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </main>
  );
}
