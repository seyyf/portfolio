import type { Metadata } from "next"

import { profile } from "@/data/profile"

/**
 * The site's public base URL, used as `metadataBase` (canonical, Open Graph and Twitter URLs are
 * relative paths resolved against it), and by the sitemap, robots.txt and JSON-LD.
 *
 * 1. NEXT_PUBLIC_SITE_URL, when set (overrides everything).
 * 2. In `next dev`: http://localhost:3000.
 * 3. Otherwise (every production build, previews included): the live domain, so canonical URLs
 *    always point at https://www.seyfmejri.tn.
 */
const PRODUCTION_URL = "https://www.seyfmejri.tn"

function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, "")
  if (process.env.NODE_ENV === "development") return "http://localhost:3000"
  return PRODUCTION_URL
}

export const siteUrl = resolveSiteUrl()

export const siteName = `${profile.name} — ${profile.edition}`

/** The share image (app/opengraph-image.png). Pages that set their own Open Graph block must list it
 *  again, or they lose it: Next.js replaces the parent's openGraph object instead of merging it. */
const shareImage = { url: "/opengraph-image.png", width: 1200, height: 630, alt: `${profile.name}, ${profile.title}: ${profile.edition}` }

/** Open Graph + Twitter + canonical for a page, as paths relative to `metadataBase`. */
export function pageMeta(path: string, title: string, description: string, type: "website" | "article" | "profile" = "website"): Metadata {
  return {
    alternates: { canonical: path },
    openGraph: { type, siteName, locale: "en_US", title, description, url: path, images: [shareImage] },
    twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  }
}
