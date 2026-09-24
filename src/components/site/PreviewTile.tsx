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
    <div className="flex flex-col gap-14">
      {groups.map((group) => (
        <div key={group.title}>
          <div className="mb-[22px] flex items-baseline justify-between border-b border-border pb-[10px]">
            <h3 className="font-serif text-[26px] tracking-[0.05em]">{group.title}</h3>
            <span className="text-[13px] text-muted-foreground">
              {group.items.length} {group.unit}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {group.items.map((item) => (
              <div
                key={item.name}
                className="glass group p-[14px] transition-all duration-300 hover:-translate-y-1.5 hover:border-revision/50 hover:shadow-[0_18px_40px_-18px_var(--revision)]"
              >
                <div className="overflow-hidden">
                  <div className="transition-transform duration-500 group-hover:scale-[1.04]">
                    <PreviewTile preview={item.preview} />
                  </div>
                </div>
                <div className="mb-1 text-[14.5px] font-semibold transition-colors group-hover:text-revision">
                  {item.name}
                </div>
                <p className="min-h-[34px] text-[12.5px] leading-[1.45] text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
