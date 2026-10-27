import { GuideSection } from "@/features/guide/components/guide-section";
import { GuideTable } from "@/features/guide/components/guide-table";
import {
  ACADEMIC_HONOR_BANDS,
  HONOR_MIN_UNITS,
  LATIN_HONOR_BANDS,
  type HonorBand,
} from "@/lib/academic";

/** "1.00–1.50" for the top band, "Above 1.50 to 1.75" for the rest (lower bound exclusive). */
function formatBand(band: HonorBand, index: number): string {
  return index === 0
    ? `${band.min.toFixed(2)}–${band.max.toFixed(2)}`
    : `Above ${band.min.toFixed(2)} to ${band.max.toFixed(2)}`;
}

const bandRows = (bands: readonly HonorBand[]) => bands.map((b, i) => [b.name, formatBand(b, i)]);

/** Rendered straight from the calculator's own band tables, so it can't drift. */
export function HonorsSection() {
  return (
    <GuideSection id="honors" title="Honors and the 12-unit rule">
      <p>
        The calculator shows a semester honor only when you've entered at least{" "}
        <strong>{HONOR_MIN_UNITS} units</strong>. A lighter load doesn't qualify, however
        good the grades.
      </p>
      <GuideTable
        caption="Semester honors"
        columns={[{ label: "Semester honor" }, { label: "GWA range", numeric: true }]}
        rows={bandRows(ACADEMIC_HONOR_BANDS)}
      />
      <p>
        Graduation (Latin) honors use your cumulative GWA across every semester. The Academic
        Summary report shows them on your overall standing:
      </p>
      <GuideTable
        caption="Latin honors"
        columns={[{ label: "Latin honor" }, { label: "Cumulative GWA", numeric: true }]}
        rows={bandRows(LATIN_HONOR_BANDS)}
      />
      <p>
        These are the ranges this calculator uses. Schools set their own cutoffs and extra
        requirements (no failing grades, a minimum residency, and so on), so your registrar
        decides who actually receives an honor.
      </p>
    </GuideSection>
  );
}
