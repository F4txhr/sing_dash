import Card from "../ui/Card";
import { formatSpeed } from "../../lib/utils";

export default function TrafficChart({ history }) {
  // hitung max value dari history untuk scaling
  const maxVal = history.reduce(
    (max, p) => Math.max(max, p.up || 0, p.down || 0),
    0
  );
  const safeMax = maxVal || 1; // hindari bagi 0

  return (
    <Card
      title="Traffic"
      className="lg:col-span-2"
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
              Menunggu data traffic...
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
                stroke="#1e293b"
                strokeWidth="0.4"
              />
              <line
                x1="0"
                y1="10"
                x2="100"
                y2="10"
                stroke="#020617"
                strokeWidth="0.3"
              />
              <line
                x1="0"
                y1="30"
                x2="100"
                y2="30"
                stroke="#020617"
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
                      return `${x},${y}`;
                    })
                    .join(" ");

                const downPts = makePoints("down");
                const upPts = makePoints("up");

                return (
                  <>
                    {/* glow */}
                    <polyline
                      points={downPts}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#softGlow)"
                      opacity="0.7"
                    />
                    <polyline
                      points={upPts}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#softGlow)"
                      opacity="0.6"
                    />

                    {/* garis utama */}
                    <polyline
                      points={downPts}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points={upPts}
                      fill="none"
                      stroke="#a855f7"
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