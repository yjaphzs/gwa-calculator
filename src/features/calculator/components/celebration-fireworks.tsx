"use client";

import { useReducedMotion } from "motion/react";

import { FireworksBackground } from "@/components/ui/shadcn-io/fireworks-background";

// Module constants: these are effect dependencies in FireworksBackground, so
// inline objects would restart the show on every re-render.
const FIREWORK_SPEED = { min: 8, max: 16 };
const FIREWORK_SIZE = { min: 4, max: 10 };
const PARTICLE_SPEED = { min: 4, max: 14 };
const PARTICLE_SIZE = { min: 2, max: 10 };

/**
 * Full-viewport fireworks behind the congratulations dialog. Fixed so it covers
 * the screen wherever you've scrolled, click-through, and skipped entirely for
 * people who prefer reduced motion.
 */
export function CelebrationFireworks({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  if (!active || reduceMotion) return null;

  return (
    <FireworksBackground
      aria-hidden
      className="pointer-events-none fixed inset-0 flex items-center justify-center"
      fireworkSpeed={FIREWORK_SPEED}
      fireworkSize={FIREWORK_SIZE}
      particleSpeed={PARTICLE_SPEED}
      particleSize={PARTICLE_SIZE}
    />
  );
}
