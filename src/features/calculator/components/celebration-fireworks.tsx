"use client";

import { useReducedMotion } from "motion/react";

import { FireworksBackground } from "@/components/ui/shadcn-io/fireworks-background";

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
      fireworkSpeed={{ min: 8, max: 16 }}
      fireworkSize={{ min: 4, max: 10 }}
      particleSpeed={{ min: 4, max: 14 }}
      particleSize={{ min: 2, max: 10 }}
    />
  );
}
