import { HonorBadge } from "@/components/shared/honor-badge";
import { computeGwa, getHonorFor } from "@/lib/academic";
import type { Subject } from "@/types";

/** A saved semester's GWA with its honor badge. */
export function SemesterGwaTile({ subjects }: { subjects: Subject[] }) {
  const { gwa } = computeGwa(subjects);
  const honor = getHonorFor(subjects);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4">
      {honor && <HonorBadge honor={honor} className="mb-2" />}
      <div className="font-mono text-3xl font-bold">{(gwa ?? 0).toFixed(3)}</div>
      <div className="text-sm text-muted-foreground">GWA</div>
    </div>
  );
}
