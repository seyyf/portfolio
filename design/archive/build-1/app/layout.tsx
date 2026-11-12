import type { Metadata, Viewport } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import { RevealObserver } from "@/components/site/reveal-observer"
import { profile } from "@/lib/content"
import "./globals.css"

const title = `${profile.name} · ${profile.title}`
const description =
  "Fullstack JavaScript developer in Tunis with 6 years of experience building React/Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products."

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title,
  description,
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: [
    "Seyf Mejri",
    "Fullstack JavaScript Developer",
    "React developer",
    "Next.js developer",
    "Node.js developer",
    "TypeScript",
    "Tunis",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.name,
    title,
    description,
    locale: "en_US",
    firstName: "Seyf",
    lastName: "Mejri",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
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
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "shadcn/ui"],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-50 rounded-pill bg-ink px-4 py-2 text-body-sm font-medium text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
        <RevealObserver />
        <script
          type="application/ld+json"
          // Static data from lib/content.ts; "<" is escaped so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  )
}
