"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const COUNT = 140;
const DURATION = 2600;
// The scheme's accent is read at burst time; gold for honors, plus a few party colors.
const EXTRA_COLORS = ["#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#a78bfa"];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  spin: number;
  angle: number;
  color: string;
}

function launch(width: number, height: number, colors: string[]): Piece[] {
  // Two cannons in the bottom corners, aimed up and inward.
  return Array.from({ length: COUNT }, (_, i) => {
    const left = i % 2 === 0;
    const angle = (left ? -60 : -120) + (Math.random() - 0.5) * 40;
    const speed = 12 + Math.random() * 10;
    return {
      x: left ? width * 0.1 : width * 0.9,
      y: height,
      vx: Math.cos((angle * Math.PI) / 180) * speed,
      vy: Math.sin((angle * Math.PI) / 180) * speed,
      size: 6 + Math.random() * 6,
      spin: (Math.random() - 0.5) * 0.4,
      angle: Math.random() * Math.PI,
      color: colors[i % colors.length],
    };
  });
}

/**
 * A one-shot burst of confetti over the page each time `active` turns on.
 * Click-through, above dialogs, and skipped for people who prefer reduced motion.
 */
export function ConfettiBurst({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!active || reduceMotion || !canvas || !ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const { innerWidth: width, innerHeight: height } = window;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    const pieces = launch(width, height, accent ? [accent, ...EXTRA_COLORS] : EXTRA_COLORS);
    const start = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of pieces) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (now - start < DURATION) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, reduceMotion]);

  if (reduceMotion) return null;
  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[60] size-full" />;
}
