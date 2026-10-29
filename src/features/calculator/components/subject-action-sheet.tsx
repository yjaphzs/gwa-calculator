"use client";

import { Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { notCountedLabel } from "@/features/calculator/lib/subject-status";
import type { Subject } from "@/types";

interface SubjectActionSheetProps {
  /** The last tapped subject; kept while the sheet animates closed. */
  subject: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border bg-muted/30 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-semibold">{value}</span>
    </div>
  );
}

/** Phone-only sheet opened by tapping a subject row: details, then Edit or Delete. */
export function SubjectActionSheet({ subject, open, onOpenChange, onEdit, onDelete }: SubjectActionSheetProps) {
  if (!subject) return null;
  const notCounted = notCountedLabel(subject);

  function run(action: (subject: Subject) => void) {
    if (!subject) return;
    onOpenChange(false);
    action(subject);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerDescription>{subject.code}</DrawerDescription>
          <DrawerTitle className="text-lg">{subject.title}</DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-2 px-4">
          <Fact label="Units" value={String(subject.units)} />
          <Fact label={subject.mark ? "Status" : "Grade"} value={subject.mark ?? subject.grade.toFixed(2)} />
        </div>
        {notCounted && (
          <p className="px-4 pt-2 text-sm text-muted-foreground">{notCounted}, not counted in your GWA.</p>
        )}
        <DrawerFooter>
          <Button className="h-11" onClick={() => run(onEdit)}>
            <Pencil className="size-4" />
            Edit subject
          </Button>
          <Button variant="destructive" className="h-11" onClick={() => run(onDelete)}>
            <Trash className="size-4" />
            Delete subject
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="h-11">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
