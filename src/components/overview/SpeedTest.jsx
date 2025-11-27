import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatBytes } from "../../lib/utils";

const DEFAULT_URL = "https://speed.cloudflare.com/__down?bytes=5000000";

function parseExpectedBytes(url) {
  try {
    const m = url.match(/[?&]bytes=(\d+)/);
    if (!m) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export default function SpeedTest() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // live state
  const [liveBytes, setLiveBytes] = useState(0);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [liveMbps, setLiveMbps] = useState(0);
  const [expectedBytes, setExpectedBytes] = useState(null);

  // ip / ISP info
  const [ipInfo, setIpInfo] = useState(null);
  const [ipError, setIpError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadIp = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setIpInfo(data);
      } catch (e) {
        if (!cancelled) {
          setIpError(
            e?.message ||
              "Gagal mengambil info IP/ISP (ipapi.co). Coba lagi nanti."
          );
        }
      }
    };

    loadIp();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRun = async () => {
    if (!url.trim()) return;
    setRunning(true);
    setError("");
    setResult(null);
    setLiveBytes(0);
    setLiveSeconds(0);
    setLiveMbps(0);

    const exp = parseExpectedBytes(url);
    setExpectedBytes(exp || null);

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
        // stream data dan hitung total bytes, update indikator realtime
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            const chunkBytes = value.length || value.byteLength || 0;
            bytes += chunkBytes;
            const elapsedSec = (performance.now() - start) / 1000;
            const mbps =
              elapsedSec > 0 ? (bytes * 8) / (elapsedSec * 1_000_000) : 0;

            setLiveBytes(bytes);
            setLiveSeconds(elapsedSec);
            setLiveMbps(mbps);
          }
        }
      } else {
        // fallback: download penuh ke memory
        const buf = await res.arrayBuffer();
        bytes = buf.byteLength;
        const elapsedSec = (performance.now() - start) / 1000;
        const mbps =
          elapsedSec > 0 ? (bytes * 8) / (elapsedSec * 1_000_000) : 0;
        setLiveBytes(bytes);
        setLiveSeconds(elapsedSec);
        setLiveMbps(mbps);
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

  const progress =
    expectedBytes && expectedBytes > 0
      ? Math.min((liveBytes / expectedBytes) * 100, 100)
      : null;

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

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleRun} disabled={running}>
              {running ? "Testing..." : "Run speed test"}
            </Button>
            {(running || result) && (
              <div className="text-[11px] text-slate-300 space-x-2">
                <span>
                  Download:{" "}
                  <span className="font-semibold">
                    {(running ? liveMbps : result?.mbps || 0).toFixed(2)} Mbps
                  </span>
                </span>
                <span className="text-slate-500">•</span>
                <span>
                  Data: {formatBytes(running ? liveBytes : result?.bytes || 0)}{" "}
                  / {(running ? liveSeconds : result?.seconds || 0).toFixed(2)}s
                </span>
              </div>
            )}
          </div>

          {/* indikator progres sederhana */}
          {(running || liveBytes > 0) && (
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-[width] duration-150"
                  style={{ width: `${progress ?? 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{formatBytes(liveBytes)} downloaded</span>
                {progress != null && (
                  <span>{Math.round(progress)}%</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info IP / ISP / lokasi */}
        <div className="border border-slate-800/80 rounded-2xl px-3 py-2 bg-slate-950/40 space-y-1">
          <div className="text-[11px] text-slate-400 mb-0.5">
            IP &amp; ISP (via ipapi.co)
          </div>
          {ipInfo ? (
            <>
              <div className="text-[11px] text-slate-200">
                {ipInfo.ip} • {ipInfo.org || ipInfo.org_name || "Unknown ISP"}
              </div>
              <div className="text-[10px] text-slate-400">
                {ipInfo.city}, {ipInfo.region}{", "}
                {ipInfo.country_name} • {ipInfo.asn || ipInfo.country}
              </div>
            </>
          ) : ipError ? (
            <div className="text-[10px] text-rose-300">{ipError}</div>
          ) : (
            <div className="text-[10px] text-slate-500">Memuat info IP...</div>
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