"use client"

import { useEffect } from "react"

import { motionReduced } from "@/lib/prefs"

type Ctx = { revert: () => void }

/**
 * Scroll animation for the mission list (#missions). Renders nothing: it animates the server-rendered
 * markup through data attributes, so the list is complete without JavaScript.
 * - [data-story-route] / [data-story-line]: the route line draws as you scroll through the story (scrubbed).
 * - [data-story-item]: each mission — node pops in, card slides in from the right with a skew that
 *   settles, then its [data-story-part] lines rise one by one.
 * - [data-story-grid]: side missions and tutorials rise in a stagger.
 * GSAP loads after the visitor's first scroll, once the section is near, so it never slows page load.
 * Anything already on screen at that moment is left as is (no flash). Reduced motion: nothing moves.
 */
export function StoryMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-story]")
    if (!root) return
    let ctx: Ctx | null = null
    let cancelled = false
    let io: IntersectionObserver | null = null

    const run = () => {
      if (cancelled || motionReduced()) return
      void import("@/lib/gsap").then(({ gsap }) => {
        if (cancelled) return
        ctx = gsap.context(() => {
          const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.88

          const route = root.querySelector("[data-story-route]")
          const line = root.querySelector("[data-story-line]")
          if (route && line) {
            gsap.fromTo(
              line,
              { scaleY: 0 },
              { scaleY: 1, ease: "none", transformOrigin: "50% 0%", scrollTrigger: { trigger: route, start: "top 75%", end: "bottom 70%", scrub: 0.6 } }
            )
          }

          for (const item of root.querySelectorAll<HTMLElement>("[data-story-item]")) {
            if (!below(item)) continue
            const node = item.querySelector("[data-story-node]")
            const card = item.querySelector("[data-story-card]")
            const parts = item.querySelectorAll("[data-story-part]")
            const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 84%", once: true } })
            if (node) tl.from(node, { scale: 0.2, opacity: 0, duration: 0.55, ease: "back.out(2.4)", clearProps: "transform,opacity" }, 0)
            if (card) tl.from(card, { x: 64, skewX: -7, opacity: 0, duration: 0.8, ease: "expo.out", clearProps: "transform,opacity" }, 0.06)
            if (parts.length) tl.from(parts, { y: 16, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.055, clearProps: "transform,opacity" }, 0.2)
          }

          for (const grid of root.querySelectorAll<HTMLElement>("[data-story-grid]")) {
            if (!below(grid)) continue
            gsap.from(grid.children, {
              y: 44,
              rotate: -1.5,
              opacity: 0,
              duration: 0.7,
              ease: "expo.out",
              stagger: 0.08,
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: grid, start: "top 86%", once: true },
            })
          }
        }, root)
      })
    }

    // Wait for the first scroll (the list is below the fold), then for the section to come near.
    const events = ["scroll", "wheel", "touchmove", "keydown"] as const
    const onFirst = () => {
      for (const e of events) window.removeEventListener(e, onFirst)
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          io?.disconnect()
          run()
        },
        { rootMargin: "0px 0px 60% 0px" }
      )
      io.observe(root)
    }
    for (const e of events) window.addEventListener(e, onFirst, { passive: true })

    return () => {
      cancelled = true
      for (const e of events) window.removeEventListener(e, onFirst)
      io?.disconnect()
      ctx?.revert()
    }
  }, [])

  return null
}
