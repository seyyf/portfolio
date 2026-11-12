/** Tiny house mark used in the header and the recruiter hero. GSAP Flip morphs between the two. */
export function BrandBadge({ className = "" }: { className?: string }) {
  return (
    <span
      data-flip-id="brand-badge"
      aria-hidden="true"
      className={`grid size-12 shrink-0 place-items-center rounded-[14px] border-2 border-ink bg-butter text-ink shadow-[0_3px_0_var(--color-ink)] print:shadow-none ${className}`}
    >
      <HouseIcon />
    </span>
  )
}

export function HouseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.5 9.35 12 4l6.5 5.35V19a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Z" fill="var(--color-coral)" />
      <path d="M10 20v-5h4v5" fill="var(--color-cream)" />
      <path d="M3.5 11 12 4l8.5 7" />
    </svg>
  )
}
