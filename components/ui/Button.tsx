import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type Variant = "primary" | "outline" | "ghost"
type Size = "md" | "sm" | "lg"

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap transition-[box-shadow,background-color,border-color,color,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
const variants: Record<Variant, string> = {
  // Dark text on the pink: 6:1.
  primary: "bg-pink text-bg hover:bg-pink-hover hover:shadow-[var(--glow)]",
  outline: "border border-ink/25 bg-bg/40 text-ink backdrop-blur-sm hover:border-pink hover:text-pink",
  ghost: "text-ink hover:bg-ink/[0.08]",
}
const sizes: Record<Size, string> = {
  sm: "h-9 rounded-lg px-3 text-sm",
  md: "h-11 rounded-xl px-5 text-[0.9375rem]",
  lg: "h-13 rounded-xl px-6 text-base",
}

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) => cn(base, variants[variant], sizes[size], className)

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}

/** For files and external URLs (the CV PDF, LinkedIn, mailto:). */
export function ButtonAnchor({ variant, size, className, ...props }: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return <a className={buttonClass(variant, size, className)} {...props} />
}
