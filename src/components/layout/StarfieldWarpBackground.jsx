import { useEffect, useRef } from "react";

const STAR_COUNT = 260;

function createStars(width, height) {
  const stars = [];
  const maxDepth = 3;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      depth: 1 + Math.random() * (maxDepth - 1),
      speed: 0.12 + Math.random() * 0.18
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
      ctx.fillStyle = "rgba(3,7,18,0.9)";
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const depthFactor = star.depth;
        const vx = (star.x - width / 2) * 0.0004 * depthFactor;
        const vy = (star.y - height / 2) * 0.0004 * depthFactor;

        star.x += vx * star.speed * 60;
        star.y += vy * star.speed * 60;

        if (star.x < -10 || star.x > width + 10 || star.y < -10 || star.y > height + 10) {
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.depth = 1 + Math.random() * 2;
        }

        const size = 0.4 + (3 / depthFactor);
        const alpha = 0.25 + (1.5 / depthFactor);

        ctx.beginPath();
        ctx.fillStyle = `rgba(148,163,184,${alpha})`;
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();
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