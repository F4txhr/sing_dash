export const THEMES = {
  glass: {
    id: "glass",
    name: "Glass",
    card:
      "rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_25px_-8px_rgba(0,0,0,0.8)]",
    sidebar: "bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl",
    bottomNav: "border border-slate-800/80 bg-slate-950/90 backdrop-blur-xl",
    background:
      "bg-slate-950 bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)]",
    latencyDisplay: "number"
  },
  solid: {
    id: "solid",
    name: "Solid",
    card: "rounded-2xl bg-slate-900 border border-slate-700 shadow-none",
    sidebar: "bg-slate-900 border border-slate-700",
    bottomNav: "border border-slate-800 bg-slate-950",
    background: "bg-slate-950",
    latencyDisplay: "number"
  },
  neon: {
    id: "neon",
    name: "Neon",
    card:
      "rounded-2xl bg-slate-950/90 border border-sky-500/40 shadow-[0_0_30px_-12px_rgba(56,189,248,0.9)]",
    sidebar:
      "bg-slate-950/95 border border-sky-500/40 shadow-[0_0_35px_-16px_rgba(56,189,248,0.9)]",
    bottomNav:
      "border border-sky-500/40 bg-slate-950/95 shadow-[0_0_30px_-18px_rgba(56,189,248,0.8)]",
    background:
      "bg-slate-950 bg-[radial-gradient(circle_at_top,_#020617,_#0f172a)]",
    latencyDisplay: "number"
  },
  dusk: {
    id: "dusk",
    name: "Dusk",
    card:
      "rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-purple-900/70 border border-purple-500/30 shadow-[0_0_30px_-16px_rgba(168,85,247,0.8)]",
    sidebar:
      "bg-gradient-to-b from-slate-950 via-slate-950/95 to-purple-950/90 border border-purple-500/40",
    bottomNav:
      "border border-purple-500/40 bg-slate-950/95 shadow-[0_0_40px_-18px_rgba(168,85,247,0.8)]",
    background:
      "bg-slate-950 bg-[radial-gradient(circle_at_top,_#1e293b,_#020617)]",
    latencyDisplay: "number"
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    card:
      "rounded-2xl bg-slate-900/80 border border-emerald-300/50 shadow-[0_0_40px_-18px_rgba(45,212,191,0.8)] backdrop-blur-xl",
    sidebar:
      "bg-slate-900/80 border border-emerald-300/50 shadow-[0_0_40px_-18px_rgba(45,212,191,0.8)] backdrop-blur-xl",
    bottomNav:
      "border border-emerald-300/50 bg-slate-950/90 shadow-[0_0_40px_-20px_rgba(45,212,191,0.9)] backdrop-blur-xl",
    background: "bg-slate-950 bg-aurora-anim",
    latencyDisplay: "number"
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    card:
      "rounded-2xl bg-gradient-to-br from-orange-500/10 via-rose-500/10 to-slate-900/90 border border-orange-400/40 shadow-[0_0_32px_-16px_rgba(251,146,60,0.9)]",
    sidebar:
      "bg-gradient-to-b from-slate-950 via-slate-950/90 to-rose-950/90 border border-orange-400/40",
    bottomNav:
      "border border-orange-400/40 bg-slate-950/95 shadow-[0_0_40px_-18px_rgba(251,146,60,0.9)]",
    background:
      "bg-slate-950 bg-[radial-gradient(circle_at_top,_#fb923c2b,_#020617)]",
    latencyDisplay: "number"
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    card:
      "rounded-2xl bg-black border border-emerald-400/40 shadow-[0_0_24px_-12px_rgba(74,222,128,0.7)]",
    sidebar:
      "bg-black border border-emerald-400/40 shadow-[0_0_28px_-14px_rgba(74,222,128,0.7)]",
    bottomNav:
      "border border-emerald-400/40 bg-black shadow-[0_0_24px_-12px_rgba(74,222,128,0.7)]",
    background: "bg-black",
    latencyDisplay: "number"
  },
  pastel: {
    id: "pastel",
    name: "Pastel",
    card:
      "rounded-2xl bg-slate-900/90 border border-sky-300/40 shadow-[0_0_24px_-12px_rgba(125,211,252,0.7)]",
    sidebar:
      "bg-slate-950/95 border border-sky-300/40 shadow-[0_0_30px_-14px_rgba(125,211,252,0.7)]",
    bottomNav:
      "border border-sky-300/40 bg-slate-950/95 shadow-[0_0_24px_-12px_rgba(125,211,252,0.7)]",
    background:
      "bg-slate-950 bg-[radial-gradient(circle_at_top,_#38bdf81f,_#020617)]",
    latencyDisplay: "number"
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    card:
      "rounded-2xl bg-slate-950/90 border border-cyan-400/40 shadow-[0_0_32px_-16px_rgba(34,211,238,0.8)]",
    sidebar:
      "bg-slate-950/95 border border-cyan-400/40 shadow-[0_0_40px_-18px_rgba(34,211,238,0.8)]",
    bottomNav:
      "border border-cyan-400/40 bg-slate-950/95 shadow-[0_0_32px_-18px_rgba(34,211,238,0.8)]",
    background:
      "bg-slate-950 bg-[radial-gradient(circle_at_bottom,_#22d3ee3d,_#020617)]",
    latencyDisplay: "number"
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    card:
      "rounded-2xl bg-slate-950/95 border border-fuchsia-400/50 shadow-[0_0_40px_-16px_rgba(244,114,182,0.9)]",
    sidebar:
      "bg-slate-950/95 border border-fuchsia-400/50 shadow-[0_0_48px_-20px_rgba(244,114,182,0.9)]",
    bottomNav:
      "border border-fuchsia-400/50 bg-slate-950 shadow-[0_0_40px_-18px_rgba(244,114,182,0.9)]",
    background:
      "bg-slate-950 bg-[radial-gradient(circle_at_top,_#e879f92b,_#020617)]",
    latencyDisplay: "number"
  },
  matrix: {
    id: "matrix",
    name: "Matrix",
    card:
      "rounded-2xl bg-black border border-emerald-500/50 shadow-[0_0_36px_-18px_rgba(34,197,94,0.9)]",
    sidebar:
      "bg-black border border-emerald-500/50 shadow-[0_0_44px_-20px_rgba(34,197,94,0.9)]",
    bottomNav:
      "border border-emerald-500/50 bg-black shadow-[0_0_36px_-18px_rgba(34,197,94,0.9)]",
    background:
      "bg-black bg-[radial-gradient(circle_at_top,_#22c55e2b,_#020617)]",
    latencyDisplay: "number"
  },
  yacd: {
    id: "yacd",
    name: "YACD Glass",
    card:
      "rounded-2xl bg-white/10 backdrop-blur-[12px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
    sidebar:
      "bg-white/12 backdrop-blur-[16px] border border-white/25 shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
    bottomNav:
      "border border-white/20 bg-white/10 backdrop-blur-[14px] shadow-[0_10px_32px_rgba(0,0,0,0.4)]",
    background: "bg-yacd-gradient",
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