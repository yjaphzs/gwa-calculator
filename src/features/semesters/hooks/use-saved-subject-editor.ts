"use client";

import { useCallback, useState } from "react";

import { useEditorDialog } from "@/hooks/use-editor-dialog";
import type { Semester, Subject } from "@/types";

/** Edit-dialog state for a subject inside a saved semester: which subject, and in which semester. */
export function useSavedSubjectEditor() {
  const editor = useEditorDialog<Subject>();
  const [semester, setSemester] = useState<Semester | null>(null);
  const { openEdit: openSubject } = editor;

  const openEdit = useCallback(
    (owner: Semester, subject: Subject) => {
      setSemester(owner);
      openSubject(subject);
    },
    [openSubject],
  );

  return { editor, semester, openEdit };
}
