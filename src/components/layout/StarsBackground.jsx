import { useMemo } from "react";

const STAR_COUNT = 48;

function generateStars() {
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 6 + Math.random() * 8,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.25 + Math.random() * 0.5
    });
  }
  return stars;
}

export default function StarsBackground() {
  const stars = useMemo(() => generateStars(), []);

  return (
    <div className="stars-bg">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star-dot"
          style={{
            left: `${s.left}%`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity
          }}
        />
      ))}
    </div>
  );
}