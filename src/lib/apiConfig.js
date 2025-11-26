const KEY = "singbox_api_config";

const DEFAULT_CONFIG = {
  baseUrl: "http://127.0.0.1:9090", // ganti kalau port beda
  secret: ""                        // isi kalau pakai secret
};

export function getApiConfig() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setApiConfig(cfg) {
  const current = getApiConfig();
  const merged = { ...current, ...cfg };
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}