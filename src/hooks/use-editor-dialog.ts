"use client";

import { useCallback, useState } from "react";

export interface EditorDialog<T> {
  open: boolean;
  /** The record being edited, or null when creating a new one. */
  editing: T | null;
  openCreate: () => void;
  openEdit: (item: T) => void;
  onOpenChange: (open: boolean) => void;
}

/** Open/close + "which record" state for a create-or-edit dialog. */
export function useEditorDialog<T>(): EditorDialog<T> {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditing(item);
    setOpen(true);
  }, []);

  // Keep `editing` while the close animation runs; openCreate/openEdit reset it.
  const onOpenChange = useCallback((next: boolean) => setOpen(next), []);

  return { open, editing, openCreate, openEdit, onOpenChange };
}
