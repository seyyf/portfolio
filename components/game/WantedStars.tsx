"use client"

import Link from "next/link"

import { starsOf, useGame } from "@/lib/game"
import { cn } from "@/lib/utils"

/**
 * The HUD interest level: five stars that fill as the visitor explores (missions, stats, the phone,
 * doors, cheats). Links to the progress panel on the Stats page. Empty on the server (no stars
 * flash in on hydration for a first-time visitor).
 */
export function WantedStars() {
  const { save } = useGame()
  const stars = starsOf(save)
  return (
    <Link
      href="/stats#progress"
      aria-label={`Interest level: ${stars} of 5 stars. See your progress`}
      title="Interest level: explore to raise it"
      className="pointer-events-auto mt-1.5 inline-flex items-center gap-0.5 rounded-md py-0.5 pl-1 lg:mt-2"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const on = i < stars
        return <Star key={on ? `on-${i}` : `off-${i}`} on={on} className={cn(on && "star-pop", stars === 5 && on && "star-max")} />
      })}
    </Link>
  )
}

function Star({ on, className }: { on: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-3.5 lg:size-[1.125rem]", className)}>
      <path
        d="M12 2.8l2.7 5.9 6.4.7-4.8 4.3 1.4 6.3L12 16.8 6.3 20l1.4-6.3L2.9 9.4l6.4-.7Z"
        fill={on ? "#e6c27a" : "rgb(20 23 28 / 0.55)"}
        stroke={on ? "#f0965a" : "rgb(221 226 234 / 0.45)"}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
