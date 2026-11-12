import { create } from "zustand"

import type { BuildingId } from "@/data/city"

export type Mode = "tour" | "explore"
export type Quality = "high" | "low"
/** null = the sky follows the scroll; "day"/"night" = pinned by the header toggle. */
export type TimeOverride = "day" | "night" | null

type CityState = {
  mode: Mode
  /** Building whose info panel is open. */
  panel: BuildingId | null
  /** Building under the pointer or keyboard focus. */
  hovered: BuildingId | null
  /** Tour stop currently framed by the camera (null on the intro and finale). */
  stop: BuildingId | null
  /** Index of the nearest tour section: 0 intro, 1..n stops, n+1 finale. */
  section: number
  timeOverride: TimeOverride
  /** True once night has fallen (scroll or toggle). Drives UI theme and ambient sound. */
  isNight: boolean
  sound: boolean
  recruiter: boolean
  quality: Quality
  sceneReady: boolean
  reducedMotion: boolean
  /** The mailbox flag pops up once a message has been prepared. */
  mailSent: boolean
  /** Clean render for screenshots (Open Graph image): no labels or UI. */
  capture: boolean

  setMode: (mode: Mode) => void
  openPanel: (id: BuildingId) => void
  closePanel: () => void
  setHovered: (id: BuildingId | null) => void
  setStop: (id: BuildingId | null, section: number) => void
  setTimeOverride: (value: TimeOverride) => void
  setIsNight: (value: boolean) => void
  toggleSound: () => void
  setRecruiter: (value: boolean) => void
  setQuality: (value: Quality) => void
  setSceneReady: () => void
  setReducedMotion: (value: boolean) => void
  setMailSent: () => void
}

export const useCity = create<CityState>()((set) => ({
  mode: "tour",
  panel: null,
  hovered: null,
  stop: null,
  section: 0,
  timeOverride: null,
  isNight: false,
  sound: false,
  recruiter: false,
  quality: "high",
  sceneReady: false,
  reducedMotion: false,
  mailSent: false,
  capture: false,

  setMode: (mode) => set({ mode }),
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),
  setHovered: (hovered) => set({ hovered }),
  setStop: (stop, section) => set({ stop, section }),
  setTimeOverride: (timeOverride) => set({ timeOverride }),
  setIsNight: (isNight) => set({ isNight }),
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  setRecruiter: (recruiter) => set({ recruiter }),
  setQuality: (quality) => set({ quality }),
  setSceneReady: () => set({ sceneReady: true }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setMailSent: () => set({ mailSent: true }),
}))

/** Key used to remember the day/night toggle. */
export const THEME_KEY = "seyf-city-time"

export function readStoredOverride(): TimeOverride {
  try {
    const v = window.localStorage.getItem(THEME_KEY)
    return v === "day" || v === "night" ? v : null
  } catch {
    return null
  }
}

export function storeOverride(value: TimeOverride) {
  try {
    if (value) window.localStorage.setItem(THEME_KEY, value)
    else window.localStorage.removeItem(THEME_KEY)
  } catch {
    // Storage can be blocked (private mode, disabled site data); the toggle still works for this visit.
  }
}
