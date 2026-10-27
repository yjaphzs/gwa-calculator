import { GuideSection } from "@/features/guide/components/guide-section";
import { GuideTable } from "@/features/guide/components/guide-table";
import { CUMULATIVE_EXAMPLE } from "@/features/guide/content/examples";
import { computeGwa } from "@/lib/academic";

export function CumulativeSection() {
  const semesters = CUMULATIVE_EXAMPLE.map((s) => ({ ...s, ...computeGwa(s.subjects) }));
  const semesterGwas = semesters.map((s) => s.gwa ?? 0);
  const plainAverage = semesterGwas.reduce((a, b) => a + b, 0) / semesterGwas.length;
  const cumulative = computeGwa(CUMULATIVE_EXAMPLE.flatMap((s) => s.subjects));

  return (
    <GuideSection id="cumulative" title="Semester GWA vs. cumulative GWA">
      <p>
        A <strong>semester GWA</strong> covers one term. Your <strong>cumulative GWA</strong>{" "}
        covers every subject you've taken, and it's what scholarships and graduation
        honors usually look at. It uses the same formula, applied to all of your subjects at once,
        not an average of your semester GWAs.
      </p>
      <GuideTable
        caption="Cumulative GWA example"
        columns={[{ label: "Semester" }, { label: "Units", numeric: true }, { label: "GWA", numeric: true }]}
        rows={semesters.map((s) => [s.label, s.totalUnits, s.gwa?.toFixed(3)])}
        footer={["Cumulative", cumulative.totalUnits, cumulative.gwa?.toFixed(3)]}
      />
      <p>
        Averaging the two semesters would give {plainAverage.toFixed(3)}, but the second semester
        carries twice the units, so it pulls the true cumulative GWA to{" "}
        <strong className="font-mono">{cumulative.gwa?.toFixed(3)}</strong>. The calculator's
        Academic Summary computes it this way.
      </p>
    </GuideSection>
  );
}
