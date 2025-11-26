const KEY = "singbox_profiles_v1";

function loadRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveRaw(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// profil berisi: id, name, createdAt, note, data:{configs, proxies}
export function getProfiles() {
  return loadRaw();
}

export function saveProfile({ name, note, configs, proxies }) {
  const list = loadRaw();
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();
  const profile = { id, name, note, createdAt, data: { configs, proxies } };
  list.unshift(profile);
  saveRaw(list.slice(0, 20)); // simpan max 20 profil
  return profile;
}

export function deleteProfile(id) {
  const list = loadRaw().filter((p) => p.id !== id);
  saveRaw(list);
  return list;
}

export function getProfileById(id) {
  return loadRaw().find((p) => p.id === id) || null;
}