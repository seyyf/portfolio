import type { Metadata } from "next"

import { profile } from "@/data/profile"

/**
 * The site's public base URL, used as `metadataBase` (canonical, Open Graph and Twitter URLs are
 * relative paths resolved against it), and by the sitemap, robots.txt and JSON-LD.
 *
 * 1. NEXT_PUBLIC_SITE_URL, when set (e.g. your custom domain: https://seyfmejri.com).
 * 2. On Vercel, the project's production domain (VERCEL_PROJECT_PRODUCTION_URL, set automatically),
 *    so preview deployments still point canonical URLs at production.
 * 3. Locally: http://localhost:3000.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, "")
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProd) return `https://${vercelProd.replace(/\/+$/, "")}`
  return "http://localhost:3000"
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
