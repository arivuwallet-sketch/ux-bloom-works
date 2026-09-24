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
    <section id={id} className={last ? "py-[96px]" : "py-[96px]"}>
      <div className="wrap">
        <div className="glass rise px-6 py-12 sm:px-12 sm:py-14">{children}</div>
      </div>
    </section>
  );
}

export function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <>
      <div className="mb-4 flex items-center gap-3 text-[12px] tracking-[0.34em] text-revision uppercase">
        <span className="inline-block h-px w-8 bg-amber/60" />
        {label}
      </div>
      <h2 className="mb-12 max-w-[18ch] text-[42px] leading-[0.92] sm:text-[64px]">{title}</h2>
    </>
  );
}

export function ServiceRows({ items }: { items: { name: string; desc: string }[] }) {
  return (
    <div className="border-b border-border/60">
      {items.map((item, i) => (
        <div
          key={item.name}
          className="group relative grid grid-cols-1 gap-2 overflow-hidden border-t border-border/60 py-[26px] pl-0 transition-all duration-300 md:grid-cols-[44px_260px_1fr] md:gap-8 md:pl-2 hover:bg-foreground/[0.03] hover:pl-4"
        >
          <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-[2px] scale-y-0 bg-revision opacity-0 shadow-[0_0_14px_var(--revision)] transition-all duration-300 group-hover:scale-y-100 group-hover:opacity-100"
          />
          <div className="hidden text-[13px] text-muted-foreground md:block">
            0{i + 1}
          </div>
          <div className="font-serif text-[30px] tracking-[0.04em] transition-colors group-hover:text-revision">
            {item.name}
          </div>
          <p className="max-w-[560px] text-[15.5px] text-ink-soft">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
