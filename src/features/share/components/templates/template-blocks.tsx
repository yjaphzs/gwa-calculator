import type { CSSProperties } from "react";

import type { MoodVariant } from "@/features/share/lib/moods";
import type { ShareSubject } from "@/features/share/lib/share-content";
import { LINE, LIST_PAD, SMALL } from "@/features/share/lib/share-layout";

const MONO = "var(--font-mono)";
// Martian Mono is wide: each figure takes about 0.66em after the -0.04em
// tracking, so "1.250" at 300px is ~990px, more than the 900px content box.
const HERO_EM_PER_CHAR = 0.66;
const HERO_MAX_WIDTH = 860;

/** The headline number: always monospaced with tabular figures, like the app. */
export function GwaHero({ gwa, size, variant }: { gwa: number | null; size: number; variant: MoodVariant }) {
  const text = gwa === null ? "N/A" : gwa.toFixed(3);
  const fitted = Math.min(size, Math.floor(HERO_MAX_WIDTH / (text.length * HERO_EM_PER_CHAR)));
  return (
    <div style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 800, fontSize: fitted, lineHeight: 1, letterSpacing: "-0.04em", color: variant.accent, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
}

export function HonorRibbon({ honor, size, pad, variant }: { honor: string; size: number; pad: number; variant: MoodVariant }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: `${pad}px ${pad * 2 + 4}px`, borderRadius: 999, background: variant.accent, color: variant.onAccent, fontSize: size, lineHeight: LINE, fontWeight: 800 }}>
      <span aria-hidden>🏅</span>
      {honor}
    </div>
  );
}

interface SubjectRowsProps {
  rows: ShareSubject[];
  hidden: number;
  showGrades: boolean;
  showTitles: boolean;
  size: number;
  pad: number;
  variant: MoodVariant;
}

/** The chosen subjects, one per row; uncounted ones show their status instead of a grade. */
export function SubjectRows({ rows, hidden, showGrades, showTitles, size, pad, variant }: SubjectRowsProps) {
  const row: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: `${pad}px 0`, fontSize: size, lineHeight: LINE };
  return (
    <div style={{ width: "100%", borderRadius: 32, background: variant.surface, padding: `${LIST_PAD}px 40px` }}>
      {rows.map((s, i) => (
        <div key={s.id} style={{ ...row, borderTop: i ? `2px solid ${variant.muted}33` : "none" }}>
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
            {showTitles ? s.title || s.code : s.code || s.title}
          </span>
          {showGrades && (
            <span style={{ flexShrink: 0, fontFamily: MONO, fontWeight: 800, color: s.counted ? variant.accent : variant.muted }}>
              {s.counted ? s.grade.toFixed(2) : s.status}
            </span>
          )}
        </div>
      ))}
      {hidden > 0 && <div style={{ ...row, justifyContent: "center", color: variant.muted, fontSize: SMALL }}>+{hidden} more</div>}
    </div>
  );
}

/** Each semester's GWA as a line. Lower is better, so the axis is flipped (better = higher). */
export function TrendLine({ points, height, variant }: { points: { label: string; gwa: number }[]; height: number; variant: MoodVariant }) {
  const W = 900;
  const H = height;
  const values = points.map((p) => p.gwa);
  const [lo, hi] = [Math.min(...values), Math.max(...values)];
  const span = Math.max(hi - lo, 0.25);
  const x = (i: number) => 30 + (i * (W - 60)) / Math.max(points.length - 1, 1);
  const y = (g: number) => 24 + ((g - lo) / span) * (H - 48);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.gwa).toFixed(1)}`).join(" ");
  return (
    <div style={{ width: "100%" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
        <path d={path} fill="none" stroke={variant.accent} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={p.label} cx={x(i)} cy={y(p.gwa)} r={12} fill={variant.accent} stroke={variant.onAccent} strokeWidth={5} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 20px 0", color: variant.muted, fontSize: SMALL, lineHeight: LINE }}>
        <span>{points[0].label}</span>
        <span>{points.at(-1)!.label}</span>
      </div>
    </div>
  );
}

/**
 * App credit and the "not official" note, always at the bottom. One line in
 * the app's sans font: the mono and serif moods would wrap it, and the layout
 * budgets one line.
 */
export function TemplateFooter({ host, variant }: { host: string; variant: MoodVariant }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, width: "100%", fontFamily: "var(--font-sans)", fontSize: SMALL, lineHeight: LINE, whiteSpace: "nowrap", color: variant.muted }}>
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", fontWeight: 700 }}>
        GWA Calculator <span style={{ fontWeight: 400 }}>· {host}</span>
      </span>
      <span style={{ flexShrink: 0 }}>Unofficial, just for fun</span>
    </div>
  );
}
