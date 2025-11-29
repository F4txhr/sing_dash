import { useEffect, useRef } from "react";

const STAR_COUNT = 220;

function createStars(width, height) {
  const stars = [];
  const halfW = width / 2;
  const halfH = height / 2;
  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * Math.max(halfW, halfH);
    stars.push({
      angle,
      radius,
      speed: 0.04 + Math.random() * 0.06
    });
  }
  return stars;
}

export default function StarfieldWarpBackground() {
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

    let stars = createStars(width, height);
    let frameId;

    const render = () => {
      ctx.fillStyle = "rgba(3,7,18,0.85)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      ctx.lineWidth = 1;

      for (const star of stars) {
        star.radius += star.speed * Math.max(width, height);

        if (star.radius > Math.max(width, height)) {
          star.radius = Math.random() * 40;
          star.angle = Math.random() * Math.PI * 2;
        }

        const prevR = star.radius - star.speed * Math.max(width, height);
        const x1 = cx + Math.cos(star.angle) * prevR;
        const y1 = cy + Math.sin(star.angle) * prevR;
        const x2 = cx + Math.cos(star.angle) * star.radius;
        const y2 = cy + Math.sin(star.angle) * star.radius;

        const brightness = Math.min(1, star.radius / (Math.max(width, height) * 0.8));
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.2 + brightness * 0.8})`;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    const onResize = () => {
      resize();
      stars = createStars(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="warp-bg">
      <canvas ref={canvasRef} className="warp-bg-canvas" />
    </div>
  );
}