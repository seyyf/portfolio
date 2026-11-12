"use client"

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"

import { fade, springs } from "@/lib/animations"
import { cn } from "@/lib/utils"

import type { ViewState } from "./index"

export type Photo = { key: string; src: string; alt: string; width: number; height: number }
export type Album = { id: string; name: string; photos: Photo[] }

type ViewerProps = {
  albums: Album[]
  view: ViewState | null
  onNavigate: (dir: number) => void
  onClose: () => void
  reduce: boolean
}

/** Slides travel a bit further than the widest phone screen. */
const SLIDE = 460
const MAX_ZOOM = 4

const slideVariants = {
  enter: (dir: number) => ({ x: dir * SLIDE, opacity: 1, scale: 1 }),
  center: { x: 0, opacity: 1, scale: 1 },
  // dir 0 means the viewer is closing: fade out (the opened photo flies back to its thumbnail).
  exit: (dir: number) => (dir === 0 ? { opacity: 0, scale: 0.92 } : { x: dir * -SLIDE, opacity: 1 }),
}
const fadeVariants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }

/**
 * Full-screen photo viewer inside the phone. Swipe sideways to browse the album, swipe down to
 * close, pinch or double-tap to zoom, drag to pan when zoomed. Keyboard: arrows, Escape.
 */
