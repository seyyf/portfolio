"use client"

import type { Howl } from "howler"

import { useOS } from "@/lib/store"

// Subtle UI sounds with Howler. Muted by default: nothing downloads until sound is switched on.
// The files are synthesized by scripts/generate-sounds.mjs (no third-party recordings).

export type Sfx = "unlock" | "ping" | "tap" | "pop" | "key"

const FILES: Record<Sfx, { src: string; volume: number }> = {
  unlock: { src: "/sounds/click.wav", volume: 0.45 },
  ping: { src: "/sounds/ding.wav", volume: 0.35 },
  tap: { src: "/sounds/tap.wav", volume: 0.3 },
  pop: { src: "/sounds/pop.wav", volume: 0.35 },
  key: { src: "/sounds/tap.wav", volume: 0.15 },
}

let sounds: Partial<Record<Sfx, Howl>> | null = null
let loading: Promise<void> | null = null

function load() {
  if (!loading) {
    loading = import("howler").then(({ Howl }) => {
      sounds = Object.fromEntries(
        (Object.keys(FILES) as Sfx[]).map((k) => [k, new Howl({ src: [FILES[k].src], volume: FILES[k].volume })])
      ) as Record<Sfx, Howl>
    })
  }
  return loading
}

/** Plays a UI sound if the visitor turned sound on. */
export function playSfx(name: Sfx) {
  if (!useOS.getState().sound) return
  if (sounds) sounds[name]?.play()
  else load().then(() => sounds?.[name]?.play())
}

/** Preloads the sounds the moment sound is switched on. */
export function primeSounds() {
  void load()
}
