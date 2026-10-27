import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/gwa-calculator.jpg";
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
      <span className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-primary-foreground">
        <Image
          src={logo}
          alt=""
          width={32}
          height={32}
          className="size-full object-cover"
          priority
        />
      </span>
      {showName && (
        <span className="text-base font-extrabold tracking-tight">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
