"use client"

import { useRef } from "react"

import { useGsapEffect } from "@/lib/gsapLazy"
import { cn } from "@/lib/utils"

/**
 * A newspaper rule that draws itself (DrawSVG) when it scrolls into view. `double` gives the classic
 * thin-over-thick section divider; `vertical` is a column rule. Rules already on screen when the page
 * loads are simply drawn (the masthead rule gets the CSS "printing" intro instead).
 */
export function Rule({ double = false, vertical = false, className }: { double?: boolean; vertical?: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  useGsapEffect(({ gsap }) => {
    const el = ref.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    gsap.from(el.querySelectorAll("line"), {
      drawSVG: vertical ? "0% 0%" : "50% 50%",
      duration: 1.1,
      ease: "power3.inOut",
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    })
  }, [])

  if (vertical) {
    return (
      <svg ref={ref} aria-hidden="true" className={cn("h-full w-px overflow-visible", className)} preserveAspectRatio="none" viewBox="0 0 1 100">
        <line x1="0.5" y1="0" x2="0.5" y2="100" stroke="var(--rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    )
  }
  return (
    <svg ref={ref} aria-hidden="true" className={cn("block w-full overflow-visible", double ? "h-[6px]" : "h-px", className)} preserveAspectRatio="none" viewBox={double ? "0 0 100 6" : "0 0 100 1"}>
      {double ? (
        <>
          <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="var(--rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="4.5" x2="100" y2="4.5" stroke="var(--rule)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </>
      ) : (
        <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="var(--rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  )
}
