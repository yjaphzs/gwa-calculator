"use client";

import { useState } from "react";

import { cardLine, localDay, type CardLineState } from "@/features/calculator/lib/card-line";

/** The day's playful line on the GWA card. Tap for another. */
export function CardLine({ state }: { state: CardLineState }) {
  const [day] = useState(() => localDay(new Date()));
  const [offset, setOffset] = useState(0);
  const line = cardLine(state, day, offset);

  return (
    <button
      type="button"
      onClick={() => setOffset((n) => n + 1)}
      className="self-start rounded-sm text-left text-sm italic text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span aria-live="polite">&ldquo;{line}&rdquo;</span>
      <span className="sr-only"> Show another line.</span>
    </button>
  );
}
