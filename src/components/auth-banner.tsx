"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Decorative right-hand panel for the auth pages. A dot grid is revealed around
 * the cursor (masked radial gradient) with a soft amber glow following the
 * pointer — adapted from the portfolio's DotGrid, scoped to this section.
 */
export function AuthBanner() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [hovering, setHovering] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setPos({ x, y });
      rafRef.current = 0;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    setPos({ x: -9999, y: -9999 });
  }, []);

  return (
    <div
      ref={sectionRef}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative hidden overflow-hidden bg-background lg:block"
    >
      {/* Base wash */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-background to-background" />

      {/* Dot grid — revealed near the cursor */}
      <div
        className="absolute inset-0 transition-[mask-position,-webkit-mask-position] duration-75 ease-out"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--dot-color) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          WebkitMaskImage: `radial-gradient(circle 280px at ${pos.x}px ${pos.y}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle 280px at ${pos.x}px ${pos.y}px, black 0%, transparent 100%)`,
        }}
      />

      {/* Glowing cursor */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovering ? 0.18 : 0,
          background: `radial-gradient(360px circle at ${pos.x}px ${pos.y}px, var(--primary), transparent 65%)`,
        }}
      />

      {/* Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-12 text-center">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight">
          Track your GWA. Anywhere.
        </h2>
        <p className="max-w-sm text-balance text-muted-foreground">
          Create an account to save your subjects and semesters and sync them
          across all your devices.
        </p>
      </div>
    </div>
  );
}
