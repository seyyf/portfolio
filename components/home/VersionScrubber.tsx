"use client"

import { m } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { anchorFor, releaseLabel, releases } from "@/data/releases"
import { cn } from "@/lib/utils"

const items = releases.map((r) => ({ version: r.version, id: anchorFor(r.version), label: releaseLabel(r), quiet: r.kind === "education" }))

/** The release whose top has passed 40% of the viewport (the one being read). */
function useActiveRelease() {
  const [active, setActive] = useState(items[0].id)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let current = items[0].id
      for (const it of items) {
        const el = document.getElementById(it.id)
        if (el && el.getBoundingClientRect().top <= line) current = it.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])
  return [active, setActive] as const
}

/**
 * Jump to any version. Desktop: a sticky rail in the left gutter (v6.0 → v0.1). Mobile: a sticky
 * strip of version pills under the header. The release in view is highlighted in both. Plain hash
 * links, so it also works before JavaScript loads.
 */
export function VersionScrubber() {
  const [active, setActive] = useActiveRelease()
  const strip = useRef<HTMLUListElement>(null)

  // Keep the active pill visible in the mobile strip (scrolls the strip only, never the page).
  useEffect(() => {
    const list = strip.current
    const pill = list?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (!list || !pill || list.offsetParent === null) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    list.scrollTo({ left: pill.offsetLeft - list.clientWidth / 2 + pill.clientWidth / 2, behavior: reduce ? "auto" : "smooth" })
  }, [active])

  return (
    <nav aria-label="Versions" className="sticky top-14 z-30 -mx-4 border-b border-border bg-bg/90 backdrop-blur-md sm:-mx-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
      {/* Mobile and tablet: horizontal strip. */}
      <ul ref={strip} className="flex gap-1.5 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden">
        {items.map((it) => {
          const on = it.id === active
          return (
            <li key={it.id} data-id={it.id} className="shrink-0">
              <a
                href={`#${it.id}`}
                onClick={() => setActive(it.id)}
                aria-current={on ? "location" : undefined}
                aria-label={`${it.version} ${it.label}`}
                className={cn(
                  "relative inline-flex h-9 items-center rounded-full border px-3 font-mono text-[0.8125rem] transition-colors",
                  on ? "border-transparent text-on-accent" : "border-border text-muted hover:text-ink"
                )}
              >
                {on && <m.span layoutId="strip-active" aria-hidden="true" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <span className="relative">{it.version}</span>
              </a>
            </li>
          )
        })}
      </ul>

      {/* Desktop: vertical rail. */}
      <ol className="sticky top-24 hidden before:absolute before:top-3 before:bottom-3 before:left-[5px] before:w-px before:bg-border lg:block">
        {items.map((it) => {
          const on = it.id === active
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={() => setActive(it.id)}
                aria-current={on ? "location" : undefined}
                className={cn("group relative flex items-center gap-3 py-1.5 pl-0 font-mono text-[0.8125rem] transition-colors", on ? "text-ink" : "text-muted hover:text-ink")}
              >
                <span aria-hidden="true" className="relative flex size-[11px] shrink-0 items-center justify-center">
                  <span className={cn("size-[7px] rounded-full border bg-bg transition-colors", it.quiet ? "border-muted/50" : "border-muted group-hover:border-ink")} />
                  {on && <m.span layoutId="rail-active" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                </span>
                <span className={cn(on && "font-semibold")}>{it.version}</span>
                <span className={cn("truncate font-sans text-xs transition-opacity", on ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>{it.label}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
