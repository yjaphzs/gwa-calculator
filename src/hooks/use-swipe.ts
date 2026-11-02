"use client";

import { useRef, type PointerEvent } from "react";

export type SwipeDirection = "left" | "right";

/**
 * Sideways swipes (touch, pen, or a mouse drag) on an element. Spread the
 * result on it. `touch-action: pan-y` leaves vertical scrolling to the page,
 * and a swipe only counts when it's mostly horizontal and past `threshold`.
 */
export function useSwipe(onSwipe: (direction: SwipeDirection) => void, threshold = 40) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  return {
    onPointerDown: (e: PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    },
    onPointerUp: (e: PointerEvent) => {
      const from = start.current;
      start.current = null;
      if (!from || from.id !== e.pointerId) return;
      const dx = e.clientX - from.x;
      const dy = e.clientY - from.y;
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      onSwipe(dx < 0 ? "left" : "right");
    },
    onPointerCancel: () => {
      start.current = null;
    },
    style: { touchAction: "pan-y" } as const,
  };
}
