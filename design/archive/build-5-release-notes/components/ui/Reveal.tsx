"use client"

import { m } from "framer-motion"
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type State = "static" | "waiting" | "shown"

/**
 * Fade and slide up once, the first time the element scrolls into view.
 * The server renders the content visible; only elements that start below the fold are hidden on
 * mount, so nothing on the first screen waits for JavaScript. Reduced motion: shown as is.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" }) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<State>("static")

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (el.getBoundingClientRect().top > window.innerHeight) setState("waiting")
  }, [])

  useEffect(() => {
    if (state !== "waiting" || !ref.current) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown")
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [state])

  const Tag = m[as]
  return (
    <Tag
      ref={ref as never}
      className={cn(className)}
      initial={false}
      animate={state === "waiting" ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
      transition={state === "waiting" ? { duration: 0 } : { duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay }}
    >
      {children}
    </Tag>
  )
}
