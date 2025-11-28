import Sidebar from "./Sidebar";
import { NAV_ITEMS } from "../../lib/navConfig";
import { useTheme } from "../../lib/themeContext";
import { THEMES } from "../../lib/themes";
import { useConnectionStatus } from "../../lib/connectionStatus";
import { useLayout } from "../../lib/layoutContext";

export default function AppLayout({ children, activePage, onChangePage }) {
  const { themeId, theme, setThemeId } = useTheme();
  const { status } = useConnectionStatus();
  const { layoutId } = useLayout();

  const themeList = Object.values(THEMES);
  const currentIndex = themeList.findIndex((t) => t.id === themeId);
  const nextThemeId =
    themeList[(currentIndex + 1) % themeList.length]?.id || themeId;

  const handleCycleTheme = () => {
    setThemeId(nextThemeId);
  };

  if (layoutId === "topbar") {
    return (
      <div className="relative z-10 flex min-h-screen">
        <div className="flex-1 flex flex-col">
          <header className="px-4 pt-4 pb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold tracking-tight">
                Vortex-x <span className="text-sky-400">Dashboard</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end text-[11px]">
              <div className="flex flex-wrap items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = item.key === activePage;
                  return (
                    <button
                      key={item.key}
                      onClick={() => onChangePage(item.key)}
                      className={`px-3 py-1 rounded-2xl border text-[11px] transition ${
                        active
                          ? "border-sky-400 bg-sky-500/20 text-sky-100"
                          : "border-transparent text-slate-300 hover:text-sky-100 hover:bg-slate-800/70"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === "ok"
                      ? "bg-emerald-400"
                      : status === "error"
                      ? "bg-rose-400"
                      : "bg-slate-500"
                  }`}
                />
                <span className="text-slate-400">
                  API:{" "}
                  {status === "ok"
                    ? "Online"
                    : status === "error"
                    ? "Error"
                    : "Unknown"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCycleTheme}
                className="text-[10px] px-2 py-1 rounded-2xl border border-slate-700/80 bg-slate-950/70 text-slate-200"
                title="Switch theme"
              >
                Theme
              </button>
            </div>
          </header>

          <main className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 max-w-5xl sm:max-w-6xl lg:max-w-7xl 2xl:max-w-7xl mx-auto w-full overflow-y-auto">
            <div key={activePage} className="page-transition">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Sidebar (desktop) */}
      <Sidebar activePage={activePage} onChangePage={onChangePage} />

      {/* Right area: content + mobile topbar + bottom nav */}
      <div className="flex-1 flex flex-col">
        {/* Mobile topbar */}
        <header className="md:hidden px-4 pt-4 pb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Vortex-x <span className="text-sky-400">Dashboard</span>
            </div>
            <div className="text-[11px] text-slate-400 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span>
                  {NAV_ITEMS.find((i) => i.key === activePage)?.label ||
                    "Overview"}
                </span>
                <span className="px-2 py-0.5 rounded-full border border-slate-700/80 text-[10px] text-slate-300">
                  {theme.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === "ok"
                      ? "bg-emerald-400"
                      : status === "error"
                      ? "bg-rose-400"
                      : "bg-slate-500"
                  }`}
                />
                <span className="text-slate-400">
                  API:{" "}
                  {status === "ok"
                    ? "Online"
                    : status === "error"
                    ? "Error"
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCycleTheme}
            className="text-[10px] px-2 py-1 rounded-2xl border border-slate-700/80 bg-slate-950/70 text-slate-200"
            title="Switch theme"
          >
            Theme
          </button>
        </header>

        {/* Main content */}
       <<main className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 max-w-4xl sm:max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="md:hidden sticky bottom-0 left-0 right-0 z-20">
          <div
            className={`mx-3 mb-3 rounded-3xl px-2 py-1.5 shadow-soft flex justify-between ${
              theme.bottomNav
            }`}
          >
            {NAV_ITEMS.map((item) => {
              const active = item.key === activePage;
              return (
                <button
                  key={item.key}
                  onClick={() => onChangePage(item.key)}
                  className={`flex-1 flex flex-col items-center justify-center px-2 py-1 rounded-2xl text-[11px] transition
                    ${
                      active
                        ? "bg-sky-500/20 text-sky-100"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                      active ? "bg-sky-400" : "bg-slate-500"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}