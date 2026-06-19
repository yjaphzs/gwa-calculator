import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder shown while the calculator data is loading (auth resolving / cloud
 * sync fetching), so the user never sees a flash of the empty state on reload.
 * Mirrors the real layout: GWA summary card, toolbar, subject rows, footer.
 */
export function CalculatorSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-4" aria-hidden>
      {/* GWA summary card — same shell as the real <GwaSummary /> */}
      <div className="flex flex-col gap-2 rounded-lg border border-dashed bg-muted/30 px-8 py-12">
        <div className="flex items-center justify-between">
          <Skeleton className="size-11 rounded-md" />
          <Skeleton className="h-14 w-40" />
        </div>
      </div>

      {/* Toolbar — action buttons (Add / Reset / more) */}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="size-9" />
      </div>

      {/* Toolbar — page size + search */}
      <div className="flex w-full gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 flex-1" />
      </div>

      {/* Subject rows — bordered cards */}
      <div className="mt-4 flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border p-4"
          >
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-3.5 w-8" />
              <Skeleton className="h-6 w-14" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="size-9 rounded-md" />
              <Skeleton className="size-9 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer — "Showing …" + pagination */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-9 w-56" />
      </div>
    </div>
  );
}
