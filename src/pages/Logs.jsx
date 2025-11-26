import { useEffect, useRef, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { connectLogs } from "../lib/clashApi";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [level, setLevel] = useState("info");
  const [status, setStatus] = useState("disconnected"); // disconnected | connecting | connected | error
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
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  const statusLabel =
    status === "connected"
      ? "Live"
      : status === "connecting"
      ? "Connecting..."
      : status === "error"
      ? "Error"
      : "Disconnected";

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Logs
          </h1>
          <p className="text-xs text-slate-400">
            Log realtime dari /logs (WebSocket).
          </p>
        </div>
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
          <Button size="sm" variant="ghost" onClick={clearLogs}>
            Clear
          </Button>
        </div>
      </header>

      <Card>
        <div className="max-h-[480px] overflow-y-auto space-y-1 text-xs font-mono">
          {logs.map((log, idx) => {
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
                <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] border border-slate-700/80 text-slate-300 mb-1 md:mb-0">
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