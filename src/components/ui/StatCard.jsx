import Card from "./Card";

export default function StatCard({ label, value, hint }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
    </Card>
  );
}