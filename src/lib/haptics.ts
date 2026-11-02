// Short vibrations for the moments that matter. Only Android browsers vibrate
// (iPhones ignore the API), and people who ask for reduced motion get none.
const PATTERNS = {
  tap: 10,
  save: 25,
  honor: [30, 60, 30],
  badge: [20, 40, 20, 40, 60],
} satisfies Record<string, VibratePattern>;

export type Buzz = keyof typeof PATTERNS;

export function buzz(kind: Buzz): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    // Blocked (no recent tap, or a permissions policy): stay quiet.
  }
}
