import Sidebar from "./Sidebar";
import { NAV_ITEMS } from "../../lib/navConfig";

export default function AppLayout({ children, activePage, onChangePage }) {
  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Sidebar: hanya tampil di md+ */}
      <Sidebar activePage={activePage} onChangePage={onChangePage} />

      {/* Area kanan: konten + topbar + bottom nav */}
      <div className="flex-1 flex flex-col">
        {/* Topbar khusus mobile */}
        <header className="md:hidden px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Sing-box <span className="text-sky-400">Glass</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {NAV_ITEMS.find((i) => i.key === activePage)?.label || "Overview"}
            </div>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-sky-500/40 blur-[1px]" />
        </header>

        {/* Konten utama */}
        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 max-w-5xl mx-auto w-full overflow-y-auto">
          {children}
        </main>

        {/* Bottom nav khusus mobile */}
        <nav className="md:hidden sticky bottom-0 left-0 right-0 z-20">
          <div className="mx-3 mb-3 rounded-3xl border border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shadow-soft flex justify-between px-2 py-1.5">
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