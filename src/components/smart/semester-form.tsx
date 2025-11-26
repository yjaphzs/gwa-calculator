import {
    useEffect,
    useState,
    forwardRef,
    type Dispatch,
    type SetStateAction,
    type RefObject,
} from "react";

// Form and validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// UI Components
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from "lucide-react"

// Types
import type { Semester, Subject } from "@/types";

/**
 * Zod schema for semester form validation
 */
const semesterFormSchema = z.object({
    semester: z.string({ message: "Semester is required." }),
    schoolYear: z.string({ message: "School Year is required." }),
});

type SemesterFormValues = z.infer<typeof semesterFormSchema>;

/**
 * Props for the SemesterForm component.
 */
interface SemesterFormProps {
    semester?: Semester | null;
    subjects?: Subject[];
    semesters?: Semester[];
    onSuccess?: (values: SemesterFormValues) => void;
    inputRef?: RefObject<HTMLInputElement | null>;
    setModalOpen?: Dispatch<SetStateAction<boolean>>;
    setProcessing?: Dispatch<SetStateAction<boolean>>;
    setSuccess?: Dispatch<SetStateAction<boolean>>;
    setDirty?: Dispatch<SetStateAction<boolean>>;
}

/**
 * SemesterForm
 * Form for creating or editing a semester, including code, name, grade, and units.
 */
const SemesterForm = forwardRef<HTMLFormElement, SemesterFormProps>(
    (
        {
            semester,
            subjects,
            semesters,
            onSuccess,
            inputRef,
            setModalOpen,
            setProcessing,
            setSuccess,
            setDirty,
        },
        ref
    ) => {
        const [subjectsCollapsed, setSubjectsCollapsed] = useState(false);
        const [duplicateError, setDuplicateError] = useState<string | null>(null);

        const form = useForm<SemesterFormValues>({
            resolver: zodResolver(semesterFormSchema),
            defaultValues: semester ? {
                semester: semester.semester,
                schoolYear: semester.schoolYear
            } : undefined
        });

        const subjectsInSemester = semester?.subjects || subjects;

        function generateSchoolYears(count = 7) {
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let i = 0; i < count; i++) {
                const from = currentYear - i;
                years.push(`${from}-${from + 1}`);
            }
            return years;
        }

        useEffect(() => {
            setDirty?.(form.formState.isDirty);
        }, [form.formState.isDirty, setDirty]);

        // Validation for duplicate semester/schoolYear
        useEffect(() => {
            if (!semesters) return;
            const { semester: semValue, schoolYear: syValue } = form.getValues();
            if (semValue && syValue) {
                const exists = semesters.some(
                    (s) =>
                        s.semester === semValue &&
                        s.schoolYear === syValue &&
                        (!semester || s.id !== semester.id)
                );
                setDuplicateError(
                    exists
                        ? "A semester for this school year and semester already exists. Please choose a different combination."
                        : null
                );
            } else {
                setDuplicateError(null);
            }
        }, [form.watch("semester"), form.watch("schoolYear"), semesters, semester, form]);

        async function onSubmit(values: SemesterFormValues) {
            if (duplicateError) {
                form.setError("semester", { type: "manual", message: duplicateError });
                form.setError("schoolYear", { type: "manual", message: duplicateError });
                return;
            }
            setProcessing?.(true);
            setSuccess?.(false);
            try {
                if (onSuccess) await onSuccess(values);
                setSuccess?.(true);
            } finally {
                setProcessing?.(false);
                setModalOpen?.(false);
            }
        }

        return (
            <Form {...form}>
                <form
                    ref={ref}
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="semester"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Semester</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue ref={inputRef} placeholder="Select semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Semesters
                                                </SelectLabel>
                                                {["First", "Second", "Third"].map(semester => (
                                                    <SelectItem
                                                        key={semester}
                                                        value={semester}
                                                    >
                                                        {semester}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="schoolYear"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>School Year</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select school year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>
                                                    School Years
                                                </SelectLabel>
                                                {generateSchoolYears(5).map(year => (
                                                    <SelectItem
                                                        key={year}
                                                        value={year}
                                                    >
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>

                <Collapsible
                    open={subjectsCollapsed}
                    onOpenChange={setSubjectsCollapsed}
                    className="flex flex-col gap-2"
                    >
                    <div className="flex items-center justify-between gap-4">
                        {semester ? (
                            <h4 className="text-sm font-semibold">
                                There are <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">{semester.subjects.length}</code> subjects archived in this semester
                            </h4>
                        ) : (
                            <h4 className="text-sm font-semibold">
                                You are archiving <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">{subjects?.length ?? 0}</code> subjects to this semester
                            </h4>
                        )}
                        {subjectsInSemester && subjectsInSemester.length > 1 && (
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                    <ChevronsUpDown />
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        )}
                    </div>
                    {subjectsInSemester && subjectsInSemester.length > 0 && (
                        <div className="flex flex-row justify-between items-center rounded-md border px-4 py-2 text-sm">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">{subjectsInSemester[0].code}</span>
                                <span className="font-semibold line-clamp-1">{subjectsInSemester[0].title}</span>
                            </div>
                            <div className="flex flex-col justify-end text-end">
                                <span className="text-xs text-muted-foreground">{subjectsInSemester[0].units}</span>
                                <span className="font-bold line-clamp-1 font-mono">{subjectsInSemester[0].grade.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <CollapsibleContent className="flex flex-col gap-2">
                        {subjectsInSemester &&
                            subjectsInSemester.slice(1).map((subject) => (
                                <div
                                    key={subject.code}
                                    className="flex flex-row justify-between items-center rounded-md border px-4 py-2 text-sm"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">{subject.code}</span>
                                        <span className="font-semibold line-clamp-1">{subject.title}</span>
                                    </div>
                                    <div className="flex flex-col justify-end text-end">
                                        <span className="text-xs text-muted-foreground">{subject.units}</span>
                                        <span className="font-bold line-clamp-1 font-mono">{subject.grade.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                    </CollapsibleContent>
                </Collapsible>
            </Form>
        );
    }
);

export default SemesterForm;
