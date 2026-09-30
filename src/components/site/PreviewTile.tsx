import { ArrowUpRight } from "lucide-react";
import type { PreviewGroup } from "@/data/site";

function WebsiteDirectionPreview({ preview }: { preview: string }) {
  return (
    <div
      className={`style-preview website-preview ${preview}`}
      style={{ gridTemplateColumns: "1fr", gridTemplateRows: "1fr", gap: 0 }}
      aria-hidden
    >
      <div className="wp-browser">
        <div className="wp-chrome">
          <div className="wp-window-dots"><i /><i /><i /></div>
          <span className="wp-address">rezyn.design / studio</span>
          <span className="wp-chrome-action">↗</span>
        </div>

        <div className="wp-page">
          <header className="wp-header">
            <strong className="wp-brand">NOVA<span>®</span></strong>
            <nav className="wp-nav"><span>Work</span><span>Studio</span><span>About</span></nav>
            <span className="wp-header-cta">Start project</span>
          </header>

          <main>
            <section className="wp-hero">
              <div className="wp-hero-copy">
                <span className="wp-eyebrow">Independent digital studio / 2026</span>
                <h2>Shape the next interface.</h2>
                <p>We build expressive digital products where strategy, design and technology move as one system.</p>
                <div className="wp-actions"><span>Explore work</span><span>Our approach</span></div>
              </div>

              <div className="wp-visual">
                <div className="wp-visual-orb" />
                <div className="wp-dashboard">
                  <div className="wp-dashboard-head"><b>Signal / 04</b><span>LIVE</span></div>
                  <div className="wp-chart"><i /><i /><i /><i /><i /><i /></div>
                  <div className="wp-dashboard-foot"><span>Interaction</span><strong>87%</strong></div>
                </div>
                <span className="wp-float-card"><b>24</b><small>projects shipped</small></span>
              </div>
            </section>

            <section className="wp-stats">
              <div><strong>14</strong><span>years making</span></div>
              <div><strong>08</strong><span>design awards</span></div>
              <div><strong>32</strong><span>global launches</span></div>
            </section>

            <section className="wp-work">
              <div className="wp-section-head"><span>Selected capabilities</span><b>What we shape</b></div>
              <div className="wp-card-grid">
                <article><span>01</span><div className="wp-card-art wp-card-art-a" /><strong>Product systems</strong><p>Interfaces built for clarity and movement.</p></article>
                <article><span>02</span><div className="wp-card-art wp-card-art-b" /><strong>Digital identities</strong><p>Distinct visual languages for ambitious brands.</p></article>
                <article><span>03</span><div className="wp-card-art wp-card-art-c" /><strong>Spatial experiences</strong><p>Immersive moments across screen and space.</p></article>
              </div>
            </section>

            <section className="wp-lower">
              <span>Built for change.</span>
              <strong>One system.<br />Many expressions.</strong>
              <div className="wp-lower-mark" />
            </section>
          </main>

          <footer className="wp-footer"><strong>NOVA®</strong><span>Chennai · London · Everywhere</span><span>© 2026</span></footer>
        </div>
      </div>
    </div>
  );
}

export function PreviewTile({ preview }: { preview: string }) {
  if (preview.startsWith("sp-")) return <WebsiteDirectionPreview preview={preview} />;

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
                <div className="absolute left-5 top-5 z-10 rounded-full border border-current/10 bg-background/70 px-2 py-1 font-mono text-[8px] tracking-[0.1em] text-muted-foreground backdrop-blur-md">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="overflow-hidden border border-current/10 bg-black/5">
                  <div className="transition-transform duration-700 ease-out group-hover:scale-[1.018]">
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
