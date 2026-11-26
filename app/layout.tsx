import type { Metadata, Viewport } from "next"
import { IBM_Plex_Sans, Martian_Mono } from "next/font/google"

import { Game } from "@/components/game/Game"
import { HUD } from "@/components/hud/HUD"
import { Providers } from "@/components/Providers"
import { missions, tutorials } from "@/data/missions"
import { profile } from "@/data/profile"
import { statTabs } from "@/data/skills"
import { headScript } from "@/lib/headScripts"
import { siteName, siteUrl } from "@/lib/site"
import "./globals.css"

// Martian Mono (variable width) for titles and HUD labels, IBM Plex Sans for body and UI.
const martian = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-martian", display: "swap" })
const plex = IBM_Plex_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-plex", display: "swap" })

const title = `${profile.name} — ${profile.title} · ${profile.edition}`
const description = `${profile.intro} Explore the missions on a map of Tunis, or skip straight to the CV.`

export const metadata: Metadata = {
  // Every URL below (canonical, og:url, og:image, twitter:image) is resolved against this base.
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  applicationName: `${profile.name} — ${profile.edition}`,
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: ["Seyf Mejri", "Fullstack JavaScript Developer", "React", "Next.js", "Node.js", "TypeScript", "Tunis", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: { type: "profile", siteName, title, description, url: "/", locale: "en_US", firstName: "Seyf", lastName: "Mejri" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { themeColor: "#140c22", colorScheme: "dark", interactiveWidget: "resizes-content" }

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  description: profile.summary,
  url: siteUrl,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
  sameAs: [profile.linkedin],
  worksFor: { "@type": "Organization", name: missions[missions.length - 1].company },
  alumniOf: { "@type": "CollegeOrUniversity", name: "ISAMM", description: tutorials.map((t) => t.degree).join("; ") },
  knowsLanguage: ["ar", "en", "fr"],
  knowsAbout: statTabs.filter((t) => t.id !== "languages" && t.id !== "tools").flatMap((t) => t.skills.map((s) => s.name)),
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${martian.variable} ${plex.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>
        <Providers>
          <a href="#main" className="sr-only z-[95] rounded-lg bg-gold px-4 py-2 font-semibold text-bg focus:not-sr-only focus:fixed focus:top-16 focus:left-3">
            Skip to content
          </a>
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <HUD />
          <Game />
        </Providers>
        <script
          type="application/ld+json"
          // Static data from data/; "<" is escaped so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  )
}
