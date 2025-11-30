import { getApiConfig } from "./apiConfig";

function buildHeaders() {
  const { secret } = getApiConfig();
  const h = { "Content-Type": "application/json" };
  if (secret) h["Authorization"] = "Bearer " + secret;
  return h;
}

function baseUrl() {
  return getApiConfig().baseUrl.replace(/\/+$/, "");
}

export async function apiGet(path) {
  const res = await fetch(baseUrl() + path, {
    method: "GET",
    headers: buildHeaders()
  });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(baseUrl() + path, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${path} -> ${res.status}`);
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/* REST wrappers */
export const getConfigs = () => apiGet("/configs");
export const updateConfig = (patch) => apiPut("/configs", patch);
export const getProxies = () => apiGet("/proxies");
export const getRules = () => apiGet("/rules");
export const getConnections = () => apiGet("/connections");

/* 🔥 WebSocket traffic (up/down B/s) */
export function connectTraffic() {
  const cfg = getApiConfig();
  let url = cfg.baseUrl.replace(/\/+$/, "");
  // http -> ws
  url = url.replace(/^http/, "ws");
  return new WebSocket(url + "/traffic");
}

/* 🔥 WebSocket memory (inuse / oslimit) ala Yacd-meta */
export function connectMemory() {
  const cfg = getApiConfig();
  let url = cfg.baseUrl.replace(/\/+$/, "");
  url = url.replace(/^http/, "ws");
  return new WebSocket(url + "/memory");
}

/* 🔥 WebSocket logs */
export function connectLogs(level = "info") {
  const cfg = getApiConfig();
  let url = cfg.baseUrl.replace(/\/+$/, "");
  url = url.replace(/^http/, "ws");
  let full = `${url}/logs?level=${encodeURIComponent(level)}`;
  if (cfg.secret) {
    full += `&token=${encodeURIComponent(cfg.secret)}`;
  }
  return new WebSocket(full);
}

/* 🔥 Test latency satu proxy */
export async function getProxyDelay(name, url, timeoutMs = 5000) {
  const q =
    `?timeout=${timeoutMs}` +
    `&url=${encodeURIComponent(url)}`;
  return apiGet(`/proxies/${encodeURIComponent(name)}/delay${q}`);
}