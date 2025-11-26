import Card from "../ui/Card";
import { formatBytes } from "../../lib/utils";

export default function ConnectionsSnapshot({ conns }) {
  return (
    <Card
      title="Connections snapshot"
      description="Beberapa host dari /connections."
    >
      <div className="space-y-1 max-h-56 overflow-y-auto text-[11px]">
        {conns && conns.length > 0 ? (
          conns.slice(0, 10).map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 px-2 py-1.5"
            >
              <div className="min-w-0">
                <div className="truncate text-slate-100">
                  {c.host || c.metadata?.host || "unknown"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {(c.network || c.metadata?.network || "")
                    .toString()
                    .toUpperCase()}{" "}
                  •{" "}
                  {c.chains?.join(" / ") ||
                    c.metadata?.chains?.join(" / ")}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 shrink-0">
                <div>↑ {formatBytes(c.upload || c.up)}</div>
                <div>↓ {formatBytes(c.download || c.down)}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-slate-500">Belum ada koneksi aktif.</div>
        )}
      </div>
    </Card>
  );
}