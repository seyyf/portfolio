"use client"

import { useRef, useState, type ElementType, type ReactNode } from "react"

import { gsapReady, useGsapEffect } from "@/lib/gsapLazy"
import { cn } from "@/lib/utils"

type Variant = "words" | "fade" | "unmask"

type RevealProps = {
  as?: ElementType
  variant?: Variant
  className?: string
  /** Seconds to wait (for a staggered group). */
  delay?: number
  children: ReactNode
  id?: string
}

/**
 * Scroll reveal, once per element: headlines rise word by word (SplitText), paragraphs fade up,
 * images unmask top to bottom. What's already on screen when a visit starts is shown as is, so the
 * page paints at once; on later page turns (GSAP already loaded) on-screen headlines rise too.
 * Reduced motion: nothing moves.
 */
export function Reveal({ as: Tag = "div", variant = "fade", className, delay = 0, children, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  // Decided at mount: on the first page of a visit GSAP isn't loaded yet (doesn't affect the markup).
  const [firstPage] = useState(() => typeof window === "undefined" || !gsapReady())

  useGsapEffect(({ gsap, SplitText }) => {
    const el = ref.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const onScreen = el.getBoundingClientRect().top < window.innerHeight
    if (onScreen && firstPage) return
    const trigger = { trigger: el, start: "top 88%", once: true }

    if (variant === "words") {
      const split = SplitText.create(el, { type: "words", mask: "words", autoSplit: true })
      gsap.from(split.words, { yPercent: 110, duration: 0.8, ease: "power3.out", stagger: 0.045, delay, scrollTrigger: onScreen ? undefined : trigger })
      return
    }
    if (variant === "unmask") {
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power3.inOut", delay, scrollTrigger: onScreen ? undefined : trigger })
      return
    }
    gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.7, ease: "power2.out", delay, scrollTrigger: onScreen ? undefined : trigger })
  }, [])

  return (
    <Tag ref={ref} id={id} className={cn(variant === "words" && "[&_.word-mask]:pb-[0.08em]", className)}>
      {children}
    </Tag>
  )
}
