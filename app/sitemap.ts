import type { MetadataRoute } from "next"

import { appIds } from "@/data/apps"
import { profile } from "@/data/profile"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: profile.siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${profile.siteUrl}/resume`, changeFrequency: "monthly", priority: 0.9 },
    ...appIds.map((id) => ({ url: `${profile.siteUrl}/app/${id}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ]
}
