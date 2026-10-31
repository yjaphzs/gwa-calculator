"use client";

import type { RefObject } from "react";
import { ArchiveIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { GwaCelebrationDialog } from "@/features/calculator/components/toolbar/gwa-celebration-dialog";
import type { ShareOptions } from "@/features/share/lib/share-options";
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
  /** Opens the share studio; the celebration presets a mood. */
  onShare: (preset?: Partial<ShareOptions>) => void;
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

  const menu = { actions, hasSemesters, autosave, onAutosaveChange };

  return (
    <>
      {/*
        Desktop: celebration + button row. Phones only show this row when it has
        something marked data-phone-row (Save as semester, the celebration);
        Add is the floating button and the rest lives in the "⋯" sheet.
      */}
      <div className="hidden w-full flex-wrap items-center justify-end gap-2 has-data-phone-row:flex md:flex">
        {totalUnits >= HONOR_MIN_UNITS && (
          // Phones only: the desktop button group below is hidden there.
          <Button variant="outline" className="h-10 md:hidden" data-phone-row onClick={actions.onSaveSemester}>
            <ArchiveIcon className="size-4" />
            Save as semester
          </Button>
        )}
        <GwaCelebrationDialog
          gwa={gwa}
          honor={honor}
          totalUnits={totalUnits}
          open={celebration.open}
          onOpenChange={celebration.onOpenChange}
          onShare={() => actions.onShare({ mood: honor ? "proud" : "chill" })}
        />
        <ButtonGroup className="hidden md:flex">
          {totalUnits >= HONOR_MIN_UNITS && (
            <Button variant="outline" onClick={actions.onSaveSemester}>
              <ArchiveIcon className="size-4" />
              Save as semester
            </Button>
          )}
          <Button variant="outline" onClick={actions.onAdd}>
            <PlusIcon className="size-4" />
            Add
          </Button>
          <ResetSubjectsDialog onConfirm={actions.onReset} />
          <SubjectsMoreMenu variant="menu" {...menu} />
        </ButtonGroup>
      </div>
      <SubjectsSearchBar
        filter={filter}
        searchInputRef={searchInputRef}
        trailing={
          <div className="md:hidden">
            <SubjectsMoreMenu variant="sheet" {...menu} />
          </div>
        }
      />
    </>
  );
}
