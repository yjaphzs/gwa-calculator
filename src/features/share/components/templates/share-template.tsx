import type { Ref } from "react";

import { GwaHero, HonorRibbon, SubjectRows, TemplateFooter, TrendLine } from "@/features/share/components/templates/template-blocks";
import { TemplateStickers } from "@/features/share/components/templates/template-stickers";
import type { Mood, MoodVariant } from "@/features/share/lib/moods";
import type { ShareContent } from "@/features/share/lib/share-content";
import { CAPTION_LINE, FOOTER_GAP, LINE, SIDE, WHO, templateLayout } from "@/features/share/lib/share-layout";
import { FORMAT_SIZE, chosenSubjects, type ShareOptions } from "@/features/share/lib/share-options";
import { shareGwa } from "@/features/share/lib/share-text";

const FONTS = { sans: "var(--font-sans)", serif: "var(--font-serif)", mono: "var(--font-mono)" };

export interface ShareTemplateProps {
  ref?: Ref<HTMLDivElement>;
  content: ShareContent;
  options: ShareOptions;
  mood: Mood;
  variant: MoodVariant;
  caption: string;
  identity: { name?: string | null; school?: string | null };
  host: string;
}

/**
 * The share image at its real size (1080 wide). The preview scales this same
 * element down with CSS, and the export captures it as-is, so what you see is
 * what gets shared. Inline styles: every size is in image pixels.
 */
export function ShareTemplate({ ref, content, options, mood, variant, caption, identity, host }: ShareTemplateProps) {
  const { width, height } = FORMAT_SIZE[options.format];
  const list = chosenSubjects(content, options);
  const showHonor = options.show.honor && !!content.honor;
  const showTrend = options.show.trend && content.trend.length >= 2;
  const who = [options.show.name && identity.name, options.show.school && identity.school].filter(Boolean).join(" · ");
  const { sizes: z, rows } = templateLayout(options.format, {
    honor: showHonor,
    units: options.show.units,
    trend: showTrend,
    who: !!who,
    subjects: list.length,
  });

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: `${z.top}px ${SIDE}px ${z.bottom}px`,
        background: variant.background,
        color: variant.text,
        fontFamily: FONTS[mood.font],
        textTransform: mood.uppercase ? "uppercase" : "none",
      }}
    >
      <TemplateStickers stickers={mood.stickers} format={options.format} />
      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: z.gap, textAlign: "center" }}>
        <div style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: z.heading, lineHeight: LINE, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: variant.muted }}>
          {content.heading}
        </div>
        <GwaHero text={shareGwa(content.gwa, options.show.exact)} size={z.hero} variant={variant} />
        {showHonor && <HonorRibbon honor={content.honor!} size={z.ribbon} pad={z.ribbonPad} variant={variant} />}
        {options.show.units && (
          <div style={{ fontSize: z.units, lineHeight: LINE, color: variant.muted }}>{content.units} units</div>
        )}
        <div style={{ maxWidth: 880, fontSize: z.caption, fontWeight: 800, lineHeight: CAPTION_LINE }}>{caption}</div>
        {showTrend && <TrendLine points={content.trend} height={z.trend} variant={variant} />}
        {rows > 0 && (
          <SubjectRows
            rows={list.slice(0, rows)}
            hidden={list.length - rows}
            showGrades={options.show.grades}
            showTitles={options.show.titles}
            size={z.row}
            pad={z.rowPad}
            variant={variant}
          />
        )}
        {who && <div style={{ fontSize: WHO, lineHeight: LINE, color: variant.muted, textTransform: "none" }}>{who}</div>}
      </div>
      <div style={{ position: "relative", marginTop: FOOTER_GAP, textTransform: "none" }}>
        <TemplateFooter host={host} variant={variant} />
      </div>
    </div>
  );
}
