export const LATENCY_STYLES = {
  classic: {
    id: "classic",
    name: "Classic (ms + label)"
  },
  pill: {
    id: "pill",
    name: "Pill badge"
  },
  chip: {
    id: "chip",
    name: "Chip quality + ms"
  },
  dot: {
    id: "dot",
    name: "Dot + ms"
  },
  quality: {
    id: "quality",
    name: "Quality text only"
  },
  barsThin: {
    id: "barsThin",
    name: "Bars – thin"
  },
  barsThick: {
    id: "barsThick",
    name: "Bars – thick"
  },
  barsDense: {
    id: "barsDense",
    name: "Bars – dense"
  },
  barProgress: {
    id: "barProgress",
    name: "Horizontal bar"
  },
  hybrid: {
    id: "hybrid",
    name: "Hybrid (ms + bars)"
  }
};

export const DEFAULT_LATENCY_STYLE_ID = "classic";

export function getInitialLatencyStyleId() {
  if (typeof window === "undefined") return DEFAULT_LATENCY_STYLE_ID;
  try {
    const saved = window.localStorage.getItem("vortexx_latency_style");
    if (saved && LATENCY_STYLES[saved]) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_LATENCY_STYLE_ID;
}