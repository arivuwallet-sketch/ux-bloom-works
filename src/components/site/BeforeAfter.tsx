import { useState } from "react";
import { ScanLine } from "lucide-react";

export function BeforeAfter() {
  const [after, setAfter] = useState(false);

  return (
    <div className="glass p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <ScanLine className="h-4 w-4 text-revision" /> Interface delta viewer
          </div>
          <div className="mt-1 font-mono text-[8px] tracking-[0.12em] text-muted-foreground uppercase">
            Same content / transformed hierarchy
          </div>
        </div>

        <div className="flex items-center gap-3 text-[12px]">
          <span className={after ? "text-muted-foreground" : "text-foreground"}>Source</span>
          <button
            type="button"
            aria-pressed={after}
            aria-label="Toggle transformed interface"
            onClick={() => setAfter((value) => !value)}
            className={`switch ${after ? "on" : ""}`}
          />
          <span className={after ? "text-revision" : "text-muted-foreground"}>Transformed</span>
        </div>
      </div>

      <div className={`mock-frame ${after ? "mock-after" : "mock-before"}`}>
        <div className="absolute right-4 top-4 z-10 font-mono text-[8px] tracking-[0.12em] text-muted-foreground">
          {after ? "REZYN / V2" : "SOURCE / V1"}
        </div>
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

      <div className="mt-5 grid grid-cols-1 gap-2 font-mono text-[8px] tracking-[0.1em] text-muted-foreground uppercase sm:grid-cols-3">
        <span>Content / preserved</span>
        <span>Hierarchy / rebuilt</span>
        <span>Noise / reduced</span>
      </div>
    </div>
  );
}
