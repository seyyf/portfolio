"use client"

import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, type ReactNode } from "react"

import { gsapReady, loadGsap, loadGsapOnInteract } from "@/lib/gsapLazy"
import { getLenis, startLenis, stopLenis } from "@/lib/lenis"

/** Theme (Morning / Night Edition via next-themes) and Lenis smooth scrolling synced with ScrollTrigger. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SmoothScroll />
      {children}
    </ThemeProvider>
  )
}

function SmoothScroll() {
  const pathname = usePathname()

  // Smooth scrolling and GSAP load once the page is up, never ahead of the first paint.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void loadGsapOnInteract()
      return
    }
    // Lenis starts with GSAP, on the visitor's first interaction.
    let cancelled = false
    void loadGsapOnInteract().then(() => {
      if (!cancelled) void startLenis()
    })
    return () => {
      cancelled = true
      stopLenis()
    }
  }, [])

  // New section: start at the top and let ScrollTrigger re-measure the new page.
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    if (!gsapReady()) return
    const t = window.setTimeout(() => void loadGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh()), 120)
    return () => window.clearTimeout(t)
  }, [pathname])

  return null
}
