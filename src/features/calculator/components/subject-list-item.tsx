import { ChevronRightIcon, Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { notCountedLabel } from "@/features/calculator/lib/subject-status";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types";

interface SubjectListItemProps {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  /** Phones: tapping anywhere on the row opens the action sheet. */
  onOpenActions: (subject: Subject) => void;
}

/** One subject row: code + title on the left, units + grade on the right. */
export function SubjectListItem({ subject, onEdit, onDelete, onOpenActions }: SubjectListItemProps) {
  const notCounted = notCountedLabel(subject);

  return (
    <Item variant="outline" asChild role="listitem">
      <div className={cn("relative flex w-full items-center", notCounted && "bg-muted/40")}>
        <ItemContent>
          <ItemTitle className="line-clamp-1 text-muted-foreground">{subject.code}</ItemTitle>
          <ItemDescription className="line-clamp-2 text-lg font-semibold md:line-clamp-1 md:text-xl">
            {subject.title}
          </ItemDescription>
          {notCounted && (
            <span className="w-fit rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              {notCounted}, not in GWA
            </span>
          )}
        </ItemContent>
        <ItemContent>
          <ItemTitle className="line-clamp-1 w-full text-end text-muted-foreground">
            {subject.units}
          </ItemTitle>
          <ItemDescription
            className={cn(
              "line-clamp-1 w-full text-end font-mono text-2xl font-bold",
              notCounted && "text-muted-foreground",
            )}
          >
            {subject.mark ?? subject.grade.toFixed(2)}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon aria-hidden className="size-5 text-muted-foreground md:hidden" />
          <ButtonGroup
            orientation="vertical"
            aria-label={`Edit or delete ${subject.code}`}
            className="hidden h-fit md:flex"
          >
            <Button
              variant="outline"
              size="icon"
              aria-label={`Edit ${subject.code}`}
              onClick={() => onEdit(subject)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              aria-label={`Delete ${subject.code}`}
              onClick={() => onDelete(subject)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </ItemActions>
        {/* Over the whole row on phones, where the inline buttons are hidden. */}
        <button
          type="button"
          aria-label={`Actions for ${subject.code}`}
          onClick={() => onOpenActions(subject)}
          className="absolute inset-0 rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:bg-foreground/5 md:hidden"
        />
      </div>
    </Item>
  );
}
