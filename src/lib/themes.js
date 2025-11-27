export const THEMES = {
  glass: {
    id: "glass",
    name: "Glass",
    // transparan, blur, terasa \"kaca\"
    card:
      "rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_25px_-8px_rgba(0,0,0,0.8)]",
    sidebar: "bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl",
    bottomNav: "border border-slate-800/80 bg-slate-950/90 backdrop-blur-xl",
    latencyDisplay: "number" // future: 'signal'
  },
  solid: {
    id: "solid",
    name: "Solid",
    // card penuh, tanpa blur, garis lebih tegas
    card: "rounded-2xl bg-slate-900 border border-slate-700 shadow-none",
    sidebar: "bg-slate-900 border border-slate-700",
    bottomNav: "border border-slate-800 bg-slate-950",
    latencyDisplay: "number"
  },
  neon: {
    id: "neon",
    name: "Neon",
    // tema lebih kontras dengan border neon tipis
    card:
      "rounded-2xl bg-slate-950/90 border border-sky-500/40 shadow-[0_0_30px_-12px_rgba(56,189,248,0.9)]",
    sidebar:
      "bg-slate-950/95 border border-sky-500/40 shadow-[0_0_35px_-16px_rgba(56,189,248,0.9)]",
    bottomNav:
      "border border-sky-500/40 bg-slate-950/95 shadow-[0_0_30px_-18px_rgba(56,189,248,0.8)]",
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