import { fitCaption } from "@/features/share/lib/style-layouts";
import { MONO, SlideFrame, glow, type SlideProps } from "@/features/wrapped/components/slides/slide-frame";
import { shortYear } from "@/features/wrapped/lib/wrapped";

const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** 1. Hello: the school year, and a little context. */
export function IntroSlide({ ref, wrapped, accent, host }: SlideProps) {
  return (
    <SlideFrame ref={ref} background={glow(accent)} accent={accent} kicker="GWA Wrapped" emoji="🎬" host={host}>
      <div style={{ fontSize: 150, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.02em" }}>
        S.Y.
        <br />
        {shortYear(wrapped.schoolYear)}
      </div>
      <div style={{ fontSize: 56, lineHeight: 1.25, fontWeight: 700 }}>Tara, balikan natin ang school year mo.</div>
      <div style={{ fontSize: 40, lineHeight: 1.3, color: "#c4c4c8" }}>
        {wrapped.terms.length} semesters · {num(wrapped.units)} units
      </div>
    </SlideFrame>
  );
}

/** 2. The load: units and subjects. */
export function LoadSlide({ ref, wrapped, accent, host }: SlideProps) {
  return (
    <SlideFrame ref={ref} background={glow("#6366f1")} accent={accent} kicker="Your load" emoji="📚" host={host}>
      <div style={{ lineHeight: 1 }}>
        <span style={{ fontFamily: MONO, fontSize: 220, fontWeight: 800, color: accent }}>{num(wrapped.units)}</span>
        <span style={{ fontSize: 80, fontWeight: 800 }}> units</span>
      </div>
      <div style={{ fontSize: 56, lineHeight: 1.25, fontWeight: 700 }}>
        {wrapped.subjects} subjects across {wrapped.terms.length} semesters
      </div>
      <div style={{ fontSize: 48, lineHeight: 1.3, fontStyle: "italic", color: "#c4c4c8" }}>
        {wrapped.units >= 40 ? "Grabe, ang bigat ng dinala mo!" : "Kinaya mo lahat 'yan!"}
      </div>
    </SlideFrame>
  );
}

/** 3. The top subject: the best grade of the year. */
export function TopSubjectSlide({ ref, wrapped, accent, host }: SlideProps) {
  const best = wrapped.best;
  const name = best ? best.title || best.code : "";
  const size = fitCaption(name, "sans", 900, [110, 96, 84, 72, 60], 3);
  const extra = wrapped.unos > 1 ? `Plus ${wrapped.unos} unos this year!` : best?.grade === 1 ? "Uno! Ikaw na talaga." : "Ikaw ang bida dito.";

  return (
    <SlideFrame ref={ref} background={glow("#f59e0b")} accent={accent} kicker="Your top subject" emoji="⭐" host={host}>
      {best ? (
        <>
          <div style={{ fontSize: size, lineHeight: 1.1, fontWeight: 900, overflowWrap: "anywhere" }}>{name}</div>
          <div style={{ fontFamily: MONO, fontSize: 200, lineHeight: 1, fontWeight: 800, color: accent }}>{best.grade.toFixed(2)}</div>
          <div style={{ fontSize: 52, lineHeight: 1.3, fontWeight: 700 }}>{extra}</div>
        </>
      ) : (
        <div style={{ fontSize: 72, lineHeight: 1.2, fontWeight: 800 }}>No graded subjects this year yet.</div>
      )}
    </SlideFrame>
  );
}
