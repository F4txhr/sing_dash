import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getConnections } from "../lib/clashApi";
import { formatBytes } from "../lib/utils"; // kalau belum ada, bisa pakai helper sendiri

// kalau nggak ada formatBytes di utils, pakai ini:
// function formatBytes(bytes) { ... } sama seperti di Overview.

export default function Conns() {
  const [conns, setConns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await getConnections();
      const list = Array.isArray(res) ? res : res.connections || [];
      setConns(list);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      load();
    }, intervalSec * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, intervalSec]);

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Connections
          </h1>
          <p className="text-xs text-slate-400">
            Active connections from /connections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
            <span>Auto-refresh:</span>
            <select
              className="rounded-2xl bg-slate-950/40 border border-slate-700/80 px-2 py-1 outline-none"
              value={autoRefresh ? String(intervalSec) : "off"}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "off") {
                  setAutoRefresh(false);
                } else {
                  setIntervalSec(Number(v) || 5);
                  setAutoRefresh(true);
                }
              }}
            >
              <option value="off">Off</option>
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="30">30s</option>
            </select>
          </div>
          <Button size="sm" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </header>

      {err && (
        <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-700/60 rounded-2xl px-3 py-2">
          Error: {err}
        </div>
      )}

      <Card
        title="Connections"
        description="List of active connections going through Sing-box."
      >
        <div className="hidden md:grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-2 text-[11px] text-slate-400 mb-2 px-1">
          <div>Host</div>
          <div>Protocol</div>
          <div>Proxy / Chains</div>
          <div className="text-right">Traffic</div>
        </div>

        <div className="space-y-1 max-h-[420px] overflow-y-auto">
          {conns && conns.length > 0 ? (
            conns.map((c, idx) => {
              const host = c.host || c.metadata?.host || "unknown";
              const network = c.network || c.metadata?.network || "tcp";
              const chains =
                c.chains || c.metadata?.chains || c.metadata?.rule || [];
              const up = c.upload || c.up;
              const down = c.download || c.down;

              return (
                <div
                  key={idx}
                  className="grid md:grid-cols-[minmax(0,1.8fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-2 items-center rounded-2xl bg-slate-950/60 border border-slate-800/80 px-2 py-1.5 text-[11px]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-slate-100">{host}</div>
                    <div className="md:hidden text-slate-400 truncate">
                      {network.toUpperCase()} •{" "}
                      {Array.isArray(chains)
                        ? chains.join(" / ")
                        : String(chains)}
                    </div>
                  </div>
                  <div className="hidden md:block text-slate-300 uppercase">
                    {network}
                  </div>
                  <div className="hidden md:block text-slate-300 truncate">
                    {Array.isArray(chains)
                      ? chains.join(" / ")
                      : String(chains)}
                  </div>
                  <div className="text-right text-slate-300">
                    <div>↑ {formatBytes(up)}</div>
                    <div>↓ {formatBytes(down)}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-500">
              No active connections.
            </div>
          )}
        </div>
      </Card>

      <div className="md:hidden text-[11px] text-slate-400">
        Auto-refresh: {autoRefresh ? `${intervalSec}s` : "Off"}
      </div>
    </div>
  );
}