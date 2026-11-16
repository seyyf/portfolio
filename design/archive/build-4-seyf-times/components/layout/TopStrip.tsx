"use client"

import { Download, Printer } from "lucide-react"
import Link from "next/link"

import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { paper, profile } from "@/data/profile"
import { useEditionDate } from "@/lib/date"

/** Small caps strip above the masthead: dateline, edition, theme, Print Edition, CV. */
export function TopStrip() {
  const date = useEditionDate()
  return (
    <div className="no-print border-b border-rule">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 sm:px-6">
        <p className="label text-gray">
          <span>{profile.location}</span>
          <span aria-hidden="true"> · </span>
          {/* The date fills in after hydration; until then an invisible longest-date placeholder holds its width, so nothing shifts. */}
          {date ? <span>{date}</span> : <span className="invisible" aria-hidden="true">Wednesday, 30 September 2026</span>}
          <span className="hidden md:inline">
            <span aria-hidden="true"> · </span>
            {paper.edition}
          </span>
        </p>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/print" className="label hidden min-h-9 items-center gap-1.5 hover:text-accent-ink sm:inline-flex">
            <Printer size={14} aria-hidden="true" />
            Print Edition
          </Link>
          <a href={profile.cv} download={profile.cvFileName} className="label inline-flex min-h-9 items-center gap-1.5 hover:text-accent-ink">
            <Download size={14} aria-hidden="true" />
            <span>
              <span className="sm:hidden">CV</span>
              <span className="hidden sm:inline">Download CV</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
