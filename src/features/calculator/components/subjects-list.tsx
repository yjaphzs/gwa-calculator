import { SearchXIcon } from "lucide-react";

import { PaginationSummary } from "@/components/shared/pagination-summary";
import Paginator from "@/components/shared/paginator";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup } from "@/components/ui/item";
import { SubjectListItem } from "@/features/calculator/components/subject-list-item";
import type { SubjectFilter } from "@/features/calculator/hooks/use-subject-filter";
import type { Subject } from "@/types";

interface SubjectsListProps {
  subjects: Subject[];
  filter: SubjectFilter;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

/** The current page of subjects, its pager, and the "no results" state. */
export function SubjectsList({ subjects, filter, onEdit, onDelete }: SubjectsListProps) {
  const { paginated, filtered, pageSize, currentPage, totalPages, setCurrentPage } = filter;

  return (
    <>
      {paginated.length > 0 && (
        <>
          <ItemGroup className="mt-4 gap-4">
            {paginated.map((subject) => (
              <SubjectListItem
                key={subject.id}
                subject={subject}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ItemGroup>
          <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
            <PaginationSummary
              currentPage={currentPage}
              pageSize={pageSize}
              total={filtered.length}
            />
            <div className="flex justify-end">
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showPreviousNext
              />
            </div>
          </div>
        </>
      )}

      {filtered.length === 0 && subjects.length > 0 && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>No Results Found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search criteria to find what you're looking for.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}
