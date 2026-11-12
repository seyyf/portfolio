"use client"

import type { Howl } from "howler"

// Ambient sound with Howler. Muted by default: nothing is downloaded until the visitor turns sound on.
// The sound files are synthesized by scripts/generate-sounds.mjs (no third-party recordings).

type Sfx = "pop" | "click" | "ding"

let howler: typeof import("howler") | null = null
let loading: Promise<void> | null = null
let enabled = false
let night = false
const ambient: { day?: Howl; night?: Howl } = {}
const sfx: Partial<Record<Sfx, Howl>> = {}

const AMBIENT_VOLUME = 0.35
const FADE_MS = 1500

async function load() {
  if (howler) return
  if (!loading) {
    loading = import("howler").then((mod) => {
      howler = mod
      const { Howl } = mod
      ambient.day = new Howl({ src: ["/sounds/birds.wav"], loop: true, volume: 0 })
      ambient.night = new Howl({ src: ["/sounds/crickets.wav"], loop: true, volume: 0 })
      sfx.pop = new Howl({ src: ["/sounds/pop.wav"], volume: 0.35 })
      sfx.click = new Howl({ src: ["/sounds/click.wav"], volume: 0.4 })
      sfx.ding = new Howl({ src: ["/sounds/ding.wav"], volume: 0.4 })
    })
  }
  await loading
}

function fadeTo(h: Howl | undefined, volume: number) {
  if (!h) return
  if (volume > 0 && !h.playing()) h.play()
  h.fade(h.volume(), volume, FADE_MS)
  if (volume === 0) {
    h.once("fade", () => {
      if (h.volume() === 0) h.pause()
    })
  }
}

function applyAmbient() {
  fadeTo(ambient.day, enabled && !night ? AMBIENT_VOLUME : 0)
  fadeTo(ambient.night, enabled && night ? AMBIENT_VOLUME : 0)
}

export async function setSoundEnabled(on: boolean) {
  enabled = on
  if (!on && !howler) return
  await load()
  applyAmbient()
}

/** Crossfade birds (day) and crickets (night). */
export function setAmbientNight(isNight: boolean) {
  if (night === isNight) return
  night = isNight
  if (howler) applyAmbient()
}

export function playSfx(name: Sfx) {
  if (!enabled || !howler) return
  sfx[name]?.play()
}
