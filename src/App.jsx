import { useEffect, useState } from "react";

import AppLayout from "./components/layout/AppLayout";
import { useTheme } from "./lib/themeContext";

import Overview from "./pages/Overview";
import Proxies from "./pages/Proxies";
import Rules from "./pages/Rules";
import Conns from "./pages/Conns";
import SettingsPage from "./pages/Settings";
import Logs from "./pages/Logs";
import Profiles from "./pages/Profiles";

const PAGES = [
  "overview",
  "proxies",
  "rules",
  "conns",
  "settings",
  "logs",
  "profiles"
];

function getInitialPage() {
  // baca dari URL, misal /profiles -> "profiles"
  const path = window.location.pathname.replace(/\/+$/, "");
  const seg = path.split("/").filter(Boolean).pop() || "overview";
  return PAGES.includes(seg) ? seg : "overview";
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const { theme } = useTheme();

  const handleChangePage = (nextPage) => {
    setPage(nextPage);
    const url = nextPage === "overview" ? "/" : `/${nextPage}`;
    window.history.pushState({}, "", url);
  };

  useEffect(() => {
    const onPop = () => {
      setPage(getInitialPage());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "proxies":
        return &lt;Proxies /&gt;;
      case "rules":
        return &lt;Rules /&gt;;
      case "conns":
        return &lt;Conns /&gt;;
      case "settings":
        return &lt;SettingsPage /&gt;;
      case "logs":
        return &lt;Logs /&gt;;
      case "profiles":
        return &lt;Profiles /&gt;;
      case "overview":
      default:
        return &lt;Overview /&gt;;
    }
  };

  return (
    &lt;div className={`min-h-screen text-slate-100 relative overflow-hidden ${theme.background || ""}`}&gt;
      {/* blur / glow background */}
      &lt;div className="pointer-events-none fixed inset-0"&gt;
        &lt;div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 blur-3xl rounded-full" /&gt;
        &lt;div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-emerald-500/15 blur-3xl rounded-full" /&gt;
      &lt;/div&gt;

      &lt;AppLayout activePage={page} onChangePage={handleChangePage}&gt;
        {renderPage()}
      &lt;/AppLayout&gt;
    &lt;/div&gt;
  );
}