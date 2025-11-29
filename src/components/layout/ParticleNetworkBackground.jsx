import { useEffect, useRef } from "react";

const POINT_COUNT = 64;
const MAX_DISTANCE = 160;

function createPoints(width, height) {
  const points = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    });
  }
  return points;
}

export default function ParticleNetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    let points = createPoints(width, height);
    let frameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // subtle background tint
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "rgba(15,23,42,0.9)");
      bgGrad.addColorStop(1, "rgba(8,47,73,0.9)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // update points
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      // draw connections
      for (let i = 0; i < POINT_COUNT; i++) {
        for (let j = i + 1; j < POINT_COUNT; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DISTANCE) {
            const alpha = 1 - dist / MAX_DISTANCE;
            ctx.strokeStyle = `rgba(56,189,248,${alpha * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw points
      for (const p of points) {
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          6
        );
        gradient.addColorStop(0, "rgba(34,211,238,0.9)");
        gradient.addColorStop(1, "rgba(34,211,238,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    const onResize = () => {
      resize();
      points = createPoints(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="network-bg">
      <canvas ref={canvasRef} className="network-bg-canvas" />
    </div>
  );
}