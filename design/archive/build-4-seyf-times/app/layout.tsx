import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Newsreader, Playfair_Display, UnifrakturMaguntia } from "next/font/google"

import { Footer } from "@/components/layout/Footer"
import { Masthead } from "@/components/layout/Masthead"
import { Providers } from "@/components/layout/Providers"
import { StickyHeader } from "@/components/layout/StickyHeader"
import { TopStrip } from "@/components/layout/TopStrip"
import { Cursor } from "@/components/shared/Cursor"
import { IntroPrint, introScript } from "@/components/shared/IntroPrint"
import { paper, profile } from "@/data/profile"
import "./globals.css"

// Blackletter only for the masthead; Playfair for headlines; Newsreader for body; Inter for labels;
// JetBrains Mono for market numbers (not preloaded: it's only used below the fold on two pages).
const unifraktur = UnifrakturMaguntia({ subsets: ["latin"], weight: "400", variable: "--font-unifraktur", display: "swap" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" })
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap", style: ["normal", "italic"] })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", preload: false })

const title = `${paper.name} · ${profile.name}, ${profile.title}`
const description = `${profile.name}, ${profile.title} in Tunis with ${profile.yearsExperience} years of experience building React/Next.js frontends and Node.js backends. Projects, career, skills and contact, as a newspaper.`

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s · ${paper.name}` },
  description,
  applicationName: paper.name,
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: ["Seyf Mejri", "Fullstack JavaScript Developer", "React", "Next.js", "Node.js", "TypeScript", "Tunis", "portfolio"],
  openGraph: { type: "profile", siteName: paper.name, title, description, locale: "en_US", firstName: "Seyf", lastName: "Mejri" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  url: profile.siteUrl,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
  sameAs: [profile.linkedin],
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "PHP", "MongoDB", "MySQL", "Docker"],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${unifraktur.variable} ${playfair.variable} ${newsreader.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <Providers>
          <a href="#main" className="label sr-only z-[100] bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
            Skip to content
          </a>
          <header className="no-print">
            <TopStrip />
            <Masthead />
          </header>
          <StickyHeader />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <IntroPrint />
          <Cursor />
        </Providers>
        <script
          type="application/ld+json"
          // Static data from data/profile.ts; "<" is escaped so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  )
}
