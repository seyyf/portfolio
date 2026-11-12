"use client"

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion"
import { Search, SearchX, X } from "lucide-react"
import { useDeferredValue, useId, useState } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { projectById } from "@/data/projects"
import { springs } from "@/lib/animations"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

const project = projectById.eprocat
const role = project.roles[0]

type Category = "Safety" | "Office" | "Cleaning" | "Tools"

const CATEGORIES: { id: Category; color: string }[] = [
  { id: "Safety", color: "bg-mint" },
  { id: "Office", color: "bg-sky" },
  { id: "Cleaning", color: "bg-lavender" },
  { id: "Tools", color: "bg-butter" },
]

const colorOf = (c: Category) => CATEGORIES.find((x) => x.id === c)?.color ?? "bg-surface-2"

// Demo catalog. Article numbers and classification codes are illustrative.
const PRODUCTS: { id: string; name: string; article: string; code: string; category: Category; unit: string }[] = [
  { id: "p1", name: "Nitrile gloves, box of 100", article: "ART-104233", code: "eCl@ss 34-22-01-02", category: "Safety", unit: "Box" },
  { id: "p2", name: "Safety goggles, anti-fog", article: "ART-104871", code: "eCl@ss 34-22-02-01", category: "Safety", unit: "Piece" },
  { id: "p3", name: "High-visibility vest, size L", article: "ART-105102", code: "eCl@ss 34-22-04-03", category: "Safety", unit: "Piece" },
  { id: "p4", name: "FFP2 masks, pack of 20", article: "ART-105530", code: "eCl@ss 34-22-03-05", category: "Safety", unit: "Pack" },
  { id: "p5", name: "Copy paper A4, 500 sheets", article: "ART-200114", code: "eCl@ss 24-32-01-01", category: "Office", unit: "Ream" },
  { id: "p6", name: "Ballpoint pens, blue, pack of 50", article: "ART-200387", code: "eCl@ss 24-31-01-02", category: "Office", unit: "Pack" },
  { id: "p7", name: "Lever arch files, 80 mm", article: "ART-200962", code: "eCl@ss 24-33-02-01", category: "Office", unit: "Piece" },
  { id: "p8", name: "Surface disinfectant, 5 L", article: "ART-301245", code: "eCl@ss 21-34-05-02", category: "Cleaning", unit: "Canister" },
  { id: "p9", name: "Microfiber cloths, pack of 10", article: "ART-301678", code: "eCl@ss 21-34-02-04", category: "Cleaning", unit: "Pack" },
  { id: "p10", name: "Paper towel rolls, case of 6", article: "ART-302001", code: "eCl@ss 21-34-06-01", category: "Cleaning", unit: "Case" },
  { id: "p11", name: "Cordless drill, 18 V", article: "ART-400556", code: "eCl@ss 21-04-01-07", category: "Tools", unit: "Piece" },
  { id: "p12", name: "Torque wrench, 1/2 inch", article: "ART-400913", code: "eCl@ss 21-02-03-02", category: "Tools", unit: "Piece" },
]

export default function EproCatApp() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category | null>(null)
  const deferredQuery = useDeferredValue(query)
  const searchId = useId()

  const q = deferredQuery.trim().toLowerCase()
  const results = PRODUCTS.filter(
    (p) => (!category || p.category === category) && (!q || `${p.name} ${p.article} ${p.code} ${p.category}`.toLowerCase().includes(q))
  )

  const clear = () => {
    setQuery("")
    setCategory(null)
    playSfx("tap")
  }

  const layout = reduce ? { duration: 0 } : springs.smooth

  return (
    <AppScreen title={project.name} subtitle={`${role.title} at ${role.company}, ${role.start} – ${role.end}`} project="eprocat">
      <p className="px-5 font-display text-lg font-medium">Where it all started.</p>
      <p className="mt-1 px-5 text-[0.95rem] leading-relaxed text-text-soft">My first developer role. {project.tagline.replace(" Where it all started.", "")}</p>

      <section aria-labelledby="eprocat-story" className="mt-7 px-5">
        <h2 id="eprocat-story" className="font-display text-xl font-semibold">
          What I did
        </h2>
        <ul className="mt-3 space-y-3">
          {project.story.map((line) => (
            <li key={line} className="flex gap-3 leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-mint" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
          {project.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="eprocat-catalog" className="mt-9 pb-4">
        <div className="flex items-baseline justify-between px-5">
          <h2 id="eprocat-catalog" className="font-display text-xl font-semibold">
            Try the catalog
          </h2>
          <span className="chip text-text-soft">Demo data</span>
        </div>

        <div className="mt-3 px-5">
          <label htmlFor={searchId} className="sr-only">
            Search products
          </label>
          <div className="flex min-h-12 items-center gap-2 rounded-2xl bg-surface px-3.5 shadow-[var(--shadow)] focus-within:ring-2 focus-within:ring-mint">
            <Search size={18} aria-hidden="true" className="shrink-0 text-text-soft" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Gloves, ART-2001, 34-22…"
              autoComplete="off"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-text-soft/70 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-text-soft"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <LayoutGroup id="eprocat-filters">
          <div role="group" aria-label="Filter by category" className="app-scroll mt-3 flex gap-1.5 overflow-x-auto px-5 py-1">
            {[null, ...CATEGORIES.map((c) => c.id)].map((c) => {
              const active = category === c
              return (
                <button
                  key={c ?? "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setCategory(c)
                    playSfx("tap")
                  }}
                  className={cn(
                    "relative min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors",
                    active ? "text-bg" : "bg-surface-2 text-text-soft hover:text-text"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="eprocat-filter"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-text"
                      transition={reduce ? { duration: 0 } : springs.snappy}
                    />
                  )}
                  <span className="relative">{c ?? "All"}</span>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        <p className="mt-3 px-5 text-sm text-text-soft" aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
        </p>

        <ul className="relative mt-2 space-y-2 px-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((p) => (
              <motion.li
                key={p.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                transition={layout}
                className="card flex items-start gap-3 p-3.5"
                style={{ borderRadius: 20 }}
              >
                <span aria-hidden="true" className={cn("mt-1 size-2.5 shrink-0 rounded-full", colorOf(p.category))} />
                <div className="min-w-0 flex-1">
                  <p className="leading-snug font-semibold">{p.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-text-soft">
                    {p.article}
                    <span aria-hidden="true">, </span>
                    {p.unit}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={cn("rounded-md px-2 py-0.5 font-mono text-[0.7rem] font-semibold text-ink", colorOf(p.category))}>
                      <span className="sr-only">Classification </span>
                      {p.code}
                    </span>
                    <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[0.7rem] font-semibold">{p.category}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <AnimatePresence initial={false}>
          {results.length === 0 && (
            <motion.div
              key="empty"
              className="mx-5 mt-2 flex flex-col items-center rounded-[24px] border-2 border-dashed border-line px-6 py-10 text-center"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0.15 } : springs.bouncy}
            >
              <SearchX size={32} aria-hidden="true" className="text-text-soft" />
              <p className="mt-3 font-semibold">No products match</p>
              <p className="mt-1 text-sm text-text-soft">Try another word or category.</p>
              <button type="button" className="btn mt-4" onClick={clear}>
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </AppScreen>
  )
}
