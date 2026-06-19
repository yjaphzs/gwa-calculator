import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

// Shared typography for the legal documents — keeps Terms and Privacy
// consistent without pulling in a Tailwind typography plugin.
const PROSE =
  "max-w-none " +
  "[&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight " +
  "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground " +
  "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground " +
  "[&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground " +
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ul]:text-sm [&_ul]:leading-relaxed [&_ul]:text-muted-foreground " +
  "[&_li]:marker:text-muted-foreground/60 " +
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_strong]:font-semibold [&_strong]:text-foreground";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
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

      <article className={PROSE}>{children}</article>

      <footer className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-6 text-sm text-muted-foreground">
        <Link href="/terms-and-conditions" className="hover:text-primary">
          Terms and Conditions
        </Link>
        <Link href="/privacy-policy" className="hover:text-primary">
          Privacy Policy
        </Link>
        <span className="ml-auto">© {year} GWA Calculator</span>
      </footer>
    </div>
  );
}
