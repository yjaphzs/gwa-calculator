"use client";

import type { ReactNode } from "react";
import { ChevronsUpDown, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { notCountedLabel } from "@/features/calculator/lib/subject-status";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types";

/** Inline count chip, e.g. "There are [5] subjects …". */
export function CountChip({ children }: { children: ReactNode }) {
  return (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
      {children}
    </code>
  );
}

interface ArchivedSubjectRowProps {
  subject: Subject;
  /** Shown only for saved semesters; the save-semester preview is read-only. */
  onEdit?: (subject: Subject) => void;
}

function ArchivedSubjectRow({ subject, onEdit }: ArchivedSubjectRowProps) {
  const notCounted = notCountedLabel(subject);

  return (
    <div className="flex flex-row items-center justify-between gap-3 rounded-md border px-4 py-2 text-sm">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">
          {subject.code}
          {notCounted && `, ${notCounted.toLowerCase()} (not in GWA)`}
        </span>
        <span className="line-clamp-1 font-semibold">{subject.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col justify-end text-end">
          <span className="text-xs text-muted-foreground">{subject.units}</span>
          <span className={cn("line-clamp-1 font-mono font-bold", notCounted && "text-muted-foreground")}>
            {subject.mark ?? subject.grade.toFixed(2)}
          </span>
        </div>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`Edit ${subject.code}`}
            onClick={() => onEdit(subject)}
          >
            <Pencil className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface ArchivedSubjectsProps {
  subjects: Subject[];
  heading: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditSubject?: (subject: Subject) => void;
  className?: string;
}

/** A semester's subjects: the first always visible, the rest collapsible. */
export function ArchivedSubjects({
  subjects,
  heading,
  open,
  onOpenChange,
  onEditSubject,
  className = "flex flex-col gap-2",
}: ArchivedSubjectsProps) {
  const [first, ...rest] = subjects;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className={className}>
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold">{heading}</h4>
        {subjects.length > 1 && (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <ChevronsUpDown />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        )}
      </div>
      {first && <ArchivedSubjectRow subject={first} onEdit={onEditSubject} />}
      <CollapsibleContent className="flex flex-col gap-2">
        {rest.map((subject) => (
          <ArchivedSubjectRow key={subject.id} subject={subject} onEdit={onEditSubject} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
