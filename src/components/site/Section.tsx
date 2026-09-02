import type { ReactNode } from "react";

export function Section({
  children,
  last = false,
  id,
}: {
  children: ReactNode;
  last?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={last ? "py-[84px]" : "border-b border-border py-[84px]"}>
      <div className="wrap">{children}</div>
    </section>
  );
}

export function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <>
      <div className="mb-2 text-[15px] text-muted-foreground">{label}</div>
      <h2 className="mb-12 max-w-[560px] text-[32px]">{title}</h2>
    </>
  );
}

export function ServiceRows({
  items,
}: {
  items: { name: string; desc: string }[];
}) {
  return (
    <div className="border-b border-border">
      {items.map((item) => (
        <div
          key={item.name}
          className="grid grid-cols-1 gap-2 border-t border-border py-[26px] md:grid-cols-[280px_1fr] md:gap-8"
        >
          <div className="font-serif text-[22px] italic">{item.name}</div>
          <p className="max-w-[520px] text-[15.5px] text-ink-soft">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
