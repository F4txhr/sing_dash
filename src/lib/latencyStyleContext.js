import React, { createContext, useContext, useEffect, useState } from "react";
import {
  LATENCY_STYLES,
  getInitialLatencyStyleId,
  DEFAULT_LATENCY_STYLE_ID
} from "./latencyStyles";

const LatencyStyleContext = createContext({
  latencyStyleId: DEFAULT_LATENCY_STYLE_ID,
  latencyStyle: LATENCY_STYLES[DEFAULT_LATENCY_STYLE_ID],
  setLatencyStyleId: () => {}
});

export function LatencyStyleProvider({ children }) {
  const [latencyStyleId, setLatencyStyleId] = useState(getInitialLatencyStyleId);

  useEffect(() => {
    try {
      window.localStorage.setItem("vortexx_latency_style", latencyStyleId);
    } catch {
      // ignore
    }
  }, [latencyStyleId]);

  const value = {
    latencyStyleId,
    latencyStyle:
      LATENCY_STYLES[latencyStyleId] || LATENCY_STYLES[DEFAULT_LATENCY_STYLE_ID],
    setLatencyStyleId
  };

  return React.createElement(LatencyStyleContext.Provider, { value }, children);
}

export function useLatencyStyle() {
  return useContext(LatencyStyleContext);
}