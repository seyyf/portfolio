"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

/** Smoothly switches every colour for 300 ms, then removes the transition again. */
export function switchTheme(setTheme: (t: string) => void, current: string | undefined) {
  const root = document.documentElement
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (!reduce) root.classList.add("theme-transition")
  setTheme(current === "dark" ? "light" : "dark")
  window.setTimeout(() => root.classList.remove("theme-transition"), 320)
}

/**
 * Light / dark switch. Both icons are rendered and CSS picks one from the theme class, so the
 * button is correct before hydration (no flash, no mismatch).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={() => switchTheme(setTheme, resolvedTheme)}
      aria-label="Toggle dark mode"
      className={cn("relative inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-ink hover:bg-ink/[0.06]", className)}
    >
      <Sun aria-hidden="true" className="size-[18px] transition-[transform,opacity] duration-300 dark:scale-50 dark:-rotate-90 dark:opacity-0" />
      <Moon aria-hidden="true" className="absolute size-[18px] scale-50 rotate-90 opacity-0 transition-[transform,opacity] duration-300 dark:scale-100 dark:rotate-0 dark:opacity-100" />
    </button>
  )
}
