"use client";

import { PlusIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ExampleRow } from "@/features/guide/components/interactive/example-row";
import { FormulaBreakdown } from "@/features/guide/components/interactive/formula-breakdown";
import { MAX_EXAMPLE_ROWS, useExampleRows } from "@/features/guide/hooks/use-example-rows";

/** Try-it calculator: change grades and units and watch each part of the formula update. */
export function InteractiveExample() {
  const { rows, update, add, remove, reset } = useExampleRows();

  return (
    <div className="mt-5 grid gap-4">
      <div className="rounded-lg border px-3 sm:px-4">
        <div
          aria-hidden
          className="hidden grid-cols-[minmax(0,1fr)_6rem_5rem_5.5rem_2.25rem] gap-2 border-b py-2 text-xs text-muted-foreground sm:grid"
        >
          <span>Subject</span>
          <span>Grade</span>
          <span>Units</span>
          <span className="text-right">Grade × units</span>
        </div>
        {rows.map((row, i) => (
          <ExampleRow
            key={row.id}
            row={row}
            index={i}
            onChange={update}
            onRemove={remove}
            canRemove={rows.length > 1}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={rows.length >= MAX_EXAMPLE_ROWS}>
          <PlusIcon />
          Add subject
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          <RotateCcwIcon />
          Reset example
        </Button>
      </div>
      <FormulaBreakdown subjects={rows} />
    </div>
  );
}
