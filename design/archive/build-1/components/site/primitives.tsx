import { ArrowUpRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { profile } from "@/lib/content"
import { cn } from "@/lib/utils"

// 1200px content width + 24px gutters (16px on mobile), per DESIGN.md Grid & Container.
export const container = "mx-auto w-full max-w-[1248px] px-4 sm:px-6"

export function MeshGradient({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute select-none", className)}>
      <div className="mesh-gradient size-full" />
    </div>
  )
}

// The single CTA pair used everywhere: one label per intent ("Email me", "LinkedIn").
export function ContactButtons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <Button asChild>
        <a href={`mailto:${profile.email}`}>
          <EnvelopeSimpleIcon aria-hidden />
          Email me
        </a>
      </Button>
      <Button asChild variant="secondary">
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
          <ArrowUpRightIcon aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </Button>
    </div>
  )
}
