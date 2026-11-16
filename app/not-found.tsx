import type { Metadata } from "next"

import { ButtonLink } from "@/components/ui/Button"
import { Palm } from "@/components/ui/Palm"

export const metadata: Metadata = { title: "Mission not found" }

export default function NotFound() {
  return (
    <div className="hud-safe relative isolate flex min-h-dvh items-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_80%_100%,rgb(255_79_163/0.18),transparent_70%),radial-gradient(60%_60%_at_15%_0%,rgb(91_42_158/0.35),transparent_70%)]" />
        {/* A map route that runs out: dashed path, then a marker with a question mark. */}
        <svg viewBox="0 0 400 200" className="absolute right-[-10%] bottom-[18%] w-[min(120vw,46rem)] text-ink/15 md:right-[-2%]" fill="none">
          <path d="M10 170 C 80 150, 90 80, 170 90 S 280 150, 330 70" stroke="currentColor" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
          <circle cx="330" cy="70" r="16" stroke="#ffc94a" strokeOpacity="0.7" strokeWidth="3" />
          <path d="M325 64 q5 -7 10 0 q2 5 -5 8 v4" stroke="#ffc94a" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <Palm className="absolute right-[4%] bottom-0 h-48 w-auto text-surface md:h-72" lean={0.8} />
      </div>

      <div className="mx-auto w-full max-w-[1120px] px-4 py-12 sm:px-6">
        <p className="font-mono text-sm tracking-[0.22em] text-gold">ERROR 404 · OFF THE MAP</p>
        <h1 className="mt-3 max-w-[12ch] font-display text-[clamp(3.25rem,14vw,8rem)] text-ink">
          <span className="lean text-sunset pr-[0.06em]">Mission not found</span>
        </h1>
        <p className="mt-5 max-w-[48ch] text-ink/85">This mission isn&apos;t on the map. The link may have a typo, or the page has moved. Every mission is on the map, and the CV has the whole story.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/#missions" size="lg">
            Back to the map
          </ButtonLink>
          <ButtonLink href="/cv" variant="outline" size="lg">
            Open the CV
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
