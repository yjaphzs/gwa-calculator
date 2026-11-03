"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WrappedViewerState } from "@/features/wrapped/hooks/use-wrapped-viewer";
import { shortYear } from "@/features/wrapped/lib/wrapped";

/** A small pill on the slide's top edge for choosing the school year (only when there's more than one). */
export function WrappedYearPicker({ viewer }: { viewer: WrappedViewerState }) {
  return (
    <Select value={viewer.year} onValueChange={viewer.pickYear}>
      <SelectTrigger
        aria-label="School year"
        className="h-9 w-auto shrink-0 gap-1.5 rounded-full border-white/25 bg-black/30 px-3 text-xs font-semibold text-white backdrop-blur-sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {viewer.years.map((year) => (
          <SelectItem key={year} value={year}>
            S.Y. {shortYear(year)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
