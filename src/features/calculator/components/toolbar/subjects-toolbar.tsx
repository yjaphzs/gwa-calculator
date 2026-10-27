"use client";

import type { RefObject } from "react";
import { ArchiveIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { GwaCelebrationDialog } from "@/features/calculator/components/toolbar/gwa-celebration-dialog";
import { ResetSubjectsDialog } from "@/features/calculator/components/toolbar/reset-subjects-dialog";
import { SubjectsEmptyState } from "@/features/calculator/components/toolbar/subjects-empty-state";
import { SubjectsMoreMenu } from "@/features/calculator/components/toolbar/subjects-more-menu";
import { SubjectsSearchBar } from "@/features/calculator/components/toolbar/subjects-search-bar";
import type { SubjectFilter } from "@/features/calculator/hooks/use-subject-filter";
import { HONOR_MIN_UNITS } from "@/lib/academic";

export interface SubjectsToolbarActions {
  onAdd: () => void;
  onReset: () => void;
  onSaveSemester: () => void;
  onImport: () => void;
  onExport: () => void;
  onQrTransfer?: () => void;
  onSemesterReport: () => void;
  onAcademicSummary: () => void;
  onSave: () => void;
}

interface SubjectsToolbarProps {
  subjectCount: number;
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
}

/** Actions above the subject list, or the empty state when there are none. */
export function SubjectsToolbar({
  subjectCount,
  hasSemesters,
  gwa,
  honor,
  totalUnits,
  celebration,
  actions,
  autosave,
  onAutosaveChange,
  filter,
  searchInputRef,
}: SubjectsToolbarProps) {
  if (subjectCount === 0) {
    return (
      <SubjectsEmptyState
        hasSemesters={hasSemesters}
        onAdd={actions.onAdd}
        onImport={actions.onImport}
        onQrTransfer={actions.onQrTransfer}
      />
    );
  }

  return (
    <>
      {/* Wraps on narrow screens: the celebration button takes its own row. */}
      <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <GwaCelebrationDialog
            gwa={gwa}
            honor={honor}
            totalUnits={totalUnits}
            open={celebration.open}
            onOpenChange={celebration.onOpenChange}
          />
          <ButtonGroup>
            {totalUnits >= HONOR_MIN_UNITS && (
              <Button variant="outline" onClick={actions.onSaveSemester}>
                <ArchiveIcon className="size-4" />
                <span className="hidden sm:inline">Save as semester</span>
                <span className="sm:hidden">Save</span>
              </Button>
            )}
            <Button variant="outline" onClick={actions.onAdd}>
              <PlusIcon className="size-4" />
              Add
            </Button>
            <ResetSubjectsDialog onConfirm={actions.onReset} />
            <SubjectsMoreMenu
              actions={actions}
              hasSemesters={hasSemesters}
              autosave={autosave}
              onAutosaveChange={onAutosaveChange}
            />
          </ButtonGroup>
      </div>
      <SubjectsSearchBar filter={filter} searchInputRef={searchInputRef} />
    </>
  );
}
