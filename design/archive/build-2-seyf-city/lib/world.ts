// Mutable, per-frame state shared between GSAP (writer) and React Three Fiber (reader).
// Kept outside React on purpose: these values change 60 times a second and must never
// trigger a re-render. UI state that React needs lives in lib/store.ts instead.

export type CameraRig = {
  /** Look-at target in world units. */
  tx: number
  ty: number
  tz: number
  /** Zoom relative to the responsive overview zoom. */
  zoom: number
  /** +1: tour card on the left, building framed to the right. -1: the opposite. 0: centred. */
  side: number
}

export const world = {
  /** Scroll progress through the tour, 0..1. */
  progress: 0,
  /** Time of day driven by scroll: 0 sunrise, ~0.45 noon, ~0.78 golden hour, 1 night. */
  scrollTime: 0,
  /** Day/night toggle override: weight 0..1 and the time it pins to. */
  overrideBlend: 0,
  overrideTime: 1,
  /** Effective time after the override is applied (written by the sky driver each frame). */
  time: 0,
  /** 0 = full day, 1 = full night. Derived from time. */
  night: 0,
  /** City build-up during the intro, 0..1. */
  assemble: 0,
  /** Floor for assemble outside the tour (explore mode, recruiter return): 0..1. */
  assembleFloor: 0,
  rig: { tx: 0, ty: 10, tz: 0, zoom: 0.62, side: 0 } as CameraRig,
  /** Pointer position in -1..1, used for a subtle camera drift on desktop. */
  pointer: { x: 0, y: 0 },
}

export const effectiveAssemble = () => Math.max(world.assemble, world.assembleFloor)

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/** Elastic ease-out, evaluated from a progress value so scrubbing backwards reverses it. */
export const elasticOut = (t: number) => {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return Math.pow(2, -9 * t) * Math.sin(((t * 10 - 0.75) * (2 * Math.PI)) / 3.2) + 1
}
export const backOut = (t: number) => {
  const c1 = 2.2
  const c3 = c1 + 1
  const x = t - 1
  return t <= 0 ? 0 : t >= 1 ? 1 : 1 + c3 * x * x * x + c1 * x * x
}
/** Staggered local progress for item i of n inside a 0..1 master progress. */
export const stagger = (master: number, i: number, n: number, span = 0.45) => {
  const start = n <= 1 ? 0 : (i / (n - 1)) * (1 - span)
  return clamp01((master - start) / span)
}
/** Deterministic pseudo-random in 0..1 from an integer seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
