import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { generatePaginationLinks } from "@/components/smart/generate-pages";

type PaginatorProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (pageNumber: number) => void;
    showPreviousNext?: boolean;
};

export default function Paginator({
    currentPage,
    totalPages,
    onPageChange,
    showPreviousNext = true,
}: PaginatorProps) {
    const isPrevDisabled = currentPage <= 1;
    const isNextDisabled = currentPage >= totalPages;

    return (
        <Pagination>
            <PaginationContent>
                {showPreviousNext && (
                    <PaginationItem>
                        <PaginationPrevious
                            aria-disabled={isPrevDisabled}
                            tabIndex={isPrevDisabled ? -1 : 0}
                            className={isPrevDisabled ? "pointer-events-none opacity-50" : ""}
                            onClick={() => {
                                if (!isPrevDisabled) onPageChange(currentPage - 1);
                            }}
                        />
                    </PaginationItem>
                )}
                {generatePaginationLinks(currentPage, totalPages, onPageChange)}
                {showPreviousNext && (
                    <PaginationItem>
                        <PaginationNext
                            aria-disabled={isNextDisabled}
                            tabIndex={isNextDisabled ? -1 : 0}
                            className={isNextDisabled ? "pointer-events-none opacity-50" : ""}
                            onClick={() => {
                                if (!isNextDisabled) onPageChange(currentPage + 1);
                            }}
                        />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}