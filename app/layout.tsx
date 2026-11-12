import type { Metadata, Viewport } from "next"
import { Fredoka, Geist } from "next/font/google"

import { profile } from "@/data/profile"
import { THEME_KEY, VISITED_KEY } from "@/lib/store"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" })
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" })

const title = `${profile.name} · ${profile.title}`
const description = `SeyfOS: my portfolio is a phone. Every app is something I built. ${profile.title} in Tunis with ${profile.yearsExperience} years of experience in React, Next.js and Node.js.`

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s · SeyfOS` },
  description,
  applicationName: "SeyfOS",
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: ["Seyf Mejri", "Fullstack JavaScript Developer", "React", "Next.js", "Node.js", "TypeScript", "Tunis", "portfolio"],
  openGraph: { type: "profile", siteName: "SeyfOS", title, description, locale: "en_US", firstName: "Seyf", lastName: "Mejri" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4eefc" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1020" },
  ],
}

// Runs before first paint: theme (saved choice, else the OS preference) and returning-visitor flag
// (skips the lock screen), so nothing flashes.
const preferenceScript = `(function(){try{var d=document.documentElement,t=null,v=null;try{t=localStorage.getItem(${JSON.stringify(
  THEME_KEY
)});v=localStorage.getItem(${JSON.stringify(VISITED_KEY)})}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",t);if(v==="1"||location.pathname!=="/")d.setAttribute("data-returning","true")}catch(e){}})()`

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  url: profile.siteUrl,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
  sameAs: [profile.linkedin],
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "PHP", "MongoDB", "MySQL"],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${fredoka.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          // Static data from data/profile.ts; "<" is escaped so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  )
}
