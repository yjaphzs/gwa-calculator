import Link from "next/link";
import { AuthBanner } from "@/components/auth-banner";
import { BrandLogo } from "@/components/brand-logo";
import { GuestGuard } from "@/components/guest-guard";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <ThemeToggle />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">{children}</div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Link href="/terms-and-conditions" className="hover:text-primary">
              Terms and Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
        <AuthBanner />
      </div>
    </GuestGuard>
  );
}
