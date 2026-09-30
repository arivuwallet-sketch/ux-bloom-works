import type { ReactNode } from "react";

export function Section({
  children,
  last = false,
  id,
  tone = "default",
}: {
  children: ReactNode;
  last?: boolean;
  id?: string;
  tone?: "default" | "quiet" | "signal";
}) {
  return (
    <section id={id} className={`experience-section experience-section--${tone}${last ? " is-last" : ""}`}>
      <div className="section-orbit" aria-hidden>
        <span className="section-orbit__line" />
        <span className="section-orbit__dot" />
      </div>
      <div className="wrap">
        <div className="section-surface">{children}</div>
      </div>
    </section>
  );
}

export function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div className="section-heading__meta">
        <span className="eyebrow">{label}</span>
        <span className="section-heading__trace" aria-hidden />
      </div>
      <div className="section-heading__copy">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
  );
}

export function ServiceRows({ items }: { items: { name: string; desc: string }[] }) {
  return (
    <div className="capability-stack">
      {items.map((item, index) => (
        <article key={item.name} className="capability-row">
          <div className="capability-row__number">0{index + 1}</div>
          <div className="capability-row__title">{item.name}</div>
          <p>{item.desc}</p>
          <div className="capability-row__signal" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </article>
      ))}
    </div>
  );
}
