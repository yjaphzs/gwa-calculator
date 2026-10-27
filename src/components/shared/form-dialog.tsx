"use client";

import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  /** Usually `formRef.current?.requestSubmit()` so the form validates first. */
  onSubmit: () => void;
  processing?: boolean;
  success?: boolean;
  /** Submit stays disabled until the form has changes. */
  dirty?: boolean;
  children: ReactNode;
}

/** Modal shell for a create/edit form: title, body, Cancel + Submit. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  processing = false,
  success = false,
  dirty = true,
  children,
}: FormDialogProps) {
  const settled = success && !dirty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">{children}</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={processing}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            className={settled ? "text-stone-100" : ""}
            onClick={onSubmit}
            disabled={processing || !dirty}
            variant={settled ? "secondary" : "default"}
            tabIndex={processing ? -1 : 0}
          >
            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
