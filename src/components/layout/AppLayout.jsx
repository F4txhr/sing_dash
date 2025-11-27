import Sidebar from "./Sidebar";
import { NAV_ITEMS } from "../../lib/navConfig";
import { useTheme } from "../../lib/themeContext";
import { THEMES } from "../../lib/themes";
import { useConnectionStatus } from "../../lib/connectionStatus";

export default function AppLayout({ children, activePage, onChangePage }) {
  const { themeId, theme, setThemeId } = useTheme();
  const { status } = useConnectionStatus();

  const themeList = Object.values(THEMES);
  const currentIndex = themeList.findIndex((t) => t.id === themeId);
  const nextThemeId =
    themeList[(currentIndex + 1) % themeList.length]?.id || themeId;

  const handleCycleTheme = () => {
    setThemeId(nextThemeId);
  };

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Sidebar: hanya tampil di md+ */}
      <Sidebar activePage={activePage} onChangePage={onChangePage} />

      {/* Area kanan: konten + topbar + bottom nav */}
      <div className="flex-1 flex flex-col">
        {/* Topbar khusus mobile */}
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
            Switch
          </button>
        </header>

        {/* Konten utama */}
        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 max-w-5xl mx-auto w-full overflow-y-auto">
          {children}
        </main>

        {/* Bottom nav khusus mobile */}
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