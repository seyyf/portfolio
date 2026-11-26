"use client"

import { useEffect, useRef } from "react"

import { motionReduced } from "@/lib/prefs"

type Ctx = { revert: () => void }

/**
 * GSAP motion for a mission page. Renders a hidden marker and animates its own <article> through
 * data attributes, so the page is complete without JavaScript (and other pages kept in the DOM by
 * the router are never touched).
 *
 * - Header (scrubbed with the scroll): the striped sun sinks behind the horizon, the palms move at
 *   different depths and sway, the outlined mission number drifts, the title block lifts and dims.
 * - Objective: the sunset bar draws, then the sentence rises word by word.
 * - Sections: the index appears, the heading wipes in, then the content: briefing bullets slide in
 *   with their markers snapping open, chips pop in one by one, the before/after frame opens on a
 *   diagonal, other blocks rise.
 * - Previous / next cards rise at the end.
 *
 * GSAP loads on the visitor's first scroll (nothing here matters before that), and whatever is
 * already on screen at that moment is left as is. Reduced motion: nothing moves.
 */
export function MissionMotion({ slug }: { slug: string }) {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = marker.current?.closest("article")
    if (!root) return
    let ctx: Ctx | null = null
    let cancelled = false

    const run = () => {
      if (cancelled || motionReduced()) return
      void import("@/lib/gsap").then(({ gsap, SplitText }) => {
        if (cancelled) return
        ctx = gsap.context(() => {
          const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.9
          const q = (sel: string, scope: ParentNode = root) => [...scope.querySelectorAll<HTMLElement>(sel)]

          // Header: scroll-linked parallax (never hides anything).
          const header = root.querySelector("[data-mm-header]")
          if (header) {
            const scrub = { trigger: header, start: "top top", end: "bottom top", scrub: 0.6 }
            const [palmFront, palmBack] = [...header.querySelectorAll<SVGElement>("[data-mm-bg] svg")]
            gsap.to(q("[data-mm-sun]", header), { yPercent: 55, scale: 0.9, ease: "none", scrollTrigger: scrub })
            gsap.to(q("[data-mm-ghost]", header), { xPercent: -14, ease: "none", scrollTrigger: scrub })
            if (palmFront) gsap.to(palmFront, { y: 36, ease: "none", scrollTrigger: scrub })
            if (palmBack) gsap.to(palmBack, { y: 80, ease: "none", scrollTrigger: scrub })
            gsap.to(q("[data-mm-headtext]", header), { y: -48, opacity: 0.4, ease: "none", scrollTrigger: scrub })
            // A slow sway while the header is on screen.
            ;[palmFront, palmBack].forEach((palm, i) => {
              if (!palm) return
              const sway = gsap.to(palm, { rotation: i ? -1.8 : 2.2, transformOrigin: "50% 100%", duration: 3.4 + i * 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 })
              gsap.timeline({ scrollTrigger: { trigger: header, start: "top bottom", end: "bottom top", onToggle: (self) => (self.isActive ? sway.play() : sway.pause()) } })
            })
          }

          // Objective: bar draws, then words rise.
          const objective = root.querySelector("[data-mm-objective]")
          if (objective && below(objective)) {
            const text = objective.querySelector<HTMLElement>("[data-mm-objtext]")
            const tl = gsap.timeline({ scrollTrigger: { trigger: objective, start: "top 82%", once: true } })
            tl.from(q("[data-mm-bar]", objective), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.6, ease: "expo.out" })
            if (text) {
              const split = SplitText.create(text, { type: "words", mask: "words" })
              tl.from(split.words, { yPercent: 110, duration: 0.7, ease: "expo.out", stagger: 0.035, onComplete: () => split.revert() }, 0.12)
            }
          }

          // Sections.
          for (const sec of q("[data-mm-section]")) {
            if (!below(sec)) continue
            const body = sec.querySelector<HTMLElement>("[data-mm-body]")
            const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 82%", once: true } })
            tl.from(q("[data-mm-index]", sec), { opacity: 0, x: -14, duration: 0.45, ease: "power3.out" }, 0)
            tl.fromTo(
              q("[data-mm-heading]", sec),
              { clipPath: "inset(-15% 100% -15% 0)", x: -28 },
              { clipPath: "inset(-15% -8% -15% 0)", x: 0, duration: 0.75, ease: "expo.out", clearProps: "clipPath,transform" },
              0.05
            )
            if (!body) continue

            const bullets = q("[data-mm-bullet]", body)
            const chips = q("ul[aria-label] > li", body)
            const figure = body.querySelector("figure")
            const blocks = [...body.children].filter((el) => !el.querySelector("[data-mm-bullet]") && !el.matches("ul[aria-label]") && el !== figure)

            if (bullets.length) {
              tl.from(bullets, { x: -26, opacity: 0, duration: 0.65, ease: "expo.out", stagger: 0.1, clearProps: "transform,opacity" }, 0.2)
              tl.from(q("[data-mm-marker]", body), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.45, ease: "back.out(3)", stagger: 0.1, clearProps: "transform" }, 0.3)
            }
            if (blocks.length) tl.from(blocks, { y: 26, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.08, clearProps: "transform,opacity" }, 0.18)
            if (figure) {
              tl.fromTo(
                figure,
                { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
                { clipPath: "polygon(0 0, 115% 0, 100% 100%, -15% 100%)", duration: 1, ease: "expo.inOut", clearProps: "clipPath" },
                0.2
              )
            }
            if (chips.length) tl.from(chips, { y: 14, scale: 0.82, opacity: 0, duration: 0.45, ease: "back.out(2.2)", stagger: 0.045, clearProps: "transform,opacity" }, 0.28)
          }

          // Previous / next.
          const nav = root.querySelector("[data-mm-nav]")
          if (nav && below(nav)) {
            gsap.from(q("a, button", nav), { y: 32, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.08, clearProps: "transform,opacity", scrollTrigger: { trigger: nav, start: "top 88%", once: true } })
          }
        }, root)
      })
    }

    const events = ["scroll", "wheel", "touchmove", "keydown"] as const
    const onFirst = () => {
      for (const e of events) window.removeEventListener(e, onFirst)
      run()
    }
    for (const e of events) window.addEventListener(e, onFirst, { passive: true })

    return () => {
      cancelled = true
      for (const e of events) window.removeEventListener(e, onFirst)
      ctx?.revert()
    }
  }, [slug])

  return <span ref={marker} hidden />
}
