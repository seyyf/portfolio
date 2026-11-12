import { Color } from "three"

import { smoothstep } from "@/lib/world"

// Time-of-day palette. One number, `t` in 0..1, describes the whole sky:
// 0 sunrise -> 0.18 morning -> 0.45 noon -> 0.72 golden hour -> 0.86 dusk -> 1 night.

type Key = {
  t: number
  top: string
  bottom: string
  sun: string
  sunIntensity: number
  /** Sun (or moon) elevation in degrees: low sun = long shadows. */
  elevation: number
  /** Azimuth in degrees around the city: negative = east (left of the view). */
  azimuth: number
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
}

const KEYS: Key[] = [
  { t: 0, top: "#A9C8E8", bottom: "#FFCBA8", sun: "#FFC9A3", sunIntensity: 1.6, elevation: 9, azimuth: -75, hemiSky: "#FFF0E4", hemiGround: "#BDEBD6", hemiIntensity: 1.45 },
  { t: 0.18, top: "#8CCBEB", bottom: "#FFF4E6", sun: "#FFF0D9", sunIntensity: 2.1, elevation: 34, azimuth: -45, hemiSky: "#FFF7EC", hemiGround: "#BDEBD6", hemiIntensity: 1.35 },
  { t: 0.45, top: "#7DC2EA", bottom: "#D8EFF9", sun: "#FFFFFF", sunIntensity: 2.4, elevation: 60, azimuth: 0, hemiSky: "#FFFFFF", hemiGround: "#B8EBD5", hemiIntensity: 1.2 },
  { t: 0.72, top: "#B5A5DA", bottom: "#FFD97D", sun: "#FFC27A", sunIntensity: 2.0, elevation: 20, azimuth: 45, hemiSky: "#FFE7C2", hemiGround: "#C3B1E1", hemiIntensity: 1.0 },
  { t: 0.86, top: "#3A2E5C", bottom: "#FF8B94", sun: "#FF8B6B", sunIntensity: 1.0, elevation: 5, azimuth: 70, hemiSky: "#C3B1E1", hemiGround: "#3A2E5C", hemiIntensity: 0.7 },
  { t: 1, top: "#1B1F3B", bottom: "#3A2E5C", sun: "#A9B8FF", sunIntensity: 0.6, elevation: 48, azimuth: -30, hemiSky: "#6A6FB0", hemiGround: "#1B1F3B", hemiIntensity: 0.55 },
]

const parsed = KEYS.map((k) => ({
  ...k,
  topC: new Color(k.top),
  bottomC: new Color(k.bottom),
  sunC: new Color(k.sun),
  hemiSkyC: new Color(k.hemiSky),
  hemiGroundC: new Color(k.hemiGround),
}))

export type SkyState = {
  top: Color
  bottom: Color
  sun: Color
  sunIntensity: number
  elevation: number
  azimuth: number
  hemiSky: Color
  hemiGround: Color
  hemiIntensity: number
  night: number
}

/** Writes the palette for time `t` into `out` (no allocations, safe to call every frame). */
export function sampleSky(t: number, out: SkyState): SkyState {
  const tc = Math.min(1, Math.max(0, t))
  let i = 0
  while (i < parsed.length - 2 && tc > parsed[i + 1].t) i++
  const a = parsed[i]
  const b = parsed[i + 1]
  const k = smoothstep(0, 1, (tc - a.t) / (b.t - a.t))
  out.top.copy(a.topC).lerp(b.topC, k)
  out.bottom.copy(a.bottomC).lerp(b.bottomC, k)
  out.sun.copy(a.sunC).lerp(b.sunC, k)
  out.hemiSky.copy(a.hemiSkyC).lerp(b.hemiSkyC, k)
  out.hemiGround.copy(a.hemiGroundC).lerp(b.hemiGroundC, k)
  out.sunIntensity = a.sunIntensity + (b.sunIntensity - a.sunIntensity) * k
  out.elevation = a.elevation + (b.elevation - a.elevation) * k
  out.azimuth = a.azimuth + (b.azimuth - a.azimuth) * k
  out.hemiIntensity = a.hemiIntensity + (b.hemiIntensity - a.hemiIntensity) * k
  out.night = smoothstep(0.8, 0.97, tc)
  return out
}

export const createSkyState = (): SkyState => ({
  top: new Color(),
  bottom: new Color(),
  sun: new Color(),
  sunIntensity: 0,
  elevation: 0,
  azimuth: 0,
  hemiSky: new Color(),
  hemiGround: new Color(),
  hemiIntensity: 0,
  night: 0,
})

/** Time the toggle pins to. */
export const DAY_TIME = 0.42
export const NIGHT_TIME = 1

/** Time of day along the scroll tour (progress 0..1). Sunrise at the top, night for the finale. */
export function scrollToTime(progress: number) {
  // Hold sunrise during the intro, reach golden hour at the last stop, night in the finale.
  if (progress < 0.06) return 0
  if (progress < 0.9) return ((progress - 0.06) / 0.84) * 0.74
  return 0.74 + ((progress - 0.9) / 0.1) * 0.26
}
