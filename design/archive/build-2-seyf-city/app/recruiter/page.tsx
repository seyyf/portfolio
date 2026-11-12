import type { Metadata } from "next"

import { RecruiterView } from "@/components/recruiter/RecruiterView"
import { profile } from "@/data/city"

const title = `${profile.name} · Recruiter view`
const description = `The quick version of Seyf City: ${profile.name}, ${profile.title} in ${profile.location} with ${profile.yearsExperience} years of experience. Experience, projects, skills and contact on one printable page.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/recruiter" },
  // Nested metadata objects replace the layout's, so the shared fields are restated here.
  openGraph: { type: "profile", siteName: "Seyf City", locale: "en_US", url: "/recruiter", title, description },
  twitter: { card: "summary_large_image", title, description },
}

export default function RecruiterPage() {
  return (
    <main id="main" className="min-h-dvh px-4 py-6 sm:px-6 sm:py-10 print:p-0">
      <RecruiterView />
    </main>
  )
}
