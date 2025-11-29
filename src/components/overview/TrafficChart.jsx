import Card from "../ui/Card";
import { formatSpeed } from "../../lib/utils";
import { useTheme } from "../../lib/themeContext";

const TRAFFIC_PALETTES = {
  default: {
    down: "#38bdf8",
    up: "#a855f7",
    gridMajor: "#1e293b",
    gridMinor: "#020617"
  },
  aurora: {
    down: "#4ade80",
    up: "#22c55e",
    gridMajor: "#064e3b",
    gridMinor: "#022c22"
  },
  cyberpunk: {
    down: "#f472b6",
    up: "#a855f7",
    gridMajor: "#4c1d95",
    gridMinor: "#020617"
  },
  ocean: {
    down: "#22d3ee",
    up: "#0ea5e9",
    gridMajor: "#0f172a",
    gridMinor: "#020617"
  },
  pastel: {
    down: "#7dd3fc",
    up: "#a5b4fc",
    gridMajor: "#1e293b",
    gridMinor: "#020617"
  },
  matrix: {
    down: "#22c55e",
    up: "#4ade80",
    gridMajor: "#022c22",
    gridMinor: "#020617"
  }
};

const TRAFFIC_MODE_BY_THEME = {
  glass: "line",
  solid: "line",
  neon: "line",
  dusk: "line",
  aurora: "line",
  sunset: "bars",
  terminal: "line",
  pastel: "line",
  ocean: "bars",
  cyberpunk: "bars",
  matrix: "bars",
  yacd: "line"
};

function getTrafficModeForTheme(themeId) {
  return TRAFFIC_MODE_BY_THEME[themeId] || "line";
}

export default function TrafficChart({ history }) {
  // hitung max value dari history untuk scaling
  const maxVal = history.reduce(
    (max, p) => Math.max(max, p.up || 0, p.down || 0),
    0
  );
  const safeMax = maxVal || 1; // hindari bagi 0
  const { themeId } = useTheme();
  const palette = TRAFFIC_PALETTES[themeId] || TRAFFIC_PALETTES.default;
  const mode = getTrafficModeForTheme(themeId);

  return (
    <Card
      title="Traffic"
      className="lg:col-span-2"
      headerRight={
        <div className="text-[10px] text-slate-400">
          {mode === "bars" ? "Chart: bars" : "Chart: line"}
        </div>
      }
    >
      <div className="flex flex-col gap-2 h-40 md:h-56">
        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-3 h-1 rounded-full bg-sky-400/80" />
            <span>Download</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-1 rounded-full bg-violet-400/80" />
            <span>Upload</span>
          </div>
          <div className="ml-auto text-[10px] text-slate-500">
            Max: {formatSpeed(safeMax)}
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-1 rounded-2xl bg-slate-950/60 border border-slate-800/80 px-3 py-2 overflow-hidden">
          {history.length < 2 ? (
            <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500">
              Waiting for traffic data...
            </div>
          ) : (
            <svg
              className="w-full h-full"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <defs>
                {/* glow tipis di belakang garis */}
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="0.5" result="blur" />
                  <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="0 0 0 0 0.38  0 0 0 0 0.72  0 0 0 0 1  0 0 0 0.6 0"
                  />
                </filter>
              </defs>

              {/* grid halus */}
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
                // scaling sedikit dihaluskan biar spike nggak terlalu tinggi
                const makePoints = (key) =>
                  history
                    .map((p, idx) => {
                      const x = (idx / (history.length - 1 || 1)) * 100;
                      const raw = Math.min(p[key] || 0, safeMax);
                      const ratio = Math.sqrt(raw / safeMax || 0); // smoothing
                      const y = 38 - ratio * 34; // 2px margin top/bottom
                      return { x, y };
                    });

                const downPoints = makePoints("down");
                const upPoints = makePoints("up");
                const downPtsStr = downPoints.map((p) => `${p.x},${p.y}`).join(" ");
                const upPtsStr = upPoints.map((p) => `${p.x},${p.y}`).join(" ");

                if (mode === "bars") {
                  const barWidth = 100 / (history.length * 1.6 || 1);
                  return (
                    <>
                      {downPoints.map((p, idx) => (
                        <rect
                          key={`down-${idx}`}
                          x={p.x - barWidth / 2}
                          y={p.y}
                          width={barWidth}
                          height={38 - p.y}
                          fill={palette.down}
                          opacity="0.55"
                        />
                      ))}
                      {upPoints.map((p, idx) => (
                        <rect
                          key={`up-${idx}`}
                          x={p.x - barWidth / 2}
                          y={p.y}
                          width={barWidth}
                          height={38 - p.y}
                          fill={palette.up}
                          opacity="0.45"
                        />
                      ))}
                    </>
                  );
                }

                return (
                  <>
                    {/* glow */}
                    <polyline
                      points={downPtsStr}
                      fill="none"
                      stroke={palette.down}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#softGlow)"
                      opacity="0.7"
                    />
                    <polyline
                      points={upPtsStr}
                      fill="none"
                      stroke={palette.up}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#softGlow)"
                      opacity="0.6"
                    />

                    {/* garis utama */}
                    <polyline
                      points={downPtsStr}
                      fill="none"
                      stroke={palette.down}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points={upPtsStr}
                      fill="none"
                      stroke={palette.up}
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                );
              })()}
            </svg>
          )}
        </div>
      </div>
    </Card>
  );
}