import Link from "next/link";
import { AuthBanner } from "@/components/auth-banner";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

// Mirrors the (auth) split-screen layout, but WITHOUT GuestGuard — account
// actions (verify email / reset password) must work whether the user is signed
// in or not.
export default function AuthActionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
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
  );
}
