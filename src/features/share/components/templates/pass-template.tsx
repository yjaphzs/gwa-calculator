import { formatDelta } from "@/features/calculator/lib/improvement";
import { Barcode, DashedRule, FADED, INK, PAPER } from "@/features/share/components/templates/style-blocks";
import { TemplateFooter } from "@/features/share/components/templates/template-blocks";
import { TemplateStickers } from "@/features/share/components/templates/template-stickers";
import { TEMPLATE_FONTS, whoLine, type ShareTemplateProps } from "@/features/share/components/templates/template-props";
import { FOOTER_GAP } from "@/features/share/lib/share-layout";
import { FORMAT_SIZE } from "@/features/share/lib/share-options";
import { shareGwa } from "@/features/share/lib/share-text";
import { fitCaption } from "@/features/share/lib/style-layouts";
import { nextStop } from "@/lib/gwa-insights";

// "Airport codes" for each honor band; the full name prints underneath.
const CODES: Record<string, string> = {
  "University Scholar": "UNI",
  "College Scholar": "COL",
  "Dean's Lister": "DEAN",
  "Summa Cum Laude": "SUMMA",
  "Magna Cum Laude": "MAGNA",
  "Cum Laude": "CUM",
};
const PASS = { post: { width: 920, top: 80, bottom: 44 }, story: { width: 940, top: 260, bottom: 90 } };
const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 18, lineHeight: 1.4, color: FADED, letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ ...oneLine, fontSize: 30, lineHeight: 1.3, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

/** The boarding pass style: from this term's GWA to the next honor ("GWA Air"). Just for fun. */
export function PassTemplate(props: ShareTemplateProps) {
  const { ref, content, options, mood, variant, caption, identity, host } = props;
  const { format, show } = options;
  const { width, height } = FORMAT_SIZE[format];
  const size = PASS[format];
  const stop = nextStop(content.gwa, content.scope === "overall");
  const who = whoLine(props);
  // The distance gives the exact GWA away, so it hides with the decimals.
  const distance = stop && show.exact ? `${formatDelta(stop.gap)} to go` : stop ? "Next stop" : "Arrived";
  const captionSize = fitCaption(caption, "mono", size.width - 80, [30, 26, 22, 20], 3);

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
        alignItems: "center",
        padding: `${size.top}px 70px ${size.bottom}px`,
        background: variant.background,
        fontFamily: TEMPLATE_FONTS.mono,
      }}
    >
      {format === "story" && <TemplateStickers stickers={mood.stickers} format={format} />}
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <div style={{ width: size.width, borderRadius: 36, overflow: "hidden", background: PAPER, color: INK, textTransform: "uppercase", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 40px", background: variant.accent, color: variant.onAccent }}>
            <span style={{ fontSize: 34, lineHeight: 1.3, fontWeight: 800 }}>✈ GWA Air</span>
            <span style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "0.12em" }}>Boarding pass</span>
          </div>
          <div style={{ padding: "32px 40px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 20 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, color: FADED, letterSpacing: "0.08em" }}>From</div>
                <div style={{ fontSize: 68, lineHeight: 1.1, fontWeight: 800 }}>{shareGwa(content.gwa, show.exact)}</div>
                <div style={{ ...oneLine, fontSize: 20, lineHeight: 1.4, color: FADED }}>{content.heading}</div>
              </div>
              <div style={{ textAlign: "center", color: FADED }}>
                <div style={{ fontSize: 52, lineHeight: 1, color: INK }}>✈</div>
                <div style={{ fontSize: 18, lineHeight: 1.4, marginTop: 6 }}>{distance}</div>
              </div>
              <div style={{ minWidth: 0, textAlign: "right" }}>
                <div style={{ fontSize: 18, color: FADED, letterSpacing: "0.08em" }}>To</div>
                <div style={{ fontSize: 68, lineHeight: 1.1, fontWeight: 800 }}>{stop ? (CODES[stop.name] ?? stop.name.slice(0, 4)) : "TOP"}</div>
                <div style={{ ...oneLine, fontSize: 20, lineHeight: 1.4, color: FADED }}>{stop ? stop.name : "Already at the top!"}</div>
              </div>
            </div>
            <DashedRule />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
              <Field label="Passenger" value={show.name && identity.name ? identity.name : "Student"} />
              <Field label="Class" value={show.honor && content.honor ? content.honor : "Rising star"} />
              <Field label={show.units ? "Units" : "Subjects"} value={String(show.units ? content.units : content.subjects.length)} />
              <Field label="Boarding" value="Now" />
            </div>
            {who && show.school && (
              <div style={{ ...oneLine, marginTop: 14, fontSize: 22, lineHeight: 1.4, textTransform: "none", color: FADED }}>{who}</div>
            )}
            <DashedRule />
            <div style={{ fontSize: 18, lineHeight: 1.4, color: FADED, letterSpacing: "0.08em" }}>Captain&apos;s note</div>
            <div style={{ fontSize: captionSize, lineHeight: 1.3, fontWeight: 700, overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {caption}
            </div>
          </div>
          <div style={{ borderTop: `4px dashed ${FADED}`, padding: "18px 40px 22px" }}>
            <Barcode height={70} />
            <div style={{ fontSize: 18, lineHeight: 1.4, textAlign: "center", color: FADED }}>Not an official record · not a real ticket</div>
          </div>
        </div>
      </div>
      <div style={{ position: "relative", width: "100%", padding: "0 20px", marginTop: FOOTER_GAP }}>
        <TemplateFooter host={host} variant={variant} />
      </div>
    </div>
  );
}
