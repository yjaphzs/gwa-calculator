import type { ReactNode } from "react";

// Shared pieces for the receipt and boarding pass styles: paper, ink, a torn
// edge, a made-up barcode, and dotted "label ...... value" rows.
export const PAPER = "#fffdf5";
export const INK = "#1c1917";
export const FADED = "#6b6560";

/** A clip-path tearing the top and bottom edges, like thermal paper. */
export function tornEdges(width: number, tooth: number): string {
  const top: string[] = [];
  for (let x = 0; x < width; x += tooth * 2) top.push(`${x}px ${tooth}px`, `${Math.min(x + tooth, width)}px 0`);
  top.push(`${width}px ${tooth}px`);
  const bottom: string[] = [];
  for (let x = width; x > 0; x -= tooth * 2) bottom.push(`${x}px calc(100% - ${tooth}px)`, `${Math.max(x - tooth, 0)}px 100%`);
  bottom.push(`0 calc(100% - ${tooth}px)`);
  return `polygon(${[...top, ...bottom].join(", ")})`;
}

/** Decorative bars, not a real code. */
export function Barcode({ height, color = INK }: { height: number; color?: string }) {
  const bars = `${color} 0 4px, transparent 4px 7px, ${color} 7px 9px, transparent 9px 14px, ${color} 14px 20px, transparent 20px 23px`;
  return <div aria-hidden style={{ height, width: "100%", margin: "12px 0", background: `repeating-linear-gradient(90deg, ${bars})` }} />;
}

export function DashedRule({ color = FADED }: { color?: string }) {
  return <div aria-hidden style={{ borderTop: `3px dashed ${color}`, margin: "14px 0" }} />;
}

interface LeaderRowProps {
  left: ReactNode;
  right: ReactNode;
  size: number;
  lineHeight: number;
  bold?: boolean;
}

/** "TOTAL UNITS ........ 21": the label shrinks with an ellipsis, the value never does. */
export function LeaderRow({ left, right, size, lineHeight, bold }: LeaderRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: size, lineHeight, fontWeight: bold ? 800 : 400 }}>
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{left}</span>
      <span aria-hidden style={{ flex: 1, minWidth: 24, borderBottom: `3px dotted ${FADED}`, transform: "translateY(-0.3em)" }} />
      <span style={{ flexShrink: 0 }}>{right}</span>
    </div>
  );
}
