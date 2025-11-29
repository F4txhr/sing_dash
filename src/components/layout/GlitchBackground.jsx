import { useMemo } from "react";

const LINE_COUNT = 18;

function createLines() {
  const lines = [];
  for (let i = 0; i < LINE_COUNT; i++) {
    lines.push({
      id: i,
      top: Math.random() * 100,
      height: 1 + Math.random() * 2,
      duration: 1.4 + Math.random() * 1.2,
      delay: Math.random() * 2
    });
  }
  return lines;
}

export default function GlitchBackground() {
  const lines = useMemo(createLines, []);

  return (
    <div className="glitch-bg">
      <div className="glitch-scanlines" />
      <div className="glitch-noise" />
      {lines.map((l) => (
        <span
          key={l.id}
          className="glitch-line"
          style={{
            top: `${l.top}%`,
            height: `${l.height}px`,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`
          }}
        />
      ))}
    </div>
  );
}