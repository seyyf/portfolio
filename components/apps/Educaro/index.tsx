"use client"

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion"
import { Check, FlaskConical, GitCommitHorizontal, Package, RotateCw, Rocket } from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider"
import { AppScreen } from "@/components/shared/AppScreen"
import { projectById } from "@/data/projects"
import { springs } from "@/lib/animations"
import { gsap, useGSAP } from "@/lib/gsap"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

import { departments, type Department } from "./departments"

const project = projectById.educaro
const role = project.roles[0]

export default function EducaroApp() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  return (
    <AppScreen title={project.name} subtitle={`${role.title}, ${role.start} – ${role.end}`} project="educaro">
      <p className="px-5 text-[0.95rem] leading-relaxed text-text-soft">{project.tagline}</p>

      <section aria-labelledby="educaro-crm" className="mt-7">
        <div className="flex items-baseline justify-between px-5">
          <h2 id="educaro-crm" className="font-display text-xl font-semibold">
            One app, every team
          </h2>
          <span className="chip text-text-soft">Demo data</span>
        </div>
        <Dashboard reduce={reduce} />
      </section>

      <section aria-labelledby="educaro-story" className="mt-9 px-5">
        <h2 id="educaro-story" className="font-display text-xl font-semibold">
          What I did
        </h2>
        <ul className="mt-3 space-y-3">
          {project.story.map((line) => (
            <li key={line} className="flex gap-3 leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-sky" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="educaro-compare" className="mt-9 px-5">
        <h2 id="educaro-compare" className="font-display text-xl font-semibold">
          Before and after
        </h2>
        <p className="mt-1 mb-3 text-sm text-text-soft">AngularJS on the left, React and TypeScript on the right.</p>
        <BeforeAfterSlider before={project.images[0]} after={project.images[1]} beforeLabel="AngularJS" afterLabel="React" />
      </section>

      <section aria-labelledby="educaro-ship" className="mt-9 px-5">
        <h2 id="educaro-ship" className="font-display text-xl font-semibold">
          Every release, automatic
        </h2>
        <p className="mt-1 text-sm text-text-soft">GitLab CI/CD builds, tests and deploys to DigitalOcean, then runs the migrations.</p>
        <Pipeline reduce={reduce} />
      </section>

      <section aria-labelledby="educaro-stack" className="mt-9 px-5 pb-4">
        <h2 id="educaro-stack" className="font-display text-xl font-semibold">
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

// ---------------------------------------------------------------------------------------------
// Dashboard: department tabs with a sliding indicator

function Dashboard({ reduce }: { reduce: boolean }) {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const dept = departments[active]

  const select = (i: number, focus = false) => {
    const next = (i + departments.length) % departments.length
    if (next === active) return
    setDir(next > active ? 1 : -1)
    setActive(next)
    playSfx("tap")
    const tab = tabRefs.current[next]
    if (focus) tab?.focus()
    tab?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest", inline: "center" })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: departments.length - 1 }
    if (!(e.key in moves)) return
    e.preventDefault()
    select(moves[e.key], true)
  }

  return (
    <div className="mt-3">
      <LayoutGroup id="educaro-tabs">
        <div role="tablist" aria-label="Departments" onKeyDown={onKeyDown} className="app-scroll flex gap-1 overflow-x-auto px-5 py-1">
          {departments.map((d, i) => {
            const selected = i === active
            return (
              <button
                key={d.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`educaro-tab-${d.id}`}
                aria-selected={selected}
                aria-controls="educaro-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                className={cn(
                  "relative flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
                  selected ? "text-bg" : "text-text-soft hover:text-text"
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="educaro-tab-indicator"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-text"
                    transition={reduce ? { duration: 0 } : springs.snappy}
                  />
                )}
                <span aria-hidden="true" className="relative">
                  {d.emoji}
                </span>
                <span className="relative">{d.name}</span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>

      <div
        id="educaro-panel"
        role="tabpanel"
        aria-labelledby={`educaro-tab-${dept.id}`}
        className="relative mt-1 overflow-x-clip px-5 py-2"
      >
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={dept.id}
            custom={dir}
            variants={{
              enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * 48 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * -48 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0.15 } : springs.smooth}
          >
            <Panel dept={dept} reduce={reduce} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function Panel({ dept, reduce }: { dept: Department; reduce: boolean }) {
  const max = Math.max(...dept.chart, 1)
  return (
    <div className="card p-4">
      <div className="grid grid-cols-2 gap-2.5">
        {dept.stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-2 px-3.5 py-3">
            <p className="font-display text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-xs font-medium text-text-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <figure className="mt-4">
        <figcaption className="text-xs font-semibold text-text-soft">{dept.chartLabel}</figcaption>
        <div aria-hidden="true" className="mt-2 flex h-20 items-end gap-2">
          {dept.chart.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <motion.div
                className={cn("w-full origin-bottom rounded-md", dept.accent)}
                style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
                initial={reduce ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={reduce ? { duration: 0 } : { ...springs.bouncy, delay: 0.05 + i * 0.035 }}
              />
              <span className="text-[0.65rem] font-semibold text-text-soft">{DAYS[i][0]}</span>
            </div>
          ))}
        </div>
        <p className="sr-only">{dept.chart.map((v, i) => `${DAYS[i]} ${v}`).join(", ")}.</p>
      </figure>

      <ul className="mt-4 divide-y divide-line">
        {dept.list.map((item) => (
          <li key={item.title} className="flex items-center gap-3 py-2.5">
            <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", dept.accent)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="truncate text-xs text-text-soft">{item.meta}</p>
            </div>
            <span className="chip shrink-0 text-xs">{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Pipeline: Commit → Build → Test → Deploy, driven by a GSAP timeline and the live pill

const STEPS = [
  { name: "Commit", icon: GitCommitHorizontal },
  { name: "Build", icon: Package },
  { name: "Test", icon: FlaskConical },
  { name: "Deploy", icon: Rocket },
]

type Phase = "idle" | "running" | "done"

function Pipeline({ reduce }: { reduce: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const running = useRef(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [done, setDone] = useState(0)

  const { contextSafe } = useGSAP({ scope: root })

  // Leaving mid-deploy: the timeline dies with the app, so the pill goes too.
  useEffect(
    () => () => {
      if (running.current) useOS.getState().clearActivity("deploy")
    },
    []
  )

  const run = () => {
    if (running.current) return
    contextSafe(deploy)()
  }

  function deploy() {
    if (running.current) return
    running.current = true
    const os = useOS.getState()
    setPhase("running")
    setDone(0)
    playSfx("tap")
    os.showActivity({ id: "deploy", icon: "🚀", label: "Deploying to production…", progress: 0 })

    gsap.set(".pipe-fill", { scaleX: 0 })
    const tl = gsap.timeline({
      onComplete: () => {
        running.current = false
        setPhase("done")
        playSfx("ping")
        useOS.getState().updateActivity("deploy", { label: "Deployed ✅", icon: "✅", progress: undefined, tone: "success" }, 2600)
      },
    })

    STEPS.forEach((_, i) => {
      const dot = `.pipe-dot-${i}`
      if (reduce) {
        tl.to({}, { duration: 0.5 })
      } else {
        // "Working": a soft breathing pulse while the step runs.
        tl.to(dot, { scale: 0.9, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 1 })
      }
      tl.call(() => {
        setDone(i + 1)
        useOS.getState().updateActivity("deploy", { progress: (i + 1) / STEPS.length })
      })
      if (!reduce) tl.fromTo(dot, { scale: 0.7 }, { scale: 1, duration: 0.55, ease: "os.spring" })
      if (i < STEPS.length - 1) {
        tl.to(`.pipe-fill-${i}`, { scaleX: 1, duration: reduce ? 0.01 : 0.4, ease: "power2.inOut" }, reduce ? undefined : "<")
      }
    })
  }

  const label = phase === "running" ? "Deploying…" : phase === "done" ? "Run it again" : "Run deploy"

  return (
    <div ref={root} className="card mt-4 p-5">
      <ol className="grid grid-cols-4">
        {STEPS.map((step, i) => {
          const isDone = done > i
          const isActive = phase === "running" && done === i
          const Icon = isDone ? Check : step.icon
          return (
            <li key={step.name} className="relative flex flex-col items-center gap-2">
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="absolute top-[21px] right-[calc(-50%+26px)] left-[calc(50%+26px)] h-1 overflow-hidden rounded-full bg-surface-2">
                  <span className={`pipe-fill pipe-fill-${i} block h-full origin-left rounded-full bg-mint`} style={{ transform: "scaleX(0)" }} />
                </span>
              )}
              <span
                className={cn(
                  `pipe-dot pipe-dot-${i} relative grid size-11 place-items-center rounded-full transition-colors duration-300`,
                  isDone ? "bg-mint text-ink" : isActive ? "bg-butter text-ink" : "bg-surface-2 text-text-soft"
                )}
              >
                {isActive && !reduce && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-butter/60" />}
                <Icon size={20} strokeWidth={2.4} aria-hidden="true" className="relative" />
              </span>
              <span className={cn("text-xs font-semibold", isDone || isActive ? "text-text" : "text-text-soft")}>{step.name}</span>
            </li>
          )
        })}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-text-soft" aria-live="polite">
          {phase === "idle" && "Ready to ship."}
          {phase === "running" && `${STEPS[Math.min(done, STEPS.length - 1)].name} in progress…`}
          {phase === "done" && "Live in production."}
        </p>
        <button type="button" className="btn shrink-0 disabled:opacity-60" onClick={run} disabled={phase === "running"} aria-disabled={phase === "running"}>
          {phase === "done" ? <RotateCw size={17} aria-hidden="true" /> : <Rocket size={17} aria-hidden="true" />}
          {label}
        </button>
      </div>
    </div>
  )
}
