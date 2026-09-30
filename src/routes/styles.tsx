import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Asterisk, CircleDotDashed, Sparkles } from "lucide-react";
import { DirectionLibrary } from "@/components/site/DirectionLibrary";
import { Reveal } from "@/components/studio/motion";
import { styleGroups } from "@/data/site";
import "@/direction-library.css";

export const Route = createFileRoute("/styles")({
  head: () => ({
    meta: [
      { title: "Direction Library — 61 interface design systems | Rezyn" },
      {
        name: "description",
        content:
          "Browse Rezyn's 61-direction reconstruction library across material systems, structural grids, art movements, retro-tech, flat architecture, modern modes, cinematic UI, organic aesthetics and AI-native spatial experiences.",
      },
    ],
  }),
  component: StylesPage,
});

function StylesPage() {
  const total = styleGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <main className="direction-page">
      <section className="direction-intro">
        <div className="direction-intro__topline">
          <span>Rezyn / Direction Library</span>
          <span>Edition 02 — 2026</span>
          <span>{String(total).padStart(2, "0")} indexed systems</span>
        </div>

        <div className="direction-intro__hero">
          <Reveal className="direction-intro__copy">
            <div className="direction-intro__kicker">
              <CircleDotDashed className="h-4 w-4" />
              Choose the visual operating system
            </div>
            <h1>
              Pick a <em>world</em>,
              <br />not a theme.
            </h1>
          </Reveal>

          <Reveal className="direction-intro__manifesto" delay={0.08}>
            <Asterisk className="direction-intro__asterisk" />
            <p>
              The master direction library contains complete reconstruction systems. Each one rebuilds layout,
              hierarchy, typography, material, motion, navigation and component character from a blank visual canvas.
            </p>
            <div className="direction-intro__manifesto-meta">
              <span>{String(styleGroups.length).padStart(2, "0")} families</span>
              <span>{String(total).padStart(2, "0")} directions</span>
              <span>01 product / entirely new visual architecture</span>
            </div>
          </Reveal>
        </div>

        <div className="direction-intro__strip" aria-hidden>
          <span>MATERIAL</span>
          <span>STRUCTURE</span>
          <span>HISTORY</span>
          <span>RETRO-TECH</span>
          <span>MODERN</span>
          <span>MOTION</span>
          <span>ORGANIC</span>
          <span>AI-NATIVE</span>
        </div>
      </section>

      <section className="direction-archive-shell">
        <DirectionLibrary groups={styleGroups} />
      </section>

      <section className="direction-outro">
        <div className="direction-outro__stamp">
          <Sparkles className="h-5 w-5" />
          Rebuild the visual system, then layer interaction patterns
        </div>
        <div className="direction-outro__grid">
          <div>
            <span className="direction-outro__label">Next archive</span>
            <h2>Direction defines the world. Interaction makes it move.</h2>
          </div>
          <div className="direction-outro__copy">
            <p>
              After choosing a reconstruction direction, layer in spatial navigation, kinetic backgrounds, magnetic controls,
              conversational AI or advanced data patterns from the Signals library.
            </p>
            <Link to="/trends" className="direction-outro__link">
              Open Signals Library <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
