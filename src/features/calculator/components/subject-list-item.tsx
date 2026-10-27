import { Pencil, Trash } from "lucide-react";

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
}

/** One subject row: code + title on the left, units + grade on the right. */
export function SubjectListItem({ subject, onEdit, onDelete }: SubjectListItemProps) {
  const notCounted = notCountedLabel(subject);

  return (
    <Item variant="outline" asChild role="listitem">
      <div className={cn("flex w-full items-center", notCounted && "bg-muted/40")}>
        <ItemContent>
          <ItemTitle className="line-clamp-1 text-muted-foreground">{subject.code}</ItemTitle>
          <ItemDescription className="line-clamp-1 text-xl font-semibold">
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
          <ButtonGroup
            orientation="vertical"
            aria-label={`Actions for ${subject.code}`}
            className="h-fit"
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
      </div>
    </Item>
  );
}
