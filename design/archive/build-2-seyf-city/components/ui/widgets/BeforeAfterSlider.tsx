"use client"

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion"
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { educaroBeforeAfter } from "@/data/city"
import { useCity } from "@/lib/store"

const STEP = 5
const BIG_STEP = 20
const clamp = (v: number) => Math.min(100, Math.max(0, v))
const settle = { type: "spring", stiffness: 420, damping: 36 } as const

/** Educaro: drag (or arrow-key) between the old AngularJS CRM and the new React one. */
export function BeforeAfterSlider() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useCity((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const frameRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<AnimationPlaybackControls | null>(null)
  const draggingRef = useRef(false)
  const [dragging, setDragging] = useState(false)

  // Position of the divider in percent (0 = all new system, 100 = all old system).
  const pos = useMotionValue(50)
  const [value, setValue] = useState(50)
  useMotionValueEvent(pos, "change", (v) => setValue(Math.round(v)))

  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`)
  const left = useTransform(pos, (v) => `${v}%`)
  const oldLabelOpacity = useTransform(pos, [4, 22], [0, 1])
  const newLabelOpacity = useTransform(pos, [78, 96], [1, 0])

  // A small "you can drag me" nudge once the panel opens.
  useEffect(() => {
    if (reduce) return
    hintRef.current = animate(pos, [50, 63, 38, 50], { duration: 1.7, delay: 0.6, ease: "easeInOut" })
    return () => hintRef.current?.stop()
  }, [pos, reduce])

  const moveTo = (next: number, smooth: boolean) => {
    hintRef.current?.stop()
    pos.stop()
    if (smooth && !reduce) animate(pos, clamp(next), settle)
    else pos.set(clamp(next))
  }

  const fromClientX = (clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return pos.get()
    return ((clientX - rect.left) / rect.width) * 100
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
    setDragging(true)
    moveTo(fromClientX(e.clientX), true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    moveTo(fromClientX(e.clientX), false)
  }

  const endDrag = () => {
    draggingRef.current = false
    setDragging(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = pos.get()
    const next: Record<string, number> = {
      ArrowLeft: current - STEP,
      ArrowDown: current - STEP,
      ArrowRight: current + STEP,
      ArrowUp: current + STEP,
      PageDown: current - BIG_STEP,
      PageUp: current + BIG_STEP,
      Home: 0,
      End: 100,
    }
    if (!(e.key in next)) return
    e.preventDefault()
    moveTo(Math.round(next[e.key] / STEP) * STEP, true)
  }

  return (
    <figure className="w-full">
      <div
        ref={frameRef}
        className="relative aspect-[16/10] w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-2xl border-2 border-line bg-cream-deep select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        {/* These are user-replaceable SVG placeholders in /public/images; next/image adds nothing for local SVGs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={educaroBeforeAfter.after.src}
          alt={educaroBeforeAfter.after.alt}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <motion.div className="pointer-events-none absolute inset-0" style={{ clipPath: clip }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={educaroBeforeAfter.before.src}
            alt={educaroBeforeAfter.before.alt}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>

        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-2.5 left-2.5 rounded-full border-2 border-ink bg-cream px-2.5 py-0.5 font-display text-xs font-semibold text-ink shadow-[0_2px_0_#2b2d42]"
          style={{ opacity: oldLabelOpacity }}
        >
          Old system
        </motion.span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-2.5 right-2.5 rounded-full border-2 border-ink bg-mint px-2.5 py-0.5 font-display text-xs font-semibold text-ink shadow-[0_2px_0_#2b2d42]"
          style={{ opacity: newLabelOpacity }}
        >
          New system
        </motion.span>

        {/* Divider + handle */}
        <motion.div className="absolute inset-y-0 w-0" style={{ left }}>
          <div className="absolute inset-y-0 -left-[2px] w-[4px] bg-cream shadow-[0_0_0_2px_#2b2d42]" />
          <motion.div
            role="slider"
            tabIndex={0}
            aria-label="Compare the old and new Educaro CRM"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={`${value}% old system, ${100 - value}% new system`}
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="absolute top-1/2 left-0 grid h-11 w-11 cursor-grab place-items-center rounded-full border-2 border-ink bg-butter text-ink shadow-[0_3px_0_#2b2d42] active:cursor-grabbing"
            style={{ x: "-50%", y: "-50%" }}
            animate={reduce ? undefined : { scale: dragging ? 1.12 : 1 }}
            whileHover={reduce ? undefined : { scale: 1.06 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
      <figcaption className="mt-2 text-sm text-text-soft">
        Drag the handle, or focus it and use the arrow keys, to compare the old and new CRM.
      </figcaption>
    </figure>
  )
}
