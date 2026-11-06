"use client";

import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SubjectEditorDialog } from "@/features/calculator/components/subject-editor-dialog";
import type { useSavedSubjectEditor } from "@/features/semesters/hooks/use-saved-subject-editor";
import type { useSemesterActions } from "@/features/semesters/hooks/use-semester-actions";
import { formatTermLabel } from "@/features/semesters/lib/semesters";

type SemesterActions = ReturnType<typeof useSemesterActions>;

interface SavedSubjectDialogProps {
  saved: ReturnType<typeof useSavedSubjectEditor>;
  actions: Pick<SemesterActions, "addSemesterSubject" | "updateSemesterSubject" | "removeSemesterSubject">;
}

/**
 * Add, edit, or remove a subject inside a saved semester. Removing has Undo in
 * its toast; a semester's last subject can't be removed (delete the semester).
 */
export function SavedSubjectDialog({ saved, actions }: SavedSubjectDialogProps) {
  const { editor, semester } = saved;
  const editing = editor.editing;
  const lastOne = (semester?.subjects.length ?? 0) <= 1;

  const remove = editing && semester && (
    <div className="flex flex-col items-start gap-2 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        className="text-destructive max-md:h-10"
        disabled={lastOne}
        onClick={() => {
          editor.onOpenChange(false);
          actions.removeSemesterSubject(semester, editing);
        }}
      >
        <Trash2Icon className="size-4" />
        Remove subject
      </Button>
      {lastOne && (
        <p className="text-xs text-muted-foreground">A semester needs at least one subject. Delete the semester instead.</p>
      )}
    </div>
  );

  return (
    <SubjectEditorDialog
      editor={editor}
      subjects={semester?.subjects ?? []}
      onCreate={(values) => semester && actions.addSemesterSubject(semester.id, values)}
      onUpdate={(id, values) => semester && actions.updateSemesterSubject(semester.id, id, values)}
      editDescription={semester ? `Saved in ${formatTermLabel(semester)}. Changes update that semester's GWA.` : undefined}
      createDescription={semester ? `Adds to ${formatTermLabel(semester)}. It updates that semester's GWA.` : undefined}
      footer={remove || null}
    />
  );
}
