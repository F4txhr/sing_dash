import { useEffect, useState, useRef } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TrafficChart from "../components/overview/TrafficChart";
import ConnectionsSnapshot from "../components/overview/ConnectionsSnapshot";
import { getConnections, connectTraffic, connectMemory } from "../lib/clashApi";
import { formatBytes, formatSpeed } from "../lib/utils";
import { useConnectionStatus } from "../lib/connectionStatus";

export default function Overview() {
  const [traffic, setTraffic] = useState(null);
  const [conns, setConns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [tick, setTick] = useState(0); // indikator kecil di UI
  const [memoryInfo, setMemoryInfo] = useState(null);
  const { setConnectionStatus } = useConnectionStatus();

  // total hasil kalkulasi lokal (menjumlah dari up/down)
  const [calcTotal, setCalcTotal] = useState({ up: 0, down: 0 });
  const lastTsRef = useRef(null);

  // history buat grafik (array titik {t, up, down})
  const [history, setHistory] = useState([]);

  // 🔥 Traffic via WebSocket
  useEffect(() => {
    let ws;

    try {
      ws = connectTraffic();
      console.log("[Overview] connectTraffic():", ws.url);

      ws.onopen = () => {
        console.log("[Overview] traffic WS opened");
        setErr((e) => (e.startsWith("traffic") ? "" : e));
        setConnectionStatus({
          status: "ok",
          lastError: "",
          lastChecked: new Date().toISOString()
        });
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          console.log("[TRAFFIC_RAW]", data);

          // simpan raw traffic (buat speed)
          setTraffic(data);

          const now = Date.now();
          const last = lastTsRef.current ?? now;
          const dtSec = Math.max((now - last) / 1000, 0); // detik
          lastTsRef.current = now;

          const upVal =
            data.up ??
            data.upload ??
            data.uplink ??
            data.upSpeed ??
            data.up_speed ??
            0;

          const downVal =
            data.down ??
            data.download ??
            data.downlink ??
            data.downSpeed ??
            data.down_speed ??
            0;

          // tambahkan ke total kalkulasi lokal
          setCalcTotal((prev) => ({
            up: prev.up + upVal * dtSec,
            down: prev.down + downVal * dtSec,
          }));

          // simpan ke history untuk grafik
          setHistory((prev) => {
            const next = [...prev, { t: now, up: upVal, down: downVal }];
            // batasi 60 titik terakhir biar ringan
            if (next.length > 60) next.shift();
            return next;
          });
        } catch (e) {
          console.warn("[Overview] invalid traffic message:", evt.data, e);
        }
      };

      ws.onerror = (e) => {
        console.error("[Overview] traffic WS error:", e);
        setErr(
          (prev) => prev || "traffic websocket error (see browser console)",
        );
        setConnectionStatus({
          status: "error",
          lastError: e?.message || "traffic websocket error",
          lastChecked: new Date().toISOString()
        });
      };

      ws.onclose = () => {
        console.log("[Overview] traffic WS closed");
      };
    } catch (e) {
      console.error("[Overview] failed to open traffic WS:", e);
      setErr(
        (prev) =>
          prev || "failed to open traffic websocket (see browser console)",
      );
      setConnectionStatus({
        status: "error",
        lastError: e?.message || "failed to open traffic websocket",
        lastChecked: new Date().toISOString()
      });
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // 🔁 Connections via HTTP + polling
  const loadConnections = async () => {
    try {
      setLoading(true);
      const c = await getConnections();
      const list = Array.isArray(c) ? c : c?.connections || [];
      setConns(list);
      setTick((x) => x + 1);
      setConnectionStatus({
        status: "ok",
        lastError: "",
        lastChecked: new Date().toISOString()
      });
    } catch (e) {
      console.error("[Overview] getConnections error:", e);
      setErr((prev) => prev || e.message || String(e));
      setConnectionStatus({
        status: "error",
        lastError: e?.message || String(e),
        lastChecked: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  // optional: memory usage (if backend exposes /memory ala Yacd-meta)
  useEffect(() => {
    let ws;
    try {
      ws = connectMemory();
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          setMemoryInfo(data);
        } catch (e) {
          console.warn("[Overview] invalid memory message:", evt.data, e);
        }
      };
    } catch (e) {
      console.warn("[Overview] failed to open memory WS:", e);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      loadConnections();
    }, intervalSec * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, intervalSec]);

  // mapping fleksibel: Clash + Sing-box
  const upSpeed =
    traffic?.up ??
    traffic?.upload ??
    traffic?.uplink ??
    traffic?.upSpeed ??
    traffic?.up_speed;

  const downSpeed =
    traffic?.down ??
    traffic?.download ??
    traffic?.downlink ??
    traffic?.downSpeed ??
    traffic?.down_speed;

  // kalau backend tidak kirim total, pakai hasil kalkulasi lokal
  const upTotal =
    traffic?.upTotal ??
    traffic?.upload_total ??
    traffic?.total_uplink ??
    traffic?.total?.up ??
    traffic?.up_total ??
    calcTotal.up;

  const downTotal =
    traffic?.downTotal ??
    traffic?.download_total ??
    traffic?.total_downlink ??
    traffic?.total?.down ??
    traffic?.down_total ??
    calcTotal.down;

  const activeConns =
    conns?.filter?.((c) => !c.closed && c.status !== "closed")?.length ?? 0;

  // memory usage (best-effort, backend may not provide)
  const memoryBytes =
    memoryInfo?.inuse ??
    memoryInfo?.inUse ??
    memoryInfo?.in_use ??
    memoryInfo?.heapInuse ??
    memoryInfo?.heap_inuse ??
    null;

  const memoryLimitBytes =
    memoryInfo?.oslimit ??
    memoryInfo?.limit ??
    null;

  // dianggap "Connected" kalau minimal ada traffic OR minimal ada 1 koneksi
  const isConnected = (!!traffic && (upSpeed || downSpeed)) || activeConns > 0;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Overview
          </h1>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border ${
              isConnected
                ? "border-emerald-400/60 text-emerald-300 bg-emerald-500/10"
                : "border-rose-400/60 text-rose-300 bg-rose-500/10"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto refresh selector */}
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
              <option value="3">3s</option>
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="30">30s</option>
            </select>
          </div>

          {/* indikator refresh kecil */}
          <div className="hidden md:flex items-center text-[11px] text-slate-400">
            <span
              className={`w-2 h-2 rounded-full mr-1 ${
                loading ? "bg-sky-400 animate-ping" : "bg-slate-500"
              }`}
            />
            <span>Tick: {tick}</span>
          </div>

          <Button size="sm" onClick={loadConnections} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </header>

      {err && (
        <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-700/60 rounded-2xl px-3 py-2">
          Error: {err}
        </div>
      )}

      {/* KPI cards in Sing-box style layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card title="Status" className="flex flex-col justify-center">
          <div className="text-[11px] md:text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Memory</span>
              <span className="text-slate-100">
                {memoryBytes != null ? formatBytes(memoryBytes) : "-"}
              </span>
            </div>
            {memoryLimitBytes != null && (
              <div className="flex items-center justify-between">
                <span>Limit</span>
                <span className="text-slate-100">
                  {formatBytes(memoryLimitBytes)}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card title="Connections" className="flex flex-col justify-center">
          <div className="text-[11px] md:text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Active</span>
              <span className="text-slate-100">{activeConns}</span>
            </div>
          </div>
        </Card>

        <Card title="Traffic" className="flex flex-col justify-center">
          <div className="text-[11px] md:text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Uplink</span>
              <span className="text-slate-100">
                {formatSpeed(upSpeed) || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Downlink</span>
              <span className="text-slate-100">
                {formatSpeed(downSpeed) || "-"}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Traffic total" className="flex flex-col justify-center">
          <div className="text-[11px] md:text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Uplink</span>
              <span className="text-slate-100">
                {formatBytes(upTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Downlink</span>
              <span className="text-slate-100">
                {formatBytes(downTotal)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Traffic chart & sample connections */}
      <div className="grid gap-4 lg:grid-cols-3">
        <TrafficChart history={history} />
        <ConnectionsSnapshot conns={conns} />
      </div>

      {/* auto refresh info kecil di mobile */}
      <div className="md:hidden text-[11px] text-slate-400">
        Auto-refresh: {autoRefresh ? `${intervalSec}s` : "Off"}
      </div>
    </div>
  );
}
