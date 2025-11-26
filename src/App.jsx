import { useEffect, useState } from "react";

import AppLayout from "./components/layout/AppLayout";

import Overview from "./pages/Overview";
import Proxies from "./pages/Proxies";
import Rules from "./pages/Rules";
import Conns from "./pages/Conns";
import ConfigPage from "./pages/ConfigPage";
import Logs from "./pages/Logs";
import Profiles from "./pages/Profiles";

const PAGES = [
  "overview",
  "proxies",
  "rules",
  "conns",
  "config",
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
      case "config":
        return <ConfigPage />;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* blur / glow background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-emerald-500/15 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] opacity-80" />
      </div>

      <AppLayout activePage={page} onChangePage={handleChangePage}>
        {renderPage()}
      </AppLayout>
    </div>
  );
}