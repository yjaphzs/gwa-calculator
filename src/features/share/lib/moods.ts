/** The feel of a share template. Each has a few color variants and its own captions (captions.ts). */
export type MoodId = "proud" | "fun" | "chill" | "sad" | "rock" | "cute" | "retro" | "minimal";

export interface MoodVariant {
  label: string;
  /** CSS background for the whole image (gradients and patterns allowed). */
  background: string;
  /** Cards and the subject list. */
  surface: string;
  text: string;
  muted: string;
  /** The GWA, the honor ribbon, highlights. */
  accent: string;
  /** Text on the accent (the honor ribbon). */
  onAccent: string;
}

export interface Mood {
  id: MoodId;
  label: string;
  emoji: string;
  /** The display face: Roboto (sans), Roboto Serif, or Martian Mono. */
  font: "sans" | "serif" | "mono";
  uppercase?: boolean;
  /** Decorations around the edges of the image. */
  stickers: string[];
  variants: MoodVariant[];
}

const v = (label: string, background: string, surface: string, text: string, muted: string, accent: string, onAccent: string): MoodVariant => ({
  label,
  background,
  surface,
  text,
  muted,
  accent,
  onAccent,
});

export const MOODS: Mood[] = [
  {
    id: "proud",
    label: "Proud",
    emoji: "🎓",
    font: "serif",
    stickers: ["🎓", "🏆", "✨", "🎉"],
    variants: [
      v("Gold", "radial-gradient(circle at 50% 0%, #6b4a10 0%, #1c1917 60%)", "rgba(255,255,255,0.06)", "#fff8e7", "#d6c7a1", "#fbbf24", "#1c1917"),
      v("Royal", "linear-gradient(160deg, #0b1d3a 0%, #1e3a8a 100%)", "rgba(255,255,255,0.07)", "#f8fafc", "#bfcbe6", "#facc15", "#0b1d3a"),
    ],
  },
  {
    id: "fun",
    label: "Fun",
    emoji: "🤪",
    font: "sans",
    stickers: ["🤪", "🍕", "🎈", "💥"],
    variants: [
      v("Pop", "repeating-radial-gradient(circle at 0 0, #fde047 0 40px, #facc15 40px 80px)", "rgba(255,255,255,0.75)", "#1f1147", "#5b4a7a", "#db2777", "#ffffff"),
      v("Bubblegum", "linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)", "rgba(255,255,255,0.18)", "#ffffff", "#fdf2f8", "#fef08a", "#4c1d95"),
    ],
  },
  {
    id: "chill",
    label: "Chill",
    emoji: "🌿",
    font: "sans",
    stickers: ["🌿", "☕", "🌙", "🍃"],
    variants: [
      v("Mint", "linear-gradient(180deg, #ecfdf5 0%, #c7ecd9 100%)", "rgba(255,255,255,0.7)", "#12372a", "#3f6b58", "#059669", "#ffffff"),
      v("Dusk", "linear-gradient(180deg, #1e293b 0%, #334155 100%)", "rgba(255,255,255,0.06)", "#e2e8f0", "#a3b1c6", "#7dd3fc", "#0f172a"),
    ],
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "🥲",
    font: "serif",
    stickers: ["🥲", "🌧️", "💧", "🫠"],
    variants: [
      v("Rain", "linear-gradient(180deg, #334155 0%, #64748b 100%)", "rgba(255,255,255,0.08)", "#f1f5f9", "#cbd5e1", "#93c5fd", "#0f172a"),
      v("Blue hour", "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)", "rgba(255,255,255,0.07)", "#e0e7ff", "#a5b4fc", "#c7d2fe", "#1e1b4b"),
    ],
  },
  {
    id: "rock",
    label: "Rock",
    emoji: "🤘",
    font: "mono",
    uppercase: true,
    stickers: ["🤘", "⚡", "🎸", "🔥"],
    variants: [
      v("Stage", "repeating-linear-gradient(-45deg, #0a0a0a 0 28px, #171717 28px 56px)", "rgba(255,255,255,0.05)", "#fafafa", "#a3a3a3", "#ef4444", "#0a0a0a"),
      v("Neon", "radial-gradient(circle at 80% 10%, #1a2e05 0%, #0a0a0a 55%)", "rgba(255,255,255,0.05)", "#fafafa", "#a3a3a3", "#a3e635", "#0a0a0a"),
    ],
  },
  {
    id: "cute",
    label: "Cute",
    emoji: "🌸",
    font: "sans",
    stickers: ["🌸", "🧸", "💖", "⭐"],
    variants: [
      v("Peach", "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)", "rgba(255,255,255,0.8)", "#881337", "#be4a67", "#e11d48", "#ffffff"),
      v("Lavender", "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)", "rgba(255,255,255,0.8)", "#4c1d95", "#7c5bb5", "#7c3aed", "#ffffff"),
    ],
  },
  {
    id: "retro",
    label: "Retro",
    emoji: "📼",
    font: "mono",
    uppercase: true,
    stickers: ["📼", "👾", "🕹️", "🌴"],
    variants: [
      v("Arcade", "repeating-linear-gradient(0deg, rgba(240,171,252,0.12) 0 2px, transparent 2px 60px), repeating-linear-gradient(90deg, rgba(240,171,252,0.12) 0 2px, transparent 2px 60px), #1a1033", "rgba(255,255,255,0.06)", "#fdf4ff", "#d8b4fe", "#22d3ee", "#1a1033"),
      v("Sunset", "linear-gradient(180deg, #fb923c 0%, #db2777 55%, #4c1d95 100%)", "rgba(0,0,0,0.18)", "#fff7ed", "#fed7aa", "#fde68a", "#4c1d95"),
    ],
  },
  {
    id: "minimal",
    label: "Minimal",
    emoji: "▫️",
    font: "sans",
    stickers: [],
    variants: [
      v("Paper", "#fafafa", "#ffffff", "#18181b", "#71717a", "#18181b", "#fafafa"),
      v("Ink", "#18181b", "#27272a", "#fafafa", "#a1a1aa", "#fafafa", "#18181b"),
    ],
  },
];

export const moodById = (id: MoodId): Mood => MOODS.find((m) => m.id === id) ?? MOODS[0];

/**
 * The "My theme" variant every mood gets: a dark card lit by the user's own
 * accent color (the bright dark-mode shade, so it reads on the dark base).
 */
export function themeVariant(accentHex: string): MoodVariant {
  return v(
    "My theme",
    `radial-gradient(circle at 50% 0%, ${accentHex}55 0%, #111111 62%)`,
    "rgba(255,255,255,0.06)",
    "#fafafa",
    "#c4c4c8",
    accentHex,
    "#111111",
  );
}

/** The mood's variants plus "My theme". */
export function variantsFor(mood: Mood, accentHex: string): MoodVariant[] {
  return [...mood.variants, themeVariant(accentHex)];
}
