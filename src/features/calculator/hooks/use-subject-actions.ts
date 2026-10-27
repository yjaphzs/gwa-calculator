"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";

import type { SubjectFormValues } from "@/features/calculator/components/subject-form";
import { buildSubject } from "@/features/calculator/lib/subject-status";
import type { Subject } from "@/types";

interface Options {
  setSubjects: Dispatch<SetStateAction<Subject[]>>;
  removeSubjects: () => void;
  persistNow: () => void;
}

/** Re-insert `subject` at `index` (or at the end), unless it's already back. */
function restoreAt(list: Subject[], index: number, subject: Subject): Subject[] {
  if (list.some((s) => s.id === subject.id)) return list;
  const at = index < 0 || index > list.length ? list.length : index;
  return [...list.slice(0, at), subject, ...list.slice(at)];
}

/** Create / update / delete (with undo) / reset / save for the working subjects. */
export function useSubjectActions({ setSubjects, removeSubjects, persistNow }: Options) {
  const createSubject = useCallback(
    (values: SubjectFormValues) => {
      setSubjects((prev) => [...prev, buildSubject(crypto.randomUUID(), values)]);
    },
    [setSubjects],
  );

  const updateSubject = useCallback(
    (id: string, values: SubjectFormValues) => {
      setSubjects((prev) => prev.map((subject) => (subject.id === id ? buildSubject(id, values) : subject)));
    },
    [setSubjects],
  );

  const deleteSubject = useCallback(
    (subject: Subject) => {
      // Read when Undo is clicked, by which point the updater below has run.
      let index = -1;
      setSubjects((prev) => {
        index = prev.findIndex((s) => s.id === subject.id);
        return prev.filter((s) => s.id !== subject.id);
      });
      toast(`Deleted ${subject.code}`, {
        action: { label: "Undo", onClick: () => setSubjects((prev) => restoreAt(prev, index, subject)) },
      });
    },
    [setSubjects],
  );

  // Manual save: the only way subjects persist while autosave is off.
  const saveNow = useCallback(() => {
    try {
      persistNow();
      toast.success("Subjects have been saved!");
    } catch {
      toast.error("Failed to save subjects.");
    }
  }, [persistNow]);

  return { createSubject, updateSubject, deleteSubject, resetSubjects: removeSubjects, saveNow };
}
