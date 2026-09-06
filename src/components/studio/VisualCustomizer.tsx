import { useMemo, useState } from "react";
import { Sliders, X, RotateCcw, Download, Search } from "lucide-react";
import { useStudio } from "./StudioProvider";
import { FONT_PRESETS, THEMES, THEME_FAMILIES } from "@/lib/themes";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function Range({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1 w-full cursor-pointer appearance-none bg-border accent-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary"
    />
  );
}

export function VisualCustomizer() {
  const { config, set, reset, exportConfig } = useStudio();
  const [open, setOpen] = useState(false);
  const [family, setFamily] = useState<string>(THEME_FAMILIES[0]!);
  const [query, setQuery] = useState("");

  const palettes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return THEMES.filter(
      (t) => (q ? t.name.toLowerCase().includes(q) : t.family === family),
    ).slice(0, 120);
  }, [family, query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open the visual customizer"
        className="glass glow-aurora fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center text-foreground transition-transform hover:scale-110 active:scale-95"
      >
        {open ? <X className="h-5 w-5" /> : <Sliders className="h-5 w-5" />}
      </button>

      {open ? (
        <aside
          className="glass fixed top-4 right-4 bottom-24 z-50 w-[min(360px,calc(100vw-2rem))] overflow-y-auto p-6 shadow-2xl"
          style={{ animation: "rise-in .35s cubic-bezier(.22,1,.36,1) both" }}
        >
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-serif text-[26px] tracking-[0.06em]">Studio</h2>
            <span className="text-[11px] text-muted-foreground">{THEMES.length} palettes</span>
          </div>

          <Row label="Palette family">
            <select
              value={family}
              onChange={(e) => {
                setFamily(e.target.value);
                setQuery("");
              }}
              className="w-full border border-input bg-background/60 px-3 py-2 text-[14px]"
            >
              {THEME_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Row>

          <div className="mb-3 flex items-center gap-2 border border-input bg-background/60 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all palettes"
              className="w-full bg-transparent text-[14px] outline-none"
            />
          </div>

          <div className="mb-6 grid max-h-[210px] grid-cols-4 gap-2 overflow-y-auto pr-1">
            {palettes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                title={theme.name}
                onClick={() => set("themeId", theme.id)}
                className={`h-11 border transition-transform hover:scale-105 ${
                  config.themeId === theme.id ? "border-primary" : "border-border/60"
                }`}
                style={{ background: theme.swatch[0] }}
              >
                <span className="flex h-full items-end gap-[3px] p-[3px]">
                  <span className="h-2 flex-1" style={{ background: theme.swatch[1] }} />
                  <span className="h-2 flex-1" style={{ background: theme.swatch[2] }} />
                  <span className="h-2 flex-1" style={{ background: theme.swatch[3] }} />
                </span>
              </button>
            ))}
          </div>

          <Row label="Typography">
            <select
              value={config.fontId}
              onChange={(e) => set("fontId", e.target.value)}
              className="w-full border border-input bg-background/60 px-3 py-2 text-[14px]"
            >
              {FONT_PRESETS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </Row>

          <Row label={`Glass blur — ${config.glassBlur}px`}>
            <Range value={config.glassBlur} min={0} max={40} onChange={(v) => set("glassBlur", v)} />
          </Row>
          <Row label={`Glass tint — ${config.glassOpacity}%`}>
            <Range value={config.glassOpacity} min={0} max={30} onChange={(v) => set("glassOpacity", v)} />
          </Row>
          <Row label={`Border strength — ${config.borderOpacity}%`}>
            <Range value={config.borderOpacity} min={0} max={60} onChange={(v) => set("borderOpacity", v)} />
          </Row>
          <Row label={`Corner radius — ${config.radius}px`}>
            <Range value={config.radius} min={0} max={28} onChange={(v) => set("radius", v)} />
          </Row>
          <Row label={`Film grain — ${config.grain}%`}>
            <Range value={config.grain} min={0} max={20} onChange={(v) => set("grain", v)} />
          </Row>
          <Row label={`Motion speed — ${config.motion.toFixed(2)}x`}>
            <Range
              value={config.motion}
              min={0.2}
              max={2}
              step={0.05}
              onChange={(v) => set("motion", v)}
            />
          </Row>

          <div className="mb-6 flex flex-col gap-3">
            {(
              [
                ["uppercaseHeadings", "Uppercase headings"],
                ["brutalist", "Tactile brutalism"],
                ["cursor", "Custom cursor"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => set(key, !config[key])}
                className="flex items-center justify-between text-[14px]"
              >
                <span>{label}</span>
                <span
                  className={`relative h-5 w-10 border transition-colors ${
                    config[key] ? "border-primary bg-primary/30" : "border-border bg-background/60"
                  }`}
                >
                  <span
                    className="absolute top-[2px] h-3.5 w-3.5 bg-primary transition-all"
                    style={{ left: config[key] ? "22px" : "2px" }}
                  />
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="glass inline-flex items-center gap-2 px-4 py-2 text-[13px] transition-colors hover:text-primary"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              type="button"
              onClick={exportConfig}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              <Download className="h-4 w-4" /> Export JSON
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
