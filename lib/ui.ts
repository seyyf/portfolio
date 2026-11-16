"use client"

import { useSyncExternalStore } from "react"

import { play } from "@/lib/sound"

// Global overlays: the phone (and which app is open) and the pause menu. Any component can open
// them: openPhone("messages"), openPause(), etc. Only one is open at a time.

export type PhoneApp = "home" | "messages" | "contacts" | "map" | "settings"
export type UIState = { phone: PhoneApp | null; pause: boolean }

let state: UIState = { phone: null, pause: false }
const listeners = new Set<() => void>()
const set = (next: Partial<UIState>) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

/** Opens the phone (in a given app). Plays the open sound when it was closed, whoever opens it. */
export const openPhone = (app: PhoneApp = "home") => {
  if (!state.phone) play("pop")
  set({ phone: app, pause: false })
}
export const setPhoneApp = (app: PhoneApp) => set({ phone: app })
export const closePhone = () => set({ phone: null })
export const openPause = () => set({ pause: true, phone: null })
export const closePause = () => set({ pause: false })
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
