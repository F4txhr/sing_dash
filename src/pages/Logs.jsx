import { useEffect, useRef, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { connectLogs } from "../lib/clashApi";

function getTagColor(tag) {
  const t = (tag || "").toString().toLowerCase();
  if (t === "error") return "border-rose-500/60 text-rose-200";
  if (t === "warning" || t === "warn")
    return "border-amber-400/70 text-amber-200";
  if (t === "debug") return "border-slate-500/80 text-slate-300";
  if (t === "info") return "border-sky-400/70 text-sky-200";
  return "border-slate-700/80 text-slate-300";
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [level, setLevel] = useState("info");
  const [status, setStatus] = useState("disconnected"); // disconnected | connecting | connected | error
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // buka koneksi saat mount & ketika level berubah
    setStatus("connecting");
    const ws = connectLogs(level);
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus((prev) => (prev === "error" ? "error" : "disconnected"));
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        // Clash-style: { time, type, payload, ... }
        setLogs((prev) => {
          const next = [...prev, msg];
          // batasi biar nggak kebanyakan
          if (next.length > 300) next.shift();
          return next;
        });
      } catch {
        // kalau bukan JSON, simpan apa adanya
        setLogs((prev) => {
          const next = [...prev, { type: "raw", payload: ev.data }];
          if (next.length > 300) next.shift();
          return next;
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [level]);

  useEffect(() => {
    if (!autoScroll) return;
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => setLogs([]);

  const statusLabel =
    status === "connected"
      ? "Live"
      : status === "connecting"
      ? "Connecting..."
      : status === "error"
      ? "Error"
      : "Disconnected";

  const searchLower = search.trim().toLowerCase();
  const visibleLogs = searchLower
    ? logs.filter((log) => {
        const payloadStr =
          typeof log.payload === "string"
            ? log.payload
            : JSON.stringify(log.payload ?? log, null, 0);
        const tag =
          log.type ||
          log.level ||
          (typeof log.payload === "string" &&
            log.payload.split(" ")[0]) ||
          "log";
        return (
          payloadStr.toLowerCase().includes(searchLower) ||
          tag.toString().toLowerCase().includes(searchLower)
        );
      })
    : logs;

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Logs
          </h1>
          <p className="text-xs text-slate-400">
            Log realtime dari /logs (WebSocket).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <div className="flex items-center gap-2">
            <select
              className="rounded-2xl bg-slate-950/40 border border-slate-700/80 px-3 py-2 text-xs outline-none focus:border-sky-500"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="debug">debug</option>
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
            </select>
            <div className="text-[11px] text-slate-400 min-w-[80px]">
              Status:{" "}
              <span
                className={
                  status === "connected"
                    ? "text-emerald-400"
                    : status === "error"
                    ? "text-rose-400"
                    : "text-slate-300"
                }
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="hidden md:inline text-slate-400">Search:</span>
            <input
              className="rounded-2xl bg-slate-950/60 border border-slate-700/80 px-3 py-1 text-[11px] outline-none focus:border-sky-500 min-w-[140px]"
              placeholder="keyword / level..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-3 h-3 rounded border border-slate-600 bg-slate-900"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              <span>Auto-scroll</span>
            </label>
          </div>
          <Button size="sm" variant="ghost" onClick={clearLogs}>
            Clear
          </Button>
        </div>
      </header>

      <Card>
        <div className="max-h-[480px] overflow-y-auto space-y-1 text-xs font-mono">
          {visibleLogs.map((log, idx) => {
            const tag =
              log.type ||
              log.level ||
              (typeof log.payload === "string" &&
                log.payload.split(" ")[0]) ||
              "log";

            const payload =
              typeof log.payload === "string"
                ? log.payload
                : JSON.stringify(log.payload ?? log, null, 0);

            return (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl px-3 py-2 flex flex-col md:flex-row md:items-center md:gap-2"
              >
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] border mb-1 md:mb-0 ${getTagColor(
                    tag
                  )}`}
                >
                  {tag}
                </span>
                <span className="text-[11px] text-slate-200 break-all">
                  {payload}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </Card>
    </div>
  );
}