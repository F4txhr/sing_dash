import { useEffect, useRef, useState } from "react";

function drawTriangles(canvas) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // soft gradient background to blend with main gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "rgba(102,126,234,0.35)");
  bgGrad.addColorStop(0.5, "rgba(118,75,162,0.45)");
  bgGrad.addColorStop(1, "rgba(56,189,248,0.25)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const cellSize = 120;
  const cols = Math.ceil(width / cellSize) + 1;
  const rows = Math.ceil(height / cellSize) + 1;

  const points = [];
  for (let x = 0; x < cols; x++) {
    points[x] = [];
    for (let y = 0; y < rows; y++) {
      const px = x * cellSize + (Math.random() - 0.5) * cellSize * 0.4;
      const py = y * cellSize + (Math.random() - 0.5) * cellSize * 0.4;
      points[x][y] = { x: px, y: py };
    }
  }

  const palettes = [
    ["rgba(255,255,255,0.14)", "rgba(129, 140, 248,0.40)", "rgba(59,130,246,0.35)"],
    ["rgba(244,114,182,0.35)", "rgba(96,165,250,0.40)", "rgba(45,212,191,0.38)"],
    ["rgba(129,140,248,0.42)", "rgba(52,211,153,0.35)", "rgba(251,191,36,0.30)"]
  ];
  const palette = palettes[Math.floor(Math.random() * palettes.length)];

  for (let x = 0; x < cols - 1; x++) {
    for (let y = 0; y < rows - 1; y++) {
      const p1 = points[x][y];
      const p2 = points[x + 1][y];
      const p3 = points[x][y + 1];
      const p4 = points[x + 1][y + 1];

      const tris =
        Math.random() > 0.5
          ? [
              [p1, p2, p3],
              [p3, p2, p4]
            ]
          : [
              [p1, p2, p4],
              [p1, p4, p3]
            ];

      tris.forEach((tri) => {
        const color =
          palette[(x + y + (Math.random() > 0.6 ? 1 : 0)) % palette.length];
        ctx.beginPath();
        ctx.moveTo(tri[0].x, tri[0].y);
        ctx.lineTo(tri[1].x, tri[1].y);
        ctx.lineTo(tri[2].x, tri[2].y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      });
    }
  }
}

export default function TrianglesBackground() {
  const canvasARef = useRef(null);
  const canvasBRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const canvasA = canvasARef.current;
    const canvasB = canvasBRef.current;
    if (!canvasA || !canvasB) return;

    // initial draw
    drawTriangles(canvasA);
    drawTriangles(canvasB);

    let current = 0;
    const interval = setInterval(() => {
      const next = current === 0 ? 1 : 0;
      const target = next === 0 ? canvasA : canvasB;
      drawTriangles(target);
      setActive(next);
      current = next;
    }, 9000);

    const handleResize = () => {
      drawTriangles(current === 0 ? canvasA : canvasB);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="triangles-bg">
      <canvas
        ref={canvasARef}
        className="triangles-bg-canvas"
        style={{ opacity: active === 0 ? 1 : 0 }}
      />
      <canvas
        ref={canvasBRef}
        className="triangles-bg-canvas"
        style={{ opacity: active === 1 ? 1 : 0 }}
      />
    </div>
  );
}