import { useEffect, useState } from "react";

import AppLayout from "./components/layout/AppLayout";
import { useTheme } from "./lib/themeContext";
import TrianglesBackground from "./components/layout/TrianglesBackground";
import StarsBackground from "./components/layout/StarsBackground";
import LinesBackground from "./components/layout/LinesBackground";
import ParticleNetworkBackground from "./components/layout/ParticleNetworkBackground";
import MatrixRainBackground from "./components/layout/MatrixRainBackground";

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
  const { themeId, theme } = useTheme();

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
        return <Proxies />;
      case "rules":
        return <Rules />;
      case "conns":
        return <Conns />;
      case "settings":
        return <SettingsPage />;
      case "logs":
        return <Logs />;
      case "profiles":
        return <Profiles />;
      case "overview":
      default:
        return <Overview />;
    }
  };

  return (
    <div
      className={`min-h-screen text-slate-100 relative overflow-hidden ${
        theme.background || ""
      }`}
    >
      {/* blur / glow background (skip on YACD theme to let gradient dominate) */}
      {themeId !== "yacd" && (
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-emerald-500/15 blur-3xl rounded-full" />
        </div>
      )}

      {themeId === "yacd" && (
        // geometric mesh background (Type #2)
        <TrianglesBackground />
      )}

      {themeId === "pastel" && <StarsBackground />}

      {themeId === "ocean" && <LinesBackground />}

      {themeId === "neon" && <ParticleNetworkBackground />}

      {themeId === "matrix" && <MatrixRainBackground />}

      <AppLayout activePage={page} onChangePage={handleChangePage}>
        {renderPage()}
      </AppLayout>
    </div>
  );
}