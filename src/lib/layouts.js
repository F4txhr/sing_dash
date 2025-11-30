export const LAYOUTS = {
  sidebar: {
    id: "sidebar",
    name: "Sidebar left"
  },
  topbar: {
    id: "topbar",
    name: "Top bar"
  }
};

export const DEFAULT_LAYOUT_ID = "sidebar";

export function getInitialLayoutId() {
  if (typeof window === "undefined") return DEFAULT_LAYOUT_ID;
  try {
    const saved = window.localStorage.getItem("vortexx_layout");
    if (saved && LAYOUTS[saved]) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_LAYOUT_ID;
}