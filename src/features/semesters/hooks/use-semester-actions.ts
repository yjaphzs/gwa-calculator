"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";

import type { SubjectFormValues } from "@/features/calculator/components/subject-form";
import { buildSubject } from "@/features/calculator/lib/subject-status";
import type { SemesterValues } from "@/features/semesters/components/semester-form";
import { replaceSemesterSubject } from "@/features/semesters/lib/semesters";
import type { Semester, Subject } from "@/types";

interface Options {
  subjects: Subject[];
  setSemesters: Dispatch<SetStateAction<Semester[]>>;
  removeSubjects: () => void;
}

/** Archive the working subjects as a semester, rename or delete one, edit its subjects. */
export function useSemesterActions({
  subjects,
  setSemesters,
  removeSubjects,
}: Options) {
  const createSemester = useCallback(
    (values: SemesterValues) => {
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

  return { createSemester, updateSemester, deleteSemester, updateSemesterSubject };
}
