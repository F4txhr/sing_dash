import Card from "../ui/Card";
import { useTheme } from "../../lib/themeContext";
import { formatBytes } from "../../lib/utils";

const MEMORY_PALETTES = {
  default: {
    line: "#38bdf8",
    fill: "rgba(56,189,248,0.25)",
    gridMajor: "#1f2933",
    gridMinor: "#020617",
  },
  aurora: {
    line: "#22c55e",
    fill: "rgba(34,197,94,0.28)",
    gridMajor: "#064e3b",
    gridMinor: "#022c22",
  },
  ocean: {
    line: "#22d3ee",
    fill: "rgba(34,211,238,0.26)",
    gridMajor: "#0f172a",
    gridMinor: "#020617",
  },
  matrix: {
    line: "#22c55e",
    fill: "rgba(34,197,94,0.26)",
    gridMajor: "#022c22",
    gridMinor: "#020617",
  },
};

export default function MemoryChart({ history }) {
  const maxVal = history.reduce(
    (max, p) => Math.max(max, p.inuse || 0),
    0
  );
  const safeMax = maxVal || 1;
  const { themeId } = useTheme();
  const palette = MEMORY_PALETTES[themeId] || MEMORY_PALETTES.default;

  return (
    <Card title="Memory">
      <div className="h-40 sm:h-44 md:h-56 lg:h-60 rounded-2xl bg-slate-950/60 border border-slate-800/80 px-3 py-2 overflow-hidden">
        {history.length < 2 ? (
          <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500">
            Waiting for memory data...
          </div>
        ) : (
          <svg
            className="w-full h-full"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="memoryGlow">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="0 0 0 0 0.22  0 0 0 0 0.78  0 0 0 0 0.99  0 0 0 0.8 0"
                />
              </filter>
            </defs>

            {/* grid */}
            <line
              x1="0"
              y1="20"
              x2="100"
              y2="20"
              stroke={palette.gridMajor}
              strokeWidth="0.4"
            />
            <line
              x1="0"
              y1="10"
              x2="100"
              y2="10"
              stroke={palette.gridMinor}
              strokeWidth="0.3"
            />
            <line
              x1="0"
              y1="30"
              x2="100"
              y2="30"
              stroke={palette.gridMinor}
              strokeWidth="0.3"
            />

            {(() => {
              const points = history.map((p, idx) => {
                const x = (idx / (history.length - 1 || 1)) * 100;
                const raw = Math.min(p.inuse || 0, safeMax);
                const ratio = Math.sqrt(raw / safeMax || 0);
                const y = 38 - ratio * 34;
                return { x, y, raw };
              });

              const ptsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

              const makeFillPoints = () => {
                if (!points.length) return "";
                const first = points[0];
                const last = points[points.length - 1];
                return `${first.x},38 ${points
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")} ${last.x},38`;
              };

              const fill = makeFillPoints();

              return (
                <>
                  {fill && (
                    <polygon
                      points={fill}
                      fill={palette.fill}
                      opacity="0.9"
                    />
                  )}

                  <polyline
                    points={ptsStr}
                    fill="none"
                    stroke={palette.line}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#memoryGlow)"
                    opacity="0.7"
                  />
                  <polyline
                    points={ptsStr}
                    fill="none"
                    stroke={palette.line}
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              );
            })()}
          </svg>
        )}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">
        Latest:{" "}
        {history.length
          ? formatBytes(history[history.length - 1].inuse || 0)
          : "-"}
      </div>
    </Card>
  );
}