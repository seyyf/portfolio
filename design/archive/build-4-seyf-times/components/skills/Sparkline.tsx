import { cn } from "@/lib/utils"

const W = 80
const H = 24
const POINTS = 12

/** FNV-1a hash of the skill name: the same name always gives the same chart. */
function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Small seeded PRNG (mulberry32). */
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A gently rising, jittery line. Purely decorative: it encodes no data. */
export function sparklinePath(name: string) {
  const rand = seeded(hash(name))
  const step = W / (POINTS - 1)
  const points: string[] = []
  for (let i = 0; i < POINTS; i++) {
    const rise = (H * 0.5 * i) / (POINTS - 1)
    const jitter = (rand() - 0.5) * H * 0.4
    const y = Math.min(H - 2, Math.max(2, H * 0.8 - rise + jitter))
    points.push(`${(i * step).toFixed(1)} ${y.toFixed(1)}`)
  }
  return `M${points.join(" L")}`
}

/** Decorative sparkline seeded from the skill name (aria-hidden). Its path carries `data-sparkline` for drawing. */
export function Sparkline({ name, className }: { name: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${W} ${H}`} className={cn("h-auto w-14 overflow-visible sm:w-20", className)}>
      <path
        data-sparkline
        d={sparklinePath(name)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
