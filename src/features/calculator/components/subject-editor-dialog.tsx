"use client";

import { useCallback, useRef } from "react";

import { FormDialog } from "@/components/shared/form-dialog";
import { SubjectForm, type SubjectFormValues } from "@/features/calculator/components/subject-form";
import type { EditorDialog } from "@/hooks/use-editor-dialog";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";
import type { Subject } from "@/types";

interface SubjectEditorDialogProps {
  editor: EditorDialog<Subject>;
  subjects: Subject[];
  onCreate: (values: SubjectFormValues) => void;
  onUpdate: (id: string, values: SubjectFormValues) => void;
}

/** Add or edit a subject in a modal form. */
export function SubjectEditorDialog({ editor, subjects, onCreate, onUpdate }: SubjectEditorDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { onOpenChange, editing } = editor;
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const submit = useFormSubmitState(close);

  return (
    <FormDialog
      open={editor.open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Subject" : "Add Subject"}
      description={
        editing
          ? "Update the form below to edit your subject. Click update when you're done."
          : "Fill out the form below to add your subject. Click save when you're done."
      }
      submitLabel={editing ? "Update" : "Save"}
      onSubmit={() => formRef.current?.requestSubmit()}
      processing={submit.processing}
      success={submit.success}
      dirty={submit.dirty}
    >
      <SubjectForm
        key={editing?.id ?? "new"}
        ref={formRef}
        subject={editing}
        subjects={subjects}
        onDirtyChange={submit.setDirty}
        onSubmit={(values) =>
          submit.run(() => (editing ? onUpdate(editing.id, values) : onCreate(values)))
        }
      />
    </FormDialog>
  );
}
