"use client";

import { useState } from "react";

import { formatTermLabel, shortTermLabel, sortOldestFirst } from "@/features/semesters/lib/semesters";
import { computeGwa } from "@/lib/academic";
import { HONORS_LINE, trendScale } from "@/lib/trend-geometry";
import type { Semester } from "@/types";

const FRAME = { width: 640, height: 200, pad: { top: 24, right: 16, bottom: 30, left: 40 }, inset: 36 };

/**
 * GWA per saved semester, oldest to newest. Single series, so no legend; 1.00
 * sits at the top. Hover or focus a point for its term and exact GWA.
 */
export function SemesterTrendChart({ semesters }: { semesters: Semester[] }) {
  const [active, setActive] = useState<number | null>(null);

  const points = sortOldestFirst(semesters)
    .map((s) => ({ short: shortTermLabel(s), full: formatTermLabel(s), gwa: computeGwa(s.subjects).gwa }))
    .filter((p): p is { short: string; full: string; gwa: number } => p.gwa !== null);
  if (points.length < 2) return null;

  const { width: W, height: H, pad } = FRAME;
  const { ticks, x, y, showHonorsLine } = trendScale(points.map((p) => p.gwa), FRAME);
  const last = points.length - 1;
  const step = x(1) - x(0); // spacing between points, for the hover hit areas
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p.gwa)}`).join(" ");
  const tip = active === null ? null : points[active];

  return (
    <figure className="rounded-lg border p-4">
      <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">GWA by semester</span>
        <span className="text-xs text-muted-foreground">Lower is better, so 1.00 is at the top</span>
      </figcaption>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`GWA by semester: ${points.map((p) => `${p.full} ${p.gwa.toFixed(3)}`).join(", ")}`}
          onMouseLeave={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="var(--border)" />
              <text x={pad.left - 8} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
                {t.toFixed(2)}
              </text>
            </g>
          ))}
          {showHonorsLine && (
            <g>
              <line x1={pad.left} x2={W - pad.right} y1={y(HONORS_LINE)} y2={y(HONORS_LINE)} stroke="var(--muted-foreground)" strokeOpacity={0.5} />
              <text x={W - pad.right} y={y(HONORS_LINE) - 5} textAnchor="end" className="fill-muted-foreground text-[10px]">
                Honors cutoff
              </text>
            </g>
          )}
          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={pad.top} y2={H - pad.bottom} stroke="var(--muted-foreground)" strokeOpacity={0.4} />
          )}
          <path d={path} fill="none" stroke="var(--chart-line)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={p.full} cx={x(i)} cy={y(p.gwa)} r={active === i ? 6 : 4} fill="var(--chart-line)" stroke="var(--card)" strokeWidth={2} />
          ))}
          {[0, last].map((i) => (
            <text key={i} x={x(i)} y={y(points[i].gwa) - 11} textAnchor="middle" className="fill-foreground font-mono text-[11px] font-bold">
              {points[i].gwa.toFixed(3)}
            </text>
          ))}
          {points.map((p, i) =>
            points.length > 8 && i % 2 === 1 && i !== last ? null : (
              <text key={p.full} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {p.short}
              </text>
            ),
          )}
          {/* Hit areas larger than the marks, one per point. */}
          {points.map((p, i) => (
            <rect
              key={p.full}
              x={x(i) - step / 2}
              y={pad.top}
              width={step}
              height={H - pad.top - pad.bottom}
              fill="transparent"
              tabIndex={0}
              aria-label={`${p.full}: ${p.gwa.toFixed(3)}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="outline-none"
            />
          ))}
        </svg>
        {tip && active !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: `${(x(active) / W) * 100}%`, top: `calc(${(y(tip.gwa) / H) * 100}% - 10px)` }}
          >
            <div className="font-medium whitespace-nowrap">{tip.full}</div>
            <div className="font-mono font-bold">{tip.gwa.toFixed(3)}</div>
          </div>
        )}
      </div>
    </figure>
  );
}
