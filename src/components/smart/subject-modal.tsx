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
import type { Subject } from "@/types";

/**
 * Props for the SubjectForm component.
 */
interface SubjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    editingSubject?: Subject | null;
    onSave?: () => void;
    onClose?: () => void;
    children: ReactNode;
    processing?: boolean;
    success?: boolean;
    dirty?: boolean;
}

/**
 * SubjectFormModal
 * Modal dialog for creating or editing a subject, wraps a form and handles submission state.
 */
const SubjectFormModal: React.FC<SubjectFormProps> = ({
    open,
    onOpenChange,
    title,
    description,
    editingSubject,
    onSave,
    onClose,
    processing = false,
    success = false,
    dirty = true,
    children,
}) => {
    const isEdit = !!editingSubject;
    const modalTitle = title ?? (isEdit ? "Edit Subject" : "Add Subject");
    const modalDescription =
        description ??
        (isEdit
            ? "Update the form below to edit your subject. Click save when you're done."
            : "Fill out the form below to add your subject. Click add when you're done.");

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
                    >
                        {processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                        )}
                        {editingSubject ? "Update" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SubjectFormModal;
