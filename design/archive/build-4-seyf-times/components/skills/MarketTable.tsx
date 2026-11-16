"use client"

import { useRef, useState } from "react"

import { Sparkline } from "@/components/skills/Sparkline"
import type { Index } from "@/data/skills"
import { gsapReady, useGsapEffect } from "@/lib/gsapLazy"
import { cn } from "@/lib/utils"

type MarketTableProps = {
  index: Index
  /** Total number of roles on the CV, for the "of N" in the header. */
  totalRoles: number
  className?: string
}

/**
 * One skills index printed like a newspaper market table. The only figure is the real number of roles
 * that used the skill; it counts up from 0 once in view. Sparklines draw themselves (decorative).
 */
export function MarketTable({ index, totalRoles, className }: MarketTableProps) {
  const ref = useRef<HTMLDivElement>(null)

  // On the first page of a visit, what's already on screen stays as rendered (GSAP arrives a moment later).
  const [firstPage] = useState(() => typeof window === "undefined" || !gsapReady())

  useGsapEffect(
    ({ gsap }) => {
      const root = ref.current
      if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      if (firstPage && root.getBoundingClientRect().top < window.innerHeight * 0.85) return
      const trigger = { trigger: root, start: "top 85%", once: true }

      gsap.from(root.querySelectorAll("[data-sparkline]"), {
        drawSVG: "0%",
        duration: 1.2,
        ease: "power2.inOut",
        stagger: 0.06,
        scrollTrigger: trigger,
      })

      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el, i) => {
        const target = Number(el.dataset.count)
        if (!target) return
        const counter = { value: 0 }
        el.textContent = "0"
        gsap.to(counter, {
          value: target,
          duration: 1,
          delay: i * 0.06,
          ease: "power2.out",
          snap: { value: 1 },
          onUpdate: () => {
            el.textContent = String(counter.value)
          },
          scrollTrigger: trigger,
        })
      })
    },
    []
  )

  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      <table className="w-full border-collapse font-sans">
        <caption className="text-left">
          <h2 className="border-b-[3px] border-double border-rule pb-1.5 font-headline text-[1.45rem] leading-tight font-bold">{index.title}</h2>
          <span className="sr-only">
            Skills in this index, with how many of Seyf&apos;s {totalRoles} roles used each one.
          </span>
        </caption>
        <thead>
          <tr className="label border-b border-ink text-gray">
            <th scope="col" className="py-2 pr-2 text-left font-semibold">
              Skill
            </th>
            <th scope="col" className="px-1 py-2 text-left font-semibold">
              <span className="sr-only">Chart (decorative)</span>
            </th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">
              Roles<span className="sr-only"> (of {totalRoles})</span>
            </th>
            <th scope="col" className="py-2 pl-2 text-left font-semibold">
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {index.skills.map((s) => (
            <tr key={s.name} className="border-b border-ink/15 align-middle">
              <th scope="row" className="py-2.5 pr-2 text-left font-normal">
                <span className="block text-[0.95rem] leading-snug font-semibold">{s.name}</span>
                {s.detail ? <span className="block text-[0.8rem] leading-snug text-gray">{s.detail}</span> : null}
              </th>
              <td className="px-1 py-2.5 whitespace-nowrap">
                <span aria-hidden="true" className="flex items-center gap-1.5">
                  <span className="text-[0.7rem] text-market">▲</span>
                  <Sparkline name={s.name} className="text-ink/70" />
                </span>
              </td>
              <td className="px-2 py-2.5 text-right font-mono text-[1rem] font-semibold tabular-nums">
                {s.roles > 0 ? (
                  <>
                    <span aria-hidden="true" data-count={s.roles}>
                      {s.roles}
                    </span>
                    <span className="sr-only">{s.roles}</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">—</span>
                    <span className="sr-only">Not counted in a role</span>
                  </>
                )}
              </td>
              <td className="py-2.5 pl-2 text-left text-[0.8rem] leading-snug">{s.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
