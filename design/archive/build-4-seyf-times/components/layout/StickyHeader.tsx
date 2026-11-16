"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { SectionNav, SectionsMenu } from "@/components/layout/SectionNav"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { paper } from "@/data/profile"
import { cn } from "@/lib/utils"

/**
 * When the full masthead scrolls away, the header "shrinks" into this slim sticky bar: small
 * masthead, section nav (or the Sections menu on phones) and the edition switch. It slides in with a
 * CSS transition; while hidden it is inert, so keyboard focus never lands on it.
 */
export function StickyHeader() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const target = document.getElementById("masthead-rule")
    if (!target) return
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(target)
    return () => io.disconnect()
  }, [])

  return (
    <div
      inert={!shown}
      aria-hidden={!shown || undefined}
      className={cn(
        "no-print fixed inset-x-0 top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur-sm transition-[transform,visibility] duration-300 ease-[var(--ease-ink)] motion-reduce:transition-none",
        shown ? "visible translate-y-0" : "invisible -translate-y-full"
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="font-masthead py-1.5 text-[1.55rem] leading-none whitespace-nowrap" aria-label={`${paper.name}, front page`}>
          {paper.name}
        </Link>
        <SectionNav id="sticky" className="flex-1" />
        <div className="flex items-center gap-3">
          <SectionsMenu />
          <ThemeToggle compact />
        </div>
      </div>
    </div>
  )
}
