import React, { createContext, useContext, useEffect, useState } from "react";
import { THEMES, getInitialThemeId, DEFAULT_THEME_ID } from "./themes";

const ThemeContext = createContext({
  themeId: DEFAULT_THEME_ID,
  theme: THEMES[DEFAULT_THEME_ID],
  setThemeId: () => {}
});

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(getInitialThemeId);

  useEffect(() => {
    try {
      window.localStorage.setItem("vortexx_theme", themeId);
    } catch {
      // ignore
    }
  }, [themeId]);

  const value = {
    themeId,
    theme: THEMES[themeId] || THEMES[DEFAULT_THEME_ID],
    setThemeId
  };

  return React.createElement(
    ThemeContext.Provider,
    { value },
    children
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}