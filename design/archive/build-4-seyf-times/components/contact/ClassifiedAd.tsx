import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ClassifiedAdProps = {
  /** Small uppercase category above the ad, e.g. "Situations wanted". */
  category?: string
  /** The bold first words of the ad. */
  heading: ReactNode
  children?: ReactNode
  /** The big lead ad: heavier border and larger type. */
  featured?: boolean
  className?: string
}

/** A small boxed classified ad, set in tight newspaper type. */
export function ClassifiedAd({ category, heading, children, featured = false, className }: ClassifiedAdProps) {
  return (
    <article
      className={cn(
        "flex flex-col bg-paper",
        featured ? "border-[3px] border-double border-ink p-5 sm:p-7" : "border border-ink p-4",
        className
      )}
    >
      {category ? <p className={cn("label text-gray", featured ? "mb-3" : "mb-2")}>{category}</p> : null}
      <h2
        className={cn(
          "font-headline font-black uppercase",
          featured ? "text-[1.9rem] leading-[1.05] tracking-tight sm:text-[2.6rem]" : "text-[1.15rem] leading-tight tracking-wide"
        )}
      >
        {heading}
      </h2>
      {children ? (
        <div className={cn("mt-2", featured ? "text-[1.2rem] leading-snug sm:text-[1.35rem]" : "text-[1.0625rem] leading-snug")}>{children}</div>
      ) : null}
    </article>
  )
}
