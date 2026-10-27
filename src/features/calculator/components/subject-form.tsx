import {
    useEffect,
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
import { Input } from "@/components/ui/input";

// Types
import type { Subject } from "@/types";

/**
 * Zod schema for subject form validation
 */
const subjectFormSchema = z.object({
    code: z.string({ message: "Code is required." }),
    title: z.string({ message: "Title is required." }),
    grade: z.string({ message: "Grade is required." }),
    units: z.string({ message: "Units are required." }),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

/**
 * Props for the SubjectForm component.
 */
interface SubjectFormProps {
    subject?: Subject | null;
    subjects?: Subject[];
    onSuccess?: (values: Omit<SubjectFormValues, "grade" | "units"> & { grade: number; units: number }) => void;
    inputRef?: RefObject<HTMLInputElement | null>;
    setModalOpen?: Dispatch<SetStateAction<boolean>>;
    setProcessing?: Dispatch<SetStateAction<boolean>>;
    setSuccess?: Dispatch<SetStateAction<boolean>>;
    setDirty?: Dispatch<SetStateAction<boolean>>;
}

/**
 * SubjectForm
 * Form for creating or editing a subject, including code, name, grade, and units.
 */
const SubjectForm = forwardRef<HTMLFormElement, SubjectFormProps>(
    (
        {
            subject,
            subjects,
            onSuccess,
            inputRef,
            setModalOpen,
            setProcessing,
            setSuccess,
            setDirty,
        },
        ref
    ) => {
        const form = useForm<SubjectFormValues>({
            resolver: zodResolver(subjectFormSchema),
            defaultValues: subject ? {
                code: subject.code,
                title: subject.title,
                grade: subject.grade.toFixed(2),
                units: subject.units.toString(),
            } : {
                code: "CODE" + (subjects ? (subjects.length + 1).toString().padStart(4, "0") : "0001"),
                title: "Subject " + (subjects ? (subjects.length + 1).toString() : "1"),
            },
        });

        useEffect(() => {
            setDirty?.(form.formState.isDirty);
        }, [form.formState.isDirty, setDirty]);

        async function onSubmit(values: SubjectFormValues) {
            setProcessing?.(true);
            setSuccess?.(false);
            try {
                const processedValues = {
                    ...values,
                    grade: parseFloat(values.grade),
                    units: Number(values.units),
                };
                if (onSuccess) await onSuccess(processedValues);
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
                        name="code"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Course Code</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., COMSCI 1101"
                                        {...field}
                                        ref={inputRef}
                                    />
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
                                    <Input
                                        placeholder="e.g., Computer Programming I"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <FormField
                            control={form.control}
                            name="grade"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Grade</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>
                                                        Grades
                                                    </SelectLabel>
                                                    {[1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 4.00, 5.00].map(grade => (
                                                        <SelectItem
                                                            key={grade}
                                                            value={grade.toFixed(2)}
                                                        >
                                                            {grade.toFixed(2)}
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
                            name="units"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Units</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select units" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>
                                                        Units
                                                    </SelectLabel>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(unit => (
                                                        <SelectItem
                                                            key={unit}
                                                            value={unit.toString()}
                                                        >
                                                            {unit}
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
                    </div>
                </form>
            </Form>
        );
    }
);

export default SubjectForm;
