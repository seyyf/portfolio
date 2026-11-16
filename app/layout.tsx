import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { Providers } from "@/components/layout/Providers"
import { profile } from "@/data/profile"
import { education, jobs } from "@/data/releases"
import { skills } from "@/data/skills"
import "./globals.css"

// Exactly two families: Geist for UI and body, Geist Mono for versions, tags, dates and code.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })

const title = `${profile.name} — ${profile.title}`
const description = `${profile.name} is a ${profile.title.toLowerCase()} in Tunis with ${profile.yearsShipping} years of experience. React/Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products. Career, projects and stack, as release notes.`

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  applicationName: `${profile.name} — Release Notes`,
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: ["Seyf Mejri", "Fullstack JavaScript Developer", "React", "Next.js", "Node.js", "TypeScript", "Tunis", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: { type: "profile", siteName: `${profile.name} — Release Notes`, title, description, locale: "en_US", url: "/", firstName: "Seyf", lastName: "Mejri" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f12" },
  ],
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  description: profile.summary,
  url: profile.siteUrl,
  email: `mailto:${profile.email}`,
  image: `${profile.siteUrl}${profile.portrait.src}`,
  address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
  sameAs: [profile.linkedin],
  worksFor: { "@type": "Organization", name: jobs[0].company },
  alumniOf: [...new Set(education.map((e) => e.school.split(" ")[0]))].map((name) => ({ "@type": "CollegeOrUniversity", name })),
  knowsLanguage: ["ar", "en", "fr"],
  knowsAbout: [...skills.frontend, ...skills.backend, ...skills.databases, ...skills.devops],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only z-[100] rounded-md bg-ink px-4 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
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
