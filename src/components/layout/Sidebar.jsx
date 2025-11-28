import { NAV_ITEMS } from "../../lib/navConfig";
import { THEMES } from "../../lib/themes";
import { useTheme } from "../../lib/themeContext";
import { useConnectionStatus } from "../../lib/connectionStatus";
import { useIconSet } from "../../lib/iconContext";
import { getNavIconChar } from "../../lib/icons";

export default function Sidebar({ activePage, onChangePage }) {
  const { themeId } = useTheme();
  const theme = THEMES[themeId];
  const { status } = useConnectionStatus();
  const { iconSetId } = useIconSet();

  return (
    <aside className="hidden md:flex flex-col w-64 px-4 py-4 gap-4">
      <div
        className={`${theme.sidebar} rounded-3xl p-4 shadow-soft`}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-2xl bg-sky-500/50 blur-[2px]" />
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Vortex-x <span className="text-sky-400">Dashboard</span>
            </div>
            <div className="text-[11px] text-slate-400">Local Sing-box panel</div>
          </div>
        </div>
      </div>

      <nav
        className={`${theme.sidebar} rounded-3xl p-3 shadow-soft flex-1 flex flex-col justify-between`}
      >
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const iconChar = getNavIconChar(iconSetId, item.key);
            return (
              <button
                key={item.key}
                onClick={() => onChangePage(item.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm transition
                ${
                  activePage === item.key
                    ? "bg-sky-500/20 text-sky-100 border border-sky-500/60 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/70 border border-transparent"
                }`}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900/70 text-[11px]">
                  {iconChar}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1 opacity-80">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === "ok"
                  ? "bg-emerald-400"
                  : status === "error"
                  ? "bg-rose-400"
                  : "bg-slate-500"
              }`}
            />
            <span>
              API:{" "}
              {status === "ok"
                ? "Online"
                : status === "error"
                ? "Error"
                : "Unknown"}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Theme, layout, and icons: Settings page
          </div>
        </div>
      </nav>
    </aside>
  );
}