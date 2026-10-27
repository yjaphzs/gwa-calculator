"use client";

import { useCallback, useRef, useState } from "react";

import { WORKED_EXAMPLE } from "@/features/guide/content/examples";

export interface ExampleRow {
  id: string;
  title: string;
  grade: number;
  units: number;
}

export const MAX_EXAMPLE_ROWS = 12;

// Deterministic ids so the server-rendered markup matches the first client render.
const initialRows = (): ExampleRow[] =>
  WORKED_EXAMPLE.map((s, i) => ({ id: `row-${i}`, ...s }));

/** Editable rows for the guide's try-it calculator, seeded with the worked example. */
export function useExampleRows() {
  const [rows, setRows] = useState<ExampleRow[]>(initialRows);
  const nextId = useRef(WORKED_EXAMPLE.length);

  const update = useCallback((id: string, patch: Partial<Omit<ExampleRow, "id">>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }, []);

  const add = useCallback(() => {
    setRows((prev) => {
      if (prev.length >= MAX_EXAMPLE_ROWS) return prev;
      const id = `row-${nextId.current++}`;
      return [...prev, { id, title: `Subject ${prev.length + 1}`, grade: 1.5, units: 3 }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const reset = useCallback(() => setRows(initialRows()), []);

  return { rows, update, add, remove, reset };
}
