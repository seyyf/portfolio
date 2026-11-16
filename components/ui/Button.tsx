import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type Variant = "primary" | "outline" | "ghost"
type Size = "md" | "sm"

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-60"
const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:shadow-[var(--shadow-hover)] hover:brightness-110",
  outline: "border border-border bg-surface text-ink hover:border-ink/30 hover:shadow-[var(--shadow-hover)]",
  ghost: "text-ink hover:bg-ink/[0.06]",
}
const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  sm: "h-9 px-3 text-sm",
}

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) => cn(base, variants[variant], sizes[size], className)

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size }

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size }

export function ButtonLink({ variant, size, className, ...props }: LinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}

/** For files and external URLs (the CV PDF, LinkedIn, mailto:). */
export function ButtonAnchor({ variant, size, className, ...props }: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return <a className={buttonClass(variant, size, className)} {...props} />
}
