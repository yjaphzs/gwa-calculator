import type { Metadata } from "next";

import { FaqJsonLd } from "@/features/guide/components/faq-json-ld";
import { FormulaBlock } from "@/features/guide/components/formula-block";
import { GuideSection } from "@/features/guide/components/guide-section";
import { InteractiveExample } from "@/features/guide/components/interactive/interactive-example";
import { CumulativeSection } from "@/features/guide/components/sections/cumulative-section";
import { ExcludedSubjectsSection } from "@/features/guide/components/sections/excluded-subjects-section";
import { FaqSection } from "@/features/guide/components/sections/faq-section";
import { GradeScaleSection } from "@/features/guide/components/sections/grade-scale-section";
import { GuideCta } from "@/features/guide/components/sections/guide-cta";
import { HonorsSection } from "@/features/guide/components/sections/honors-section";
import { StepsSection } from "@/features/guide/components/sections/steps-section";
import { WhatIsGwaSection } from "@/features/guide/components/sections/what-is-gwa-section";
import { WorkedExampleSection } from "@/features/guide/components/sections/worked-example-section";

const DESCRIPTION =
  "How to compute your General Weighted Average (GWA): the formula, a worked example, a try-it calculator, grade equivalents, honors, and cumulative GWA.";

export const metadata: Metadata = {
  title: "How to Compute Your GWA",
  description: DESCRIPTION,
  alternates: { canonical: "/how-to-compute-gwa/" },
  openGraph: { title: "How to Compute Your GWA", description: DESCRIPTION, url: "/how-to-compute-gwa/" },
};

export default function HowToComputeGwaPage() {
  return (
    <>
      <h1>How to compute your GWA</h1>
      <p className="text-base!">
        Your GWA is the average of your grades, weighted by how many units each subject carries.
        This is the exact formula the calculator uses, worked through step by step, with a
        version you can try yourself.
      </p>
      <FormulaBlock />

      <WhatIsGwaSection />
      <StepsSection />
      <WorkedExampleSection />

      <GuideSection id="try-it" title="Try it yourself">
        <p>
          Change any grade or unit, or add your own subjects, and every part of the formula
          updates. Nothing here is saved.
        </p>
        <InteractiveExample />
      </GuideSection>

      <GradeScaleSection />
      <HonorsSection />
      <CumulativeSection />
      <ExcludedSubjectsSection />
      <FaqSection />
      <FaqJsonLd />
      <GuideCta />
    </>
  );
}
