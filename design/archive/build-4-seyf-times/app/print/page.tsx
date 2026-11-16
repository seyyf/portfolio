import type { Metadata } from "next"

import { PrintEdition } from "@/components/print/PrintEdition"
import { PageTransition } from "@/components/shared/PageTransition"
import { profile } from "@/data/profile"

export const metadata: Metadata = {
  title: "Print Edition: Résumé",
  description: `${profile.name}, ${profile.title} in ${profile.city}: a one-page printable résumé with experience, selected projects, skills, education and languages.`,
  alternates: { canonical: "/print" },
}

export default function PrintPage() {
  return (
    <PageTransition>
      <div className="px-4 pt-10 pb-20 sm:px-6 sm:pt-14 print:p-0!">
        <PrintEdition />
      </div>
    </PageTransition>
  )
}
