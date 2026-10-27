"use client";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExampleRow as Row } from "@/features/guide/hooks/use-example-rows";
import { GRADE_OPTIONS, UNIT_OPTIONS } from "@/lib/academic";

interface ExampleRowProps {
  row: Row;
  index: number;
  onChange: (id: string, patch: Partial<Omit<Row, "id">>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

/** One editable subject: name, grade, units, and its grade × units product. */
export function ExampleRow({ row, index, onChange, onRemove, canRemove }: ExampleRowProps) {
  const label = row.title || `Subject ${index + 1}`;

  return (
    <div className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 border-b py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_6rem_5rem_5.5rem_2.25rem]">
      <Input
        value={row.title}
        onChange={(e) => onChange(row.id, { title: e.target.value })}
        aria-label={`Subject ${index + 1} name`}
        className="col-span-4 sm:col-span-1"
      />
      <Select value={row.grade.toFixed(2)} onValueChange={(v) => onChange(row.id, { grade: Number(v) })}>
        <SelectTrigger aria-label={`Grade for ${label}`} className="font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GRADE_OPTIONS.map((g) => (
            <SelectItem key={g} value={g.toFixed(2)} className="font-mono">
              {g.toFixed(2)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(row.units)} onValueChange={(v) => onChange(row.id, { units: Number(v) })}>
        <SelectTrigger aria-label={`Units for ${label}`} className="font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {UNIT_OPTIONS.map((u) => (
            <SelectItem key={u} value={String(u)} className="font-mono">
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <output
        aria-label={`Grade times units for ${label}`}
        className="text-right font-mono text-sm tabular-nums"
      >
        {(row.grade * row.units).toFixed(2)}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(row.id)}
        disabled={!canRemove}
        aria-label={`Remove ${label}`}
      >
        <XIcon />
      </Button>
    </div>
  );
}
