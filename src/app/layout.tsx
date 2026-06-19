import type { Metadata } from "next";
import { Roboto, Roboto_Serif, Martian_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/sonner";

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
  "Compute your General Weighted Average and academic honors. Works offline in your browser — sign in to save your progress and sync across devices.";

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
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
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
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
