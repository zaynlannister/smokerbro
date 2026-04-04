"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeDir: number;
}

export default function GoldDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const COUNT = 45;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.8 + Math.random() * 1.8,
        speedY: -(0.15 + Math.random() * 0.35),
        speedX: -0.2 + Math.random() * 0.4,
        opacity: Math.random() * 0.5,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const p of particles) {
        // Update
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += p.fadeDir * 0.004;

        if (p.opacity >= 0.6) p.fadeDir = -1;
        if (p.opacity <= 0.05) p.fadeDir = 1;

        // Wrap around
        if (p.y < -10) {
          p.y = canvas!.height + 10;
          p.x = Math.random() * canvas!.width;
        }
        if (p.x < -10) p.x = canvas!.width + 10;
        if (p.x > canvas!.width + 10) p.x = -10;

        // Draw
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201, 168, 76, ${p.opacity})`;
        ctx!.shadowBlur = p.size * 4;
        ctx!.shadowColor = `rgba(201, 168, 76, ${p.opacity * 0.5})`;
        ctx!.fill();
      }

      ctx!.shadowBlur = 0;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
