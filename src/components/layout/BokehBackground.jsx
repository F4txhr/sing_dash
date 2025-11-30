import { useMemo } from "react";

const ORB_COUNT = 22;

function createOrbs() {
  const colors = [
    "rgba(96,165,250,0.55)",
    "rgba(129,140,248,0.45)",
    "rgba(244,114,182,0.40)",
    "rgba(45,212,191,0.45)"
  ];
  const orbs = [];
  for (let i = 0; i < ORB_COUNT; i++) {
    orbs.push({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 120 + Math.random() * 220,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 16 + Math.random() * 18,
      delay: Math.random() * 12,
      driftX: -12 + Math.random() * 24,
      driftY: -8 + Math.random() * 16
    });
  }
  return orbs;
}

export default function BokehBackground() {
  const orbs = useMemo(createOrbs, []);

  return (
    <div className="bokeh-bg">
      {orbs.map((o) => (
        <span
          key={o.id}
          className="bokeh-orb"
          style={{
            top: `${o.top}%`,
            left: `${o.left}%`,
            width: `${o.size}px`,
            height: `${o.size}px`,
            background: `radial-gradient(circle at 30% 30%, ${o.color}, transparent 60%)`,
            animationDuration: `${o.duration}s`,
            animationDelay: `${o.delay}s`,
            "--drift-x": `${o.driftX}px`,
            "--drift-y": `${o.driftY}px`
          }}
        />
      ))}
    </div>
  );
}