"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Bike, Check, ChefHat, Minus, Plus, Receipt, ShoppingBag } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { QrCode } from "@/components/shared/Ticket"
import { projectById } from "@/data/projects"
import { springs } from "@/lib/animations"
import { gsap, useGSAP } from "@/lib/gsap"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

import { resetOrder, startOrder, useOrderRun, type OrderStatus } from "./orderRun"

const project = projectById.order

// Demo menu.
const MENU = [
  { id: "espresso", emoji: "☕", name: "Espresso", note: "Short and strong", price: 3.5 },
  { id: "direct", emoji: "🥛", name: "Café direct", note: "Coffee with hot milk, the Tunis way", price: 4 },
  { id: "cappuccino", emoji: "🫖", name: "Cappuccino", note: "Silky foam, a pinch of cocoa", price: 5 },
  { id: "iced", emoji: "🧊", name: "Iced latte", note: "Cold milk, double shot", price: 6.5 },
] as const

type ItemId = (typeof MENU)[number]["id"]
type Cart = Partial<Record<ItemId, number>>

const tnd = (n: number) => `${n.toFixed(1)} TND`

export default function OrderApp() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const status = useOrderRun((s) => s.status)
  // Fresh visits open on the scan; with an order in flight we go straight to the tracker.
  const [scanned, setScanned] = useState(() => useOrderRun.getState().status !== "idle")

  const view = status !== "idle" ? "tracking" : scanned ? "menu" : "scan"

  return (
    <AppScreen title={project.name} subtitle="Global ENR and Opus Lab, Feb 2022 – Feb 2024" project="order">
      <p className="px-5 text-[0.95rem] leading-relaxed text-text-soft">{project.tagline}</p>

      <section aria-labelledby="order-demo" className="mt-6 px-5">
        <h2 id="order-demo" className="font-display text-xl font-semibold">
          Table 4, scan to order
        </h2>
        <div className="card relative mt-3 min-h-[440px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {view === "scan" && (
              <Fade key="scan" reduce={reduce}>
                <ScanIntro reduce={reduce} onDone={() => setScanned(true)} />
              </Fade>
            )}
            {view === "menu" && (
              <Fade key="menu" reduce={reduce}>
                <Menu reduce={reduce} />
              </Fade>
            )}
            {view === "tracking" && (
              <Fade key="tracking" reduce={reduce}>
                <Tracker status={status} reduce={reduce} />
              </Fade>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-3 text-sm text-text-soft">A demo. The real PWA served about 120 people ordering food and drinks from their phones.</p>
      </section>

      <section aria-labelledby="order-story" className="mt-9 px-5">
        <h2 id="order-story" className="font-display text-xl font-semibold">
          What I did
        </h2>
        <div className="mt-3 space-y-4">
          {project.roles.map((r) => {
            const prefix = `${r.company}: `
            const lines = project.story.filter((l) => l.startsWith(prefix)).map((l) => l.slice(prefix.length))
            return (
              <article key={r.company} className="card p-4">
                <h3 className="font-display text-lg font-semibold">{r.company}</h3>
                <p className="text-sm text-text-soft">
                  {r.title}, {r.start} – {r.end}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {lines.map((line) => (
                    <li key={line} className="flex gap-3 leading-relaxed">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-butter" />
                      <span>{line.charAt(0).toUpperCase() + line.slice(1)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="order-stack" className="mt-9 px-5 pb-4">
        <h2 id="order-stack" className="font-display text-xl font-semibold">
          Stack
        </h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </section>
    </AppScreen>
  )
}

function Fade({ reduce, children }: { reduce: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={reduce ? { duration: 0.15 } : springs.smooth}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------------------------
// 1. The QR scan: viewfinder corners snap in, a light sweeps across, a check pops.

function ScanIntro({ reduce, onDone }: { reduce: boolean; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduce) {
        gsap.delayedCall(0.8, onDone)
        return
      }
      const tl = gsap.timeline({ delay: 0.25, onComplete: onDone })
      tl.from(".scan-corner", { scale: 1.5, opacity: 0, duration: 0.5, ease: "os.spring", stagger: 0.05 })
        .fromTo(".scan-beam", { yPercent: 0 }, { yPercent: 200, duration: 0.85, ease: "sine.inOut", repeat: 1, yoyo: true }, "-=0.2")
        .to(".scan-corner", { borderColor: "#7ee2bc", duration: 0.2 }, "-=0.1")
        .fromTo(".scan-flash", { opacity: 0 }, { opacity: 0.85, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, "<")
        .fromTo(".scan-check", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "os.spring" }, "-=0.05")
        .to({}, { duration: 0.35 })
    },
    { scope: root }
  )

  return (
    <div ref={root} className="flex min-h-[440px] flex-col items-center justify-center gap-5 p-6 text-center">
      <p className="text-sm font-semibold text-text-soft" aria-live="polite">
        Scanning the table code…
      </p>
      <div className="relative size-[200px] p-4">
        {/* Viewfinder corners */}
        {["top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl"].map((c) => (
          <span key={c} aria-hidden="true" className={cn("scan-corner absolute size-9 border-text", c)} />
        ))}
        <div className="relative size-full overflow-hidden rounded-xl bg-white p-2.5">
          <QrCode seed="table-4" />
          <span className="sr-only">A decorative QR code on table 4.</span>
          <span
            aria-hidden="true"
            className="scan-beam absolute inset-x-0 bottom-full h-full will-change-transform"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(126,226,188,0) 55%, rgba(126,226,188,0.55) 88%, rgba(255,255,255,0.95) 100%)",
            }}
          />
          <span aria-hidden="true" className="scan-flash absolute inset-0 bg-white opacity-0" />
          <span aria-hidden="true" className="scan-check absolute inset-0 grid place-items-center opacity-0">
            <span className="grid size-16 place-items-center rounded-full bg-mint text-ink shadow-[0_8px_20px_rgba(31,34,51,0.25)]">
              <Check size={34} strokeWidth={3} />
            </span>
          </span>
        </div>
      </div>
      <button type="button" onClick={onDone} className="min-h-11 rounded-full px-4 text-sm font-semibold text-text-soft underline-offset-4 hover:underline">
        Open the menu
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// 2. The menu: pick a coffee, the cart badge pops, place the order.

function Menu({ reduce }: { reduce: boolean }) {
  const [cart, setCart] = useState<Cart>({})
  const count = Object.values(cart).reduce((a, b) => a + (b ?? 0), 0)
  const total = MENU.reduce((sum, i) => sum + (cart[i.id] ?? 0) * i.price, 0)

  const change = (id: ItemId, delta: number) => {
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }))
    playSfx(delta > 0 ? "pop" : "tap")
  }

  const place = () => {
    if (count === 0) return
    const summary = MENU.filter((i) => cart[i.id])
      .map((i) => `${cart[i.id]} × ${i.name}`)
      .join(", ")
    playSfx("tap")
    startOrder(summary)
  }

  return (
    <div className="flex min-h-[440px] flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
        <div>
          <p className="text-xs font-semibold text-text-soft">Café du Coin, table 4</p>
          <h3 className="font-display text-lg font-semibold">Coffee</h3>
        </div>
        <div className="relative grid size-11 place-items-center rounded-full bg-surface-2" role="status" aria-label={`Cart: ${count} ${count === 1 ? "item" : "items"}`}>
          <ShoppingBag size={20} aria-hidden="true" />
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                aria-hidden="true"
                className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[0.7rem] font-bold text-ink tabular-nums"
                initial={reduce ? { opacity: 0 } : { scale: 0.3 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 700, damping: 14 }}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ul className="flex-1 divide-y divide-line px-4">
        {MENU.map((item) => {
          const qty = cart[item.id] ?? 0
          return (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-butter/50 text-2xl">
                {item.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="truncate text-xs text-text-soft">{item.note}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">{tnd(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <AnimatePresence initial={false}>
                  {qty > 0 && (
                    <motion.div
                      className="flex items-center gap-1"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
                      transition={reduce ? { duration: 0.12 } : springs.snappy}
                    >
                      <button
                        type="button"
                        onClick={() => change(item.id, -1)}
                        aria-label={`Remove one ${item.name}`}
                        className="grid size-11 place-items-center rounded-full bg-surface-2 transition-transform active:scale-90"
                      >
                        <Minus size={18} aria-hidden="true" />
                      </button>
                      <span className="w-5 text-center font-semibold tabular-nums" aria-label={`${qty} in cart`}>
                        {qty}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={() => change(item.id, 1)}
                  aria-label={`Add ${item.name}`}
                  className="grid size-11 place-items-center rounded-full bg-text text-bg transition-transform active:scale-90"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="m-3 flex items-center justify-between gap-3 rounded-[20px] bg-surface-2 p-3 pl-4">
        <div>
          <p className="text-xs text-text-soft">{count === 0 ? "Your cart is empty" : `${count} ${count === 1 ? "item" : "items"}`}</p>
          <p className="font-display text-lg font-semibold tabular-nums">{tnd(total)}</p>
        </div>
        <button type="button" className="btn disabled:opacity-50" disabled={count === 0} onClick={place}>
          Place order
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// 3. The tracker: Received → Preparing → On its way, mirrored in the live pill.

const STAGES: { id: Exclude<OrderStatus, "idle">; label: string; icon: typeof Receipt }[] = [
  { id: "received", label: "Received", icon: Receipt },
  { id: "preparing", label: "Preparing", icon: ChefHat },
  { id: "onTheWay", label: "On its way", icon: Bike },
]

const HEADLINES: Record<Exclude<OrderStatus, "idle">, { emoji: string; title: string; text: string }> = {
  received: { emoji: "🧾", title: "Order received", text: "The bar has your order." },
  preparing: { emoji: "☕", title: "Preparing your coffee", text: "Grinding, pulling, steaming." },
  onTheWay: { emoji: "🛵", title: "Coffee on its way", text: "Look up, it is coming to table 4." },
}

function Tracker({ status, reduce }: { status: OrderStatus; reduce: boolean }) {
  const summary = useOrderRun((s) => s.summary)
  if (status === "idle") return null
  const stage = STAGES.findIndex((s) => s.id === status)
  const head = HEADLINES[status]
  const progress = (stage + 0.5) / STAGES.length
  const done = status === "onTheWay"

  return (
    <div className="flex min-h-[440px] flex-col p-5">
      <p className="text-xs font-semibold text-text-soft">Order #0427, table 4</p>

      <div className="mt-6 flex flex-1 flex-col items-center text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={status}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: -8 }}
            transition={reduce ? { duration: 0.15 } : springs.bouncy}
            className="flex flex-col items-center"
          >
            <span aria-hidden="true" className="grid size-24 place-items-center rounded-full bg-butter/50 text-5xl">
              <motion.span
                animate={reduce || done ? undefined : { rotate: [0, -8, 8, 0], y: [0, -3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                {head.emoji}
              </motion.span>
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold">{head.title}</h3>
            <p className="mt-1 text-sm text-text-soft">{head.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress track */}
      <div className="mt-6">
        <div className="relative h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-mint"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: done ? 1 : progress }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <ol className="mt-3 grid grid-cols-3 text-xs font-semibold">
          {STAGES.map((s, i) => {
            const reached = i <= stage
            const Icon = s.icon
            return (
              <li
                key={s.id}
                className={cn("flex items-center gap-1.5", i === 1 && "justify-center", i === 2 && "justify-end", reached ? "text-text" : "text-text-soft")}
                aria-current={i === stage ? "step" : undefined}
              >
                <Icon size={15} aria-hidden="true" />
                {s.label}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="min-w-0 truncate text-sm text-text-soft">{summary}</p>
        <button type="button" className="btn btn-soft shrink-0 disabled:opacity-50" onClick={resetOrder} disabled={!done}>
          Order again
        </button>
      </div>
    </div>
  )
}
