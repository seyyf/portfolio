"use client"

import { useSyncExternalStore } from "react"

import { addHeat } from "@/lib/game"
import { play } from "@/lib/sound"

// Global overlays: the phone (and which app is open), the pause menu and the skills wheel. Any
// component can open them: openPhone("messages"), openPause(), openWheel(), etc. Only one is open at a time.

export type PhoneApp = "home" | "messages" | "contacts" | "map" | "settings" | "codes" | "call"
export type UIState = { phone: PhoneApp | null; pause: boolean; wheel: boolean }

let state: UIState = { phone: null, pause: false, wheel: false }
const listeners = new Set<() => void>()
const set = (next: Partial<UIState>) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

/** Opens the phone (in a given app). Plays the open sound when it was closed, whoever opens it. */
export const openPhone = (app: PhoneApp = "home") => {
  if (!state.phone) play("pop")
  addHeat("phone")
  set({ phone: app, pause: false, wheel: false })
}
export const setPhoneApp = (app: PhoneApp) => set({ phone: app })
export const closePhone = () => set({ phone: null })
export const openPause = () => set({ pause: true, phone: null, wheel: false })
export const closePause = () => set({ pause: false })
/** The skills wheel (hold Q, or from the pause menu, the phone or the Stats page). */
export const openWheel = () => {
  addHeat("wheel")
  set({ wheel: true, pause: false, phone: null })
}
export const closeWheel = () => set({ wheel: false })
export const getUI = () => state

export function useUI(): UIState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
