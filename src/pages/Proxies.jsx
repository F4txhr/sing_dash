import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getProxies, apiPut, getProxyDelay } from "../lib/clashApi";

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

function getLatencyColor(val) {
  if (val === "error" || val === null || val === undefined)
    return "text-slate-500";
  if (val < 80) return "text-emerald-400";
  if (val < 150) return "text-lime-300";
  if (val < 250) return "text-yellow-300";
  return "text-rose-400";
}

function qualityDotClass(val) {
  if (val === "error" || val === null || val === undefined)
    return "bg-slate-500";
  if (val < 80) return "bg-emerald-400";
  if (val < 150) return "bg-lime-300";
  if (val < 250) return "bg-yellow-300";
  return "bg-rose-400";
}

export default function Proxies() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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

  // filter berdasarkan search
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
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Proxies
          </h1>
          <p className="text-xs text-slate-400">
            Group selector & latency monitor dari /proxies.
          </p>
        </div>

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
            Tidak ada group proxy yang cocok dengan pencarian.
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

          return (
            <Card key={name} className="flex flex-col gap-2">
              {/* header card: quality dot + nama + latency + Test all + hide */}
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${qualityDotClass(
                      currentLatency
                    )}`}
                  />
                  <span className="text-sm font-semibold text-slate-100">
                    {name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full border border-slate-700/80 bg-slate-900/80 text-[11px] ${getLatencyColor(
                      currentLatency
                    )}`}
                  >
                    {currentLatency === "error"
                      ? "ERR"
                      : currentLatency == null
                      ? "-"
                      : `${currentLatency} ms`}
                  </span>
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

              {/* info kecil */}
              <div className="text-[11px] text-slate-400">
                Type:{" "}
                <span className="text-slate-200">{proxy.type}</span> • Now:{" "}
                <span className="text-sky-300 font-medium">{proxy.now}</span>
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
                          <span
                            className={`${getLatencyColor(
                              lat
                            )} text-[10px] text-right shrink-0 ml-1`}
                          >
                            {latText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {viewMode === "simple" && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Simple view: daftar node disembunyikan. Gunakan mode
                  <span className="text-sky-300"> Advanced</span> untuk melihat
                  semua tag.
                </div>
              )}
            </Card>
          );
        })}
      </section>

      {/* indicator kecil untuk mobile */}
      <div className="md:hidden text-[11px] text-slate-400">
        Auto-refresh: {autoRefresh ? `${intervalSec}s` : "Off"} (ubah di versi
        desktop)
      </div>
    </div>
  );
}