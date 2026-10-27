import { GuideSection } from "@/features/guide/components/guide-section";
import { GuideTable } from "@/features/guide/components/guide-table";
import { TYPICAL_UNITS } from "@/features/guide/content/credit-units";
import { GRADE_EQUIVALENTS } from "@/features/guide/content/grade-scale";

/** Typical grade → percentage → meaning, and typical units per subject type. */
export function GradeScaleSection() {
  return (
    <GuideSection id="grade-scale" title="Grades, percentages, and units">
      <p>
        Many schools convert raw percentage scores to the 1.00–5.00 scale like this. Your school
        may draw the lines a little differently, so treat it as a guide and check your student
        handbook.
      </p>
      <GuideTable
        caption="Typical grade equivalents"
        columns={[{ label: "Grade", numeric: true }, { label: "Percentage", numeric: true }, { label: "Meaning" }]}
        rows={GRADE_EQUIVALENTS.map((g) => [g.grade, g.percent ?? "None", g.meaning])}
      />
      <h3>Typical units per subject</h3>
      <p>Units usually follow contact hours per week. These are common loads:</p>
      <GuideTable
        caption="Typical credit units"
        columns={[{ label: "Subject type" }, { label: "Units", numeric: true }, { label: "Note" }]}
        rows={TYPICAL_UNITS.map((u) => [u.kind, u.units, u.note])}
      />
    </GuideSection>
  );
}
