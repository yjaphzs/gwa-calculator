import { SemesterCard, type SemesterCardActions } from "@/features/semesters/components/semester-card";
import { sortNewestFirst } from "@/features/semesters/lib/semesters";
import type { Semester } from "@/types";

interface SemesterListProps {
  semesters: Semester[];
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  actions: SemesterCardActions;
}

/** Saved semesters, newest first. */
export function SemesterList({ semesters, expanded, onToggle, actions }: SemesterListProps) {
  return (
    <div className="flex flex-col gap-4">
      {sortNewestFirst(semesters).map((semester) => (
        <SemesterCard
          key={semester.id}
          semester={semester}
          expanded={!!expanded[semester.id]}
          onToggle={onToggle}
          actions={actions}
        />
      ))}
    </div>
  );
}
