import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CONFIG,
  FONT_PRESETS,
  STUDIO_STORAGE_KEY,
  THEMES,
  findTheme,
  type StudioConfig,
} from "@/lib/themes";

type StudioContextValue = {
  config: StudioConfig;
  set: <K extends keyof StudioConfig>(key: K, value: StudioConfig[K]) => void;
  reset: () => void;
  exportConfig: () => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}

function applyConfig(config: StudioConfig) {
  const root = document.documentElement;
  const theme = findTheme(config.themeId) ?? THEMES[0]!;
  for (const [token, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(token, value);
  }
  const font = FONT_PRESETS.find((f) => f.id === config.fontId) ?? FONT_PRESETS[0]!;
  root.style.setProperty("--font-display-active", font.display);
  root.style.setProperty("--font-body-active", font.body);
  root.style.setProperty("--glass-blur", `${config.glassBlur}px`);
  root.style.setProperty("--glass-opacity", String(config.glassOpacity / 100));
  root.style.setProperty("--glass-border-opacity", String(config.borderOpacity / 100));
  root.style.setProperty("--radius", `${config.radius}px`);
  root.style.setProperty("--grain-opacity", String(config.grain / 100));
  root.style.setProperty("--motion-scale", String(config.motion));
  root.style.setProperty("--heading-transform", config.uppercaseHeadings ? "uppercase" : "none");
  root.classList.toggle("brutalist", config.brutalist);
  root.classList.toggle("custom-cursor", config.cursor);
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StudioConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
      if (raw) setConfig({ ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<StudioConfig>) });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    applyConfig(config);
    try {
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* storage may be unavailable */
    }
  }, [config]);

  const set = useCallback<StudioContextValue["set"]>((key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setConfig(DEFAULT_CONFIG), []);

  const exportConfig = useCallback(() => {
    const theme = findTheme(config.themeId);
    const payload = {
      version: 1,
      config,
      tokens: theme?.tokens ?? {},
      theme: theme ? { id: theme.id, name: theme.name, family: theme.family } : null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rezyn-design-tokens.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const value = useMemo(() => ({ config, set, reset, exportConfig }), [config, set, reset, exportConfig]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}
