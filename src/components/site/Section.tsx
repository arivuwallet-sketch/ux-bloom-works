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
    <section
      id={id}
      className={`archive-section archive-section--${tone}${last ? " is-last" : ""}`}
    >
      <div className="wrap">
        <div className="archive-section__rule">
          <span>REZYN / SECTION</span>
          <span>↘</span>
        </div>
        <div className="archive-section__surface">{children}</div>
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
    <div className="archive-section-heading">
      <div className="archive-section-heading__label">
        <span>{label}</span>
        <span>INDEX</span>
      </div>
      <div className="archive-section-heading__copy">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
  );
}

export function ServiceRows({ items }: { items: { name: string; desc: string }[] }) {
  return (
    <div className="archive-ledger">
      <div className="archive-ledger__head">
        <span>No.</span>
        <span>Capability</span>
        <span>Description</span>
        <span>↗</span>
      </div>
      {items.map((item, index) => (
        <article key={item.name} className="archive-ledger__row">
          <span className="archive-ledger__number">{String(index + 1).padStart(2, "0")}</span>
          <h3>{item.name}</h3>
          <p>{item.desc}</p>
          <span className="archive-ledger__arrow">↗</span>
        </article>
      ))}
    </div>
  );
}
