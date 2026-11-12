"use client"

import { useSyncExternalStore } from "react"

import { profile } from "@/data/profile"

// The real current time in Tunis. Server render shows nothing (the page is static, so a build-time
// clock would be wrong); the client fills it in right after hydration and ticks every second.

const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined
let now = 0

function subscribe(cb: () => void) {
  listeners.add(cb)
  if (!timer) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 1000)
  }
  return () => {
    listeners.delete(cb)
    if (!listeners.size && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

/** Milliseconds since epoch, updated every second; null during server render and hydration. */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      // Must return the same value between ticks, or React re-renders forever.
      if (!now) now = Date.now()
      return now
    },
    () => null
  )
}

const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: profile.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: profile.timeZone, weekday: "long", day: "numeric", month: "long" })
const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: profile.timeZone, day: "numeric" })
const weekdayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: profile.timeZone, weekday: "short" })

/** "14:05" in Tunis. */
export const formatTime = (ms: number) => timeFmt.format(ms)
/** "Thursday 12 November" in Tunis. */
export const formatDate = (ms: number) => dateFmt.format(ms)
/** Day of the month in Tunis, for the Calendar icon. */
export const formatDay = (ms: number) => dayFmt.format(ms)
export const formatWeekday = (ms: number) => weekdayFmt.format(ms)
