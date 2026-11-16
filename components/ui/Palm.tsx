import { cn } from "@/lib/utils"

/**
 * An original palm silhouette (drawn for this site). Decorative: aria-hidden.
 * `lean` bends the trunk; colour comes from `currentColor`.
 */
export function Palm({ className, lean = 1 }: { className?: string; lean?: number }) {
  const dx = 18 * lean
  return (
    <svg viewBox="0 0 120 220" aria-hidden="true" className={cn("pointer-events-none", className)} fill="currentColor">
      {/* trunk */}
      <path d={`M58 218 C ${60 + dx * 0.2} 170, ${62 + dx * 0.6} 120, ${60 + dx} 62 L ${66 + dx} 62 C ${68 + dx * 0.6} 122, ${66 + dx * 0.2} 172, 66 218 Z`} />
      {/* fronds */}
      <g transform={`translate(${63 + dx} 60)`}>
        <path d="M0 0 C -18 -14, -44 -14, -60 4 C -40 -4, -20 -2, 0 4 Z" />
        <path d="M0 0 C -10 -22, -30 -36, -52 -34 C -32 -26, -16 -14, -2 2 Z" />
        <path d="M0 0 C 4 -24, -2 -44, -14 -56 C -4 -38, -2 -20, 2 0 Z" />
        <path d="M0 0 C 16 -20, 36 -30, 56 -26 C 36 -18, 18 -8, 2 2 Z" />
        <path d="M0 0 C 20 -8, 44 -4, 60 12 C 40 6, 20 4, 0 4 Z" />
        <path d="M0 2 C 10 10, 18 26, 20 42 C 12 28, 4 16, -2 6 Z" />
        <path d="M0 2 C -10 10, -20 24, -24 40 C -14 26, -6 16, 2 6 Z" />
        <circle cx="-3" cy="6" r="3.2" />
        <circle cx="4" cy="7" r="3" />
      </g>
    </svg>
  )
}
