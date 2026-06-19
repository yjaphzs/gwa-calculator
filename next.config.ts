import type { NextConfig } from "next";

import pkg from "./package.json";

// Static export is only enabled for production builds — `npm run dev` runs as a
// normal Next.js app. The whole app is client-rendered (the calculator and the
// Firebase auth flows are browser-only), so a static export to `out/` deploys
// cleanly to Firebase Hosting.
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isProd ? { output: "export" as const } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    // Exposed to the client as process.env.NEXT_PUBLIC_APP_VERSION so the
    // header can show the running version without a separate env var.
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
};

export default nextConfig;
