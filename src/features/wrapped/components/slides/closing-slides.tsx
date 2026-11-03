import { formatDelta } from "@/features/calculator/lib/improvement";
import { shareGwa } from "@/features/share/lib/share-text";
import { MONO, SlideFrame, glow, type SlideProps } from "@/features/wrapped/components/slides/slide-frame";
import { shortYear, type WrappedTerm } from "@/features/wrapped/lib/wrapped";

const MUTED = "#c4c4c8";

/** One bar per term; a better (lower) GWA stands taller. No numbers, so it never gives the GWA away. */
function TermBars({ terms, accent }: { terms: WrappedTerm[]; accent: string }) {
  const height = (gwa: number | null) => (gwa === null ? 40 : Math.max(60, 360 - (gwa - 1) * 150));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 32, height: 420 }}>
      {terms.map((t) => (
        <div key={t.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: "100%", height: height(t.gwa), borderRadius: 24, background: accent }} />
          <div style={{ fontSize: 28, lineHeight: 1.2, color: MUTED, whiteSpace: "nowrap" }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

/** 4. The glow-up: the biggest jump between terms, and the year against the last one. */
export function GlowUpSlide({ ref, wrapped, accent, host }: SlideProps) {
  const jump = wrapped.bestJump;
  return (
    <SlideFrame ref={ref} background={glow("#10b981")} accent={accent} kicker="Your glow-up" emoji="📈" host={host}>
      {jump ? (
        <>
          <div style={{ lineHeight: 1 }}>
            <span style={{ fontFamily: MONO, fontSize: 200, fontWeight: 800, color: accent }}>{formatDelta(jump.delta)}</span>
            <span style={{ fontSize: 80, fontWeight: 800 }}> better</span>
          </div>
          <div style={{ fontSize: 48, lineHeight: 1.3, color: MUTED }}>
            {jump.from} → {jump.to}. Gumanda ang laro mo!
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 160, lineHeight: 1, fontWeight: 900 }}>Steady</div>
          <div style={{ fontSize: 52, lineHeight: 1.3, fontWeight: 700 }}>Consistent all year, and that counts.</div>
        </>
      )}
      <TermBars terms={wrapped.terms} accent={accent} />
      {wrapped.versusLastYear !== null && wrapped.versusLastYear > 0 && (
        <div style={{ fontSize: 44, lineHeight: 1.3, fontWeight: 700 }}>{formatDelta(wrapped.versusLastYear)} better than last school year</div>
      )}
    </SlideFrame>
  );
}

/** 5. Honors earned, term by term, and the Latin honor track. */
export function HonorsSlide({ ref, wrapped, accent, host }: SlideProps) {
  const honored = wrapped.terms.filter((t) => t.honor);
  return (
    <SlideFrame ref={ref} background={glow("#f43f5e")} accent={accent} kicker="Your honors" emoji="🏅" host={host}>
      {honored.length > 0 ? (
        <>
          <div style={{ lineHeight: 1 }}>
            <span style={{ fontFamily: MONO, fontSize: 220, fontWeight: 800, color: accent }}>{honored.length}</span>
            <span style={{ fontSize: 80, fontWeight: 800 }}> honor{honored.length === 1 ? "" : "s"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {honored.map((t) => (
              <div key={t.label} style={{ display: "flex", justifyContent: "space-between", gap: 24, padding: "22px 32px", borderRadius: 28, background: "rgba(255,255,255,0.08)", fontSize: 40, lineHeight: 1.2 }}>
                <span style={{ color: MUTED, whiteSpace: "nowrap" }}>{t.label}</span>
                <span style={{ fontWeight: 800, textAlign: "right" }}>{t.honor}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 120, lineHeight: 1.05, fontWeight: 900 }}>Wala pang honors</div>
          <div style={{ fontSize: 52, lineHeight: 1.3, fontWeight: 700 }}>Pero ang mahalaga, tuloy ang laban.</div>
        </>
      )}
      {wrapped.latin && <div style={{ fontSize: 44, lineHeight: 1.3, color: MUTED }}>Overall: {wrapped.latin} so far</div>}
    </SlideFrame>
  );
}

/** 6. The summary card: the one most people will share. */
export function SummarySlide({ ref, wrapped, accent, exact, host }: SlideProps) {
  const stats = [
    { label: "Units", value: String(wrapped.units) },
    { label: "Subjects", value: String(wrapped.subjects) },
    { label: "Honors", value: String(wrapped.terms.filter((t) => t.honor).length) },
    { label: "Top grade", value: wrapped.best ? wrapped.best.grade.toFixed(2) : "N/A" },
  ];
  return (
    <SlideFrame ref={ref} background={glow(accent)} accent={accent} kicker={`S.Y. ${shortYear(wrapped.schoolYear)} Wrapped`} emoji="🎉" host={host}>
      <div>
        <div style={{ fontSize: 40, lineHeight: 1.2, color: MUTED }}>GWA this school year</div>
        <div style={{ fontFamily: MONO, fontSize: 220, lineHeight: 1.1, fontWeight: 800, color: accent }}>{shareGwa(wrapped.gwa, exact)}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ padding: "28px 32px", borderRadius: 32, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 30, lineHeight: 1.2, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 76, lineHeight: 1.2, fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 52, lineHeight: 1.3, fontWeight: 700 }}>See you next school year!</div>
    </SlideFrame>
  );
}
