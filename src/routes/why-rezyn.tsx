import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  FileStack,
  GitCompare,
  Layers3,
  MessageSquare,
  ScanSearch,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";

export const Route = createFileRoute("/why-rezyn")({
  head: () => ({
    meta: [
      { title: "Rezyn vs. a chatbot prompt — redesign + SEO comparison | Rezyn" },
      {
        name: "description",
        content:
          "A chatbot can redesign or suggest SEO changes from a prompt. Rezyn adds project-wide source analysis, design planning, M1–M8 SEO intelligence, deterministic checks, coordinated transformation and export.",
      },
      { property: "og:title", content: "Rezyn vs. a chatbot prompt — an honest comparison" },
      {
        property: "og:description",
        content:
          "Where single-prompt redesign and SEO advice work, where whole-project consistency breaks down, and what Rezyn adds around the model.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhyRezyn,
});

const rows: { topic: string; chat: string; rezyn: string }[] = [
  {
    topic: "Getting files in",
    chat: "Paste files into the conversation. Large projects can hit message/context limits, so the model may not see the complete system at once.",
    rezyn:
      "Upload the whole project or a ZIP. Supported source files are stored, hydrated and analyzed as one project before transformation.",
  },
  {
    topic: "Consistency",
    chat: "Each reply is generated fresh. Page five can drift from page one unless you keep re-explaining the project rules.",
    rezyn:
      "Project-level design and SEO plans create shared constraints before file-by-file work begins.",
  },
  {
    topic: "SEO / GEO / AEO",
    chat: "A good prompt can produce useful SEO ideas, but measurements, route context and cross-file consistency depend on what you supplied in that conversation.",
    rezyn:
      "The SEO Agent runs deterministic project analysis plus M1–M8 intelligence across crawl/indexing, on-page SEO, E-E-A-T, keyword mapping, structured data, AEO and GEO. Unknown metrics remain null instead of being invented.",
  },
  {
    topic: "Checking the result",
    chat: "You usually review the response yourself. Confident output can still contain invalid code, unsupported schema or unintended changes.",
    rezyn:
      "Rezyn combines deterministic guards with separate AI QA and post-transformation audits. Rejected output retries or surfaces a visible error.",
  },
  {
    topic: "Keeping behaviour",
    chat: "Depends on how carefully you prompt each time.",
    rezyn:
      "Built-in preservation rules cover routes, handlers, data bindings, forms, IDs, content meaning and existing project behavior.",
  },
  {
    topic: "Per-file control",
    chat: "Possible, but you manage it manually across many messages.",
    rezyn:
      "Set one redesign direction for the project or override individual files; SEO can run independently without restyling the UI.",
  },
  {
    topic: "Getting files out",
    chat: "You often copy files back one by one or rely on whatever artifact workflow is available in that chat.",
    rezyn:
      "One project ZIP prioritizes SEO-updated source when present, then redesigned source, while retaining untouched source for files that did not need transformation.",
  },
];

const chatWins = [
  "Redesigning or reviewing a single page/component quickly.",
  "Open-ended brainstorming and back-and-forth.",
  "One-off SEO questions where you do not need a project-wide execution pipeline.",
  "Non-code tasks: copy, ideas, outlines and mood boards.",
];

const pipeline = [
  {
    icon: FileStack,
    title: "Whole-project source",
    body: "No giant paste. Rezyn hydrates the actual project and preserves file relationships instead of treating every file as an isolated prompt.",
  },
  {
    icon: Layers3,
    title: "61 style blueprints",
    body: "Each redesign direction is a connected visual system — type, spacing, surfaces, motion and hierarchy — rather than a one-line adjective.",
  },
  {
    icon: Search,
    title: "M1–M8 SEO intelligence",
    body: "Technical SEO, on-page, E-E-A-T, keyword mapping, structured data, AEO and GEO share one source-grounded project context.",
  },
  {
    icon: ScanSearch,
    title: "Deterministic analysis",
    body: "Rezyn checks measurable source conditions first and keeps unavailable search volume, difficulty, rankings and traffic explicitly unknown.",
  },
  {
    icon: ShieldCheck,
    title: "Independent review",
    body: "Separate QA checks behavior, accessibility, design-system fit and SEO safety before accepting generated output.",
  },
  {
    icon: GitCompare,
    title: "Originals kept",
    body: "Uploaded files remain available for comparison and reset while transformed outputs are stored separately.",
  },
  {
    icon: MessageSquare,
    title: "Project chat",
    body: "Refine project results in a conversation tied to your files and existing transformations rather than starting from an empty chat.",
  },
];

const limits = [
  "It's AI. Generated code can still contain bugs or unintended behavior — test before shipping.",
  "Search rankings, traffic, search volume, keyword difficulty and AI citations require real external data; Rezyn must not invent them.",
  "Some SEO checks require live deployment, Search Console, analytics, logs or external validators and are marked partial/not-run when that evidence is unavailable.",
  "Structured data can improve machine understanding but does not guarantee rankings, rich results or AI citations.",
  "Very large single files may be rejected or clipped for safe AI context handling.",
];

function WhyRezyn() {
  return (
    <main>
      <PageHero
        index="06"
        eyebrow="Honest comparison"
        title="Can't a chatbot"
        accent="do this?"
        description="Partly — and we'll say so. General AI tools can redesign a page or suggest SEO changes from a strong prompt. Rezyn is the project workflow around that intelligence: complete source context, coordinated plans, M1–M8 analysis, controlled transformation, QA and export."
        stat="PROJECT"
        statLabel="context before generation"
        action={{ to: "/projects", label: "Try it on your project" }}
      />

      <Section>
        <SectionHeading
          label="Where chatbots win"
          title="Credit where it's due."
          description="If any of these describe the job, a general chatbot may be all you need."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {chatWins.map((item, i) => (
            <Reveal key={item} delay={i * 0.05}>
              <div className="glass flex items-start gap-4 p-6">
                <Check className="mt-1 h-5 w-5 shrink-0 text-revision" />
                <p className="m-0 text-[16px] leading-7 text-ink-soft">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="quiet">
        <SectionHeading
          label="Side by side"
          title="A whole project is a different job."
          description="The model matters, but so do source coverage, state, deterministic analysis, orchestration and QA around it."
        />
        <Reveal>
          <div
            className="compare-table glass"
            role="table"
            aria-label="Chatbot prompt compared with Rezyn"
          >
            <div className="compare-table__row compare-table__row--head" role="row">
              <span role="columnheader">Task</span>
              <span role="columnheader">Single chatbot prompt</span>
              <span role="columnheader">Rezyn</span>
            </div>
            {rows.map((row) => (
              <div key={row.topic} className="compare-table__row" role="row">
                <strong role="cell">{row.topic}</strong>
                <span role="cell">{row.chat}</span>
                <span role="cell" className="compare-table__rezyn">
                  {row.rezyn}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section tone="signal">
        <SectionHeading
          label="What's actually inside"
          title="Seven things a prompt box doesn't coordinate for you."
          description="These are project-level systems around generation, so you do not have to restate them file by file."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pipeline.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <article className="glass min-h-[230px] p-7">
                  <Icon className="h-5 w-5 text-revision" />
                  <h3 className="mb-3 mt-10 text-[30px] leading-[0.95]">{item.title}</h3>
                  <p className="m-0 text-[14px] leading-7 text-ink-soft">{item.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section last>
        <SectionHeading
          label="Limits, in plain sight"
          title="What we won't pretend."
          description="Trust starts with distinguishing measured evidence from generated recommendations."
        />
        <ul className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {limits.map((item) => (
            <li key={item} className="glass flex items-start gap-4 p-6">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-revision" />
              <span className="text-[15px] leading-7 text-ink-soft">{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-8">
          <p className="m-0 max-w-[640px] text-[18px] leading-8 text-ink-soft">
            The fairest test is still the same: use the same real project and compare the outputs,
            implementation safety and context retention. Read the{" "}
            <Link to="/legal/ai-disclosure" className="underline underline-offset-4">
              AI Disclosure
            </Link>{" "}
            for the details.
          </p>
          <Link to="/projects" className="button-primary">
            Run the comparison <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </main>
  );
}
