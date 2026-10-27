import { Medal } from "lucide-react";

import { cn } from "@/lib/utils";

interface HonorBadgeProps {
  honor: string;
  className?: string;
  /** Show only the medal on small screens; the name stays readable to screen readers. */
  compact?: boolean;
}

/** The one honor badge used everywhere: amber tint from the --honor tokens. */
export function HonorBadge({ honor, className, compact = false }: HonorBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-honor-border bg-honor px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-honor-foreground",
        className,
      )}
    >
      <Medal aria-hidden className="size-3.5" />
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{honor}</span>
    </span>
  );
}
