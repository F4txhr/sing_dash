import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatBytes } from "../../lib/utils";

const DEFAULT_URL = "https://speed.cloudflare.com/__down?bytes=5000000";

export default function SpeedTest() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    if (!url.trim()) return;
    setRunning(true);
    setError("");
    setResult(null);

    const startedAt = Date.now();
    const cacheBustedUrl =
      url + (url.includes("?") ? "&" : "?") + "_t=" + startedAt;

    try {
      const res = await fetch(cacheBustedUrl, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      let bytes = 0;
      const start = performance.now();

      if (res.body && res.body.getReader) {
        const reader = res.body.getReader();
        // stream data dan hitung total bytes
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) bytes += value.length || value.byteLength || 0;
        }
      } else {
        // fallback: download penuh ke memory
        const buf = await res.arrayBuffer();
        bytes = buf.byteLength;
      }

      const elapsedSec = (performance.now() - start) / 1000;
      const mbps =
        elapsedSec > 0 ? (bytes * 8) / (elapsedSec * 1_000_000) : 0;

      setResult({
        bytes,
        seconds: elapsedSec,
        mbps,
        finishedAt: new Date().toISOString()
      });
    } catch (e) {
      setError(
        e?.message ||
          "Speed test gagal. Coba ganti URL atau cek CORS di endpoint tersebut."
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card
      title="Speed test"
      description="Download speed sederhana via HTTP (bergantung CORS pada URL yang dipilih)."
    >
      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <div className="text-slate-400">Test URL</div>
          <input
            className="w-full rounded-2xl bg-slate-950/40 border border-slate-700/80 px-3 py-2 text-xs outline-none focus:border-sky-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/large-file.bin"
          />
          <p className="text-[11px] text-slate-500">
            Gunakan URL file yang cukup besar dan mengizinkan CORS. Trafik
            akan melewati jalur Sing-box saat browser ini menggunakan proxy
            tersebut.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleRun} disabled={running}>
            {running ? "Testing..." : "Run speed test"}
          </Button>
          {result && (
            <div className="text-[11px] text-slate-300 space-x-2">
              <span>
                Download:{" "}
                <span className="font-semibold">
                  {result.mbps.toFixed(2)} Mbps
                </span>
              </span>
              <span className="text-slate-500">•</span>
              <span>
                Data: {formatBytes(result.bytes)} /{" "}
                {result.seconds.toFixed(2)}s
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-700/60 rounded-2xl px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}