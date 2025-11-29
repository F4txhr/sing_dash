import { useMemo } from "react";

const BLOB_COUNT = 8;

function createBlobs() {
  const colors = [
    "rgba(251,146,60,0.55)",
    "rgba(248,113,113,0.50)",
    "rgba(244,114,182,0.55)"
  ];
  const blobs = [];
  for (let i = 0; i < BLOB_COUNT; i++) {
    blobs.push({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 180 + Math.random() * 220,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 22 + Math.random() * 14,
      delay: Math.random() * 10
    });
  }
  return blobs;
}

export default function GooeyBlobsBackground() {
  const blobs = useMemo(createBlobs, []);

  return (
    <div className="gooey-bg">
      {blobs.map((b) => (
        <span
          key={b.id}
          className="gooey-blob"
          style={{
            top: `${b.top}%`,
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: `radial-gradient(circle at 30% 30%, ${b.color}, transparent 65%)`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`
          }}
        />
      ))}
    </div>
  );
}