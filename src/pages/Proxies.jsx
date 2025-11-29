import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getProxies, apiPut, getProxyDelay } from "../lib/clashApi";
import { useTheme } from "../lib/themeContext";
import { useLatencyStyle } from "../lib/latencyStyleContext";

const LATENCY_TEST_URL = "http://www.gstatic.com/generate_204";

function extractLatencyMap(proxiesObj) {
  const map = {};
  if (!proxiesObj) return map;

  for (const [name, p] of Object.entries(proxiesObj)) {
    let v = null;

    if (typeof p?.delay === "number") {
      v = p.delay;
    } else if (Array.isArray(p?.history) && p.history.length > 0) {
      const last = p.history[p.history.length - 1];
      if (typeof last?.delay === "number") v = last.delay;
    }

    if (v != null) map[name] = v;
  }

  return map;
}

const LATENCY_PALETTES = {
  default: {
    text: ["text-emerald-400", "text-lime-300", "text-yellow-300", "text-rose-400"],
    bg: ["bg-emerald-400", "bg-lime-300", "bg-yellow-300", "bg-rose-400"],
    bar: "bg-sky-400"
  },
  matrix: {
    text: ["text-emerald-400", "text-emerald-300", "text-lime-300", "text-emerald-200"],
    bg: ["bg-emerald-400", "bg-emerald-300", "bg-lime-300", "bg-emerald-200"],
    bar: "bg-emerald-400"
  },
  terminal: {
    text: ["text-emerald-400", "text-emerald-300", "text-lime-300", "text-emerald-200"],
    bg: ["bg-emerald-400", "bg-emerald-300", "bg-lime-300", "bg-emerald-200"],
    bar: "bg-emerald-400"
  },
  cyberpunk: {
    text: ["text-fuchsia-300", "text-pink-300", "text-amber-300", "text-rose-400"],
    bg: ["bg-fuchsia-400", "bg-pink-400", "bg-amber-300", "bg-rose-400"],
    bar: "bg-fuchsia-400"
  },
  sunset: {
    text: ["text-orange-300", "text-amber-300", "text-yellow-300", "text-rose-400"],
    bg: ["bg-orange-400", "bg-amber-400", "bg-yellow-300", "bg-rose-400"],
    bar: "bg-orange-400"
  },
  aurora: {
    text: ["text-emerald-300", "text-emerald-200", "text-lime-300", "text-rose-400"],
    bg: ["bg-emerald-400", "bg-emerald-300", "bg-lime-300", "bg-rose-400"],
    bar: "bg-emerald-400"
  },
  ocean: {
    text: ["text-cyan-300", "text-sky-300", "text-teal-300", "text-rose-400"],
    bg: ["bg-cyan-400", "bg-sky-400", "bg-teal-400", "bg-rose-400"],
    bar: "bg-cyan-400"
  },
  pastel: {
    text: ["text-sky-300", "text-cyan-300", "text-emerald-300", "text-rose-400"],
    bg: ["bg-sky-400", "bg-cyan-400", "bg-emerald-400", "bg-rose-400"],
    bar: "bg-sky-400"
  }
};

const LATENCY_BAR_CONFIG = {
  matrix: { count: 5, heights: [4, 6, 8, 10, 12] },
  cyberpunk: { count: 3, heights: [6, 9, 12] },
  pastel: { count: 4, heights: [4, 7, 10, 13] },
  default: { count: 4, heights: [4, 6, 8, 10] }
};

function getLatencyPalette(themeId) {
  return LATENCY_PALETTES[themeId] || LATENCY_PALETTES.default;
}

function getLatencyBarConfig(themeId) {
  return LATENCY_BAR_CONFIG[themeId] || LATENCY_BAR_CONFIG.default;
}

function getLatencyColor(val, themeId) {
  if (val === "error" || val === null || val === undefined)
    return "text-slate-500";
  const palette = getLatencyPalette(themeId);
  if (val < 80) return palette.text[0];
  if (val < 150) return palette.text[1];
  if (val < 250) return palette.text[2];
  return palette.text[3];
}

function qualityDotClass(val, themeId) {
  if (val === "error" || val === null || val === undefined)
    return "bg-slate-500";
  const palette = getLatencyPalette(themeId);
  if (val < 80) return palette.bg[0];
  if (val < 150) return palette.bg[1];
  if (val < 250) return palette.bg[2];
  return palette.bg[3];
}

function latencyQualityLabel(val) {
  if (val === "error") return "Error";
  if (val === null || val === undefined) return "Unknown";
  if (val < 80) return "Excellent";
  if (val < 150) return "Good";
  if (val < 250) return "Fair";
  return "Poor";
}

