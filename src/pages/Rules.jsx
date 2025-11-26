import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getRules } from "../lib/clashApi";

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await getRules();

      let list = [];
      if (Array.isArray(res)) {
        // sing-box bisa kirim array langsung
        list = res;
      } else if (Array.isArray(res?.rules)) {
        // clash klasik
        list = res.rules;
      } else if (res && typeof res === "object") {
        // fallback: gabung semua nilai object
        const values = Object.values(res);
        if (values.every((v) => typeof v === "string")) {
          list = values;
        }
      }

      setRules(list);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderRule = (r) => {
    if (typeof r === "string") return r;
    try {
      return JSON.stringify(r);
    } catch {
      return String(r);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Rules
          </h1>
          <p className="text-xs text-slate-400">
            Daftar rules dari /rules (format menyesuaikan Sing-box).
          </p>
        </div>
        <Button size="sm" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </header>

      {err && (
        <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-700/50 rounded-2xl px-3 py-2">
          Error: {err}
        </div>
      )}

      <Card>
        <div className="text-xs font-mono space-y-2 max-h-[420px] overflow-y-auto">
          {rules.length === 0 && !err && (
            <div className="text-slate-500">
              Tidak ada rules atau API /rules mengembalikan list kosong.
            </div>
          )}
          {rules.map((r, i) => (
            <div
              key={i}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl px-3 py-2"
            >
              {renderRule(r)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}