import React, { createContext, useContext, useState } from "react";

const ConnectionContext = createContext({
  status: "unknown", // "unknown" | "ok" | "error"
  lastError: "",
  lastChecked: null,
  setConnectionStatus: () => {}
});

export function ConnectionProvider({ children }) {
  const [state, setState] = useState({
    status: "unknown",
    lastError: "",
    lastChecked: null
  });

  const setConnectionStatus = (next) => {
    setState((prev) => ({
      ...prev,
      ...next
    }));
  };

  const value = {
    status: state.status,
    lastError: state.lastError,
    lastChecked: state.lastChecked,
    setConnectionStatus
  };

  return React.createElement(ConnectionContext.Provider, { value }, children);
}

export function useConnectionStatus() {
  return useContext(ConnectionContext);
}