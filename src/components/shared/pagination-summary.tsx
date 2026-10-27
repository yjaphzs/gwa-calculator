interface PaginationSummaryProps {
  currentPage: number;
  pageSize: number;
  total: number;
  /** Noun after the count, e.g. "row(s)". */
  noun?: string;
}

/** "Showing 1 - 10 of 42 row(s)" */
export function PaginationSummary({
  currentPage,
  pageSize,
  total,
  noun = "row(s)",
}: PaginationSummaryProps) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="text-sm text-muted-foreground">
      Showing {from}
      {" - "}
      {to}
      {" of "}
      {total} {noun}
    </div>
  );
}
