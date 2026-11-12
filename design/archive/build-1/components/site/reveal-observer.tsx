"use client"

import { useEffect } from "react"

// Fades [data-reveal] blocks in once as they enter the viewport.
// Uses the Web Animations API instead of toggling classes, so it never touches
// React-managed attributes (no hydration mismatch) and nothing is hidden without JS.
// Blocks already on screen at load are left alone.
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight
    )

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        entry.target.animate(
          [
            { opacity: 0, transform: "translateY(16px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        )
      }
    })
    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
