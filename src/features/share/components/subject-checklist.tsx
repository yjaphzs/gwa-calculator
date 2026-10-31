"use client";

import type { ShareSubject } from "@/features/share/lib/share-content";
import { cn } from "@/lib/utils";

interface SubjectChecklistProps {
  subjects: ShareSubject[];
  chosen: string[];
  onChange: (chosen: string[]) => void;
}

/** Pick exactly which subjects go on the image. */
export function SubjectChecklist({ subjects, chosen, onChange }: SubjectChecklistProps) {
  return (
    <fieldset className="flex max-h-56 flex-col overflow-y-auto rounded-lg border">
      <legend className="sr-only">Subjects to include</legend>
      {subjects.map((s) => {
        const checked = chosen.includes(s.id);
        return (
          <label
            key={s.id}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 border-b px-3 text-sm last:border-0",
              checked && "bg-primary/5",
            )}
          >
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={checked}
              onChange={() => onChange(checked ? chosen.filter((id) => id !== s.id) : [...chosen, s.id])}
            />
            <span className="min-w-0 flex-1 truncate">{s.title || s.code}</span>
            <span className="font-mono text-xs text-muted-foreground">{s.counted ? s.grade.toFixed(2) : s.status}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
