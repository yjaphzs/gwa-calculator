import { GuideSection } from "@/features/guide/components/guide-section";
import { GuideTable } from "@/features/guide/components/guide-table";
import { OFTEN_EXCLUDED } from "@/features/guide/content/credit-units";

export function ExcludedSubjectsSection() {
  return (
    <GuideSection id="excluded-subjects" title="Subjects that may not count">
      <p>
        Some subjects appear on your records but are left out of the GWA. Policies differ by
        school and curriculum, so check your student handbook before you include them:
      </p>
      <GuideTable
        caption="Subjects often left out of the GWA"
        columns={[{ label: "Subject" }, { label: "Usually" }]}
        rows={OFTEN_EXCLUDED.map((s) => [s.subject, s.usually])}
      />
      <p>
        Marks that aren't grades, like <strong>INC</strong> (incomplete),{" "}
        <strong>DRP</strong> (dropped), and <strong>W</strong> (withdrawn), don't count until
        they're resolved. A failing 5.00 usually does count, with its full units.
      </p>
      <p>
        In the calculator, keep these subjects on your list and set <strong>Counts toward GWA?</strong>{" "}
        to Not counted, INC, DRP, or W. They stay on your records and reports without changing
        your GWA, and you can switch them back once there's a final grade.
      </p>
    </GuideSection>
  );
}
