"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { paper, sections } from "@/data/profile"
import { getLenis } from "@/lib/lenis"
import { cn } from "@/lib/utils"

export const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

/**
 * Section navigation under the masthead: uppercase Inter, an animated red underline on the active
 * section that draws in from the left (and previews on hover). Plain CSS, so the navigation needs no
 * animation library.
 */
export function SectionNav({ className }: { id?: string; className?: string }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Sections" className={cn("hidden md:block", className)}>
      <ul className="flex items-center justify-center gap-1 lg:gap-3">
        {sections.map((s) => {
          const active = isActive(pathname, s.href)
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={cn("group label relative inline-flex min-h-11 items-center px-3 transition-colors hover:text-accent-ink", active && "text-ink")}
              >
                {s.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 bottom-2 h-[2px] origin-left bg-accent transition-transform duration-300 ease-[var(--ease-ink)]",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
                  )}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Mobile: a "Sections" button that opens a full-screen newspaper-style index. */
export function SectionsMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const dialogId = useId()

  // Close when the route changes (state is reset with the pathname key below).
  const [shownFor, setShownFor] = useState(pathname)
  if (shownFor !== pathname) {
    setShownFor(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    document.documentElement.style.overflow = "hidden"
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    const btn = opener.current
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ""
      window.removeEventListener("keydown", onKey)
      btn?.focus()
    }
  }, [open])

  return (
    <div className={cn("md:hidden", className)}>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={dialogId}
        className="label inline-flex min-h-11 items-center gap-2 px-1 hover:text-accent-ink"
      >
        <Menu size={16} aria-hidden="true" />
        Sections
      </button>
      {open && (
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-label="Sections index"
            className="sections-index fixed inset-0 z-[90] flex flex-col bg-paper px-5 pt-4 pb-8"
          >
            <div className="flex items-center justify-between">
              <p className="font-masthead text-2xl">{paper.name}</p>
              <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="label inline-flex min-h-11 items-center gap-1.5" aria-label="Close sections index">
                <X size={18} aria-hidden="true" />
                Close
              </button>
            </div>
            <div className="rule-double mt-3" />
            <p className="label mt-6 text-gray">Index</p>
            <ol className="mt-3">
              {sections.map((s, i) => {
                const active = isActive(pathname, s.href)
                return (
                  <li key={s.href} className="border-b border-rule/30">
                    <Link
                      href={s.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="flex min-h-14 items-baseline justify-between gap-4 py-3"
                    >
                      <span className={cn("font-headline text-3xl font-bold", active && "text-accent-ink")}>{s.label}</span>
                      <span className="label text-gray">{String.fromCharCode(65 + i)}1</span>
                    </Link>
                  </li>
                )
              })}
              <li className="border-b border-rule/30">
                <Link href="/print" onClick={() => setOpen(false)} className="flex min-h-14 items-baseline justify-between gap-4 py-3">
                  <span className="font-headline text-3xl font-bold">Print Edition</span>
                  <span className="label text-gray">CV</span>
                </Link>
              </li>
            </ol>
          </div>
        )}
    </div>
  )
}
