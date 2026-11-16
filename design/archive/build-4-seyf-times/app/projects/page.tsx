import type { Metadata } from "next"

import { ProjectIndex } from "@/components/projects/ProjectIndex"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"
import { Rule } from "@/components/shared/Rule"
import { paper, profile } from "@/data/profile"

const description = `Case studies by ${profile.name}: an internal CRM, restaurant ordering, event booking, an ERP, e-commerce stores and client sites, built with React, Next.js and Node.js.`

export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects" },
  openGraph: { type: "website", siteName: paper.name, title: "Projects", description, url: "/projects" },
}

export default function ProjectsPage() {
  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-16 sm:px-6 lg:pt-12 lg:pb-24">
        <header className="max-w-3xl">
          <p className="kicker">Section B · The Work</p>
          <Reveal as="h1" variant="words" className="mt-3 font-headline text-5xl font-black tracking-tight sm:text-6xl">
            Projects
          </Reveal>
          <Reveal as="p" className="mt-4 text-xl leading-snug text-ink/80 italic">
            Every project, filed as a story. Pick a beat to narrow the page.
          </Reveal>
        </header>
        <Rule double className="mt-8 mb-8" />
        <ProjectIndex />
      </div>
    </PageTransition>
  )
}