export function Viewer({ albums, view, onNavigate, onClose, reduce }: ViewerProps) {
  // 0..1 while dragging a photo down to dismiss: fades the backdrop and the controls.
  const dismiss = useMotionValue(0)
  const backdrop = useTransform(dismiss, [0, 1], [1, 0.15])
  const chrome = useTransform(dismiss, [0, 0.35], [1, 0])
  const closeRef = useRef<HTMLButtonElement>(null)
  const isOpen = view !== null

  const album = view ? albums[view.album] : null
  const photo = view && album ? album.photos[view.index] : null

  // Keyboard: arrows browse, Escape closes (and stops the OS from closing the whole app).
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        onNavigate(1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        onNavigate(-1)
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [isOpen, onClose, onNavigate])

  useEffect(() => {
    if (!isOpen) return
    dismiss.set(0)
    closeRef.current?.focus({ preventScroll: true })
  }, [isOpen, dismiss])

  return (
    <AnimatePresence>
      {view && album && photo && (
        <motion.div
          key="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`${album.name}, photo ${view.index + 1} of ${album.photos.length}`}
          className="fixed inset-0 z-[70] flex flex-col overflow-hidden text-white"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[#07080f]"
            style={{ opacity: backdrop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? fade : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Top bar: close and counter */}
          <motion.div
            className="relative z-10 flex shrink-0 items-center justify-between px-3 pt-[calc(var(--status-h)+env(safe-area-inset-top))]"
            style={{ opacity: chrome }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="grid size-11 place-items-center rounded-full bg-white/12 backdrop-blur-md transition-transform active:scale-90"
              aria-label="Close photo"
            >
              <X size={22} aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold tabular-nums text-white/85">
              {view.index + 1} of {album.photos.length}
            </p>
            <span className="size-11" aria-hidden="true" />
          </motion.div>

          {/* Stage */}
          <div className="relative min-h-0 flex-1 touch-none">
            <AnimatePresence initial={false} custom={view.dir}>
              <Slide
                key={photo.key}
                photo={photo}
                hero={view.hero === photo.key}
                dir={view.dir}
                canPrev={view.index > 0}
                canNext={view.index < album.photos.length - 1}
                onNavigate={onNavigate}
                onClose={onClose}
                dismiss={dismiss}
                reduce={reduce}
              />
            </AnimatePresence>

            {view.index > 0 && (
              <NavButton side="left" onClick={() => onNavigate(-1)} label="Previous photo" opacity={chrome} />
            )}
            {view.index < album.photos.length - 1 && (
              <NavButton side="right" onClick={() => onNavigate(1)} label="Next photo" opacity={chrome} />
            )}
          </div>

          {/* Caption */}
          <motion.div
            className="relative z-10 shrink-0 px-5 pt-3 pb-[calc(var(--home-h)+env(safe-area-inset-bottom)+12px)]"
            style={{ opacity: chrome }}
          >
            <p className="font-display text-base font-semibold">{album.name}</p>
            <p className="mt-0.5 min-h-10 text-sm leading-snug text-white/75" aria-live="polite">
              {photo.alt}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function NavButton({
  side,
  onClick,
  label,
  opacity,
}: {
  side: "left" | "right"
  onClick: () => void
  label: string
  opacity: MotionValue<number>
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ opacity }}
      className={cn(
        "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/12 backdrop-blur-md transition-transform active:scale-90",
        "[@media(pointer:fine)]:grid",
        side === "left" ? "left-2" : "right-2"
      )}
    >
      <Icon size={22} aria-hidden="true" />
    </motion.button>
  )
}

type SlideProps = {
  photo: Photo
  hero: boolean
  dir: number
  canPrev: boolean
  canNext: boolean
  onNavigate: (dir: number) => void
  onClose: () => void
  dismiss: MotionValue<number>
  reduce: boolean
}

type Gesture = {
  mode: "pending" | "swipe-x" | "swipe-y" | "pan" | "pinch"
  startX: number
  startY: number
  startPanX: number
  startPanY: number
  startDist: number
  startScale: number
  lastX: number
  lastY: number
  lastT: number
  vx: number
  vy: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
/** Rubber band: the further you pull past the edge, the less it follows. */
const rubber = (d: number, k = 0.28) => d * k

function Slide({ photo, hero, dir, canPrev, canNext, onNavigate, onClose, dismiss, reduce }: SlideProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const zoom = useMotionValue(1)
  const panX = useMotionValue(0)
  const panY = useMotionValue(0)
  const shrink = useTransform(dismiss, [0, 1], [1, 0.82])
  const [zoomed, setZoomed] = useState(false)

  const frameRef = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const g = useRef<Gesture | null>(null)
  const lastTap = useRef({ t: 0, x: 0, y: 0 })

  const spring = reduce ? fade : springs.smooth

  const panBounds = (s: number) => {
    const el = frameRef.current
    if (!el) return { x: 0, y: 0 }
    return { x: ((s - 1) * el.offsetWidth) / 2, y: ((s - 1) * el.offsetHeight) / 2 }
  }

  const setZoom = (s: number, focus?: { x: number; y: number }) => {
    const el = frameRef.current
    let tx = 0
    let ty = 0
    if (el && focus && s > 1) {
      // Keep the tapped point under the finger: translate by -(s - 1) * offset from the centre.
      const r = el.getBoundingClientRect()
      const b = panBounds(s)
      tx = clamp(-(s - 1) * (focus.x - (r.left + r.width / 2)), -b.x, b.x)
      ty = clamp(-(s - 1) * (focus.y - (r.top + r.height / 2)), -b.y, b.y)
    }
    animate(zoom, s, spring)
    animate(panX, tx, spring)
    animate(panY, ty, spring)
    setZoomed(s > 1)
  }

  const distance = () => {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  /** After a pinch or pan: snap back to 1x if barely zoomed, else keep the photo inside its bounds. */
  const settleZoom = () => {
    const s = zoom.get()
    if (s <= 1.05) {
      setZoom(1)
      return
    }
    const b = panBounds(s)
    animate(panX, clamp(panX.get(), -b.x, b.x), spring)
    animate(panY, clamp(panY.get(), -b.y, b.y), spring)
    setZoomed(true)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const base = { lastX: e.clientX, lastY: e.clientY, lastT: e.timeStamp, vx: 0, vy: 0 }

    if (pointers.current.size === 2) {
      // Second finger: switch to pinch and let go of any swipe in progress.
      animate(x, 0, spring)
      animate(y, 0, spring)
      dismiss.set(0)
      g.current = {
        ...base,
        mode: "pinch",
        startX: e.clientX,
        startY: e.clientY,
        startPanX: panX.get(),
        startPanY: panY.get(),
        startDist: distance() || 1,
        startScale: zoom.get(),
      }
      return
    }
    if (pointers.current.size > 2) return
    g.current = {
      ...base,
      mode: zoom.get() > 1.01 ? "pan" : "pending",
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panX.get(),
      startPanY: panY.get(),
      startDist: 1,
      startScale: zoom.get(),
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = g.current
    if (!s || !pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const dt = Math.max(1, e.timeStamp - s.lastT)
    s.vx = (e.clientX - s.lastX) / dt
    s.vy = (e.clientY - s.lastY) / dt
    s.lastX = e.clientX
    s.lastY = e.clientY
    s.lastT = e.timeStamp

    if (s.mode === "pinch") {
      if (pointers.current.size < 2) return
      const next = clamp((s.startScale * distance()) / s.startDist, 0.8, MAX_ZOOM)
      zoom.set(next)
      const b = panBounds(Math.max(1, next))
      panX.set(clamp(panX.get(), -b.x, b.x))
      panY.set(clamp(panY.get(), -b.y, b.y))
      return
    }

    const dx = e.clientX - s.startX
    const dy = e.clientY - s.startY

    if (s.mode === "pan") {
      const b = panBounds(zoom.get())
      const px = s.startPanX + dx
      const py = s.startPanY + dy
      panX.set(px > b.x ? b.x + rubber(px - b.x) : px < -b.x ? -b.x + rubber(px + b.x) : px)
      panY.set(py > b.y ? b.y + rubber(py - b.y) : py < -b.y ? -b.y + rubber(py + b.y) : py)
      return
    }

    if (s.mode === "pending") {
      if (Math.hypot(dx, dy) < 8) return
      s.mode = Math.abs(dx) > Math.abs(dy) ? "swipe-x" : "swipe-y"
    }

    if (s.mode === "swipe-x") {
      const blocked = (dx < 0 && !canNext) || (dx > 0 && !canPrev)
      x.set(blocked ? rubber(dx) : dx)
    } else if (s.mode === "swipe-y") {
      y.set(dy > 0 ? dy : rubber(dy, 0.2))
      dismiss.set(clamp(dy / 320, 0, 1))
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.delete(e.pointerId)
    const s = g.current
    if (!s) return

    if (s.mode === "pinch") {
      if (pointers.current.size === 1) {
        // One finger left: carry on panning from where it is.
        const [rest] = [...pointers.current.values()]
        g.current = { ...s, mode: "pan", startX: rest.x, startY: rest.y, startPanX: panX.get(), startPanY: panY.get() }
        return
      }
      settleZoom()
      g.current = null
      return
    }
    if (pointers.current.size > 0) return
    g.current = null

    const dx = e.clientX - s.startX
    const dy = e.clientY - s.startY
    const width = e.currentTarget.offsetWidth || 360

    if (s.mode === "pending" || (s.mode === "pan" && Math.hypot(dx, dy) < 8)) {
      // A tap: two quick taps toggle 2x zoom around the tapped point.
      const t = e.timeStamp
      const prev = lastTap.current
      if (t - prev.t < 300 && Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < 30) {
        lastTap.current = { t: 0, x: 0, y: 0 }
        setZoom(zoom.get() > 1.01 ? 1 : 2, { x: e.clientX, y: e.clientY })
      } else {
        lastTap.current = { t, x: e.clientX, y: e.clientY }
      }
      return
    }

    if (s.mode === "pan") {
      settleZoom()
      return
    }

    if (s.mode === "swipe-x") {
      const goNext = (dx < -width * 0.22 || s.vx < -0.45) && canNext
      const goPrev = (dx > width * 0.22 || s.vx > 0.45) && canPrev
      if (goNext) onNavigate(1)
      else if (goPrev) onNavigate(-1)
      else animate(x, 0, reduce ? fade : springs.bouncy)
      return
    }

    if (s.mode === "swipe-y") {
      if (dy > 110 || s.vy > 0.6) {
        onClose()
      } else {
        animate(y, 0, reduce ? fade : springs.bouncy)
        animate(dismiss, 0, reduce ? fade : springs.smooth)
      }
    }
  }

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-3 py-2 select-none"
      style={{ x, containerType: "size" }}
      custom={dir}
      variants={reduce ? fadeVariants : slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={reduce ? fade : springs.smooth}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <motion.div
        ref={frameRef}
        layoutId={hero ? `photo-${photo.key}` : undefined}
        transition={springs.smooth}
        className={cn("relative bg-white/5", zoomed ? "overflow-visible" : "overflow-hidden")}
        style={{
          y,
          scale: shrink,
          borderRadius: 14,
          width: `min(100cqw, 100cqh * ${photo.width / photo.height})`,
          aspectRatio: `${photo.width} / ${photo.height}`,
        }}
      >
        <motion.div className="size-full" style={{ scale: zoom, x: panX, y: panY, cursor: zoomed ? "grab" : "zoom-in" }}>
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 430px) 100vw, 430px"
            unoptimized={photo.src.endsWith(".svg")}
            draggable={false}
            loading="eager"
            className="pointer-events-none size-full rounded-[14px] object-contain"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
