import { VIEW } from "@/components/map/geometry"

// Pan / zoom for the world map: drag, wheel (Ctrl/⌘ + wheel or trackpad pinch on desktop, so the
// page still scrolls), two-finger pinch, buttons, and animated "flights" between markers.
// The world element is laid out by CSS (it already frames the markers before any JS runs); this
// adds translate + scale on top. Markers stay the same size on screen through the --inv variable.

export type View = { x: number; y: number; s: number }
export type Rect = { left: number; top: number; right: number; bottom: number }

export const MIN_SCALE = 0.6
export const MAX_SCALE = 4

const clampS = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

type Options = {
  reduced: () => boolean
  /** Desktop: a plain wheel scrolls the page; only Ctrl/⌘ + wheel (or a trackpad pinch) zooms. */
  cooperative: () => boolean
  onWheelHint: () => void
  onSettle: (v: View) => void
}

export class PanZoom {
  v: View = { x: 0, y: 0, s: 1 }
  private raf = 0
  private settleTimer = 0
  private pointers = new Map<number, { x: number; y: number }>()
  private start: { v: View; x: number; y: number; d: number } | null = null
  private moved = false
  private suppressClick = false
  private lastWidth = 0
  private ro: ResizeObserver

  constructor(
    private vp: HTMLElement,
    private world: HTMLElement,
    private opts: Options
  ) {
    // Start from the CSS framing (also after the page is shown again from the router cache).
    this.apply(this.v)
    vp.addEventListener("pointerdown", this.onDown)
    vp.addEventListener("pointermove", this.onMove)
    vp.addEventListener("pointerup", this.onUp)
    vp.addEventListener("pointercancel", this.onUp)
    vp.addEventListener("wheel", this.onWheel, { passive: false })
    vp.addEventListener("click", this.onClickCapture, true)
    this.ro = new ResizeObserver(() => {
      const w = vp.clientWidth
      // A new width re-frames the map from CSS; start again from that framing.
      if (this.lastWidth && w && w !== this.lastWidth) {
        cancelAnimationFrame(this.raf)
        this.apply({ x: 0, y: 0, s: 1 })
        this.settle()
      }
      if (w) this.lastWidth = w
    })
    this.ro.observe(vp)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    clearTimeout(this.settleTimer)
    this.ro.disconnect()
    this.vp.removeEventListener("pointerdown", this.onDown)
    this.vp.removeEventListener("pointermove", this.onMove)
    this.vp.removeEventListener("pointerup", this.onUp)
    this.vp.removeEventListener("pointercancel", this.onUp)
    this.vp.removeEventListener("wheel", this.onWheel)
    this.vp.removeEventListener("click", this.onClickCapture, true)
  }

  /** CSS framing of the world: its offset in the viewport and pixels per map unit. */
  private base() {
    const w = this.world
    return { bx: w.offsetLeft, by: w.offsetTop, u: w.offsetWidth / VIEW.w || 1, W: this.vp.clientWidth, H: this.vp.clientHeight }
  }

  /** Keeps the scale in range and the view's centre over the map. */
  clamp(v: View): View {
    const { bx, by, u, W, H } = this.base()
    const s = clampS(v.s)
    const k = u * s
    const cx = Math.min(VIEW.w, Math.max(0, (W / 2 - bx - v.x) / k))
    const cy = Math.min(VIEW.h, Math.max(0, (H / 2 - by - v.y) / k))
    return { s, x: W / 2 - bx - cx * k, y: H / 2 - by - cy * k }
  }

  private apply(v: View) {
    this.v = v
    this.world.style.transform = `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.s})`
    this.world.style.setProperty("--inv", String(1 / v.s))
  }

  /** Re-rasterize sharply once movement stops (will-change only while moving). */
  private moving() {
    this.world.style.willChange = "transform"
    clearTimeout(this.settleTimer)
  }
  private settle() {
    clearTimeout(this.settleTimer)
    this.settleTimer = window.setTimeout(() => {
      this.world.style.willChange = ""
      this.opts.onSettle(this.v)
    }, 140)
  }

  set(v: View) {
    cancelAnimationFrame(this.raf)
    this.moving()
    this.apply(this.clamp(v))
    this.settle()
  }

