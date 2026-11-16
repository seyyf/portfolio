import type { Metadata, Viewport } from "next"
import { Anton, Inter, JetBrains_Mono } from "next/font/google"

import { HUD } from "@/components/hud/HUD"
import { Providers } from "@/components/Providers"
import { missions, tutorials } from "@/data/missions"
import { profile } from "@/data/profile"
import { statTabs } from "@/data/skills"
import { headScript } from "@/lib/headScripts"
import "./globals.css"

// Anton for display titles, Inter for body and UI, JetBrains Mono for HUD numbers.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" })

const title = `${profile.name} — ${profile.title} · ${profile.edition}`
const description = `${profile.intro} Explore the missions on a map of Tunis, or skip straight to the CV.`

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  applicationName: `${profile.name} — ${profile.edition}`,
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: ["Seyf Mejri", "Fullstack JavaScript Developer", "React", "Next.js", "Node.js", "TypeScript", "Tunis", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: { type: "profile", siteName: `${profile.name} — ${profile.edition}`, title, description, url: "/", locale: "en_US", firstName: "Seyf", lastName: "Mejri" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { themeColor: "#0b0f1a", colorScheme: "dark", interactiveWidget: "resizes-content" }

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  description: profile.summary,
  url: profile.siteUrl,
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
    <html lang="en" className={`${anton.variable} ${inter.variable} ${jetbrains.variable} antialiased`} suppressHydrationWarning>
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
