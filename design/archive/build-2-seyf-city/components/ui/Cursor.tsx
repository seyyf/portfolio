"use client"

import { useRef } from "react"

import { gsap, useGSAP } from "@/lib/gsap"
import { useCity } from "@/lib/store"

const INTERACTIVE = "a, button, [role='slider'], label, summary, [data-cursor]"

/** A small round cursor that follows with a little lag and grows over anything clickable. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const reduced = useCity((s) => s.reducedMotion)

  useGSAP(
    () => {
      const el = dot.current
      if (!el || reduced || !window.matchMedia("(pointer: fine)").matches) return
      document.documentElement.classList.add("has-custom-cursor")
      gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 })
      const xTo = gsap.quickTo(el, "x", { duration: 0.18, ease: "power3.out" })
      const yTo = gsap.quickTo(el, "y", { duration: 0.18, ease: "power3.out" })
      let big = false
      const setBig = (v: boolean) => {
        if (v === big) return
        big = v
        gsap.to(el, {
          scale: v ? 2.6 : 1,
          backgroundColor: v ? "rgba(255, 139, 148, 0.35)" : "rgba(255, 139, 148, 1)",
          duration: 0.35,
          ease: "back.out(2)",
        })
      }
      const move = (e: PointerEvent) => {
        xTo(e.clientX)
        yTo(e.clientY)
        gsap.to(el, { autoAlpha: 1, duration: 0.2, overwrite: "auto" })
        const target = e.target as Element | null
        const overText = !!target?.closest("input, textarea")
        el.style.display = overText ? "none" : ""
        setBig(!!target?.closest(INTERACTIVE) || useCity.getState().hovered !== null)
      }
      const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.2 })
      const down = () => gsap.to(el, { scale: big ? 2 : 0.7, duration: 0.15 })
      const up = () => gsap.to(el, { scale: big ? 2.6 : 1, duration: 0.3, ease: "back.out(2)" })
      // Building hover lives in the 3D scene, so listen to the store as well.
      const unsub = useCity.subscribe((s, prev) => {
        if (s.hovered !== prev.hovered) setBig(s.hovered !== null)
      })
      window.addEventListener("pointermove", move, { passive: true })
      document.addEventListener("pointerleave", leave)
      window.addEventListener("pointerdown", down)
      window.addEventListener("pointerup", up)
      return () => {
        unsub()
        document.documentElement.classList.remove("has-custom-cursor")
        window.removeEventListener("pointermove", move)
        document.removeEventListener("pointerleave", leave)
        window.removeEventListener("pointerdown", down)
        window.removeEventListener("pointerup", up)
      }
    },
    { dependencies: [reduced] }
  )

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[70] size-3.5 rounded-full border-2 border-ink bg-coral opacity-0 mix-blend-normal"
    />
  )
}
