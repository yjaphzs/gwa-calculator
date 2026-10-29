"use client";

import { useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";

import { ResponsiveMenu } from "@/components/shared/responsive-menu";
import { Button } from "@/components/ui/button";
import { ResetSubjectsDialog } from "@/features/calculator/components/toolbar/reset-subjects-dialog";
import type { SubjectsToolbarActions } from "@/features/calculator/components/toolbar/subjects-toolbar";
import { buildSubjectMenuGroups } from "@/features/calculator/lib/subject-menu-groups";

interface SubjectsMoreMenuProps {
  actions: SubjectsToolbarActions;
  hasSemesters: boolean;
  autosave: boolean;
  onAutosaveChange: (enabled: boolean) => void;
  /** "menu" sits in the desktop toolbar; "sheet" is the phone's only toolbar, so it also offers Reset. */
  variant: "menu" | "sheet";
}

/** The "⋯" menu: save semester, import/export, reports, save + autosave. */
export function SubjectsMoreMenu({ variant, ...options }: SubjectsMoreMenuProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const sheet = variant === "sheet";
  const groups = buildSubjectMenuGroups({
    ...options,
    onRequestReset: sheet ? () => setResetOpen(true) : undefined,
  });

  return (
    <>
      <ResponsiveMenu
        mode={variant}
        title="Subject actions"
        groups={groups}
        trigger={
          <Button variant="outline" size="icon" className={sheet ? "size-10" : undefined} aria-label="More Options">
            <MoreHorizontalIcon />
          </Button>
        }
      />
      {sheet && (
        <ResetSubjectsDialog
          open={resetOpen}
          onOpenChange={setResetOpen}
          onConfirm={options.actions.onReset}
          showTrigger={false}
        />
      )}
    </>
  );
}
