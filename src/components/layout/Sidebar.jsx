import { NAV_ITEMS } from "../../lib/navConfig";

export default function Sidebar({ activePage, onChangePage }) {
  return (
    <aside className="hidden md:flex flex-col w-64 px-4 py-4 gap-4">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 shadow-soft backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-2xl bg-sky-500/50 blur-[2px]" />
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Sing-box <span className="text-sky-400">Glass</span>
            </div>
            <div className="text-[11px] text-slate-400">Live Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-3 shadow-soft backdrop-blur-xl flex-1 flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
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
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400/70" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 text-[11px] text-slate-500">
          <div>Theme: Glass • Blur</div>
          <div className="opacity-70">API: Clash-compatible</div>
        </div>
      </nav>
    </aside>
  );
}