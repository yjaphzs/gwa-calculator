import { GuideSection } from "@/features/guide/components/guide-section";
import { GuideTable } from "@/features/guide/components/guide-table";
import { WORKED_EXAMPLE } from "@/features/guide/content/examples";
import { computeGwa, getHonorFor } from "@/lib/academic";

/** A thin bar showing how much of the total load one subject carries. */
function WeightBar({ share }: { share: number }) {
  // Two decimals keep the shares summing to exactly 100% (e.g. 18.75% + 25%).
  const percent = Number((share * 100).toFixed(2));
  return (
    <span className="flex items-center justify-end gap-2">
      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block" aria-hidden>
        <span className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </span>
      <span className="w-14 text-right">{percent}%</span>
    </span>
  );
}

export function WorkedExampleSection() {
  const subjects = [...WORKED_EXAMPLE];
  const { gwa, totalUnits } = computeGwa(subjects);
  const weightedTotal = subjects.reduce((sum, s) => sum + s.grade * s.units, 0);
  const honor = getHonorFor(subjects);

  return (
    <GuideSection id="worked-example" title="A worked example">
      <p>
        Here are five subjects from one semester. The weight column shows each subject's share
        of the total units. The 4-unit physics class counts for the most.
      </p>
      <GuideTable
        caption="Worked GWA example"
        columns={[
          { label: "Subject" },
          { label: "Units", numeric: true },
          { label: "Grade", numeric: true },
          { label: "Grade × units", numeric: true },
          { label: "Weight", numeric: true },
        ]}
        rows={subjects.map((s) => [
          s.title,
          s.units,
          s.grade.toFixed(2),
          (s.grade * s.units).toFixed(2),
          <WeightBar key="w" share={s.units / totalUnits} />,
        ])}
        footer={["Total", totalUnits, "", weightedTotal.toFixed(2), "100%"]}
      />
      <p>
        Divide the totals: <strong className="font-mono">{weightedTotal.toFixed(2)} ÷ {totalUnits}</strong>{" "}
        = {(weightedTotal / totalUnits).toFixed(6)}, which rounds to a GWA of{" "}
        <strong className="font-mono">{gwa?.toFixed(3)}</strong>. With {totalUnits} units, more
        than the 12 needed for honors, that semester earns <strong>{honor}</strong> standing.
      </p>
    </GuideSection>
  );
}
