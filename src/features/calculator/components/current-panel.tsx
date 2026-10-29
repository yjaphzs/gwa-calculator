import type { RefObject } from "react";

import { AddSubjectFab } from "@/features/calculator/components/add-subject-fab";
import { GwaSummary } from "@/features/calculator/components/gwa-summary";
import { SubjectsList } from "@/features/calculator/components/subjects-list";
import {
  SubjectsToolbar,
  type SubjectsToolbarActions,
} from "@/features/calculator/components/toolbar/subjects-toolbar";
import type { SubjectFilter } from "@/features/calculator/hooks/use-subject-filter";
import type { Subject } from "@/types";

interface CurrentPanelProps {
  subjects: Subject[];
  hasSemesters: boolean;
  gwa: number | null;
  honor: string | null;
  totalUnits: number;
  celebration: { open: boolean; onOpenChange: (open: boolean) => void };
  actions: SubjectsToolbarActions;
  autosave: boolean;
  onAutosaveChange: (enabled: boolean) => void;
  filter: SubjectFilter;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

/** The Current tab: GWA card, toolbar, and the working subjects. */
export function CurrentPanel({ subjects, gwa, honor, totalUnits, onEdit, onDelete, ...toolbar }: CurrentPanelProps) {
  return (
    <>
      <GwaSummary subjects={subjects} gwa={gwa} honor={honor} totalUnits={totalUnits} />
      {/* Bottom padding on phones keeps the last row clear of the floating Add button. */}
      <div className="mt-8 flex flex-col gap-4 pb-16 md:pb-0">
        <SubjectsToolbar
          subjectCount={subjects.length}
          gwa={gwa}
          honor={honor}
          totalUnits={totalUnits}
          {...toolbar}
        />
        <SubjectsList subjects={subjects} filter={toolbar.filter} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <AddSubjectFab onAdd={toolbar.actions.onAdd} />
    </>
  );
}
