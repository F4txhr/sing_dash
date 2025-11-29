import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソ01";

export default function MatrixRainBackground() {
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

    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array.from({ length: columns }).map(
      () => Math.floor(Math.random() * height) / fontSize
    );

    let frameId;
    const render = () => {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(34,197,94,0.9)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text =
          CHARS[Math.floor(Math.random() * CHARS.length)] || "0";
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    const onResize = () => {
      resize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="matrix-bg">
      <canvas ref={canvasRef} className="matrix-bg-canvas" />
    </div>
  );
}