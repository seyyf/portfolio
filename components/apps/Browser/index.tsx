"use client"

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion"
import { ExternalLink, Lock, RotateCw } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { browserSites, type BrowserSite } from "@/data/apps"
import { projectById } from "@/data/projects"
import { springs } from "@/lib/animations"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

const SITES = Object.keys(browserSites) as BrowserSite[]
const isSite = (s: string | null): s is BrowserSite => !!s && s in browserSites

/** In-phone browser for the websites. `?site=` picks the site; the static shell falls back to Febal. */
export default function BrowserApp() {
  return (
    <Suspense fallback={<BrowserView site="febal" />}>
      <BrowserFromParams />
    </Suspense>
  )
}

function BrowserFromParams() {
  const params = useSearchParams()
  const s = params.get("site")
  return <BrowserView site={isSite(s) ? s : "febal"} />
}

function BrowserView({ site: urlSite }: { site: BrowserSite }) {
  const router = useRouter()
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  // Switch instantly on tap; follow the URL when it changes from outside (home icons, back button).
  const [site, setSite] = useState(urlSite)
  const [prevUrlSite, setPrevUrlSite] = useState(urlSite)
  if (urlSite !== prevUrlSite) {
    setPrevUrlSite(urlSite)
    setSite(urlSite)
  }
  const [reloads, setReloads] = useState(0)

  const info = browserSites[site]
  const project = projectById[info.project]
  const shot = project.images[0]

  const go = (next: BrowserSite) => {
    if (next === site) return
    setSite(next)
    playSfx("tap")
    router.replace(`/app/browser?site=${next}`, { scroll: false })
  }

  const loadKey = `${site}-${reloads}`

  return (
    <AppScreen title={info.name} project={info.project}>
      {/* Browser chrome: sticks under the status bar while the page scrolls. */}
      <div className="sticky top-[calc(var(--status-h)+env(safe-area-inset-top))] z-10 px-3 pt-1 pb-2">
        <div className="glass-strong relative overflow-hidden rounded-[22px] p-1.5 shadow-[var(--shadow)]">
          <div className="flex items-center gap-2 pl-3">
            <Lock size={14} strokeWidth={2.6} aria-hidden="true" className="shrink-0 text-text-soft" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium">
              <span className="sr-only">Address: </span>
              {info.host}
            </p>
            <button
              type="button"
              onClick={() => setReloads((r) => r + 1)}
              aria-label="Reload"
              className="grid size-11 shrink-0 place-items-center rounded-full text-text-soft transition-transform active:scale-90"
            >
              <RotateCw size={17} aria-hidden="true" />
            </button>
          </div>

          <LayoutGroup id="browser-sites">
            <nav aria-label="Websites" className="mt-1 grid grid-cols-3 gap-1">
              {SITES.map((s) => {
                const active = s === site
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => go(s)}
                    className={cn("relative min-h-11 rounded-2xl px-2 text-sm font-semibold transition-colors", active ? "text-bg" : "text-text-soft hover:text-text")}
                  >
                    {active && (
                      <motion.span
                        layoutId="browser-site-tab"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-2xl bg-text"
                        transition={reduce ? { duration: 0 } : springs.snappy}
                      />
                    )}
                    <span className="relative">{browserSites[s].name}</span>
                  </button>
                )
              })}
            </nav>
          </LayoutGroup>

          {/* Loading bar: replays on every switch and reload. */}
          <motion.span
            key={loadKey}
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-sky"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={reduce ? { scaleX: 1, opacity: 0 } : { scaleX: [0, 0.45, 0.8, 1], opacity: [1, 1, 1, 0] }}
            transition={reduce ? { duration: 0.3 } : { duration: 1.1, times: [0, 0.3, 0.7, 1], ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="px-5 pt-2">
        <p className="text-[0.95rem] leading-relaxed text-text-soft">{project.tagline}</p>
        <div className="mt-3">
          {project.url ? (
            <a className="btn" href={project.url} target="_blank" rel="noreferrer">
              <ExternalLink size={17} aria-hidden="true" />
              Visit live site
            </a>
          ) : (
            <button type="button" className="btn btn-soft cursor-not-allowed opacity-60" disabled>
              <ExternalLink size={17} aria-hidden="true" />
              Live link coming soon
            </button>
          )}
        </div>
      </div>

      <section aria-label={`${info.name} website preview`} className="mt-5 px-3 pb-2">
        <div className="relative overflow-hidden rounded-[22px] bg-surface-2 shadow-[var(--shadow)]" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={loadKey}
              className="absolute inset-0"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0.2 } : { ...springs.smooth, delay: 0.35 }}
            >
              <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} unoptimized loading="eager" fetchPriority="high" className="h-auto w-full" />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </AppScreen>
  )
}
