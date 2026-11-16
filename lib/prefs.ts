"use client"

import { useSyncExternalStore } from "react"

import { PREFS_KEY as KEY } from "@/lib/headScripts"

// Visitor settings (Pause menu → Settings): sound (off by default) and reduce motion. Saved in
// localStorage. "Reduce motion" is ON when the visitor turns it on here OR the OS asks for it.
// While on, <html> has the class "reduce-motion" (CSS kills transitions and animations).

export type Prefs = { sound: boolean; reduceMotion: boolean }

const DEFAULTS: Prefs = { sound: false, reduceMotion: false }
let prefs: Prefs = DEFAULTS
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Prefs>
    prefs = { sound: raw.sound === true, reduceMotion: raw.reduceMotion === true }
  } catch {
    prefs = DEFAULTS
  }
}

export function setPrefs(patch: Partial<Prefs>) {
  load()
  prefs = { ...prefs, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch {}
  document.documentElement.classList.toggle("reduce-motion", prefs.reduceMotion)
  listeners.forEach((l) => l())
}

export function getPrefs(): Prefs {
  load()
  return prefs
}

/** True when animations should be skipped (OS setting or the in-site setting). Safe to call anywhere in the browser. */
export function motionReduced(): boolean {
  if (typeof window === "undefined") return false
  return getPrefs().reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", l)
  return () => {
    listeners.delete(l)
    mq.removeEventListener("change", l)
  }
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getPrefs, () => DEFAULTS)
}

/** Reactive version of motionReduced() for components. False on the server. */
export function useMotionReduced(): boolean {
  return useSyncExternalStore(subscribe, motionReduced, () => false)
}

