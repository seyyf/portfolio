import { Reveal } from "@/components/shared/Reveal"
import { Rule } from "@/components/shared/Rule"
import { cn } from "@/lib/utils"

type PullQuoteProps = {
  quote: string
  /** Only for a real, sourced quote. Editorial pull lines stay unattributed. */
  attribution?: string
  className?: string
}

/** A large italic line set between two rules, the way papers break up a long story. */
export function PullQuote({ quote, attribution, className }: PullQuoteProps) {
  if (!quote) return null
  return (
    <figure className={cn("mx-auto max-w-3xl", className)}>
      <Rule double />
      <Reveal
        as="blockquote"
        className="px-1 py-8 text-center font-headline text-[1.75rem] leading-[1.2] font-semibold text-balance italic sm:py-10 sm:text-4xl lg:text-[2.6rem]"
      >
        <p>{quote}</p>
      </Reveal>
      {attribution && <figcaption className="byline -mt-4 mb-6 text-center">— {attribution}</figcaption>}
      <Rule />
    </figure>
  )
}
