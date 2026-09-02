import { useState } from "react";

export function BeforeAfter() {
  const [after, setAfter] = useState(false);

  return (
    <div>
      <div className="mb-8 flex items-center gap-3 text-[14.5px] text-ink-soft">
        <button
          type="button"
          aria-pressed={after}
          aria-label="Toggle revision markup"
          onClick={() => setAfter((v) => !v)}
          className={`switch ${after ? "on" : ""}`}
        />
        <span>Showing: {after ? "after" : "before"}</span>
      </div>

      <div className={`mock-frame ${after ? "mock-after" : "mock-before"}`}>
        <div className="mock-block mock-nav" />
        <div className="mock-block mock-hero" />
        <div className="mock-block mock-line" style={{ width: "100%" }} />
        <div className="mock-block mock-line" style={{ width: "95%" }} />
        <div className="mock-block mock-line" style={{ width: "60%" }} />
        <div className="mock-row">
          <div className="mock-block mock-card" />
          <div className="mock-block mock-card" />
          <div className="mock-block mock-card" />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Left unchanged: the content. Changed: hierarchy, spacing, and the number of things
        competing for attention.
      </p>
    </div>
  );
}
