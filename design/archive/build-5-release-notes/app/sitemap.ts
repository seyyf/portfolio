import type { MetadataRoute } from "next"

import { profile } from "@/data/profile"
import { jobs } from "@/data/releases"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.siteUrl
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...jobs.map((j) => ({ url: `${base}/releases/${j.slug}`, changeFrequency: "yearly" as const, priority: 0.7 })),
    { url: `${base}/cv`, changeFrequency: "monthly", priority: 0.6 },
  ]
}
