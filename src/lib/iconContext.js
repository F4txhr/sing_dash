import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ICON_SETS,
  getInitialIconSetId,
  DEFAULT_ICON_SET_ID
} from "./icons";

const IconContext = createContext({
  iconSetId: DEFAULT_ICON_SET_ID,
  iconSet: ICON_SETS[DEFAULT_ICON_SET_ID],
  setIconSetId: () => {}
});

export function IconProvider({ children }) {
  const [iconSetId, setIconSetId] = useState(getInitialIconSetId);

  useEffect(() => {
    try {
      window.localStorage.setItem("vortexx_icon_set", iconSetId);
    } catch {
      // ignore
    }
  }, [iconSetId]);

  const value = {
    iconSetId,
    iconSet: ICON_SETS[iconSetId] || ICON_SETS[DEFAULT_ICON_SET_ID],
    setIconSetId
  };

  return React.createElement(IconContext.Provider, { value }, children);
}

export function useIconSet() {
  return useContext(IconContext);
}