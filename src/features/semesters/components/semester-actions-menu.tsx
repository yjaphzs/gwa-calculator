"use client";

import { useState } from "react";
import { FileTextIcon, MoreHorizontalIcon, Pencil, Trash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountChip } from "@/features/semesters/components/archived-subjects";
import type { Semester } from "@/types";

interface SemesterActionsMenuProps {
  semester: Semester;
  onReport: (semester: Semester) => void;
  onEdit: (semester: Semester) => void;
  onDelete: (semester: Semester) => void;
}

/** Per-semester "⋯" menu: Semester Report, Edit, Delete (with confirmation). */
export function SemesterActionsMenu({ semester, onReport, onEdit, onDelete }: SemesterActionsMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="More Options">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onReport(semester);
            }}
          >
            <FileTextIcon className="h-4 w-4" />
            Semester Report
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onEdit(semester);
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setConfirmOpen(true);
                }}
              >
                <Trash className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
