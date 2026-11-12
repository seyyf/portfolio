import type { Metadata } from "next"

import { profile } from "@/data/profile"

const title = `Résumé`
const description = `${profile.name}, ${profile.title} in ${profile.location} with ${profile.yearsExperience} years of experience. Experience, projects, skills, education and contact on one printable page.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resume" },
  openGraph: { type: "profile", siteName: "SeyfOS", locale: "en_US", url: "/resume", title: `${profile.name} · Résumé`, description },
  twitter: { card: "summary_large_image", title: `${profile.name} · Résumé`, description },
}

// Rendered by the OS shell (Focus Mode): the phone animates out and the résumé fills the page.
export default function ResumePage() {
  return null
}
