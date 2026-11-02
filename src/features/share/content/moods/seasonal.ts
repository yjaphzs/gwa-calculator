import { v, type Mood } from "@/features/share/lib/mood-types";

/** Moods offered only in their season (see lib/seasons.ts). */
export const SEASONAL_MOODS: Mood[] = [
  {
    id: "pasko",
    label: "Pasko",
    emoji: "🎄",
    font: "serif",
    season: "pasko",
    stickers: ["🎄", "🎁", "⭐", "⛄"],
    variants: [
      v("Noche Buena", "radial-gradient(circle at 50% 0%, #b91c1c 0%, #14532d 70%)", "rgba(255,255,255,0.08)", "#fff7ed", "#fecaca", "#fde047", "#14532d"),
      v("Parol", "radial-gradient(circle at 50% 10%, #1e3a8a 0%, #0b1026 65%)", "rgba(255,255,255,0.07)", "#f8fafc", "#c7d2fe", "#fbbf24", "#0b1026"),
    ],
  },
  {
    id: "valentines",
    label: "Valentine's",
    emoji: "💘",
    font: "sans",
    season: "valentines",
    stickers: ["💘", "🌹", "💌", "💕"],
    variants: [
      v("Sweetheart", "linear-gradient(160deg, #fb7185 0%, #be123c 100%)", "rgba(255,255,255,0.16)", "#ffffff", "#ffe4e6", "#fff1f2", "#be123c"),
      v("Rosé", "linear-gradient(180deg, #fff1f2 0%, #fecdd3 100%)", "rgba(255,255,255,0.75)", "#881337", "#be123c", "#e11d48", "#ffffff"),
    ],
  },
  {
    id: "recognition",
    label: "Recognition",
    emoji: "🏅",
    font: "serif",
    season: "recognition",
    stickers: ["🏅", "🎓", "🌟", "🎖️"],
    variants: [
      v("Toga", "linear-gradient(160deg, #111827 0%, #1f2937 100%)", "rgba(255,255,255,0.06)", "#f9fafb", "#d1d5db", "#facc15", "#111827"),
      v("Ribbon", "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)", "rgba(255,255,255,0.8)", "#422006", "#854d0e", "#b45309", "#ffffff"),
    ],
  },
  {
    id: "spooky",
    label: "Spooky",
    emoji: "🎃",
    font: "sans",
    season: "spooky",
    stickers: ["🎃", "👻", "🦇", "🕸️"],
    variants: [
      v("Pumpkin", "radial-gradient(circle at 50% 0%, #431407 0%, #0c0a09 65%)", "rgba(255,255,255,0.05)", "#fafaf9", "#d6d3d1", "#fb923c", "#0c0a09"),
      v("Ghost", "linear-gradient(180deg, #2e1065 0%, #0f0a1f 100%)", "rgba(255,255,255,0.06)", "#f5f3ff", "#c4b5fd", "#e9d5ff", "#2e1065"),
    ],
  },
];
