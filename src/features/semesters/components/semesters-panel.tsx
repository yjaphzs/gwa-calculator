import { ArchiveIcon, FilesIcon, Share2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { SemesterCardActions } from "@/features/semesters/components/semester-card";
import { SemesterList } from "@/features/semesters/components/semester-list";
import { SemesterTrendChart } from "@/features/semesters/components/semester-trend-chart";
import { TargetPlanner } from "@/features/semesters/components/target-planner";
import type { Semester } from "@/types";

interface SemestersPanelProps {
  semesters: Semester[];
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  actions: SemesterCardActions;
  onAcademicSummary: () => void;
  /** Opens the share studio on the overall (cumulative) result. */
  onShareOverall: () => void;
  /** Opens the save-semester form for the working subjects. */
  onSaveCurrent: () => void;
  hasCurrentSubjects: boolean;
}

/** The Semesters tab: empty state, or trend + planner + the saved semesters. */
export function SemestersPanel({
  semesters,
  expanded,
  onToggle,
  actions,
  onAcademicSummary,
  onShareOverall,
  onSaveCurrent,
  hasCurrentSubjects,
}: SemestersPanelProps) {
  if (semesters.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ArchiveIcon />
          </EmptyMedia>
          <EmptyTitle>No saved semesters yet</EmptyTitle>
          <EmptyDescription>
            Save your current subjects as a semester to keep each term on record, see your GWA
            trend, and track your cumulative GWA toward Latin honors.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onSaveCurrent} disabled={!hasCurrentSubjects}>
            <ArchiveIcon className="size-4" />
            Save current subjects as a semester
          </Button>
          {!hasCurrentSubjects && (
            <p className="text-xs text-muted-foreground">Add subjects on the Current tab first.</p>
          )}
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="max-md:h-10" onClick={onShareOverall}>
          <Share2Icon className="size-4" />
          Share overall
        </Button>
        <Button variant="outline" size="sm" className="max-md:h-10" onClick={onAcademicSummary}>
          <FilesIcon className="size-4" />
          Academic Summary
        </Button>
      </div>
      <SemesterTrendChart semesters={semesters} />
      <TargetPlanner semesters={semesters} />
      <SemesterList semesters={semesters} expanded={expanded} onToggle={onToggle} actions={actions} />
    </div>
  );
}
