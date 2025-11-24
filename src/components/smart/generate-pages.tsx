// generate-pages.ts
import * as React from "react";
import {
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";

export const generatePaginationLinks = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
) => {
    const pages: React.ReactNode[] = [];
    if (totalPages <= 4) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => onPageChange(i)}
                        isActive={i === currentPage}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }
    } else {
        // Always show first page
        pages.push(
            <PaginationItem key={1}>
                <PaginationLink
                    onClick={() => onPageChange(1)}
                    isActive={currentPage === 1}
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );
        if (currentPage > 3) {
            pages.push(<PaginationEllipsis key="start-ellipsis" />);
        }
        // Show up to 2 pages before and after current page
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => onPageChange(i)}
                        isActive={i === currentPage}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        if (currentPage < totalPages - 2) {
            pages.push(<PaginationEllipsis key="end-ellipsis" />);
        }
        // Always show last page
        pages.push(
            <PaginationItem key={totalPages}>
                <PaginationLink
                    onClick={() => onPageChange(totalPages)}
                    isActive={currentPage === totalPages}
                >
                    {totalPages}
                </PaginationLink>
            </PaginationItem>
        );
    }
    return pages;
};
