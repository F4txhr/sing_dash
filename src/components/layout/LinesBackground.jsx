import { useMemo } from "react";

const LINE_COUNT = 26;

function generateLines() {
  const lines = [];
  for (let i = 0; i < LINE_COUNT; i++) {
    lines.push({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      length: 80 + Math.random() * 160,
      thickness: 1 + Math.random() * 1.5,
      angle: -30 + Math.random() * 60,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 6
    });
  }
  return lines;
}

export default function LinesBackground() {
  const lines = useMemo(() => generateLines(), []);

  return (
    <div className="lines-bg">
      {lines.map((l) => (
        <span
          key={l.id}
          className="line-segment"
          style={{
            top: `${l.top}%`,
            left: `${l.left}%`,
            width: `${l.length}px`,
            height: `${l.thickness}px`,
            "--line-angle": `${l.angle}deg`,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`
          }}
        />
      ))}
    </div>
  );
}