  flyTo(target: View, ms = 750) {
    cancelAnimationFrame(this.raf)
    const to = this.clamp(target)
    if (this.opts.reduced()) {
      this.set(to)
      return
    }
    const from = this.v
    const t0 = performance.now()
    this.moving()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      const e = ease(t)
      this.apply({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, s: from.s + (to.s - from.s) * e })
      if (t < 1) this.raf = requestAnimationFrame(step)
      else this.settle()
    }
    this.raf = requestAnimationFrame(step)
  }

  private zoomTarget(px: number, py: number, s: number, from = this.v): View {
    const { bx, by } = this.base()
    const ns = clampS(s)
    return { s: ns, x: px - bx - ((px - bx - from.x) * ns) / from.s, y: py - by - ((py - by - from.y) * ns) / from.s }
  }

  /** Zoom around the viewport centre (buttons, + / - keys). */
  zoomBy(factor: number) {
    const { W, H } = this.base()
    this.flyTo(this.zoomTarget(W / 2, H / 2, this.v.s * factor), 320)
  }

  reset() {
    this.flyTo({ x: 0, y: 0, s: 1 })
  }

  /** Where a map point is on screen, relative to the viewport. */
  screen(mx: number, my: number) {
    const { bx, by, u } = this.base()
    return { x: bx + this.v.x + mx * u * this.v.s, y: by + this.v.y + my * u * this.v.s }
  }

  /** Fly so that a map point sits in the middle of `rect` (viewport coordinates). */
  centerOn(mx: number, my: number, rect: Rect, scale = this.v.s) {
    const { bx, by, u } = this.base()
    const s = clampS(scale)
    const cx = (rect.left + rect.right) / 2
    const cy = (rect.top + rect.bottom) / 2
    this.flyTo({ s, x: cx - bx - mx * u * s, y: cy - by - my * u * s })
  }

  private onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    cancelAnimationFrame(this.raf)
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    this.begin()
  }

  private begin() {
    const pts = [...this.pointers.values()]
    if (!pts.length) {
      this.start = null
      return
    }
    const mid = pts.length > 1 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0]
    const d = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0
    this.start = { v: this.v, x: mid.x, y: mid.y, d }
    if (pts.length > 1) this.moved = true
  }

  private onMove = (e: PointerEvent) => {
    if (!this.pointers.has(e.pointerId) || !this.start) return
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...this.pointers.values()]
    const r = this.vp.getBoundingClientRect()
    if (pts.length === 1) {
      const dx = pts[0].x - this.start.x
      const dy = pts[0].y - this.start.y
      if (!this.moved && Math.hypot(dx, dy) < 6) return
      if (!this.moved) {
        this.moved = true
        this.vp.setPointerCapture(e.pointerId)
        this.vp.dataset.dragging = ""
      }
      this.moving()
      this.apply(this.clamp({ s: this.start.v.s, x: this.start.v.x + dx, y: this.start.v.y + dy }))
    } else {
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      if (!this.start.d) return
      const z = this.zoomTarget(this.start.x - r.left, this.start.y - r.top, (this.start.v.s * d) / this.start.d, this.start.v)
      this.moving()
      this.apply(this.clamp({ s: z.s, x: z.x + (mid.x - this.start.x), y: z.y + (mid.y - this.start.y) }))
    }
  }

  private onUp = (e: PointerEvent) => {
    if (!this.pointers.delete(e.pointerId)) return
    if (this.pointers.size) {
      this.begin()
      return
    }
    if (this.moved) {
      this.suppressClick = true
      window.setTimeout(() => (this.suppressClick = false), 0)
      this.settle()
    }
    this.moved = false
    this.start = null
    delete this.vp.dataset.dragging
  }

  private onClickCapture = (e: MouseEvent) => {
    if (!this.suppressClick) return
    e.stopPropagation()
    e.preventDefault()
  }

  private onWheel = (e: WheelEvent) => {
    if (this.opts.cooperative() && !e.ctrlKey && !e.metaKey) {
      this.opts.onWheelHint()
      return
    }
    e.preventDefault()
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1
    const delta = Math.max(-60, Math.min(60, e.deltaY * unit))
    const r = this.vp.getBoundingClientRect()
    this.set(this.zoomTarget(e.clientX - r.left, e.clientY - r.top, this.v.s * Math.exp(-delta * 0.004)))
  }
}
