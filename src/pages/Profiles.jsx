import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getConfigs, getProxies, updateConfig } from "../lib/clashApi";
import {
  getProfiles,
  saveProfile,
  deleteProfile,
  getProfileById
} from "../lib/profileStore";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function downloadJsonFile(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  const handleSnapshot = async () => {
    try {
      setBusy(true);
      setErr("");
      setMsg("");

      const [cfg, prox] = await Promise.all([
        getConfigs(),
        getProxies()
      ]);

      const displayName =
        name.trim() ||
        `Snapshot ${new Date().toLocaleString().replace(",", "")}`;

      const p = saveProfile({
        name: displayName,
        note: note.trim(),
        configs: cfg,
        proxies: prox
      });

      setProfiles(getProfiles());
      setName("");
      setNote("");
      setMsg(`Saved profile: ${p.name}`);
    } catch (e) {
      setErr("Failed to create snapshot: " + (e.message || String(e)));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (id) => {
    const list = deleteProfile(id);
    setProfiles(list);
  };

  const handleExport = (id) => {
    const p = getProfileById(id);
    if (!p) return;
    downloadJsonFile(p, `singbox-profile-${p.name || p.id}.json`);
  };

  const handleRestoreSimple = async (id) => {
    const p = getProfileById(id);
    if (!p) return;
    try {
      setBusy(true);
      setErr("");
      setMsg("");
      const cfg = p.data?.configs || {};
      await updateConfig({
        mode: cfg.mode,
        "log-level": cfg.log_level
      });
      setMsg(`Restored runtime config from profile: ${p.name}`);
    } catch (e) {
      setErr("Failed to restore: " + (e.message || String(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* page header */}
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Profiles
          </h1>
          <p className="text-xs text-slate-400">
            Save and manage Sing-box configuration snapshots (configs + proxies)
            locally in the browser.
          </p>
        </div>
      </header>

      {(msg || err) && (
        <div className="space-y-1 text-xs">
          {msg && (
            <div className="text-sky-300 bg-sky-950/40 border border-sky-700/60 rounded-2xl px-3 py-2">
              {msg}
            </div>
          )}
          {err && (
            <div className="text-rose-300 bg-rose-950/40 border border-rose-700/60 rounded-2xl px-3 py-2">
              {err}
            </div>
          )}
        </div>
      )}

      {/* snapshot card */}
      <Card
        title="Create snapshot"
        description="Capture current configs + proxies and save as a local profile."
      >
        <div className="space-y-3 text-xs">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-slate-400">Name (optional)</div>
              <input
                className="w-full rounded-2xl bg-slate-950/40 border border-slate-700/80 px-3 py-2 text-xs outline-none focus:border-sky-500"
                placeholder="e.g. Stable gaming 4G"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Note (optional)</div>
              <input
                className="w-full rounded-2xl bg-slate-950/40 border border-slate-700/80 px-3 py-2 text-xs outline-none focus:border-sky-500"
                placeholder="e.g. Good ping to SG & ID"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <Button size="sm" onClick={handleSnapshot} disabled={busy}>
            {busy ? "Saving..." : "Save snapshot"}
          </Button>
          <div className="text-[11px] text-slate-500">
            Profiles are stored in the browser (localStorage). Up to 20 recent
            profiles are kept.
          </div>
        </div>
      </Card>

      {/* saved profiles list */}
      <Card title="Saved profiles">
        {profiles.length === 0 ? (
          <div className="text-xs text-slate-500">
            No profiles yet. Create a snapshot above first.
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto text-xs">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl px-3 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <div className="font-medium text-slate-100">
                    {p.name || "(no name)"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDate(p.createdAt)}
                  </div>
                  {p.note && (
                    <div className="text-[11px] text-slate-300 mt-1">
                      {p.note}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRestoreSimple(p.id)}
                    disabled={busy}
                    className="text-[11px]"
                  >
                    Restore runtime
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExport(p.id)}
                    className="text-[11px]"
                  >
                    Export JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[11px] text-rose-300 border-rose-500/50"
                    onClick={() => handleDelete(p.id)}
                    disabled={busy}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}