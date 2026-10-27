import { escapeHtml } from "@/features/reports/lib/format";

/** Label/value rows for the student details; rows with no value are omitted. */
export function renderStudentBlock(rows: Array<[label: string, value: string | null | undefined]>): string {
  const items = rows
    .filter((row): row is [string, string] => !!row[1]?.trim())
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("");
  return items ? `<dl class="meta">${items}</dl>` : "";
}

export interface StatTile {
  label: string;
  value: string;
  note?: string;
  /** The headline figure: larger, with the amber accent. */
  hero?: boolean;
  /** Words rather than a figure (e.g. an honor name). */
  text?: boolean;
}

/** Row of headline figures under the header. Values are escaped here. */
export function renderStatTiles(tiles: StatTile[]): string {
  const cells = tiles
    .map((tile) => {
      const tileClass = tile.hero ? "tile tile--hero" : "tile";
      const valueClass = tile.text ? "tile-value tile-value--text" : "tile-value mono";
      const note = tile.note ? `<div class="tile-note">${escapeHtml(tile.note)}</div>` : "";
      return `<div class="${tileClass}"><div class="tile-label">${escapeHtml(tile.label)}</div><div class="${valueClass}">${escapeHtml(tile.value)}</div>${note}</div>`;
    })
    .join("");
  return `<div class="tiles">${cells}</div>`;
}

export function renderHonorPill(honor: string | null): string {
  return honor ? `<span class="honor">${escapeHtml(honor)}</span>` : "";
}

/** Section heading with a right-aligned summary (units, GWA, honor). */
export function renderSectionHead(title: string, metaHtml = ""): string {
  return `<div class="section-head"><h2 class="section-title">${escapeHtml(title)}</h2><div class="section-meta">${metaHtml}</div></div>`;
}

interface CumulativePanelOptions {
  gwa: string;
  units: string;
  subjectCount: number;
  honor: string | null;
}

/** Closing panel of the Academic Summary: the cumulative GWA and Latin honor. */
export function renderCumulativePanel({ gwa, units, subjectCount, honor }: CumulativePanelOptions): string {
  return `
<section class="panel">
  <div>
    <h2 class="panel-title">Cumulative standing</h2>
    <p class="panel-text">${subjectCount} counted subjects and ${escapeHtml(units)} units, each grade weighted by its units.</p>
  </div>
  <div class="panel-figure">
    <div class="panel-gwa mono">${escapeHtml(gwa)}</div>
    ${renderHonorPill(honor)}
  </div>
</section>`;
}
