import type { Metadata, Viewport } from "next"
import { Fredoka, Nunito } from "next/font/google"

import { profile } from "@/data/city"
import { THEME_KEY } from "@/lib/store"
import "./globals.css"

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" })

const title = `${profile.name} · ${profile.title}`
const description = `Seyf City: an interactive 3D town where every building is an app I built. ${profile.title} in Tunis with ${profile.yearsExperience} years of experience in React, Next.js and Node.js.`

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title,
  description,
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: ["Seyf Mejri", "Fullstack JavaScript Developer", "React", "Next.js", "Node.js", "TypeScript", "Tunis", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: "Seyf City",
    title,
    description,
    locale: "en_US",
    firstName: "Seyf",
    lastName: "Mejri",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff4e6" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1f3b" },
  ],
}

// Runs before first paint: applies the remembered day/night choice (or the OS preference)
// and flags reduced motion, so the page never flashes the wrong theme.
const preferenceScript = `(function(){try{var d=document.documentElement,v=null;try{v=localStorage.getItem(${JSON.stringify(
  THEME_KEY
)})}catch(e){}var n=v==="night"||(v!=="day"&&matchMedia("(prefers-color-scheme: dark)").matches);if(n)d.setAttribute("data-night","true");if(matchMedia("(prefers-reduced-motion: reduce)").matches)d.setAttribute("data-reduced-motion","true")}catch(e){}})()`

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  url: profile.siteUrl,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
  sameAs: [profile.linkedin],
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "Three.js"],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="btn btn-plain sr-only z-[60] focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          // Static data from data/city.ts; "<" is escaped so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  )
}
