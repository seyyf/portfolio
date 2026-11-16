"use client"

import { useSyncExternalStore } from "react"

// Tunis local time for the phone's status bar and clock widget. Client only (the phone never renders
// on the server); the server snapshot is a neutral placeholder.

const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Tunis", hour: "2-digit", minute: "2-digit", hour12: false })
const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Tunis", weekday: "long", day: "numeric", month: "long" })

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 10_000)
  return () => clearInterval(id)
}
const getTime = () => timeFmt.format(Date.now())
const getDate = () => dateFmt.format(Date.now())
const placeholder = () => "--:--"
const empty = () => ""

export function useTunisClock(): { time: string; date: string } {
  const time = useSyncExternalStore(subscribe, getTime, placeholder)
  const date = useSyncExternalStore(subscribe, getDate, empty)
  return { time, date }
}
