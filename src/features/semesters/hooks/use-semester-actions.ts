"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";

import type { SubjectFormValues } from "@/features/calculator/components/subject-form";
import { buildSubject } from "@/features/calculator/lib/subject-status";
import type { SemesterValues } from "@/features/semesters/components/semester-form";
import {
  addSemesterSubject as withAddedSubject,
  removeSemesterSubject as withoutSubject,
  replaceSemesterSubject,
  restoreSemesterSubject,
  shortTermLabel,
} from "@/features/semesters/lib/semesters";
import type { Semester, Subject } from "@/types";

interface Options {
  subjects: Subject[];
  setSemesters: Dispatch<SetStateAction<Semester[]>>;
  removeSubjects: () => void;
}

/** Archive the working subjects as a semester, rename or delete one, and add, edit, or remove its subjects. */
export function useSemesterActions({
  subjects,
  setSemesters,
  removeSubjects,
}: Options) {
  /** Returns the saved semester, so the caller can compare it with the term before. */
  const createSemester = useCallback(
    (values: SemesterValues): Semester => {
      const semester: Semester = {
        id: crypto.randomUUID(),
        semester: values.semester,
        schoolYear: values.schoolYear,
        subjects,
      };
      // Add first, then clear the working set — the persistence layer writes
      // both in one go (see removeSubjects in use-calculator-data).
      setSemesters((prev) => [...prev, semester]);
      removeSubjects();
      return semester;
    },
    [subjects, setSemesters, removeSubjects],
  );

  const updateSemester = useCallback(
    (id: string, values: SemesterValues) => {
      setSemesters((prev) =>
        prev.map((semester) =>
          semester.id === id
            ? { id, semester: values.semester, schoolYear: values.schoolYear, subjects: semester.subjects }
            : semester,
        ),
      );
    },
    [setSemesters],
  );

  const deleteSemester = useCallback(
    (semester: Semester) => setSemesters((prev) => prev.filter((s) => s.id !== semester.id)),
    [setSemesters],
  );

  // Edit one subject inside a saved semester (e.g. fill in an INC or IP grade).
  const updateSemesterSubject = useCallback(
    (semesterId: string, subjectId: string, values: SubjectFormValues) => {
      setSemesters((prev) => replaceSemesterSubject(prev, semesterId, buildSubject(subjectId, values)));
    },
    [setSemesters],
  );

  // Add a subject to a saved semester (a late grade, or one that was missed).
  const addSemesterSubject = useCallback(
    (semesterId: string, values: SubjectFormValues) => {
      setSemesters((prev) => withAddedSubject(prev, semesterId, buildSubject(crypto.randomUUID(), values)));
    },
    [setSemesters],
  );

  // Remove one, with Undo, like working subjects. A semester keeps at least one subject.
  const removeSemesterSubject = useCallback(
    (semester: Semester, subject: Subject) => {
      // Read when Undo is clicked, by which point the updater below has run.
      let index = -1;
      setSemesters((prev) => {
        index = prev.find((s) => s.id === semester.id)?.subjects.findIndex((s) => s.id === subject.id) ?? -1;
        return withoutSubject(prev, semester.id, subject.id);
      });
      toast(`Removed ${subject.code} from ${shortTermLabel(semester)}`, {
        action: { label: "Undo", onClick: () => setSemesters((prev) => restoreSemesterSubject(prev, semester.id, subject, index)) },
      });
    },
    [setSemesters],
  );

  return { createSemester, updateSemester, deleteSemester, updateSemesterSubject, addSemesterSubject, removeSemesterSubject };
}
