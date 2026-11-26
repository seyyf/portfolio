import type { Metadata } from "next"

import { Door } from "@/components/game/Door"
import { Respawn } from "@/components/game/Respawn"
import { ButtonLink } from "@/components/ui/Button"
import { Palm } from "@/components/ui/Palm"

export const metadata: Metadata = { title: "Busted (page not found)" }

/** The 404: busted for going off the map. No fine, no record: respawn at the map. */
export default function NotFound() {
  return (
    <div className="hud-safe relative isolate flex min-h-dvh items-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_80%_100%,rgb(255_92_147/0.18),transparent_70%),radial-gradient(60%_60%_at_15%_0%,rgb(59_52_102/0.35),transparent_70%)]" />
        {/* Patrol lights sweeping the scene: red and blue, slow (static with reduced motion). */}
        <div className="busted-lights absolute inset-0" />
        {/* A map route that runs out: dashed path, then a marker with a question mark. */}
        <svg viewBox="0 0 400 200" className="absolute right-[-10%] bottom-[18%] w-[min(120vw,46rem)] text-ink/15 md:right-[-2%]" fill="none">
          <path d="M10 170 C 80 150, 90 80, 170 90 S 280 150, 330 70" stroke="currentColor" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
          <circle cx="330" cy="70" r="16" stroke="#f2b544" strokeOpacity="0.7" strokeWidth="3" />
          <path d="M325 64 q5 -7 10 0 q2 5 -5 8 v4" stroke="#f2b544" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <Palm className="absolute right-[4%] bottom-0 h-48 w-auto text-surface md:h-72" lean={0.8} />
      </div>

      <div className="mx-auto w-full max-w-[1120px] px-4 py-12 sm:px-6">
        <p className="font-mono text-sm text-red">error 404 · off the map</p>
        <h1 className="busted-title mt-3 font-display text-[clamp(4.5rem,22vw,12rem)] text-ink">
          <span className="text-red">Busted</span>
        </h1>
        <p className="mt-5 max-w-[48ch] text-ink/85">
          You went off the map, so the city brought you in. This page doesn&apos;t exist: the link may have a typo, or the page has moved.
        </p>
        <p className="mt-2 font-mono text-sm text-muted lowercase">Fine: $0 · Record: clean · Recruiters ride free</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Respawn />
          <ButtonLink href="/cv" variant="outline" size="lg">
            Open the CV
          </ButtonLink>
          <Door id="busted" className="ml-auto" />
        </div>
      </div>
    </div>
  )
}
