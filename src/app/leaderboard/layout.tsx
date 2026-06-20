import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-5 p-4 md:p-8">
        <header className="flex items-center justify-between">
          <BrandLogo />
          <ThemeToggle />
        </header>
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href="/">
            <ArrowLeftIcon />
            Back to calculator
          </Link>
        </Button>
        {children}
      </div>
    </AuthGuard>
  );
}
