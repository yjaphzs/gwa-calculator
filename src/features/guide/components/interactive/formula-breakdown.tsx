import { HonorBadge } from "@/components/shared/honor-badge";
import { computeGwa, getHonorFor, weightedSum } from "@/lib/academic";
import { describeHonorProgress, honorProgress } from "@/lib/gwa-insights";

interface FormulaBreakdownProps {
  subjects: { grade: number; units: number }[];
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );
}

/** The formula filled in with the current rows, ending in the rounded GWA and honor. */
export function FormulaBreakdown({ subjects }: FormulaBreakdownProps) {
  const { gwa, totalUnits } = computeGwa(subjects);
  const weighted = weightedSum(subjects);
  const honor = getHonorFor(subjects);

  return (
    <div aria-live="polite" className="rounded-lg border border-dashed bg-muted/30 p-4 sm:p-5">
      <dl className="grid gap-1.5">
        <Line label="Σ(grade × units)" value={weighted.toFixed(2)} />
        <Line label="Σ units" value={String(totalUnits)} />
        <Line
          label="Division"
          value={gwa === null ? "N/A" : `${weighted.toFixed(2)} ÷ ${totalUnits} = ${(weighted / totalUnits).toFixed(6)}`}
        />
      </dl>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t pt-4">
        <div>
          <div className="text-sm text-muted-foreground">GWA, rounded</div>
          <div className="font-mono text-4xl font-bold">{gwa === null ? "N/A" : gwa.toFixed(3)}</div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          {honor && <HonorBadge honor={honor} />}
          <span className="text-sm text-muted-foreground">{describeHonorProgress(honorProgress(subjects))}</span>
        </div>
      </div>
    </div>
  );
}
