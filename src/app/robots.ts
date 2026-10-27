import type { MetadataRoute } from "next";

import { APP_URL } from "@/config/app";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal and transactional screens have nothing worth indexing.
      disallow: ["/account/", "/auth/", "/login/", "/register/", "/forgot-password/", "/leaderboard/"],
    },
    sitemap: `${APP_URL.replace(/\/+$/, "")}/sitemap.xml`,
  };
}
