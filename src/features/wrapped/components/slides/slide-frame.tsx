import type { ReactNode, Ref } from "react";

import { TemplateFooter } from "@/features/share/components/templates/template-blocks";
import { themeVariant } from "@/features/share/lib/moods";
import type { WrappedSummary } from "@/features/wrapped/lib/wrapped";

/** What every Wrapped slide draws from. Slides render at story size (1080×1920), in image pixels. */
export interface SlideProps {
  ref?: Ref<HTMLDivElement>;
  wrapped: WrappedSummary;
  /** The user's scheme accent (its bright shade, for the dark slides). */
  accent: string;
  /** False shows the GWA as "1.**". */
  exact: boolean;
  host: string;
}

/** A dark slide lit by a color from the top. */
export const glow = (color: string) => `radial-gradient(circle at 50% 18%, ${color}66 0%, #0b0b10 62%)`;

export const MONO = "var(--font-mono)";

interface SlideFrameProps {
  ref?: Ref<HTMLDivElement>;
  background: string;
  accent: string;
  kicker: string;
  emoji: string;
  host: string;
  children: ReactNode;
}

/** The shared slide: a kicker up top, the story in the middle, the app's footer at the bottom. */
export function SlideFrame({ ref, background, accent, kicker, emoji, host, children }: SlideFrameProps) {
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: 1080,
        height: 1920,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "220px 90px 90px",
        background,
        color: "#fafafa",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span aria-hidden style={{ position: "absolute", top: 70, right: 80, fontSize: 140, lineHeight: 1, transform: "rotate(10deg)" }}>
        {emoji}
      </span>
      <div style={{ fontSize: 34, lineHeight: 1.2, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
        {kicker}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>{children}</div>
      <div style={{ marginTop: 24 }}>
        <TemplateFooter host={host} variant={themeVariant(accent)} />
      </div>
    </div>
  );
}