export default function Proxies() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { themeId } = useTheme();
  const { latencyStyleId } = useLatencyStyle();

  const [latency, setLatency] = useState({});
  const [testingGroup, setTestingGroup] = useState("");
  const [testingAll, setTestingAll] = useState(false);

  // auto refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);

  // collapse per group
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // simple / advanced view
  const [viewMode, setViewMode] = useState("advanced"); // 'simple' | 'advanced'

  // latency display: 'number' | 'bars'
  const [latencyView, setLatencyView] = useState("number");

  // search
  const [search, setSearch] = useState("");

  const proxies = data?.proxies || {};

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await getProxies();
      setData(res);

      const autoMap = extractLatencyMap(res.proxies || res);
      setLatency((prev) => ({
        ...prev,
        ...autoMap
      }));
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

  // adjust default view when latency style changes
  useEffect(() => {
    if (
      latencyStyleId === "barsThin" ||
      latencyStyleId === "barsThick" ||
      latencyStyleId === "barsDense" ||
      latencyStyleId === "barProgress" ||
      latencyStyleId === "hybrid"
    ) {
      setLatencyView("bars");
    } else {
      setLatencyView("number");
    }
  }, [latencyStyleId]);

  const handleSwitch = async (group, proxy) => {
    await apiPut(`/proxies/${encodeURIComponent(group)}`, { name: proxy });
    await load();
  };

  const testLatencyForProxy = async (name) => {
    const res = await getProxyDelay(name, LATENCY_TEST_URL, 5000);
    const ms = res.delay ?? null;
    setLatency((prev) => ({ ...prev, [name]: ms }));
    return ms;
  };

  const testAllInGroup = async (group) => {
    const proxyGroup = proxies?.[group];
    if (!proxyGroup?.all) return;

    setTestingGroup(group);
    try {
      for (const name of proxyGroup.all) {
        try {
          await testLatencyForProxy(name);
        } catch {
          setLatency((prev) => ({ ...prev, [name]: "error" }));
        }
      }
    } finally {
      setTestingGroup("");
    }
  };

  const testAllGroups = async () => {
    if (!data?.proxies) return;
    setTestingAll(true);
    setErr("");
    try {
      // jalankan per group yang punya 'all'
      for (const [name, proxy] of Object.entries(data.proxies)) {
        if (!Array.isArray(proxy.all)) continue;
        try {
          await testAllInGroup(name);
        } catch {
          // lanjut saja ke group berikutnya
        }
      }
    } finally {
      setTestingAll(false);
    }
  };

  const toggleCollapsed = (groupName) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // filter berdasarkan search (urutan tetap mengikuti urutan dari backend)
  const entriesRaw = Object.entries(proxies).filter(
    ([, proxy]) => Array.isArray(proxy.all)
  );

  const searchLower = search.trim().toLowerCase();
  const entries = entriesRaw.filter(([name, proxy]) => {
    if (!searchLower) return true;
    if (name.toLowerCase().includes(searchLower)) return true;
    return proxy.all.some((p) => p.toLowerCase().includes(searchLower));
  });

  return (
    <div className="space-y-4">
      {/* page header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          Proxies
        </h1>

        <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
          {/* view mode toggle */}
          <div className="flex items-center text-[11px] border border-slate-700/80 rounded-2xl bg-slate-950/60 overflow-hidden">
            <button
              onClick={() => setViewMode("simple")}
              className={`px-3 py-1 ${
                viewMode === "simple"
                  ? "bg-sky-500/20 text-sky-100"
                  : "text-slate-400"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              className={`px-3 py-1 ${
                viewMode === "advanced"
                  ? "bg-sky-500/20 text-sky-100"
                  : "text-slate-400"
              }`}
            >
              Advanced
            </button>
          </div>

          {/* latency view toggle */}
          <div className="flex items-center text-[11px] border border-slate-700/80 rounded-2xl bg-slate-950/60 overflow-hidden">
            <button
              onClick={() => setLatencyView("number")}
              className={`px-3 py-1 ${
                latencyView === "number"
                  ? "bg-sky-500/20 text-sky-100"
                  : "text-slate-400"
              }`}
            >
              ms
            </button>
            <button
              onClick={() => setLatencyView("bars")}
              className={`px-3 py-1 ${
                latencyView === "bars"
                  ? "bg-sky-500/20 text-sky-100"
                  : "text-slate-400"
              }`}
            >
              Bars
            </button>
          </div>

          {/* search */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="hidden md:inline text-slate-400">Search:</span>
            <input
              className="rounded-2xl bg-slate-950/60 border border-slate-700/80 px-3 py-1 text-[11px] outline-none focus:border-sky-500 min-w-[140px]"
              placeholder="group / node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* auto refresh */}
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

          {/* test all groups + refresh */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={testAllGroups}
              disabled={testingAll || loading}
              className="text-[11px]"
            >
              {testingAll ? "Testing all..." : "Test all groups"}
            </Button>
            <Button size="sm" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
      </header>

      {err && (
        <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-700/50 rounded-2xl px-3 py-2">
          Error: {err}
        </div>
      )}

      {/* satu kolom list card */}
      <section className="space-y-4 max-w-4xl mx-auto">
        {entries.length === 0 && !loading && (
          <div className="text-xs text-slate-500">
            No proxy group matches the current search.
          </div>
        )}

        {entries.map(([name, proxy]) => {
          const collapsed = !!collapsedGroups[name];
          const groupTesting = testingGroup === name;

          const currentName = proxy.now;
          const currentLatency = latency[currentName];

          const allNames = proxy.all;

          const showDetails =
            viewMode === "advanced" && !collapsed && allNames.length > 0;

          const latencyText =
            currentLatency === "error"
              ? "ERR"
              : currentLatency == null
              ? "-"
              : `${currentLatency} ms`;
          const qualityLabel = latencyQualityLabel(currentLatency);
          const qualityLevel =
            currentLatency === "error" || currentLatency == null
              ? 0
              : currentLatency < 80
              ? 4
              : currentLatency < 150
              ? 3
              : currentLatency < 250
              ? 2
              : 1;

          const renderLatencyBars = (val) => {
            const palette = getLatencyPalette(themeId);
            const config = getLatencyBarConfig(themeId);
            const count = config.count;
            const heights = config.heights;

            if (val === "error" || val == null) {
              return (
                <span className="flex items-end gap-0.5">
                  {Array.from({ length: count }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-0.5 rounded-full ${
                        i === 0 ? "h-[6px] bg-slate-600" : "h-[3px] bg-slate-700"
                      }`}
                    />
                  ))}
                </span>
              );
            }

            const baseLevel = val < 80 ? 4 : val < 150 ? 3 : val < 250 ? 2 : 1;
            const level = Math.max(
              1,
              Math.min(count, Math.round((baseLevel / 4) * count))
            );

            return (
              <span className="flex items-end gap-0.5">
                {Array.from({ length: count }).map((_, idx) => {
                  const i = idx + 1;
                  const isActive = i <= level;
                  const heightClass =
                    heights[idx] != null ? `h-[${heights[idx]}px]` : "h-[4px]";
                  return (
                    <span
                      key={i}
                      className={`w-0.5 rounded-full ${
                        isActive
                          ? `${palette.bar} ${heightClass}`
                          : "bg-slate-700 h-[4px]"
                      }`}
                    />
                  );
                })}
              </span>
            );
          };

          const renderHeaderLatencyNumber = () => {
            const colorClass = getLatencyColor(currentLatency, themeId);
            const qualityText = qualityLabel;

            switch (latencyStyleId) {
              case "pill":
                return (
                  <>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] border border-sky-500/60 bg-gradient-to-r from-sky-500/20 via-emerald-500/10 to-fuchsia-500/20 ${colorClass}`}
                    >
                      {latencyText}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {qualityText}
                    </span>
                  </>
                );
              case "chip":
                return (
                  <div className="flex flex-col gap-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] border border-slate-600/80 bg-slate-900/80 text-slate-100">
                      {qualityText}
                    </span>
                    <span className={`text-[10px] ${colorClass}`}>
                      {latencyText}
                    </span>
                  </div>
                );
              case "dot":
                return (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shadow-inner ${qualityDotClass(
                        currentLatency,
                        themeId
                      )}`}
                    />
                    <span className={`text-[11px] ${colorClass}`}>
                      {latencyText}
                    </span>
                  </div>
                );
              case "quality":
                return (
                  <div className="flex flex-col gap-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] border border-slate-600/80 bg-slate-900/80 text-slate-100">
                      {qualityText}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {latencyText}
                    </span>
                  </div>
                );
              case "barsThin":
              case "barsThick":
              case "barsDense":
              case "barProgress":
              case "hybrid":
                // numeric view but show small chart under/next to number
                return (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full border border-slate-700/80 bg-slate-900/80 text-[11px] ${colorClass}`}
                    >
                      {latencyText}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="text-slate-500">|</span>
                      <span>{qualityText}</span>
                    </span>
                  </div>
                );
              case "classic":
              default:
                return (
                  <>
                    <span
                      className={`px-2 py-0.5 rounded-full border border-slate-700/80 bg-slate-900/80 text-[11px] ${colorClass}`}
                    >
                      {latencyText}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {qualityText}
                    </span>
                  </>
                );
            }
          };

          const renderHeaderLatencyBars = () => {
            const qualityText = qualityLabel;
            const levelPercent =
              qualityLevel <= 0 ? 0 : (qualityLevel / 4) * 100;

            switch (latencyStyleId) {
              case "barsThick":
                return (
                  <div className="flex items-center gap-1">
                    <div className="px-2 py-0.5 rounded-full border border-slate-600/80 bg-slate-950/80 text-[11px]">
                      <div className="flex items-end gap-1">
                        {renderLatencyBars(currentLatency)}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-300">
                      {qualityText}
                    </span>
                  </div>
                );
              case "barsDense":
                return (
                  <div className="flex items-center gap-1.5">
                    <div className="px-1.5 py-0.5 rounded-full border border-slate-700/80 bg-slate-950/80 text-[11px]">
                      <div className="flex items-end gap-0.5 scale-y-110">
                        {renderLatencyBars(currentLatency)}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-300">
                      {qualityText}
                    </span>
                  </div>
                );
              case "barProgress":
                return (
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-400"
                        style={{ width: `${levelPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-300">
                      {qualityText}
                    </span>
                  </div>
                );
              case "hybrid":
                return (
                  <div className="flex items-center gap-1.5">
                    <div className="px-2 py-0.5 rounded-full border border-slate-700/80 bg-slate-950/80 text-[11px] flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-300">
                        {latencyText}
                      </span>
                      <span className="text-slate-500">·</span>
                      {renderLatencyBars(currentLatency)}
                    </div>
                    <span className="hidden sm:inline text-[10px] text-slate-400">
                      {qualityText}
                    </span>
                  </div>
                );
              case "classic":
              case "pill":
              case "chip":
              case "dot":
              case "quality":
              default:
                return (
                  <div className="flex items-center gap-1">
                    <div className="px-2 py-0.5 rounded-full border border-slate-700/80 bg-slate-900/80 text-[11px]">
                      {renderLatencyBars(currentLatency)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {qualityText}
                    </span>
                  </div>
                );
            }
          };

          return (
            <Card key={name} className="flex flex-col gap-2">
              {/* header card: quality dot + nama + latency + Test all + hide */}
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${qualityDotClass(
                      currentLatency,
                      themeId
                    )}`}
                  />
                  <span className="text-sm font-semibold text-slate-100">
                    {name}
                  </span>
                  {latencyView === "number"
                    ? renderHeaderLatencyNumber()
                    : renderHeaderLatencyBars()}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={groupTesting}
                    onClick={() => testAllInGroup(name)}
                    className="text-[11px] px-3 py-1"
                  >
                    {groupTesting ? "Testing..." : "Test all"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(name)}
                    className="w-7 h-7 rounded-full border border-slate-700/80 bg-slate-900/80 flex items-center justify-center text-[11px] text-slate-300 hover:border-slate-500"
                    title={collapsed ? "Show details" : "Hide details"}
                  >
                    {collapsed ? "↓" : "↑"}
                  </button>
                </div>
              </div>

              {/* info kecil + small latency dots for group */}
              <div className="text-[11px] text-slate-400 flex flex-col gap-1">
                <div>
                  Type:{" "}
                  <span className="text-slate-200">{proxy.type}</span> • Now:{" "}
                  <span className="text-sky-300 font-medium">{proxy.now}</span>
                </div>
                {(viewMode === "simple" || collapsed) && allNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {allNames.map((p) => {
                      const lat = latency[p];
                      return (
                        <span
                          key={p}
                          className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full ${qualityDotClass(
                            lat,
                            themeId
                          )}`}
                          title={`${p}${
                            lat == null
                              ? ""
                              : lat === "error"
                              ? " (ERR)"
                              : ` (${lat} ms)`
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* daftar tag dalam 2 kolom (hanya advanced) */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  showDetails ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {showDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                    {allNames.map((p) => {
                      const lat = latency[p];
                      const latText =
                        lat === "error"
                          ? "ERR"
                          : lat == null
                          ? "-"
                          : `${lat} ms`;
                      const active = p === proxy.now;

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleSwitch(name, p)}
                          className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-1 px-2 py-1 rounded-full text-[11px] border w-full
                            ${
                              active
                                ? "border-sky-400 bg-sky-500/20 text-sky-100"
                                : "border-slate-700/80 text-slate-200 hover:border-slate-500 hover:bg-slate-900/70"
                            }`}
                          title={p}
                        >
                          <span className="text-left truncate">{p}</span>
                          {latencyView === "number" ? (
                            <span
                              className={`${getLatencyColor(
                                lat,
                                themeId
                              )} text-[10px] text-right shrink-0 ml-1`}
                            >
                              {latText}
                            </span>
                          ) : (
                            <span className="flex justify-end shrink-0 ml-1">
                              {renderLatencyBars(lat)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </section>

      {/* small indicator for mobile */}
      <div className="md:hidden text-[11px] text-slate-400">
        Auto-refresh: {autoRefresh ? `${intervalSec}s` : "Off"} (change from
        desktop view)
      </div>
    </div>
  );
}