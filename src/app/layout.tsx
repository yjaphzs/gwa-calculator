import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Serif, Martian_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerCleanup } from "@/components/shared/service-worker-cleanup";
import { AppearanceSync } from "@/features/appearance/components/appearance-sync";
import { SCHEME_SCRIPT } from "@/features/appearance/lib/scheme-script";

const fontSans = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const fontSerif = Roboto_Serif({
  subsets: ["latin"],
  variable: "--font-roboto-serif",
  display: "swap",
});

const fontMono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "GWA Calculator";
const SITE_DESCRIPTION =
  "Compute your General Weighted Average and academic honors. Works offline in your browser. Sign in to save your progress and sync across devices.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s · ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/site.webmanifest",
  keywords: [
    "GWA",
    "General Weighted Average",
    "GWA calculator",
    "Latin honors",
    "Dean's List",
    "grade calculator",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    // Static file (not an opengraph-image route) so Hosting serves it as a
    // plain .png regardless of trailing-slash rewrites.
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME}: compute your GWA and honors` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

// viewportFit "cover" exposes env(safe-area-inset-*) for the bottom tab bar and sheets.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables must live on <html>: globals.css reads them on :root
    // (--font-sans: var(--font-roboto)…), which can't see variables set on <body>.
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Restores a saved color scheme before the first paint (no amber flash). */}
        <script dangerouslySetInnerHTML={{ __html: SCHEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ServiceWorkerCleanup />
        <NextTopLoader
          color="var(--primary)"
          height={3}
          shadow="0 0 10px var(--primary), 0 0 5px var(--primary)"
          showSpinner={false}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppearanceSync />
            {children}
          </AuthProvider>
          <Toaster
            offset={{ bottom: "var(--toast-bottom)" }}
            mobileOffset={{ bottom: "var(--toast-bottom)" }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
