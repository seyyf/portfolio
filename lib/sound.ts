"use client"

import type { Howl } from "howler"

import { getPrefs } from "@/lib/prefs"

// Original, subtle UI sounds (public/sounds, generated for this site). OFF by default. Howler is
// downloaded only the first time a sound plays with sound turned on.

export type SoundName = "click" | "tap" | "pop" | "ding"

const VOLUME: Record<SoundName, number> = { click: 0.25, tap: 0.3, pop: 0.35, ding: 0.4 }
const cache = new Map<SoundName, Howl>()
let howler: Promise<typeof import("howler")> | null = null

export function play(name: SoundName) {
  if (typeof window === "undefined" || !getPrefs().sound) return
  howler ??= import("howler")
  void howler.then(({ Howl }) => {
    let h = cache.get(name)
    if (!h) {
      h = new Howl({ src: [`/sounds/${name}.wav`], volume: VOLUME[name] })
      cache.set(name, h)
    }
    h.play()
  })
}
