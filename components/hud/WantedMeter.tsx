import { cn } from "@/lib/utils"

/**
 * "Wanted by recruiters ★★★★★". The stars light up one by one when the page first loads
 * (CSS, staggered); with reduced motion they're simply lit. Read as "Wanted by recruiters, 5 out of 5 stars".
 */
export function WantedMeter({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center justify-end gap-2", className)}>
      <span className="font-mono text-[0.625rem] tracking-[0.12em] text-muted uppercase lg:text-[0.6875rem]">Wanted by recruiters</span>
      <span role="img" aria-label="5 out of 5 stars" className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className="wanted-star size-3.5 lg:size-4" style={{ animationDelay: `${600 + i * 220}ms` }}>
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
          </svg>
        ))}
      </span>
    </p>
  )
}
