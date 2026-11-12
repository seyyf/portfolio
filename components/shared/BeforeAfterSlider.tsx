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
import Image from "next/image"
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

type Img = { src: string; alt: string; width: number; height: number }

type BeforeAfterSliderProps = {
  before: Img
  after: Img
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

const STEP = 5
const BIG_STEP = 20
const clamp = (v: number) => Math.min(100, Math.max(0, v))
const settle = { type: "spring", stiffness: 420, damping: 36 } as const

/**
 * Drag (or arrow-key) between two images. The divider position is the share of the "before" image
 * that shows, from the left edge.
 */
export function BeforeAfterSlider({ before, after, beforeLabel = "Old system", afterLabel = "New system", className }: BeforeAfterSliderProps) {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const frameRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<AnimationPlaybackControls | null>(null)
  const draggingRef = useRef(false)
  const [dragging, setDragging] = useState(false)

  const pos = useMotionValue(50)
  const [value, setValue] = useState(50)
  useMotionValueEvent(pos, "change", (v) => setValue(Math.round(v)))

  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`)
  const left = useTransform(pos, (v) => `${v}%`)
  const beforeLabelOpacity = useTransform(pos, [4, 24], [0, 1])
  const afterLabelOpacity = useTransform(pos, [76, 96], [1, 0])

  // A small "you can drag me" nudge once the slider appears.
  useEffect(() => {
    if (reduce) return
    hintRef.current = animate(pos, [50, 64, 38, 50], { duration: 1.8, delay: 0.7, ease: "easeInOut" })
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
    const keys: Record<string, number> = {
      ArrowLeft: current - STEP,
      ArrowDown: current - STEP,
      ArrowRight: current + STEP,
      ArrowUp: current + STEP,
      PageDown: current - BIG_STEP,
      PageUp: current + BIG_STEP,
      Home: 0,
      End: 100,
    }
    if (!(e.key in keys)) return
    e.preventDefault()
    moveTo(Math.round(keys[e.key] / STEP) * STEP, true)
  }

  return (
    <figure className={cn("w-full", className)}>
      <div
        ref={frameRef}
        className="relative w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-[20px] bg-surface-2 shadow-[var(--shadow)] select-none"
        style={{ aspectRatio: `${after.width} / ${after.height}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <Image
          src={after.src}
          alt={after.alt}
          width={after.width}
          height={after.height}
          unoptimized
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <motion.div className="pointer-events-none absolute inset-0 will-change-[clip-path]" style={{ clipPath: clip }}>
          <Image
            src={before.src}
            alt={before.alt}
            width={before.width}
            height={before.height}
            unoptimized
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>

        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur"
          style={{ opacity: beforeLabelOpacity }}
        >
          {beforeLabel}
        </motion.span>
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 right-2.5 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-ink"
          style={{ opacity: afterLabelOpacity }}
        >
          {afterLabel}
        </motion.span>

        {/* Divider and handle */}
        <motion.div className="absolute inset-y-0 w-0" style={{ left }}>
          <div aria-hidden="true" className="absolute inset-y-0 -left-px w-[2px] bg-white shadow-[0_0_12px_rgba(31,34,51,0.35)]" />
          <motion.div
            role="slider"
            tabIndex={0}
            aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={`${value}% ${beforeLabel}, ${100 - value}% ${afterLabel}`}
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="absolute top-1/2 left-0 grid size-11 cursor-grab place-items-center rounded-full bg-white text-ink shadow-[0_4px_14px_rgba(31,34,51,0.3)] active:cursor-grabbing"
            style={{ x: "-50%", y: "-50%" }}
            animate={reduce ? undefined : { scale: dragging ? 1.14 : 1 }}
            whileHover={reduce ? undefined : { scale: 1.06 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
      <figcaption className="mt-2 text-sm text-text-soft">Drag the handle, or focus it and use the arrow keys, to compare.</figcaption>
    </figure>
  )
}
