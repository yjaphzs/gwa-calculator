import { GuideSection } from "@/features/guide/components/guide-section";

/** The 1.00–5.00 scale as a bar: passing grades on the left, failing on the right. */
function ScaleStrip() {
  return (
    <div className="mt-6" aria-hidden>
      <div className="flex h-2.5 overflow-hidden rounded-full">
        <div className="flex-[2] bg-gradient-to-r from-primary to-primary/25" />
        <div className="flex-[2] bg-muted" />
      </div>
      <div className="mt-2 grid grid-cols-3 font-mono text-xs text-muted-foreground">
        <span>1.00 highest</span>
        <span className="text-center">3.00 lowest pass</span>
        <span className="text-right">5.00 failed</span>
      </div>
    </div>
  );
}

export function WhatIsGwaSection() {
  return (
    <GuideSection id="what-is-gwa" title="What your GWA means">
      <p>
        Your General Weighted Average (GWA) sums up your grades for a semester, or for your whole
        program, as one number. Philippine colleges usually grade from 1.00 to 5.00, where{" "}
        <strong>a lower number is better</strong>: 1.00 is the top grade, 3.00 is usually the
        lowest passing grade, and 5.00 is a failing grade.
      </p>
      <ScaleStrip />
      <p className="sr-only">
        The scale runs from 1.00, the highest grade, through 3.00, the lowest passing grade, to
        5.00, a failing grade.
      </p>
      <p>
        It's <em>weighted</em> because subjects don't count equally. Each grade counts
        in proportion to its units, so a 5-unit major moves your GWA more than a 2-unit PE class.
        A 1.00 in a 3-unit subject and a 2.00 in a 1-unit subject average to 1.25, not 1.50.
      </p>
    </GuideSection>
  );
}
