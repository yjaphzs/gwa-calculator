"use client";

import { useEffect, useState, type Ref } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormSelectField } from "@/components/shared/form-select-field";
import { Form } from "@/components/ui/form";
import { ArchivedSubjects, CountChip } from "@/features/semesters/components/archived-subjects";
import {
  SEMESTER_TERMS,
  generateSchoolYears,
  isDuplicateTerm,
} from "@/features/semesters/lib/semesters";
import type { Semester, Subject } from "@/types";

const semesterFormSchema = z.object({
  semester: z.string({ message: "Semester is required." }),
  schoolYear: z.string({ message: "School Year is required." }),
});

export type SemesterValues = z.infer<typeof semesterFormSchema>;

const DUPLICATE_MESSAGE =
  "A semester for this school year and semester already exists. Please choose a different combination.";

const TERM_SELECT = SEMESTER_TERMS.map((term) => ({ value: term, label: term }));

interface SemesterFormProps {
  ref?: Ref<HTMLFormElement>;
  /** The semester being edited, or null when archiving the working subjects. */
  semester: Semester | null;
  semesters: Semester[];
  subjects: Subject[];
  onSubmit: (values: SemesterValues) => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}

/** Term + school year for a saved semester, with a preview of its subjects. */
export function SemesterForm({
  ref,
  semester,
  semesters,
  subjects,
  onSubmit,
  onDirtyChange,
}: SemesterFormProps) {
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const form = useForm<SemesterValues>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: semester
      ? { semester: semester.semester, schoolYear: semester.schoolYear }
      : undefined,
  });

  const { isDirty } = form.formState;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const term = useWatch({ control: form.control, name: "semester" });
  const schoolYear = useWatch({ control: form.control, name: "schoolYear" });
  const duplicate = !!term && !!schoolYear && isDuplicateTerm(semesters, term, schoolYear, semester?.id);

  const submit = (values: SemesterValues) => {
    if (duplicate) {
      form.setError("semester", { type: "manual", message: DUPLICATE_MESSAGE });
      form.setError("schoolYear", { type: "manual", message: DUPLICATE_MESSAGE });
      return;
    }
    return onSubmit(values);
  };

  const schoolYearOptions = generateSchoolYears(5).map((year) => ({ value: year, label: year }));
  const previewSubjects = semester?.subjects ?? subjects;

  return (
    <Form {...form}>
      <form ref={ref} onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <FormSelectField
          control={form.control}
          name="semester"
          label="Semester"
          placeholder="Select semester"
          groupLabel="Semesters"
          options={TERM_SELECT}
        />
        <FormSelectField
          control={form.control}
          name="schoolYear"
          label="School Year"
          placeholder="Select school year"
          groupLabel="School Years"
          options={schoolYearOptions}
        />
      </form>
      <ArchivedSubjects
        subjects={previewSubjects}
        open={subjectsOpen}
        onOpenChange={setSubjectsOpen}
        heading={
          semester ? (
            <>
              There are <CountChip>{semester.subjects.length}</CountChip> subjects archived in
              this semester
            </>
          ) : (
            <>
              You are archiving <CountChip>{subjects.length}</CountChip> subjects to this semester
            </>
          )
        }
      />
    </Form>
  );
}
