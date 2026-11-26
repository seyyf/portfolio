"use client"

import { ChevronsLeftRight } from "lucide-react"
import Image from "next/image"
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import type { Img } from "@/data/missions"

const clamp = (n: number) => Math.min(100, Math.max(0, n))

/**
 * Legacy vs new, one image over the other. Drag anywhere on the image (vertical scrolling still
 * works on touch), or focus the handle: ←/→ (Shift for bigger steps), PageUp/PageDown, Home, End.
 */
export function BeforeAfter({ before, after, beforeLabel, afterLabel }: { before: Img; after: Img; beforeLabel: string; afterLabel: string }) {
  const [pos, setPos] = useState(50)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const fromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (r && r.width > 0) setPos(clamp(((clientX - r.left) / r.width) * 100))
  }
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    fromPointer(e.clientX)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromPointer(e.clientX)
  }
  const stop = () => {
    dragging.current = false
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2
    const keys: Record<string, number> = { ArrowLeft: pos - step, ArrowDown: pos - step, ArrowRight: pos + step, ArrowUp: pos + step, PageDown: pos - 10, PageUp: pos + 10, Home: 0, End: 100 }
    const next = keys[e.key]
    if (next === undefined) return
    e.preventDefault()
    setPos(clamp(next))
  }

  const p = Math.round(pos)
  return (
    <figure>
      <div
        ref={box}
        className="cut-br relative cursor-ew-resize touch-pan-y overflow-hidden rounded-xl border border-ink/12 bg-surface select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      >
        <Image src={after.src} alt={after.alt} width={after.width} height={after.height} sizes="(min-width: 1120px) 820px, (min-width: 1024px) 70vw, 100vw" draggable={false} className="block h-auto w-full" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before.src} alt={before.alt} width={before.width} height={before.height} sizes="(min-width: 1120px) 820px, (min-width: 1024px) 70vw, 100vw" draggable={false} className="block h-full w-full object-cover" />
        </div>

        <span className="pointer-events-none absolute top-3 left-3 max-w-[45%] rounded-md bg-bg/85 px-2 py-1.5 font-mono text-[0.6875rem] leading-tight text-ink lowercase md:text-xs">
          <span className="block text-muted">Before</span>
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute top-3 right-3 max-w-[45%] rounded-md bg-bg/85 px-2 py-1.5 text-right font-mono text-[0.6875rem] leading-tight text-blue lowercase md:text-xs">
          <span className="block text-muted">After</span>
          {afterLabel}
        </span>

        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.75 -translate-x-1/2 bg-blue" style={{ left: `${pos}%` }} />
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Compare ${beforeLabel} (before) and ${afterLabel} (after)`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={p}
          aria-valuetext={`${p}% ${beforeLabel}, ${100 - p}% ${afterLabel}`}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className="absolute top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-blue bg-bg text-blue shadow-(--glow)"
          style={{ left: `${pos}%` }}
        >
          <ChevronsLeftRight aria-hidden="true" className="size-5" />
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-xs leading-5 text-muted">Drag across the image, or focus the handle and use the arrow keys.</figcaption>
    </figure>
  )
}
