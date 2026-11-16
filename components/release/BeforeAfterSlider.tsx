"use client"

import { ChevronsLeftRight } from "lucide-react"
import Image from "next/image"
import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import type { Img } from "@/data/releases"

/**
 * Legacy vs new, one image over the other. Drag anywhere on the image, or focus the handle and use
 * ←/→ (Shift for bigger steps), Home and End. Exposed as a slider to screen readers.
 */
export function BeforeAfterSlider({ before, after, beforeLabel, afterLabel }: { before: Img; after: Img; beforeLabel: string; afterLabel: string }) {
  const [pos, setPos] = useState(50)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const fromPointer = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    fromPointer(e.clientX)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => dragging.current && fromPointer(e.clientX)
  const onPointerUp = () => (dragging.current = false)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2
    const next = { ArrowLeft: pos - step, ArrowDown: pos - step, ArrowRight: pos + step, ArrowUp: pos + step, Home: 0, End: 100, PageDown: pos - 10, PageUp: pos + 10 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    setPos(Math.min(100, Math.max(0, next)))
  }

  return (
    <figure>
      <div
        ref={box}
        className="relative touch-pan-y overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Image src={after.src} alt={after.alt} width={after.width} height={after.height} unoptimized draggable={false} className="dim-at-night block h-auto w-full" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before.src} alt={before.alt} width={before.width} height={before.height} unoptimized draggable={false} className="dim-at-night block h-auto w-full" />
        </div>

        <span className="pointer-events-none absolute top-3 left-3 rounded-md bg-surface/90 px-2 py-0.5 font-mono text-xs text-ink">{beforeLabel}</span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-md bg-surface/90 px-2 py-0.5 font-mono text-xs text-ink">{afterLabel}</span>

        <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-accent" style={{ left: `${pos}%` }} />
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% ${beforeLabel}`}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border bg-surface text-ink shadow-[var(--shadow-hover)]"
          style={{ left: `${pos}%` }}
        >
          <ChevronsLeftRight aria-hidden="true" className="size-5" />
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted">Drag the handle, or focus it and use the arrow keys. Placeholder images.</figcaption>
    </figure>
  )
}
