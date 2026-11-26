import Link from "next/link"

/**
 * Recruiter mode: always visible, above every overlay including the loading screen (z-[90]).
 * A plain link, so it works before any JavaScript runs.
 */
export function RecruiterButton() {
  return (
    <Link
      href="/cv"
      className="hud-panel fixed top-3 left-3 z-[90] inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink transition-colors hover:border-pink hover:text-pink lg:top-4 lg:left-4 lg:h-11 lg:px-4"
    >
      Skip to CV <span aria-hidden="true">→</span>
    </Link>
  )
}
