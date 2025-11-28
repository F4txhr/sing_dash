import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getApiConfig, setApiConfig } from "../lib/apiConfig";
import { getConfigs, updateConfig } from "../lib/clashApi";
import { useConnectionStatus } from "../lib/connectionStatus";

export default function ConfigPage() {
  const [apiCfg, setApiCfgState] = useState(getApiConfig());
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const { setConnectionStatus } = useConnectionStatus();

  const loadCfg = async (updateStatus = false) => {
    try {
      setLoading(true);
      setMsg("");
      const c = await getConfigs();
      setCfg(c);
      if (updateStatus) {
        setConnectionStatus({
          status: "ok",
          lastError: "",
          lastChecked: new Date().toISOString()
        });
        setMsg("API OK: /configs loaded successfully.");
      }
    } catch (e) {
      const message = e.message || String(e);
      if (updateStatus) {
        setConnectionStatus({
          status: "error",
          lastError: message,
          lastChecked: new Date().toISOString()
        });
        setMsg("Error testing /configs: " + message);
      } else {
        setMsg("Error loading /configs: " + message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCfg(false);
  }, []);

  const handleSaveApi = () => {
    const merged = setApiConfig(apiCfg);
    setApiCfgState(merged);
    setMsg("API config saved. Please refresh the other pages.");
  };

  const handleTestConnection = () => {
    loadCfg(true);
  };

  const handlePatchConfig = async () => {
    try {
      setLoading(true);
      setMsg("");
      await updateConfig({
        "log-level": cfg.log_level,
        mode: cfg.mode
      });
      setMsg("Config updated.");
    } catch (e) {
      setMsg("Error update /configs: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          Config
        </h1>
        <Button size="sm" onClick={loadCfg} disabled={loading}>
          {loading ? "Loading..." : "Reload /configs"}
        </Button>
      </header>

      {msg && (
        <div className="text-xs text-sky-300 bg-sky-950/40 border border-sky-700/50 rounded-2xl px-3 py-2">
          {msg}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="API Settings"
        >
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400">Base URL</div>
              <input
                className="w-full rounded-2xl bg-slate-950/40 border border-slate-700/80 px-3 py-2 text-xs outline-none focus:border-sky-500"
                value={apiCfg.baseUrl}
                onChange={(e) =>
                  setApiCfgState((x) => ({ ...x, baseUrl: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Secret (optional)</div>
              <input
                className="w-full rounded-2xl bg-slate-950/40 border border-slate-700/80 px-3 py-2 text-xs outline-none focus:border-sky-500"
                value={apiCfg.secret}
                onChange={(e) =>
                  setApiCfgState((x) => ({ ...x, secret: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSaveApi}>
                Save API settings
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleTestConnection}
                disabled={loading}
              >
                {loading ? "Testing..." : "Test connection"}
              </Button>
            </div>
          </div>
        </Card>

        <Card
          title="Runtime Config"
        >
          {cfg ? (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="text-slate-400">Mode</div>
                <select
                  className="w-full rounded-2xl bg-slate-950/40 border border-slate-700/80 px-3 py-2 text-xs outline-none focus:border-sky-500"
                  value={cfg.mode}
                  onChange={(e) =>
                    setCfg((x) => ({ ...x, mode: e.target.value }))
                  }
                >
                  <option value="rule">rule</option>
                  <option value="global">global</option>
                  <option value="direct">direct</option>
                </select>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400">Log Level</div>
                <select
                  className="w-full rounded-2xl bg-slate-950/40 border border-slate-700/80 px-3 py-2 text-xs outline-none focus:border-sky-500"
                  value={cfg.log_level}
                  onChange={(e) =>
                    setCfg((x) => ({ ...x, log_level: e.target.value }))
                  }
                >
                  <option value="silent">silent</option>
                  <option value="error">error</option>
                  <option value="warning">warning</option>
                  <option value="info">info</option>
                  <option value="debug">debug</option>
                </select>
              </div>
              <Button size="sm" onClick={handlePatchConfig} disabled={loading}>
                {loading ? "Saving..." : "Save runtime config"}
              </Button>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Belum ada data /configs.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}