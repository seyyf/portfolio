"use client"

import { useSyncExternalStore } from "react"

import { profile } from "@/data/profile"

// Today's date in Tunis for the top strip. The pages are static, so a build-time date would be wrong:
// the server renders nothing and the client fills it in right after hydration.

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 60_000)
  return () => clearInterval(t)
}

const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: profile.timeZone, weekday: "long", day: "numeric", month: "long", year: "numeric" })

/** "Friday, 13 November 2026" in Tunis; null during server render and hydration. */
export function useEditionDate(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => fmt.format(new Date()),
    () => null
  )
}

export const currentYear = () => new Date().getFullYear()
