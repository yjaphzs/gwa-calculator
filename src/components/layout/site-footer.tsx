import Link from "next/link";

import KofiButton from "@/components/shared/kofi-button";
import { APP_NAME, APP_VERSION } from "@/config/app";

/** Links every footer shows, in order. */
export const FOOTER_LINKS = [
  { href: "/how-to-compute-gwa", label: "How GWA is computed" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
] as const;

function Year() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}

/** Calculator footer: Ko-fi, links, and the maker credit. */
function FullFooter() {
  return (
    <footer className="mt-12 border-t">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-4">
        <KofiButton username="yjaphzs" label="Buy Me a Ko-fi" preset="no_background" />
        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {FOOTER_LINKS.map((link, i) => (
            <span key={link.href} className="contents">
              {i > 0 && (
                <span aria-hidden className="text-border">
                  •
                </span>
              )}
              <Link href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">
          © <Year /> {APP_NAME} <span className="font-mono">v{APP_VERSION}</span> · Made by{" "}
          <a
            href="https://www.yjaphzs.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors hover:text-primary"
          >
            JPB
          </a>
        </p>
      </div>
    </footer>
  );
}

/** Content-page footer: links on the left, copyright on the right. */
function CompactFooter() {
  return (
    <footer className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-6 text-sm text-muted-foreground">
      {FOOTER_LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="hover:text-primary">
          {link.label}
        </Link>
      ))}
      <span className="ml-auto">
        © <Year /> {APP_NAME}
      </span>
    </footer>
  );
}

/** Auth-screen footer: small centered links only. */
function MinimalFooter() {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {FOOTER_LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="hover:text-primary">
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function SiteFooter({ variant = "full" }: { variant?: "full" | "compact" | "minimal" }) {
  if (variant === "compact") return <CompactFooter />;
  if (variant === "minimal") return <MinimalFooter />;
  return <FullFooter />;
}
