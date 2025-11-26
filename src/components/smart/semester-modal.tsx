import React, { type ReactNode } from "react";

// UI Components
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

// Types
import type { Semester } from "@/types";

/**
 * Props for the SemesterForm component.
 */
interface SemesterFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    editingSemester?: Semester | null;
    onSave?: () => void;
    onClose?: () => void;
    children: ReactNode;
    processing?: boolean;
    success?: boolean;
    dirty?: boolean;
}

/**
 * SemesterFormModal
 * Modal dialog for creating or editing a semester, wraps a form and handles submission state.
 */
const SemesterFormModal: React.FC<SemesterFormProps> = ({
    open,
    onOpenChange,
    title,
    description,
    editingSemester,
    onSave,
    onClose,
    processing = false,
    success = false,
    dirty = true,
    children,
}) => {
    const isEdit = !!editingSemester;
    const modalTitle = title ?? (isEdit ? "Edit Semester" : "Save Semester");
    const modalDescription =
        description ??
        (isEdit
            ? "Update the form below to edit your semester. Click save when you're done."
            : "Fill out the form below to add your semester. Click add when you're done.");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{modalTitle}</DialogTitle>
                    <DialogDescription>{modalDescription}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">{children}</div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        className={`${success && !dirty ? "text-stone-100" : ""}`}
                        onClick={onSave}
                        disabled={processing || !dirty}
                        variant={success && !dirty ? "secondary" : "default"}
                        tabIndex={processing ? -1 : 0}
                    >
                        {processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                        )}
                        {editingSemester ? "Update" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SemesterFormModal;
