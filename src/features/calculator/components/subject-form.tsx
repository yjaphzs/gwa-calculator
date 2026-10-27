"use client";

import { useEffect, type Ref } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormSelectField } from "@/components/shared/form-select-field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  STATUS_OPTIONS,
  isMark,
  statusOf,
  type SubjectStatus,
} from "@/features/calculator/lib/subject-status";
import { GRADE_OPTIONS, UNIT_OPTIONS } from "@/lib/academic";
import type { Subject } from "@/types";

const STATUSES = STATUS_OPTIONS.map((o) => o.value) as [SubjectStatus, ...SubjectStatus[]];

const subjectFormSchema = z
  .object({
    code: z.string().trim().max(30, "Keep the code to 30 characters or fewer."),
    title: z.string().trim().max(120, "Keep the title to 120 characters or fewer."),
    status: z.enum(STATUSES),
    grade: z.string().optional(),
    units: z.string({ message: "Units are required." }),
  })
  .refine((v) => isMark(v.status) || !!v.grade, { message: "Grade is required.", path: ["grade"] });

type SubjectFormFields = z.infer<typeof subjectFormSchema>;

export interface SubjectFormValues {
  code: string;
  title: string;
  grade: number;
  units: number;
  status: SubjectStatus;
}

const GRADE_SELECT = GRADE_OPTIONS.map((g) => ({ value: g.toFixed(2), label: g.toFixed(2) }));
const UNIT_SELECT = UNIT_OPTIONS.map((u) => ({ value: String(u), label: String(u) }));
const STATUS_SELECT = STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }));

function defaultValues(subject: Subject | null): Partial<SubjectFormFields> {
  if (!subject) return { code: "", title: "", status: "graded" };
  return {
    code: subject.code,
    title: subject.title,
    status: statusOf(subject),
    grade: subject.mark ? undefined : subject.grade.toFixed(2),
    units: subject.units.toString(),
  };
}

interface SubjectFormProps {
  ref?: Ref<HTMLFormElement>;
  subject: Subject | null;
  subjects: Subject[];
  onSubmit: (values: SubjectFormValues) => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}

/** Course code, title, GWA status, grade, and units for one subject. */
export function SubjectForm({ ref, subject, subjects, onSubmit, onDirtyChange }: SubjectFormProps) {
  const form = useForm<SubjectFormFields>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: defaultValues(subject),
  });
  const status = useWatch({ control: form.control, name: "status" });

  const { isDirty } = form.formState;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Blank code/title fall back to the numbered defaults shown as placeholders.
  const next = subject ? null : subjects.length + 1;
  const codeFallback = subject?.code || `CODE${String(next).padStart(4, "0")}`;
  const titleFallback = subject?.title || `Subject ${next}`;

  const submit = (values: SubjectFormFields) =>
    onSubmit({
      code: values.code || codeFallback,
      title: values.title || titleFallback,
      status: values.status,
      grade: values.grade ? parseFloat(values.grade) : 0,
      units: Number(values.units),
    });

  return (
    <Form {...form}>
      <form ref={ref} onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Course Code</FormLabel>
              <FormControl>
                <Input placeholder={codeFallback} autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder={titleFallback} autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSelectField
          control={form.control}
          name="status"
          label="Counts toward GWA?"
          placeholder="Choose"
          groupLabel="Status"
          options={STATUS_SELECT}
        />
        <div className="flex gap-4">
          {!isMark(status) && (
            <FormSelectField
              control={form.control}
              name="grade"
              label="Grade"
              placeholder="Select your grade"
              groupLabel="Grades"
              options={GRADE_SELECT}
            />
          )}
          <FormSelectField
            control={form.control}
            name="units"
            label="Units"
            placeholder="Select units"
            groupLabel="Units"
            options={UNIT_SELECT}
          />
        </div>
      </form>
    </Form>
  );
}
