import React, { createContext, useContext, useEffect, useState } from "react";
import { LAYOUTS, DEFAULT_LAYOUT_ID, getInitialLayoutId } from "./layouts";

const LayoutContext = createContext({
  layoutId: DEFAULT_LAYOUT_ID,
  layout: LAYOUTS[DEFAULT_LAYOUT_ID],
  setLayoutId: () => {}
});

export function LayoutProvider({ children }) {
  const [layoutId, setLayoutId] = useState(getInitialLayoutId);

  useEffect(() => {
    try {
      window.localStorage.setItem("vortexx_layout", layoutId);
    } catch {
      // ignore
    }
  }, [layoutId]);

  const value = {
    layoutId,
    layout: LAYOUTS[layoutId] || LAYOUTS[DEFAULT_LAYOUT_ID],
    setLayoutId
  };

  return React.createElement(LayoutContext.Provider, { value }, children);
}

export function useLayout() {
  return useContext(LayoutContext);
}