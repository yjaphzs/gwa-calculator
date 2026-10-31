import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { APP_NAME } from "@/config/app";
import { cn } from "@/lib/utils";

/** App wordmark + logo that links back to the calculator. */
export function BrandLogo({
  className,
  showName = true,
}: {
  className?: string;
  showName?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2", className)}
      aria-label={APP_NAME}
    >
      <span className="flex size-8 shrink-0 overflow-hidden rounded-md">
        <BrandMark />
      </span>
      {showName && (
        <span className="text-base font-bold tracking-tight whitespace-nowrap sm:text-lg">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
