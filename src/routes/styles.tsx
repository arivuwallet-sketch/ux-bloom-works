import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Asterisk, CircleDotDashed, Sparkles } from "lucide-react";
import { DirectionLibrary } from "@/components/site/DirectionLibrary";
import { Reveal } from "@/components/studio/motion";
import { styleGroups } from "@/data/site";

export const Route = createFileRoute("/styles")({
  head: () => ({
    meta: [
      { title: "Direction Library — 28 interface design systems | Rezyn" },
      {
        name: "description",
        content:
          "Browse Rezyn's visual direction archive: 28 interface systems spanning minimal, expressive, dimensional, nostalgic, digital and editorial design languages.",
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
          <span>Edition 01 — 2026</span>
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
              The direction library is a catalog of complete interface attitudes. Each entry changes proportion,
              typography, density, material, motion and hierarchy across the product.
            </p>
            <div className="direction-intro__manifesto-meta">
              <span>06 families</span>
              <span>28 directions</span>
              <span>01 product / entirely different character</span>
            </div>
          </Reveal>
        </div>

        <div className="direction-intro__strip" aria-hidden>
          <span>MINIMAL</span>
          <span>BRUTAL</span>
          <span>TACTILE</span>
          <span>NOSTALGIC</span>
          <span>DIGITAL</span>
          <span>EDITORIAL</span>
        </div>
      </section>

      <section className="direction-archive-shell">
        <DirectionLibrary groups={styleGroups} />
      </section>

      <section className="direction-outro">
        <div className="direction-outro__stamp">
          <Sparkles className="h-5 w-5" />
          Mix the language with current interaction patterns
        </div>
        <div className="direction-outro__grid">
          <div>
            <span className="direction-outro__label">Next archive</span>
            <h2>Style gives it character. Interaction gives it life.</h2>
          </div>
          <div className="direction-outro__copy">
            <p>
              Once the visual language is chosen, layer in spatial navigation, kinetic backgrounds, magnetic controls,
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
