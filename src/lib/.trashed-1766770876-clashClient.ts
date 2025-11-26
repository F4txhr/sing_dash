// Stub: nanti diganti fetch ke Clash/Mihomo API
export async function getProxiesMock() {
  return Promise.resolve({
    proxies: {
      "GLOBAL": {
        type: "Selector",
        now: "HK-01",
        all: ["HK-01", "SG-01", "JP-01", "DIRECT"]
      },
      "Auto": {
        type: "URLTest",
        now: "SG-01",
        all: ["HK-01", "SG-01", "JP-01"]
      }
    }
  });
}