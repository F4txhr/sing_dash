import { useEffect, useState, useRef } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getConnections, connectTraffic } from "../lib/clashApi";

// helper format byte
function formatBytes(bytes) {
  if (bytes == null || isNaN(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = Number(bytes);
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(2)} ${units[i]}`;
}

// helper format speed
function formatSpeed(bytesPerSec) {
  if (bytesPerSec == null || isNaN(bytesPerSec)) return "-";
  return `${formatBytes(bytesPerSec)}/s`;
}

export default function Overview() {
  const [traffic, setTraffic] = useState(null);
  const [conns, setConns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [tick, setTick] = useState(0); // indikator kecil di UI

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
          (prev) => prev || "traffic websocket error (lihat console browser)",
        );
      };

      ws.onclose = () => {
        console.log("[Overview] traffic WS closed");
      };
    } catch (e) {
      console.error("[Overview] failed to open traffic WS:", e);
      setErr(
        (prev) =>
          prev || "failed to open traffic websocket (lihat console browser)",
      );
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
    } catch (e) {
      console.error("[Overview] getConnections error:", e);
      setErr((prev) => prev || e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
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

  // dianggap "Connected" kalau minimal ada traffic OR minimal ada 1 koneksi
  const isConnected = (!!traffic && (upSpeed || downSpeed)) || activeConns > 0;

  // ==== DATA UNTUK GRAFIK ====
  const maxVal = history.reduce(
    (max, p) => Math.max(max, p.up || 0, p.down || 0),
    0,
  );
  const safeMax = maxVal || 1; // hindari bagi 0

  return (
    <div className="space-y-4">
      {/* Header halaman */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="space-y-1">
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
          <p className="text-xs text-slate-400">
            Ringkasan trafik & koneksi Sing-box / Clash.
          </p>
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <Card title="Upload" className="!p-3 md:!p-4">
          <div className="text-sm font-semibold">{formatSpeed(upSpeed)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Kecepatan saat ini
          </div>
        </Card>

        <Card title="Download" className="!p-3 md:!p-4">
          <div className="text-sm font-semibold">{formatSpeed(downSpeed)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Kecepatan saat ini
          </div>
        </Card>

        {/* Upload Total (dari kalkulasi lokal atau dari backend jika ada) */}
        <Card title="Upload Total" className="!p-3 md:!p-4">
          <div className="text-sm font-semibold">{formatBytes(upTotal)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Estimasi total upload (sejak buka halaman ini)
          </div>
        </Card>

        {/* Download Total */}
        <Card title="Download Total" className="!p-3 md:!p-4">
          <div className="text-sm font-semibold">{formatBytes(downTotal)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Estimasi total download (sejak buka halaman ini)
          </div>
        </Card>

        <Card title="Active connections" className="!p-3 md:!p-4">
          <div className="text-sm font-semibold">{activeConns}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Dari /connections
          </div>
        </Card>
      </div>

      {/* Traffic chart & sample connections */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Traffic"
          description="Grafik sederhana dari /traffic (Up / Down) dalam beberapa detik terakhir."
          className="lg:col-span-2"
        >
          <div className="flex flex-col gap-2 h-40 md:h-56">
            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-3 h-1 rounded-full bg-sky-400/80" />
                <span>Download</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-1 rounded-full bg-violet-400/80" />
                <span>Upload</span>
              </div>
              <div className="ml-auto text-[10px] text-slate-500">
                Max: {formatSpeed(safeMax)}
              </div>
            </div>

            {/* Chart area */}
            <div className="flex-1 rounded-2xl bg-slate-950/60 border border-slate-800/80 px-3 py-2 overflow-hidden">
              {history.length < 2 ? (
                <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500">
                  Menunggu data traffic...
                </div>
              ) : (
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* glow tipis di belakang garis */}
                    <filter id="softGlow">
                      <feGaussianBlur stdDeviation="0.5" result="blur" />
                      <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="0 0 0 0 0.38  0 0 0 0 0.72  0 0 0 0 1  0 0 0 0.6 0"
                      />
                    </filter>
                  </defs>

                  {/* grid halus */}
                  <line
                    x1="0"
                    y1="20"
                    x2="100"
                    y2="20"
                    stroke="#1e293b"
                    strokeWidth="0.4"
                  />
                  <line
                    x1="0"
                    y1="10"
                    x2="100"
                    y2="10"
                    stroke="#020617"
                    strokeWidth="0.3"
                  />
                  <line
                    x1="0"
                    y1="30"
                    x2="100"
                    y2="30"
                    stroke="#020617"
                    strokeWidth="0.3"
                  />

                  {(() => {
                    // scaling sedikit dihaluskan biar spike nggak terlalu tinggi
                    const makePoints = (key) =>
                      history
                        .map((p, idx) => {
                          const x = (idx / (history.length - 1 || 1)) * 100;
                          const raw = Math.min(p[key] || 0, safeMax);
                          const ratio = Math.sqrt(raw / safeMax || 0); // smoothing
                          const y = 38 - ratio * 34; // 2px margin top/bottom
                          return `${x},${y}`;
                        })
                        .join(" ");

                    const downPts = makePoints("down");
                    const upPts = makePoints("up");

                    return (
                      <>
                        {/* glow */}
                        <polyline
                          points={downPts}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#softGlow)"
                          opacity="0.7"
                        />
                        <polyline
                          points={upPts}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#softGlow)"
                          opacity="0.6"
                        />

                        {/* garis utama */}
                        <polyline
                          points={downPts}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points={upPts}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="1.1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    );
                  })()}
                </svg>
              )}
            </div>
          </div>
        </Card>

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
                      {c.chains?.join(" / ") || c.metadata?.chains?.join(" / ")}
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
      </div>

      {/* auto refresh info kecil di mobile */}
      <div className="md:hidden text-[11px] text-slate-400">
        Auto-refresh: {autoRefresh ? `${intervalSec}s` : "Off"}
      </div>
    </div>
  );
}
