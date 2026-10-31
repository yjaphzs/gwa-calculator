"use client";

import { useState } from "react";
import { FileTextIcon, MoreHorizontalIcon, Pencil, Share2Icon, Trash } from "lucide-react";

import type { MenuGroup } from "@/components/shared/menu-types";
import { ResponsiveMenu } from "@/components/shared/responsive-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CountChip } from "@/features/semesters/components/archived-subjects";
import { formatTermLabel } from "@/features/semesters/lib/semesters";
import type { Semester } from "@/types";

interface SemesterActionsMenuProps {
  semester: Semester;
  onReport: (semester: Semester) => void;
  onShare: (semester: Semester) => void;
  onEdit: (semester: Semester) => void;
  onDelete: (semester: Semester) => void;
}

/** Per-semester "⋯" menu (a sheet on phones): Semester Report, Share, Edit, Delete with confirmation. */
export function SemesterActionsMenu({ semester, onReport, onShare, onEdit, onDelete }: SemesterActionsMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const groups: MenuGroup[] = [
    {
      id: "semester",
      items: [
        { kind: "action", id: "report", label: "Semester Report", icon: FileTextIcon, onSelect: () => onReport(semester) },
        { kind: "action", id: "share", label: "Share image", icon: Share2Icon, onSelect: () => onShare(semester) },
        { kind: "action", id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(semester) },
      ],
    },
    {
      id: "danger",
      items: [
        { kind: "action", id: "delete", label: "Delete", icon: Trash, destructive: true, onSelect: () => setConfirmOpen(true) },
      ],
    },
  ];

  return (
    <>
      <ResponsiveMenu
        title={formatTermLabel(semester)}
        groups={groups}
        trigger={
          <Button variant="outline" size="icon" className="max-md:size-10" aria-label="More Options">
            <MoreHorizontalIcon />
          </Button>
        }
      />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Trash className="mx-auto size-10 rounded-lg border bg-primary p-2 text-primary-foreground sm:mx-0" />
            <AlertDialogTitle>Delete this semester?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your subjects
              under{" "}
              <CountChip>
                S.Y. {semester.schoolYear} - {semester.semester} Semester.
              </CountChip>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(semester);
                setConfirmOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
