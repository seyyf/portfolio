"use client"

import { cloneElement, useState, type ReactElement, type Ref } from "react"

import { gsap, useGSAP } from "@/lib/gsap"
import { useCity } from "@/lib/store"

/** Pulls its child gently towards the pointer (GSAP quickTo), springing back on leave. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactElement<{ ref?: Ref<HTMLElement> }>; strength?: number }) {
  const [el, setEl] = useState<HTMLElement | null>(null)
  const reduced = useCity((s) => s.reducedMotion)

  useGSAP(
    () => {
      if (!el || reduced || !window.matchMedia("(pointer: fine)").matches) return
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" })
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" })
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - (r.left + r.width / 2)) * strength)
        yTo((e.clientY - (r.top + r.height / 2)) * strength)
      }
      const leave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" })
      }
      el.addEventListener("pointermove", move)
      el.addEventListener("pointerleave", leave)
      return () => {
        el.removeEventListener("pointermove", move)
        el.removeEventListener("pointerleave", leave)
      }
    },
    { dependencies: [el, reduced, strength] }
  )

  return cloneElement(children, { ref: setEl })
}
