export const ICON_SETS = {
  minimal: {
    id: "minimal",
    name: "Minimal dots",
    icons: {
      overview: "●",
      proxies: "●",
      rules: "●",
      conns: "●",
      settings: "●",
      logs: "●",
      profiles: "●"
    }
  },
  emoji: {
    id: "emoji",
    name: "Emoji",
    icons: {
      overview: "🏠",
      proxies: "🛰️",
      rules: "📜",
      conns: "🔗",
      settings: "⚙️",
      logs: "📄",
      profiles: "📁"
    }
  },
  outline: {
    id: "outline",
    name: "Outline",
    icons: {
      overview: "◇",
      proxies: "⬡",
      rules: "⬥",
      conns: "⬦",
      settings: "⚙",
      logs: "▢",
      profiles: "⬚"
    }
  },
  solid: {
    id: "solid",
    name: "Solid squares",
    icons: {
      overview: "■",
      proxies: "■",
      rules: "■",
      conns: "■",
      settings: "■",
      logs: "■",
      profiles: "■"
    }
  }
};

export const DEFAULT_ICON_SET_ID = "emoji";

export function getInitialIconSetId() {
  if (typeof window === "undefined") return DEFAULT_ICON_SET_ID;
  try {
    const saved = window.localStorage.getItem("vortexx_icon_set");
    if (saved && ICON_SETS[saved]) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_ICON_SET_ID;
}

export function getNavIconChar(iconSetId, key) {
  const set = ICON_SETS[iconSetId] || ICON_SETS[DEFAULT_ICON_SET_ID];
  return set.icons[key] || "●";
}