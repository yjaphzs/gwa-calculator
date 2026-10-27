"use client";

import { useCallback, useRef } from "react";

import { FormDialog } from "@/components/shared/form-dialog";
import { SemesterForm, type SemesterValues } from "@/features/semesters/components/semester-form";
import type { EditorDialog } from "@/hooks/use-editor-dialog";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";
import type { Semester, Subject } from "@/types";

interface SemesterEditorDialogProps {
  editor: EditorDialog<Semester>;
  semesters: Semester[];
  /** The working subjects that "Save Semester" archives. */
  subjects: Subject[];
  onCreate: (values: SemesterValues) => void;
  onUpdate: (id: string, values: SemesterValues) => void;
}

/** Save the working subjects as a semester, or edit a saved one's term. */
export function SemesterEditorDialog({
  editor,
  semesters,
  subjects,
  onCreate,
  onUpdate,
}: SemesterEditorDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { onOpenChange, editing } = editor;
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const submit = useFormSubmitState(close);

  return (
    <FormDialog
      open={editor.open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Semester" : "Save Semester"}
      description={
        editing
          ? "Update the form below to edit your semester. Click update when you're done."
          : "Fill out the form below to save your semester. Click save when you're done."
      }
      submitLabel={editing ? "Update" : "Save"}
      onSubmit={() => formRef.current?.requestSubmit()}
      processing={submit.processing}
      success={submit.success}
      dirty={submit.dirty}
    >
      <SemesterForm
        key={editing?.id ?? "new"}
        ref={formRef}
        semester={editing}
        semesters={semesters}
        subjects={subjects}
        onDirtyChange={submit.setDirty}
        onSubmit={(values) =>
          submit.run(() => (editing ? onUpdate(editing.id, values) : onCreate(values)))
        }
      />
    </FormDialog>
  );
}
