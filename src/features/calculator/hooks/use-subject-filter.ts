"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { filterSubjects } from "@/features/calculator/lib/filter-subjects";
import { pageCount, paginate } from "@/lib/pagination";
import type { Subject } from "@/types";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export type SubjectFilter = ReturnType<typeof useSubjectFilter>;

/** Search + pagination over the working subjects. */
export function useSubjectFilter(subjects: Subject[]) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSizeState] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => filterSubjects(subjects, search), [subjects, search]);
  const totalPages = pageCount(filtered.length, pageSize);
  const paginated = paginate(filtered, currentPage, pageSize);

  // Jump back to the first page when the results shrink below the current one.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const setPageSize = useCallback((size: number) => {
    setCurrentPage(1);
    setPageSizeState(size);
  }, []);

  return {
    search,
    setSearch,
    pageSize,
    setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    currentPage,
    setCurrentPage,
    totalPages,
    filtered,
    paginated,
  };
}
