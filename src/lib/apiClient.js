import { getApiConfig } from "./apiConfig";

export function apiUrl(path) {
  const { baseUrl } = getApiConfig();
  return `${baseUrl}${path}`;
}

export async function apiGet(path) {
  const url = apiUrl(path);

  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`API Error (${res.status}): ${text.slice(0, 100)}`);
  }

  // Jika Sing-box mengembalikan kosong
  if (text.trim() === "") return null;

  // Jika ternyata HTML
  if (text.trim().startsWith("<")) {
    throw new Error(`Invalid JSON (HTML returned): ${text.slice(0, 100)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON: ${text.slice(0, 100)}`);
  }
}