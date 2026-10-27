import type { MetadataRoute } from "next";

import { APP_URL } from "@/config/app";

// Static export: generate sitemap.xml once at build time.
export const dynamic = "force-static";

/** Public, indexable pages only (auth and account screens are left out). */
const PAGES: Array<{ path: string; priority: number; changeFrequency: "monthly" | "yearly" }> = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/how-to-compute-gwa/", priority: 0.9, changeFrequency: "monthly" },
  { path: "/terms-and-conditions/", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy-policy/", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = APP_URL.replace(/\/+$/, "");
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    changeFrequency,
    priority,
  }));
}
