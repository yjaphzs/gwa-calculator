"use client";

import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  useResponsiveDialogIsDrawer,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

type ActionsProps = Pick<FormDialogProps, "submitLabel" | "onSubmit" | "processing" | "success" | "dirty">;

/** Desktop: Cancel then Submit, right-aligned. Sheet: Submit on top, both full width. */
function FormDialogActions({ submitLabel, onSubmit, processing = false, success = false, dirty = true }: ActionsProps) {
  const drawer = useResponsiveDialogIsDrawer();
  const settled = success && !dirty;
  const size = drawer ? "h-11" : undefined;

  const cancel = (
    <ResponsiveDialogClose asChild>
      <Button variant="outline" className={size} disabled={processing}>
        Cancel
      </Button>
    </ResponsiveDialogClose>
  );
  const submit = (
    <Button
      type="button"
      className={cn(size, settled && "text-stone-100")}
      onClick={onSubmit}
      disabled={processing || !dirty}
      variant={settled ? "secondary" : "default"}
      tabIndex={processing ? -1 : 0}
    >
      {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      {submitLabel}
    </Button>
  );

  return (
    <ResponsiveDialogFooter>
      {drawer ? submit : cancel}
      {drawer ? cancel : submit}
    </ResponsiveDialogFooter>
  );
}

/** Create/edit form shell: a centered dialog on desktop, a bottom sheet on phones. */
export function FormDialog({ open, onOpenChange, title, description, children, ...actions }: FormDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{description}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="grid gap-4">{children}</ResponsiveDialogBody>
        <FormDialogActions {...actions} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
