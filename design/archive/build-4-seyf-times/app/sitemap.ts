import type { MetadataRoute } from "next"

import { profile } from "@/data/profile"
import { projects } from "@/data/projects"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.siteUrl
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...["/projects", "/career", "/skills", "/contact", "/print"].map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ]
}
