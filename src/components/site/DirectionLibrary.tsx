import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Layers3, MoveUpRight } from "lucide-react";
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

export function DirectionLibrary({ groups }: { groups: PreviewGroup[] }) {
  const entries = useMemo(() => flattenGroups(groups), [groups]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = entries[activeIndex] ?? entries[0];

  if (!active) return null;

  const selectGroup = (groupIndex: number) => {
    const first = entries.find((entry) => entry.groupIndex === groupIndex);
    if (first) setActiveIndex(first.index);
  };

  return (
    <div className="direction-library">
      <div className="direction-library__toolbar">
        <div className="direction-library__mark">
          <span>RZ</span>
          <span>DIR</span>
          <span>26</span>
        </div>
        <div className="direction-library__toolbar-copy">
          <span>Visual language archive</span>
          <span>{String(entries.length).padStart(2, "0")} systems indexed</span>
        </div>
        <a href="#direction-index" className="direction-library__jump">
          Browse index <ArrowDownRight className="h-4 w-4" />
        </a>
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
            <p>Each direction changes hierarchy, type, spacing, material, motion and component character—not just color.</p>
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
            {entries.map((entry) => {
              const isActive = entry.index === activeIndex;
              return (
                <button
                  key={`${entry.group}-${entry.name}`}
                  type="button"
                  onClick={() => setActiveIndex(entry.index)}
                  onMouseEnter={() => setActiveIndex(entry.index)}
                  className={isActive ? "direction-library__row is-active" : "direction-library__row"}
                  aria-pressed={isActive}
                >
                  <span className="direction-library__row-number">{String(entry.index + 1).padStart(2, "0")}</span>
                  <span className="direction-library__row-name">{entry.name}</span>
                  <span className="direction-library__row-family">{entry.group}</span>
                  <span className="direction-library__row-arrow"><MoveUpRight className="h-4 w-4" /></span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="direction-library__preview-wrap" aria-live="polite">
          <div className="direction-library__preview-card">
            <div className="direction-library__preview-meta">
              <span>Selected direction</span>
              <span>{String(active.index + 1).padStart(2, "0")} / {String(entries.length).padStart(2, "0")}</span>
            </div>

            <div className="direction-library__stage">
              <div className="direction-library__stage-grid" aria-hidden />
              <div className="direction-library__stage-preview">
                <PreviewTile preview={active.preview} />
              </div>
              <span className="direction-library__stage-code">{active.preview.replace("sp-", "")}</span>
            </div>

            <div className="direction-library__preview-copy">
              <span className="direction-library__preview-family">{active.group}</span>
              <h3>{active.name}</h3>
              <p>{active.desc}</p>
            </div>

            <a href="/projects" className="direction-library__apply">
              <span>Apply this direction</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
