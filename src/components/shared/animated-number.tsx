"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  /** Seconds. */
  duration?: number;
  className?: string;
}

/**
 * A number that rolls to each new value, starting from 0 the first time.
 * Screen readers get only the final value; with reduced motion it just shows it.
 */
export function AnimatedNumber({ value, decimals = 3, duration = 0.6, className }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const [rolling, setRolling] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(from.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        from.current = v;
        setRolling(v);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduceMotion]);

  const shown = reduceMotion ? value : rolling;
  return (
    <span className={className}>
      <span aria-hidden>{shown.toFixed(decimals)}</span>
      <span className="sr-only">{value.toFixed(decimals)}</span>
    </span>
  );
}
