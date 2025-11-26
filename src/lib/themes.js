export const THEMES = {
  glass: {
    id: "glass",
    name: "Glass",
    card: "rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_25px_-8px_rgba(0,0,0,0.8)]",
    sidebar: "bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl",
    bottomNav: "border border-slate-800/80 bg-slate-950/90 backdrop-blur-xl",
    latencyDisplay: "number" // future: 'signal'
  },
  solid: {
    id: "solid",
    name: "Solid",
    card: "rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm",
    sidebar: "bg-slate-900/90 border border-slate-800",
    bottomNav: "border border-slate-800 bg-slate-950",
    latencyDisplay: "number"
  }
};

export const DEFAULT_THEME_ID = "glass";

export function getInitialThemeId() {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  try {
    const saved = window.localStorage.getItem("vortexx_theme");
    if (saved && THEMES[saved]) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_THEME_ID;
}