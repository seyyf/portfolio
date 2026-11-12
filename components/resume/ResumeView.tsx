"use client"

import { useEffect, type ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { ArrowLeft, Briefcase, Download, Mail, MapPin, Printer } from "lucide-react"

import { education, languages, profile, skillGroups } from "@/data/profile"
import { projectById, projects, type ProjectId } from "@/data/projects"
import { startLenis, stopLenis } from "@/lib/scroll"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ data */

type Job = {
  key: string
  title: string
  company: string
  /** Product name when it isn't obvious from the company (e.g. e-proCAT at Bertsch Innovation). */
  product?: string
  start: string
  end: string
  bullets: string[]
  /** Only for single-role projects: a project's stack can't be attributed to one of several roles. */
  stack: string[]
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

/** "Feb 2023" -> sortable number (year * 12 + month). */
function monthValue(label: string) {
  const [month = "", year = "0"] = label.trim().split(/\s+/)
  return Number(year) * 12 + Math.max(0, MONTHS.indexOf(month.slice(0, 3).toLowerCase()))
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * One entry per role, newest first. A project with several roles (Order: Global ENR and Opus Lab)
 * prefixes each story line with "<Company>:"; each role keeps only its own lines, prefix stripped.
 */
const jobs: Job[] = projects
  .flatMap((p) =>
    p.roles
      .filter((role) => role.start)
      .map((role): Job => {
        const shared = p.roles.length > 1
        const prefix = `${role.company}:`
        const bullets = shared
          ? p.story.filter((line) => line.startsWith(prefix)).map((line) => capitalize(line.slice(prefix.length).trim()))
          : p.story
        const product =
          !shared && !p.name.toLowerCase().startsWith(role.company.toLowerCase()) ? p.name : undefined
        return {
          key: `${p.id}-${role.company}`,
          title: role.title,
          company: role.company,
          product,
          start: role.start,
          end: role.end,
          bullets,
          stack: shared ? [] : p.stack,
        }
      }),
  )
  .sort((a, b) => monthValue(b.start) - monthValue(a.start))

/** Display names as they appear on the CV (cv.md). */
const projectNames: Partial<Record<ProjectId, string>> = {
  febal: "Febal Casa USA",
  aurelia: "Aurelia Gloves",
}

const sideProjects = (["fripa", "febal", "aurelia", "weedy"] as const).map((id) => {
  const p = projectById[id]
  return {
    id,
    name: projectNames[id] ?? p.name,
    note: p.roles[0]?.title,
    line: p.tagline,
  }
})

/* ---------------------------------------------------------------- styles */

/** Print always comes out black on white, whatever the light/dark theme. */
const printTokens =
  "print:[--bg:#fff] print:[--text:#000] print:[--text-soft:#333] print:[--line:#bbb] print:[--surface:#fff] print:[--surface-2:#fff]"

/** Keeps content visible before hydration for reduced-motion users and in print, whatever inline styles Framer set. */
const revealReset = "motion-reduce:opacity-100! motion-reduce:transform-none! print:opacity-100! print:transform-none!"

const linkClass =
  "inline-flex items-center gap-2 rounded-md font-semibold underline decoration-coral decoration-2 underline-offset-4 transition-colors hover:text-text-soft print:no-underline"

const pastels = ["bg-mint", "bg-sky", "bg-butter", "bg-lavender", "bg-coral"] as const

/* ------------------------------------------------------------- component */

export function ResumeView({ onBack }: { onBack: () => void }) {
  const prefersReduced = useReducedMotion()
  const osReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced) || osReduced

  // Lenis smooth scrolling, only on desktop with a fine pointer and motion allowed. The document scrolls.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)")
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      if (desktop.matches && !reducedMq.matches && !osReduced) startLenis()
      else stopLenis()
    }
    sync()
    desktop.addEventListener("change", sync)
    reducedMq.addEventListener("change", sync)
    return () => {
      desktop.removeEventListener("change", sync)
      reducedMq.removeEventListener("change", sync)
      stopLenis()
    }
  }, [osReduced])

  // "hidden" never changes (it is what the server renders); only the "show" transition depends on motion settings.
  const sheet: Variants = {
    hidden: {},
    show: { transition: reduce ? { duration: 0 } : { staggerChildren: 0.07, delayChildren: 0.05 } },
  }
  const reveal: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <div className={cn("min-h-dvh w-full bg-bg text-text print:min-h-0 print:bg-white", printTokens)}>
      {/* Controls */}
      <header className="no-print glass-strong sticky top-0 z-20 border-b border-line">
        <div className="mx-auto flex w-full max-w-215 flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <button type="button" className="btn btn-soft px-3.5 text-sm sm:px-4" onClick={onBack}>
            <ArrowLeft size={18} strokeWidth={2.25} aria-hidden="true" />
            Back to SeyfOS
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-soft px-3.5 text-sm sm:px-4" onClick={() => window.print()}>
              <Printer size={18} strokeWidth={2.25} aria-hidden="true" />
              Print
            </button>
            <a href={profile.cv} download={profile.cvFileName} className="btn btn-accent px-3.5 text-sm sm:px-4">
              <Download size={18} strokeWidth={2.25} aria-hidden="true" />
              Download CV
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-215 px-4 py-6 sm:px-6 sm:py-10 print:max-w-none print:p-0">
        <motion.article
          aria-labelledby="resume-name"
          variants={sheet}
          initial="hidden"
          animate="show"
          className="text-left sm:rounded-3xl sm:bg-surface sm:px-10 sm:py-11 sm:shadow-(--shadow) print:rounded-none print:bg-transparent print:p-0 print:shadow-none"
        >
          {/* Hero */}
          <motion.header variants={reveal} className={revealReset}>
            <h1 id="resume-name" className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-2 font-display text-xl font-medium text-text-soft sm:text-2xl">{profile.title}</p>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] font-semibold text-text-soft">
              <li className="inline-flex items-center gap-1.5">
                <Briefcase size={17} strokeWidth={2.25} aria-hidden="true" />
                {profile.yearsExperience} years of experience
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin size={17} strokeWidth={2.25} aria-hidden="true" />
                {profile.location}
              </li>
            </ul>

            <p className="mt-5 max-w-[66ch] text-[1.0625rem] leading-relaxed">{profile.summary}</p>

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3" aria-label="Contact">
              <li>
                <a href={`mailto:${profile.email}`} className={linkClass}>
                  <Mail size={18} strokeWidth={2.25} aria-hidden="true" />
                  {profile.email}
                </a>
              </li>
              <li>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <LinkedInIcon />
                  {profile.linkedinLabel}
                  <span className="sr-only"> (LinkedIn, opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </motion.header>

          <div className="mt-10 border-t border-line pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_14.5rem] lg:gap-12 print:mt-6 print:pt-6 print:block">
            {/* Main column */}
            <div className="space-y-12 print:space-y-7">
              <Section id="experience" title="Experience" variants={reveal}>
                <ol className="relative mt-5 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-1.25 before:w-0.5 before:rounded-full before:bg-line print:space-y-5">
                  {jobs.map((job, i) => (
                    <li key={job.key} className="relative break-inside-avoid pl-7">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute top-[0.45rem] left-0 size-3 rounded-full ring-4 ring-bg sm:ring-surface print:ring-white",
                          pastels[i % pastels.length],
                        )}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                        <h3 className="font-display text-lg leading-snug font-semibold">
                          {job.title}
                          <span className="font-medium text-text-soft">
                            {" "}
                            · {job.company}
                            {job.product && ` (${job.product})`}
                          </span>
                        </h3>
                        <p className="text-sm font-semibold whitespace-nowrap text-text-soft tabular-nums">
                          {job.start} – {job.end}
                        </p>
                      </div>
                      {job.bullets.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed marker:text-coral print:marker:text-black">
                          {job.bullets.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      )}
                      {job.stack.length > 0 && (
                        <p className="mt-2.5 text-sm leading-relaxed text-text-soft">
                          <span className="font-semibold text-text">Stack: </span>
                          {job.stack.join(", ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </Section>

              <Section id="projects" title="Projects" variants={reveal}>
                <ul className="mt-5 space-y-3">
                  {sideProjects.map((p) => (
                    <li key={p.id} className="break-inside-avoid leading-relaxed">
                      <span className="font-display font-semibold">{p.name}</span>
                      {p.note && <span className="text-sm font-semibold text-text-soft"> ({p.note.toLowerCase()})</span>}
                      <span className="text-text-soft"> — </span>
                      {p.line}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section id="education" title="Education" variants={reveal}>
                <ul className="mt-5 space-y-4">
                  {education.map((item) => (
                    <li key={item.degree} className="break-inside-avoid">
                      <h3 className="font-display leading-snug font-semibold">{item.degree}</h3>
                      <p className="mt-0.5 text-[0.95rem] text-text-soft">
                        {item.school} <span aria-hidden="true">·</span>{" "}
                        <span className="tabular-nums">
                          {item.start} – {item.end}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            {/* Sidebar on wide screens, after the main column everywhere else */}
            <div className="mt-12 space-y-10 lg:mt-0 print:mt-7 print:space-y-7">
              <Section id="skills" title="Skills" variants={reveal}>
                <div className="mt-5 space-y-4">
                  {skillGroups.map((group) => {
                    const headingId = `skills-${group.label.toLowerCase().replace(/\W+/g, "-")}`
                    return (
                      <div key={group.label} className="break-inside-avoid">
                        <h3 id={headingId} className="text-sm font-semibold text-text-soft">
                          {group.label}
                        </h3>
                        <ul aria-labelledby={headingId} className="mt-2 flex flex-wrap gap-1.5">
                          {group.items.map((item) => (
                            <li
                              key={item.name}
                              className="chip h-auto py-1 leading-snug print:min-h-0 print:border print:border-line print:py-0.5"
                            >
                              <span>
                                {item.name}
                                {item.detail && <span className="font-medium text-text-soft"> ({item.detail})</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </Section>

              <Section id="languages" title="Languages" variants={reveal}>
                <ul className="mt-4">
                  {languages.map((lang) => (
                    <li
                      key={lang.name}
                      className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0"
                    >
                      <span className="font-semibold">{lang.name}</span>
                      <span className="text-[0.95rem] font-semibold text-text-soft">{lang.level}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section id="contact" title="Contact" variants={reveal}>
                <ul className="mt-4 space-y-3 text-[0.95rem]">
                  <li>
                    <a href={`mailto:${profile.email}`} className={cn(linkClass, "break-all")}>
                      <Mail size={17} strokeWidth={2.25} aria-hidden="true" className="shrink-0" />
                      {profile.email}
                    </a>
                  </li>
                  <li>
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      <LinkedInIcon className="shrink-0" />
                      LinkedIn
                      <span className="sr-only"> profile (opens in a new tab)</span>
                    </a>
                  </li>
                  <li className="inline-flex items-center gap-2 text-text-soft">
                    <MapPin size={17} strokeWidth={2.25} aria-hidden="true" className="shrink-0" />
                    {profile.location}
                  </li>
                </ul>
                <a
                  href={profile.cv}
                  download={profile.cvFileName}
                  className="no-print btn btn-accent mt-5 w-full text-sm sm:w-auto lg:w-full"
                >
                  <Download size={18} strokeWidth={2.25} aria-hidden="true" />
                  Download CV (PDF)
                </a>
              </Section>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- helpers */

function Section({
  id,
  title,
  variants,
  children,
}: {
  id: string
  title: string
  variants: Variants
  children: ReactNode
}) {
  const titleId = `${id}-title`
  return (
    <motion.section
      id={id}
      aria-labelledby={titleId}
      variants={variants}
      className={cn("scroll-mt-20", revealReset)}
    >
      <h2 id={titleId} className="font-display text-2xl leading-tight font-semibold print:text-xl">
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

/** lucide-react no longer ships brand icons, so the LinkedIn mark is inline. */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}
