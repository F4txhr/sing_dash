import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatBytes } from "../../lib/utils";

const DEFAULT_URL = "https://speed.cloudflare.com/__down?bytes=20000000";
const MIN_TEST_DURATION_SEC = 5;seEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatBytes } from "../../lib/utils";

const DEFAULT_URL = "https://speed.cloudflare.com/__down?bytes=20000000";

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

    const startedAt = performance.now();
    const cacheBustedUrl =
      url + (url.includes("?") ? "&" : "?") + "_t=" + Date.now();

    try {
      const res = await fetch(cacheBustedUrl, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      let bytes = 0;
      const downloadStart = performance.now();

      if (res.body && res.body.getReader) {
        const reader = res.body.getReader();
        // stream data dan hitung total bytes, update indikator realtime
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            const chunkBytes = value.length || value.byteLength || 0;
            bytes += chunkBytes;
            const elapsedSec = (performance.now() - downloadStart) / 1000;
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
        const elapsedSec = (performance.now() - downloadStart) / 1000;
        const mbps =
          elapsedSec > 0 ? (bytes * 8) / (elapsedSec * 1_000_000) : 0;
        setLiveBytes(bytes);
        setLiveSeconds(elapsedSec);
        setLiveMbps(mbps);
      }

      const downloadElapsedSec = (performance.now() - downloadStart) / 1000;
      const mbps =
        downloadElapsedSec > 0
          ? (bytes * 8) / (downloadElapsedSec * 1_000_000)
          : 0;

      setResult({
        bytes,
        seconds: downloadElapsedSec,
        mbps,
        finishedAt: new Date().toISOString()
      });

      // pastikan animasi test terasa agak lama
      const wallElapsed = (performance.now() - startedAt) / 1000;
      if (wallElapsed < MIN_TEST_DURATION_SEC) {
        const waitMs = (MIN_TEST_DURATION_SEC - wallElapsed) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
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

  const currentMbps = running ? liveMbps : result?.mbps || 0;
  const currentBytes = running ? liveBytes : result?.bytes || 0;
  const currentSeconds = running ? liveSeconds : result?.seconds || 0;

  // speedometer mapping
  const MAX_Mbps = 300;
  const capped = Math.max(0, Math.min(currentMbps, MAX_Mbps));
  const ratio = capped / MAX_Mbps; // 0..1
  const angle = -110 + ratio * 220; // -110deg .. +110deg
  const rad = (angle * Math.PI) / 180;
  const needleLength = 32;
  const centerX = 50;
  const centerY = 50;
  const needleX = centerX + needleLength * Math.cos(rad);
  const needleY = centerY + needleLength * Math.sin(rad);

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="relative p-4 md:p-5 rounded-2xl bg-gradient-to-br from-sky-500/25 via-indigo-500/20 to-fuchsia-500/25 border border-white/10">
        {/* glow background */}
        <div className="pointer-events-none absolute -top-32 -right-10 w-64 h-64 bg-sky-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-10 w-72 h-72 bg-purple-500/30 blur-3xl" />

        <div className="relative grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* left: speedometer */}
          <div className="flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between text-[11px] text-slate-100/80">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full border border-white/15 bg-slate-950/40">
                  Speed test
                </span>
                {running && (
                  <span className="inline-flex items-center gap-1 text-sky-100">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              {result && !running && (
                <span className="text-slate-200">
                  Last:{" "}
                  <span className="font-semibold">
                    {currentMbps.toFixed(2)} Mbps
                  </span>
                </span>
              )}
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-full max-w-xs md:max-w-sm">
                <svg
                  viewBox="0 0 100 60"
                  className="w-full h-32 md:h-36"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient
                      id="speedArc"
                      x1="0%"
                      y1="100%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="40%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <filter id="softGlowSpeed">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                    </filter>
                  </defs>

                  {/* background arc */}
                  <path
                    d="M10 50 A40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#020617"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* colored arc */}
                  <path
                    d="M10 50 A40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#speedArc)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#softGlowSpeed)"
                  />

                  {/* tick marks */}
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const tRatio = idx / 6; // 0..1
                    const tAngle = -110 + tRatio * 220;
                    const tRad = (tAngle * Math.PI) / 180;
                    const rOuter = 42;
                    const rInner = idx % 3 === 0 ? 36 : 38;
                    const x1 = centerX + rInner * Math.cos(tRad);
                    const y1 = centerY + rInner * Math.sin(tRad);
                    const x2 = centerX + rOuter * Math.cos(tRad);
                    const y2 = centerY + rOuter * Math.sin(tRad);
                    return (
                      <line
                        key={idx}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#111827"
                        strokeWidth={idx % 3 === 0 ? 1.4 : 0.7}
                      />
                    );
                  })}

                  {/* needle */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={needleX}
                    y2={needleY}
                    stroke="#e5e7eb"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  {/* needle center */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="3.2"
                    fill="#0f172a"
                    stroke="#e5e7eb"
                    strokeWidth="1.2"
                  />

                  {/* labels 0 - MAX */}
                  <text
                    x="14"
                    y="54"
                    fontSize="4"
                    fill="#9ca3af"
                    textAnchor="middle"
                  >
                    0
                  </text>
                  <text
                    x="50"
                    y="40"
                    fontSize="4"
                    fill="#9ca3af"
                    textAnchor="middle"
                  >
                    {Math.round(MAX_Mbps / 2)}
                  </text>
                  <text
                    x="86"
                    y="54"
                    fontSize="4"
                    fill="#9ca3af"
                    textAnchor="middle"
                  >
                    {MAX_Mbps}
                  </text>
                </svg>
              </div>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-50 drop-shadow-[0_0_12px_rgba(15,23,42,0.8)]">
                  {currentMbps.toFixed(2)}
                </span>
                <span className="pb-1 text-xs text-slate-200/80">Mbps</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-200/80">
                {formatBytes(currentBytes)} • {currentSeconds.toFixed(2)}s
              </div>
            </div>

            {(running || liveBytes > 0) && (
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-slate-900/70 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-fuchsia-400 transition-[width] duration-150"
                    style={{ width: `${progress ?? 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-200/80">
                  <span>{formatBytes(liveBytes)} downloaded</span>
                  {progress != null && <span>{Math.round(progress)}%</span>}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <Button size="sm" onClick={handleRun} disabled={running}>
                {running ? "Testing..." : "Run speed test"}
              </Button>
              <div className="flex-1 text-[10px] text-slate-200/80">
                Gunakan URL file yang cukup besar dan mengizinkan CORS. Trafik
                akan melewati jalur Sing-box saat browser ini menggunakan proxy.
              </div>
            </div>
          </div>

          {/* right: URL + IP/ISP + error */}
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] text-slate-100/80">Test URL</div>
              <input
                className="w-full rounded-2xl bg-slate-950/50 border border-white/15 px-3 py-2 text-[11px] outline-none focus:border-sky-400 text-slate-100 placeholder:text-slate-400"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/large-file.bin"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 space-y-1">
              <div className="text-[11px] text-slate-200/90 mb-0.5">
                IP &amp; ISP
              </div>
              {ipInfo ? (
                <>
                  <div className="text-[11px] text-slate-50">
                    {ipInfo.ip} •{" "}
                    {ipInfo.org || ipInfo.org_name || "Unknown ISP"}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {ipInfo.city}, {ipInfo.region}
                    {", "}
                    {ipInfo.country_name} • {ipInfo.asn || ipInfo.country}
                  </div>
                </>
              ) : ipError ? (
                <div className="text-[10px] text-rose-300">{ipError}</div>
              ) : (
                <div className="text-[10px] text-slate-400">
                  Memuat info IP...
                </div>
              )}
            </div>

            {error && (
              <div className="text-[11px] text-rose-200 bg-rose-950/40 border border-rose-700/60 rounded-2xl px-3 py-2">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}