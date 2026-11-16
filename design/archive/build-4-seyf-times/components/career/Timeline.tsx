"use client"

import { useRef, useState } from "react"

import { EditionCard } from "@/components/career/EditionCard"
import type { Job } from "@/data/career"
import { gsapReady, useGsapEffect } from "@/lib/gsapLazy"

/**
 * The archive: past editions stacked newest first, with a vertical timeline line on the left that
 * draws itself as you scroll (scrubbed). Each edition slides in and settles once. Reduced motion: the
 * line is simply drawn and the cards are in place.
 */
export function Timeline({ jobs }: { jobs: Job[] }) {
  const ref = useRef<HTMLDivElement>(null)

  // On the first page of a visit, what's already on screen stays as rendered (GSAP arrives a moment later).
  const [firstPage] = useState(() => typeof window === "undefined" || !gsapReady())

  useGsapEffect(
    ({ gsap }) => {
      const root = ref.current
      if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      const line = root.querySelector("[data-timeline-line]")
      if (line) {
        gsap.fromTo(
          line,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", ease: "none", scrollTrigger: { trigger: root, start: "top 75%", end: "bottom 75%", scrub: 0.6 } }
        )
      }

      root.querySelectorAll<HTMLElement>("[data-edition]").forEach((item) => {
        if (firstPage && item.getBoundingClientRect().top < window.innerHeight * 0.88) return
        const card = item.querySelector("[data-card]")
        const dot = item.querySelector("[data-dot]")
        const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 88%", once: true } })
        if (card) {
          tl.from(card, { autoAlpha: 0, y: 30, rotation: -1.5, transformOrigin: "0% 0%", duration: 0.9, ease: "power3.out" })
        }
        if (dot) tl.from(dot, { scale: 0, duration: 0.4, ease: "back.out(2)" }, 0.1)
      })
    },
    []
  )

  return (
    <div ref={ref} className="relative">
      <svg
        aria-hidden="true"
        focusable="false"
        className="absolute top-0 left-[7px] h-full w-0.5 overflow-visible sm:left-[11px]"
        preserveAspectRatio="none"
        viewBox="0 0 2 100"
      >
        <line data-timeline-line x1="1" y1="0" x2="1" y2="100" stroke="var(--rule)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>

      <ol className="space-y-10 pl-8 sm:space-y-14 sm:pl-12" aria-label="Past editions, newest first">
        {jobs.map((job, i) => (
          <li key={`${job.company}-${job.start}`} data-edition className="relative">
            <span
              data-dot
              aria-hidden="true"
              className="absolute top-7 -left-8 size-4 rounded-full border-2 border-ink bg-paper sm:-left-12 sm:size-6"
            >
              <span className="absolute inset-[3px] rounded-full bg-accent sm:inset-[5px]" />
            </span>
            <div data-card>
              <EditionCard job={job} edition={jobs.length - i} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
