import { ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"

/** "Visit site ↗": a project's live URL, in a new tab. Renders nothing when there's no URL. */
export function VisitLink({ url, name, className }: { url?: string; name: string; className?: string }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative z-10 inline-flex items-center gap-1.5 font-semibold text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-gold",
        className
      )}
    >
      Visit site <ExternalLink aria-hidden="true" className="size-4" />
      <span className="sr-only">: {name} (opens in a new tab)</span>
    </a>
  )
}
