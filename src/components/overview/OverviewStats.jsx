import Card from "../ui/Card";
import { formatBytes, formatSpeed } from "../../lib/utils";

export default function OverviewStats({
  upSpeed,
  downSpeed,
  upTotal,
  downTotal,
  activeConns,
  memoryBytes,
}) {
  const items = [
    {
      label: "Upload",
      value: formatSpeed(upSpeed) || "0 B/s",
    },
    {
      label: "Download",
      value: formatSpeed(downSpeed) || "0 B/s",
    },
    {
      label: "Upload Total",
      value: formatBytes(upTotal),
    },
    {
      label: "Download Total",
      value: formatBytes(downTotal),
    },
    {
      label: "Active Connections",
      value: activeConns ?? 0,
    },
    {
      label: "Memory Usage",
      value: memoryBytes != null ? formatBytes(memoryBytes) : "-",
    },
  ];

  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="sec rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 shadow-sm"
          >
            <div className="text-[11px] text-slate-400">{item.label}</div>
            <div className="pt-1 text-sm font-semibold text-slate-100 truncate">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}