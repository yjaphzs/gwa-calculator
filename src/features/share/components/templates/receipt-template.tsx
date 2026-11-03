import { Barcode, DashedRule, FADED, INK, LeaderRow, PAPER, tornEdges } from "@/features/share/components/templates/style-blocks";
import { TemplateFooter } from "@/features/share/components/templates/template-blocks";
import { TEMPLATE_FONTS, whoLine, type ShareTemplateProps } from "@/features/share/components/templates/template-props";
import { FOOTER_GAP } from "@/features/share/lib/share-layout";
import { FORMAT_SIZE, chosenSubjects } from "@/features/share/lib/share-options";
import { shareGwa } from "@/features/share/lib/share-text";
import { RECEIPT, receiptLayout } from "@/features/share/lib/style-layouts";

const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const text = (size: number, lineHeight = RECEIPT.lineHeight) => ({ fontSize: size, lineHeight });
const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

/** The receipt style: a thermal-paper "student receipt" with subjects as line items. Just for fun. */
export function ReceiptTemplate(props: ShareTemplateProps) {
  const { ref, content, options, variant, caption, host } = props;
  const { format, show } = options;
  const { width, height } = FORMAT_SIZE[format];
  const list = show.subjects ? chosenSubjects(content, options) : [];
  const showHonor = show.honor && !!content.honor;
  const who = whoLine(props);
  const layout = receiptLayout(format, { units: show.units, honor: showHonor, who: !!who, caption, subjects: list.length });
  const paper = RECEIPT.width[format];
  const hidden = list.length - layout.rows;

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
        padding: `${RECEIPT.top[format]}px 60px ${RECEIPT.bottom[format]}px`,
        background: variant.background,
        fontFamily: TEMPLATE_FONTS.mono,
      }}
    >
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.35))" }}>
          <div
            style={{
              width: paper,
              padding: `${RECEIPT.pad + RECEIPT.edge}px ${RECEIPT.pad}px`,
              background: PAPER,
              color: INK,
              textTransform: "uppercase",
              clipPath: tornEdges(paper, RECEIPT.edge),
            }}
          >
            <div style={{ ...text(RECEIPT.title, 1.2), textAlign: "center", fontWeight: 800 }}>GWA Calculator</div>
            <div style={{ ...text(RECEIPT.small), textAlign: "center", color: FADED }}>Student receipt · just for fun</div>
            <div style={{ ...text(RECEIPT.heading), ...oneLine, textAlign: "center" }}>{content.heading}</div>
            <DashedRule />
            {layout.rows > 0 && (
              <>
                {list.slice(0, layout.rows).map((s) => (
                  <LeaderRow
                    key={s.id}
                    left={`${num(s.units)} × ${show.titles ? s.title || s.code : s.code || s.title}`}
                    right={!show.grades ? "✓" : s.counted ? s.grade.toFixed(2) : s.status}
                    size={RECEIPT.text}
                    lineHeight={RECEIPT.lineHeight}
                  />
                ))}
                {hidden > 0 && <div style={{ ...text(RECEIPT.text), color: FADED }}>+{hidden} more</div>}
                <DashedRule />
              </>
            )}
            {show.units && <LeaderRow left="Total units" right={num(content.units)} size={RECEIPT.text} lineHeight={RECEIPT.lineHeight} />}
            <LeaderRow left="GWA" right={shareGwa(content.gwa, show.exact)} size={RECEIPT.gwa} lineHeight={1.2} bold />
            {showHonor && (
              <div style={{ ...text(RECEIPT.text), ...oneLine, textAlign: "center", fontWeight: 800 }}>★ {content.honor} ★</div>
            )}
            <DashedRule />
            <div style={{ ...text(RECEIPT.small), textAlign: "center", color: FADED }}>Cashier&apos;s note:</div>
            <div style={{ ...text(layout.caption, 1.3), textAlign: "center", fontWeight: 700, overflowWrap: "anywhere" }}>{caption}</div>
            {who && (
              <div style={{ ...text(RECEIPT.text), ...oneLine, textAlign: "center", textTransform: "none" }}>Customer: {who}</div>
            )}
            <Barcode height={RECEIPT.barcode} />
            <div style={{ ...text(RECEIPT.text), textAlign: "center" }}>Thank you, come again next sem!</div>
            <div style={{ ...text(RECEIPT.small), textAlign: "center", color: FADED }}>Not an official record</div>
          </div>
        </div>
      </div>
      <div style={{ position: "relative", width: "100%", padding: "0 30px", marginTop: FOOTER_GAP }}>
        <TemplateFooter host={host} variant={variant} />
      </div>
    </div>
  );
}
