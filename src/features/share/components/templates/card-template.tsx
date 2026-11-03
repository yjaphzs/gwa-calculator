import { TemplateFooter } from "@/features/share/components/templates/template-blocks";
import { TemplateStickers } from "@/features/share/components/templates/template-stickers";
import { TEMPLATE_FONTS, type ShareTemplateProps } from "@/features/share/components/templates/template-props";
import { FOOTER_GAP } from "@/features/share/lib/share-layout";
import { FORMAT_SIZE } from "@/features/share/lib/share-options";
import { shareGwa } from "@/features/share/lib/share-text";
import { fitCaption } from "@/features/share/lib/style-layouts";
import { honorStars } from "@/lib/gwa-insights";

// Card sizes per format, in image pixels. The art window takes whatever height is left.
const CARD = {
  post: { width: 860, height: 1130, top: 60, bottom: 44, emoji: 200, gwa: 64 },
  story: { width: 900, height: 1440, top: 250, bottom: 90, emoji: 280, gwa: 76 },
};
const FRAME = 20;
const PAD = 30;
const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

/** The trading card style: GWA as power, honor as rarity, earned badges as moves. Just for fun. */
export function CardTemplate(props: ShareTemplateProps) {
  const { ref, content, options, mood, variant, caption, identity, host, badges } = props;
  const { format, show } = options;
  const { width, height } = FORMAT_SIZE[format];
  const size = CARD[format];
  const stars = show.honor ? honorStars(content.honor) : 0;
  const name = show.name && identity.name ? identity.name : content.heading;
  const inner = size.width - 2 * (FRAME + PAD);
  const captionSize = fitCaption(caption, mood.font, inner, [34, 30, 26, 22], 3);
  const stats = [
    show.units ? { label: "Units", value: String(content.units) } : null,
    { label: "Subjects", value: String(content.subjects.filter((s) => s.counted).length) },
    { label: "Badges", value: String(badges.length) },
  ].filter((s) => s !== null);

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
        padding: `${size.top}px 90px ${size.bottom}px`,
        background: variant.background,
        color: variant.text,
        fontFamily: TEMPLATE_FONTS[mood.font],
      }}
    >
      {format === "story" && <TemplateStickers stickers={mood.stickers} format={format} />}
      <div
        style={{
          position: "relative",
          width: size.width,
          height: size.height,
          padding: FRAME,
          borderRadius: 44,
          background: `linear-gradient(135deg, ${variant.accent} 0%, ${variant.accent} 42%, #ffffffaa 50%, ${variant.accent} 58%, ${variant.accent} 100%)`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 18, padding: PAD, borderRadius: 28, background: variant.background }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div style={{ ...oneLine, flex: 1, fontSize: 40, lineHeight: 1.2, fontWeight: 800 }}>{name}</div>
            <div style={{ textAlign: "right", lineHeight: 1 }}>
              <div style={{ fontSize: 20, color: variant.muted, letterSpacing: "0.1em" }}>GWA</div>
              <div style={{ fontFamily: TEMPLATE_FONTS.mono, fontSize: size.gwa, fontWeight: 800, color: variant.accent }}>
                {shareGwa(content.gwa, show.exact)}
              </div>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              flex: 1,
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              border: `6px solid ${variant.accent}`,
              background: `radial-gradient(circle at 50% 45%, ${variant.accent}55 0%, transparent 65%), ${variant.surface}`,
            }}
          >
            <span style={{ fontSize: size.emoji, lineHeight: 1 }}>{mood.stickers[0] ?? mood.emoji}</span>
            {stars > 0 && (
              <span style={{ position: "absolute", top: 14, right: 20, fontSize: 40, color: variant.accent }}>{"★".repeat(stars)}</span>
            )}
            <span style={{ position: "absolute", left: 18, bottom: 14, fontSize: 22, padding: "4px 14px", borderRadius: 999, background: variant.accent, color: variant.onAccent }}>
              {mood.label} type
            </span>
          </div>
          <div style={{ ...oneLine, fontSize: 30, lineHeight: 1.3, fontWeight: 700 }}>
            {show.honor && content.honor ? content.honor : "Rising star"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {badges.length === 0 && <div style={{ fontSize: 24, lineHeight: 1.3, color: variant.muted }}>No moves yet. Save semesters to earn badges.</div>}
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, flexShrink: 0, borderRadius: 999, background: variant.accent, color: variant.onAccent }}>
                    <Icon width={28} height={28} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...oneLine, fontSize: 28, lineHeight: 1.2, fontWeight: 700 }}>{badge.name}</div>
                    <div style={{ ...oneLine, fontSize: 20, lineHeight: 1.3, color: variant.muted }}>{badge.hint}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ flex: 1, padding: "10px 0", borderRadius: 16, background: variant.surface, textAlign: "center" }}>
                <div style={{ fontSize: 18, lineHeight: 1.3, color: variant.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
                <div style={{ fontFamily: TEMPLATE_FONTS.mono, fontSize: 36, lineHeight: 1.2, fontWeight: 800 }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              paddingTop: 14,
              borderTop: `2px solid ${variant.muted}55`,
              fontSize: captionSize,
              lineHeight: 1.25,
              fontStyle: "italic",
              textAlign: "center",
              overflowWrap: "anywhere",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {caption}
          </div>
        </div>
      </div>
      <div style={{ position: "relative", width: "100%", marginTop: FOOTER_GAP, textTransform: "none" }}>
        <TemplateFooter host={host} variant={variant} />
      </div>
    </div>
  );
}
