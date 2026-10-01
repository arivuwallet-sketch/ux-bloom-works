import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, Check, FileStack, GitCompare, Layers3, MessageSquare, ScanSearch, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";

export const Route = createFileRoute("/why-rezyn")({
  head: () => ({
    meta: [
      { title: "Rezyn vs. a chatbot prompt — an honest comparison | Rezyn" },
      {
        name: "description",
        content:
          "You can ask ChatGPT, Claude, Gemini or Lovable to redesign a page. Here's honestly where that works, where it breaks down on a whole project, and what Rezyn adds.",
      },
      { property: "og:title", content: "Rezyn vs. a chatbot prompt — an honest comparison" },
      {
        property: "og:description",
        content: "Where single-prompt redesigns work, where they break, and what a dedicated project pipeline adds.",
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
    chat: "Paste files into the conversation. Large projects hit message and context limits, so files get dropped or summarised.",
    rezyn: "Upload the whole project or a ZIP. Every supported file is stored and processed individually.",
  },
  {
    topic: "Consistency",
    chat: "Each reply is generated fresh. Page five can drift from page one unless you keep re-explaining the style.",
    rezyn: "Every file gets the same style blueprint plus the project's file list, so the direction stays the same.",
  },
  {
    topic: "Checking the result",
    chat: "You review everything yourself. A reply that looks confident may have quietly changed behaviour.",
    rezyn: "A similarity check and a second AI review pass run on every file. Failures retry, then show a visible reason.",
  },
  {
    topic: "Keeping behaviour",
    chat: "Depends on how carefully you prompt each time.",
    rezyn: "Built-in rules on every file: keep routes, handlers, data bindings, forms, IDs and content meaning.",
  },
  {
    topic: "Per-file control",
    chat: "Possible, but you manage it by hand across many messages.",
    rezyn: "Set one direction for the project, or override it on any single file.",
  },
  {
    topic: "Getting files out",
    chat: "Copy and paste each file back, one by one.",
    rezyn: "One ZIP download of the redesigned files. Originals stay in the workspace to compare.",
  },
];

const chatWins = [
  "Redesigning a single page or component quickly.",
  "Open-ended brainstorming and back-and-forth.",
  "You already have a paid subscription you're happy with.",
  "Non-code tasks: copy, ideas, mood boards.",
];

const pipeline = [
  { icon: FileStack, title: "File-by-file", body: "No giant paste. Each file is redesigned on its own, with knowledge of the rest of the project." },
  { icon: Layers3, title: "61 style blueprints", body: "Each direction is a written system — type, spacing, surfaces, motion — not a one-line adjective." },
  { icon: ScanSearch, title: "Similarity guard", body: "If the result looks too much like the original, it's rejected and regenerated." },
  { icon: ShieldCheck, title: "Second-pass review", body: "A separate review step checks behaviour, accessibility and style fit, then requests fixes." },
  { icon: GitCompare, title: "Originals kept", body: "Your uploaded files are never overwritten. Compare, start over, or download again." },
  { icon: MessageSquare, title: "Project chat", body: "Refine results in a chat that's tied to your project's files, not a blank conversation." },
];

const limits = [
  "It's AI. Output can contain bugs or behave differently — always test before shipping.",
  "Only text and code files are redesigned. Images, fonts and binaries are skipped and not in the ZIP.",
  "The ZIP contains redesigned files only. You merge them back into your project.",
  "The review pass is also AI. It catches a lot, not everything.",
  "Very large single files may be rejected for size.",
];

function WhyRezyn() {
  return (
    <main>
      <PageHero
        index="06"
        eyebrow="Honest comparison"
        title="Can't a chatbot"
        accent="do this?"
        description="Partly — and we'll say so. ChatGPT, Claude, Gemini and Lovable can all redesign a page from one good prompt. Rezyn is for the moment that stops working: a whole project, dozens of files, one consistent result you can check."
        stat="1:1"
        statLabel="same AI family / different workflow"
        action={{ to: "/projects", label: "Try it on your project" }}
      />

      <Section>
        <SectionHeading
          label="Where chatbots win"
          title="Credit where it's due."
          description="If any of these describe you, a general chatbot may be all you need."
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
          description="Same underlying technology. The difference is everything built around it."
        />
        <Reveal>
          <div className="compare-table glass" role="table" aria-label="Chatbot prompt compared with Rezyn">
            <div className="compare-table__row compare-table__row--head" role="row">
              <span role="columnheader">Task</span>
              <span role="columnheader">Single chatbot prompt</span>
              <span role="columnheader">Rezyn</span>
            </div>
            {rows.map((row) => (
              <div key={row.topic} className="compare-table__row" role="row">
                <strong role="cell">{row.topic}</strong>
                <span role="cell">{row.chat}</span>
                <span role="cell" className="compare-table__rezyn">{row.rezyn}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section tone="signal">
        <SectionHeading
          label="What's actually inside"
          title="Six things a prompt box doesn't do for you."
          description="Each of these runs automatically on every file — you don't have to remember to ask."
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
          description="Trust starts with saying what a tool can't do."
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
            The fairest test: run the same project through your favourite chatbot and through Rezyn, then compare. Read the{" "}
            <Link to="/legal/ai-disclosure" className="underline underline-offset-4">AI Disclosure</Link> for the details.
          </p>
          <Link to="/projects" className="button-primary">
            Run the comparison <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </main>
  );
}
