import { ArrowUpRight } from "lucide-react";
import type { PreviewGroup } from "@/data/site";

export function PreviewTile({ preview }: { preview: string }) {
  return (
    <div className={`style-preview ${preview}`} aria-hidden>
      <div className="sp-block" />
      <div className="sp-line" />
      <div className="sp-dot" />
    </div>
  );
}

export function PreviewGroups({ groups }: { groups: PreviewGroup[] }) {
  return (
    <div className="flex flex-col gap-20">
      {groups.map((group, groupIndex) => (
        <section key={group.title} className="relative">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] tracking-[0.14em] text-revision">0{groupIndex + 1}</span>
              <h3 className="m-0 text-[clamp(28px,3.5vw,46px)] leading-none">{group.title}</h3>
            </div>
            <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
              {group.items.length} {group.unit}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {group.items.map((item, index) => (
              <article
                key={item.name}
                className="glass group relative p-3 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="absolute left-5 top-5 z-10 rounded-full border border-white/10 bg-background/55 px-2 py-1 font-mono text-[8px] tracking-[0.1em] text-muted-foreground backdrop-blur-md">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="overflow-hidden rounded-[15px] border border-white/[0.06] bg-black/20">
                  <div className="transition-transform duration-700 ease-out group-hover:scale-[1.035]">
                    <PreviewTile preview={item.preview} />
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 px-2 pb-2 pt-5">
                  <div>
                    <div className="text-[15px] font-semibold tracking-[-0.02em] transition-colors group-hover:text-revision">
                      {item.name}
                    </div>
                    <p className="mb-0 mt-2 min-h-[38px] text-[12px] leading-[1.55] text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-revision" />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
