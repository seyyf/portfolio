import type { MetadataRoute } from "next"

import { missionPages } from "@/data/missions"
import { profile } from "@/data/profile"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.siteUrl
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...missionPages.map((m) => ({ url: `${base}/missions/${m.slug}`, changeFrequency: "yearly" as const, priority: m.kind === "mission" ? 0.8 : 0.6 })),
    { url: `${base}/stats`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/cv`, changeFrequency: "monthly", priority: 0.9 },
  ]
}
