import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Layers3, MoveUpRight, Search, X } from "lucide-react";
import type { PreviewGroup, PreviewItem } from "@/data/site";
import { PreviewTile } from "@/components/site/PreviewTile";

type DirectionEntry = PreviewItem & {
  group: string;
  groupIndex: number;
  index: number;
};

function flattenGroups(groups: PreviewGroup[]): DirectionEntry[] {
  let cursor = 0;
  return groups.flatMap((group, groupIndex) =>
    group.items.map((item) => ({
      ...item,
      group: group.title,
      groupIndex,
      index: cursor++,
    })),
  );
}

function familyTag(title: string) {
  if (title.includes("Morphisms")) return "Material";
  if (title.includes("Structural")) return "Structure";
  if (title.includes("Historical")) return "Art";
  if (title.includes("Retro-Tech")) return "Retro-tech";
  if (title.includes("Minimalism")) return "Minimal / flat";
  if (title.includes("Modern System")) return "System modes";
  if (title.includes("Mixed-Media")) return "Motion / media";
  if (title.includes("Natural")) return "Natural";
  if (title.includes("AI-Native")) return "AI / spatial";
  return title;
}

export function DirectionLibrary({ groups }: { groups: PreviewGroup[] }) {
  const entries = useMemo(() => flattenGroups(groups), [groups]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState<number | null>(null);
  const active = entries[activeIndex] ?? entries[0];

  const visibleEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (familyFilter !== null && entry.groupIndex !== familyFilter) return false;
      if (!needle) return true;
      return `${entry.name} ${entry.desc} ${entry.group}`.toLowerCase().includes(needle);
    });
  }, [entries, familyFilter, query]);

  if (!active) return null;

  const related = entries
    .filter((entry) => entry.groupIndex === active.groupIndex && entry.index !== active.index)
    .slice(0, 3);

  const selectGroup = (groupIndex: number) => {
    const first = entries.find((entry) => entry.groupIndex === groupIndex);
    setFamilyFilter(groupIndex);
    setQuery("");
    if (first) setActiveIndex(first.index);
  };

  const clearFilters = () => {
    setFamilyFilter(null);
    setQuery("");
  };

  return (
    <div className="direction-library">
      <div className="direction-library__toolbar">
        <div className="direction-library__mark">
          <span>RZ</span>
          <span>DIR</span>
          <span>{String(entries.length).padStart(2, "0")}</span>
        </div>
        <div className="direction-library__toolbar-copy">
          <span>Visual language archive</span>
          <span>{String(entries.length).padStart(2, "0")} systems indexed</span>
        </div>
        <a href="#direction-index" className="direction-library__jump">
          Browse index <ArrowDownRight className="h-4 w-4" />
        </a>
      </div>

      <div className="border-x border-b border-black bg-[#f4f0e7] px-4 py-4 sm:px-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,.8fr)_1.2fr] lg:items-center">
          <label className="flex min-h-11 items-center gap-3 border border-black bg-[#fffdf7] px-3">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search all 61 directions…"
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-black outline-none placeholder:text-black/45"
              aria-label="Search direction library"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="border-0 bg-transparent p-1 text-black/55 hover:text-black"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className={`whitespace-nowrap border border-black px-3 py-2 font-mono text-[9px] uppercase tracking-[.08em] ${familyFilter === null ? "bg-black text-[#f4f0e7]" : "bg-transparent text-black"}`}
            >
              All / {entries.length}
            </button>
            {groups.map((group, index) => (
              <button
                key={group.title}
                type="button"
                onClick={() => selectGroup(index)}
                className={`whitespace-nowrap border border-black px-3 py-2 font-mono text-[9px] uppercase tracking-[.08em] ${familyFilter === index ? "bg-black text-[#f4f0e7]" : "bg-transparent text-black"}`}
              >
                {familyTag(group.title)} / {group.items.length}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="direction-library__body" id="direction-index">
        <aside className="direction-library__rail">
          <div className="direction-library__rail-label">Families</div>
          <div className="direction-library__families">
            {groups.map((group, index) => {
              const isActive = active.groupIndex === index;
              return (
                <button
                  key={group.title}
                  type="button"
                  onClick={() => selectGroup(index)}
                  className={isActive ? "is-active" : ""}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{group.title}</strong>
                  <em>{String(group.items.length).padStart(2, "0")}</em>
                </button>
              );
            })}
          </div>

          <div className="direction-library__rail-note">
            <Layers3 className="h-4 w-4" />
            <p>
              Each direction reconstructs hierarchy, layout, type, spacing, material, motion and
              component character—not just color.
            </p>
          </div>
        </aside>

        <section className="direction-library__ledger">
          <div className="direction-library__ledger-head">
            <span>No.</span>
            <span>Direction</span>
            <span>Family</span>
            <span>Open</span>
          </div>

          <div className="direction-library__rows">
            {visibleEntries.length ? (
              visibleEntries.map((entry) => {
                const isActive = entry.index === activeIndex;
                return (
                  <button
                    key={`${entry.group}-${entry.name}`}
                    type="button"
                    onClick={() => setActiveIndex(entry.index)}
                    onMouseEnter={() => setActiveIndex(entry.index)}
                    className={
                      isActive ? "direction-library__row is-active" : "direction-library__row"
                    }
                    aria-pressed={isActive}
                  >
                    <span className="direction-library__row-number">
                      {String(entry.index + 1).padStart(2, "0")}
                    </span>
                    <span className="direction-library__row-name">{entry.name}</span>
                    <span className="direction-library__row-family">{entry.group}</span>
                    <span className="direction-library__row-arrow">
                      <MoveUpRight className="h-4 w-4" />
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="border-b border-black p-8 text-center text-[13px] text-black/60">
                No direction matches “{query}”.{" "}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-1 border-0 bg-transparent p-0 font-semibold text-black underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="direction-library__preview-wrap" aria-live="polite">
          <div className="direction-library__preview-card">
            <div className="direction-library__preview-meta">
              <span>Selected direction</span>
              <span>
                {String(active.index + 1).padStart(2, "0")} /{" "}
                {String(entries.length).padStart(2, "0")}
              </span>
            </div>

            <div className="direction-library__stage">
              <div className="direction-library__stage-grid" aria-hidden />
              <div className="direction-library__stage-preview">
                <PreviewTile preview={active.preview} />
              </div>
              <span className="direction-library__stage-code">
                {active.preview.replace("sp-", "")}
              </span>
            </div>

            <div className="direction-library__preview-copy">
              <span className="direction-library__preview-family">{active.group}</span>
              <h3>{active.name}</h3>
              <p>{active.desc}</p>
            </div>

            {related.length ? (
              <div className="border-t border-black/25 px-4 py-4">
                <div className="mb-2 font-mono text-[8px] uppercase tracking-[.12em] text-black/55">
                  Related directions
                </div>
                <div className="flex flex-wrap gap-2">
                  {related.map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      onClick={() => {
                        setActiveIndex(entry.index);
                        setFamilyFilter(entry.groupIndex);
                        setQuery("");
                      }}
                      className="border border-black bg-transparent px-2.5 py-1.5 text-left text-[10px] text-black transition-transform hover:-translate-y-0.5 hover:bg-black hover:text-[#f4f0e7]"
                    >
                      {entry.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <Link to="/projects" className="direction-library__apply">
              <span>Apply this direction</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
