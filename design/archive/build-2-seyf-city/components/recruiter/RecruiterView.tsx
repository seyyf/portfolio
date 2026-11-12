"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import {
  Briefcase,
  DownloadSimple,
  EnvelopeSimple,
  LinkedinLogo,
  MapPin,
  Printer,
} from "@phosphor-icons/react"

import { BrandBadge } from "@/components/ui/BrandBadge"
import { buildings, education, languages, profile, skillGroups, type Building } from "@/data/city"

const jobs = buildings.filter((b) => b.kind === "job") // already newest first in data/city.ts
const projects = buildings.filter((b) => b.kind === "project")

/** Rotating pastel fills for the timeline dots and project emoji. */
const pastels = ["bg-butter", "bg-mint", "bg-sky", "bg-lavender", "bg-coral"] as const

/**
 * The city's stories include short narrative asides ("Where it all started.") that read
 * well on a tour card but not on a CV, so bullets keep only substantive lines.
 */
function cvBullets(b: Building) {
  return b.story.filter((line) => line.trim().split(/\s+/).length > 4)
}

/** Project blurb from its story; the "Personal project" label already covers that prefix. */
function projectBlurb(b: Building) {
  return b.story
    .map((line) => line.replace(/^a personal project:\s*/i, ""))
    .map((line) => line.charAt(0).toUpperCase() + line.slice(1))
    .join(" ")
}

/** Print-safe colors whatever the day/night theme, so the sheet always prints black on white. */
const printTokens =
  "print:[--text:#000] print:[--text-soft:#333] print:[--line:#999] print:[--surface:#fff] print:[--surface-2:#fff]"

/**
 * Sections fade up once on mount. These overrides keep content visible before hydration
 * for reduced-motion users and in print, whatever inline styles Framer Motion has set.
 */
const revealReset =
  "motion-reduce:opacity-100! motion-reduce:transform-none! print:opacity-100! print:transform-none!"

const sheetVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const instantVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
}

const linkClass =
  "inline-flex items-center gap-2 rounded-md font-semibold underline decoration-coral/70 decoration-2 underline-offset-4 transition-colors hover:decoration-coral"

export function RecruiterView({ onBackToCity }: { onBackToCity?: () => void }) {
  const reduceMotion = useReducedMotion()
  const reveal = reduceMotion ? instantVariants : sectionVariants

  const backToCity = onBackToCity ? (
    <button type="button" className="btn" onClick={onBackToCity}>
      <span aria-hidden="true">🏙️</span> Back to the city
    </button>
  ) : (
    <Link href="/" className="btn">
      <span aria-hidden="true">🏙️</span> Back to the city
    </Link>
  )

  return (
    <div className={`mx-auto w-full max-w-[880px] text-left text-text print:max-w-none ${printTokens}`}>
      {/* Top bar */}
      <nav aria-label="Recruiter view" className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        {backToCity}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-plain btn-sm" onClick={() => window.print()}>
            <Printer size={18} weight="bold" aria-hidden="true" />
            Print
          </button>
          <a href={profile.cv} download className="btn btn-mint btn-sm">
            <DownloadSimple size={18} weight="bold" aria-hidden="true" />
            Download CV
          </a>
        </div>
      </nav>

      <motion.div
        variants={sheetVariants}
        initial="hidden"
        animate="show"
        className="card print-plain px-5 py-8 sm:px-10 sm:py-11 print:rounded-none print:border-0 print:p-0"
      >
        {/* Hero */}
        <motion.header variants={reveal} className={revealReset}>
          <BrandBadge />

          <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-2 font-display text-xl font-medium text-text-soft sm:text-2xl">{profile.title}</p>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] font-semibold text-text-soft">
            <li className="inline-flex items-center gap-1.5">
              <Briefcase size={18} weight="bold" aria-hidden="true" />
              {profile.yearsExperience} years of experience
            </li>
            <li className="inline-flex items-center gap-1.5">
              <MapPin size={18} weight="bold" aria-hidden="true" />
              {profile.location}
            </li>
          </ul>

          <p className="mt-5 max-w-[64ch] text-[1.0625rem] leading-relaxed">{profile.summary}</p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <li>
              <a href={`mailto:${profile.email}`} className={linkClass}>
                <EnvelopeSimple size={20} weight="bold" aria-hidden="true" />
                {profile.email}
              </a>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <LinkedinLogo size={20} weight="bold" aria-hidden="true" />
                {profile.linkedinLabel}
                <span className="sr-only"> (LinkedIn, opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </motion.header>

        {/* Experience: a real sequence, newest first, on a rail */}
        <Section id="experience" title="Experience" variants={reveal}>
          <ol className="relative mt-6 space-y-9 before:absolute before:top-3 before:bottom-3 before:left-[17px] before:w-0.5 before:rounded-full before:bg-line/15">
            {jobs.map((job, i) => {
              const bullets = cvBullets(job)
              return (
                <li key={job.id} className="relative break-inside-avoid pl-14">
                  <span
                    aria-hidden="true"
                    className={`absolute top-0 left-0 grid size-9 place-items-center rounded-full border-2 border-ink text-base leading-none ${pastels[i % pastels.length]}`}
                  >
                    {job.emoji}
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 pt-1">
                    <h3 className="font-display text-lg leading-snug font-semibold sm:text-xl">
                      {job.role}
                      <span className="font-medium text-text-soft"> · {job.name}</span>
                    </h3>
                    <p className="text-sm font-bold whitespace-nowrap text-text-soft tabular-nums">{job.period}</p>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="mt-2.5 list-disc space-y-1.5 pl-5 leading-relaxed marker:text-coral">
                      {bullets.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                  {job.stack.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${job.name} stack`}>
                      {job.stack.map((tech) => (
                        <li key={tech} className="chip">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </Section>

        {/* Projects */}
        <Section id="projects" title="Selected projects" variants={reveal}>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {projects.map((project, i) => (
              <li
                key={project.id}
                className="print-plain flex break-inside-avoid gap-4 rounded-[20px] border-2 border-line/15 bg-surface p-4 sm:p-5"
              >
                <span
                  aria-hidden="true"
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-ink text-xl leading-none ${pastels[(i + 2) % pastels.length]}`}
                >
                  {project.emoji}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg leading-snug font-semibold">{project.name}</h3>
                  {project.role && <p className="text-sm font-bold text-text-soft">{project.role}</p>}
                  <p className="mt-1 leading-relaxed">{projectBlurb(project)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Skills */}
        <Section id="skills" title="Skills" variants={reveal}>
          <dl className="mt-5 space-y-4">
            {skillGroups.map((group) => (
              <div key={group.label} className="break-inside-avoid sm:grid sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                <dt className="font-display font-semibold sm:pt-0.5">{group.label}</dt>
                <dd className="mt-1.5 sm:mt-0">
                  <ul className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="chip">
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Education and languages, side by side on desktop */}
        <motion.div
          variants={reveal}
          className={`mt-10 grid gap-10 border-t-2 border-line/10 pt-10 md:grid-cols-[1.5fr_1fr] md:gap-12 print:mt-8 print:pt-6 ${revealReset}`}
        >
          <section id="education" aria-labelledby="education-title" className="break-inside-avoid">
            <SectionTitle id="education-title">Education</SectionTitle>
            <ul className="mt-5 space-y-4">
              {education.map((item) => (
                <li key={item.degree}>
                  <h3 className="font-display leading-snug font-semibold">{item.degree}</h3>
                  <p className="mt-0.5 text-[0.95rem] text-text-soft">
                    {item.school} <span aria-hidden="true">·</span>{" "}
                    <span className="tabular-nums">{item.years}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section id="languages" aria-labelledby="languages-title" className="break-inside-avoid">
            <SectionTitle id="languages-title">Languages</SectionTitle>
            <dl className="mt-5 space-y-2.5">
              {languages.map((lang) => (
                <div
                  key={lang.name}
                  className="flex items-baseline justify-between gap-4 border-b border-line/10 pb-2.5 last:border-b-0"
                >
                  <dt className="font-display font-semibold">{lang.name}</dt>
                  <dd className="text-[0.95rem] font-bold text-text-soft">{lang.level}</dd>
                </div>
              ))}
            </dl>
          </section>
        </motion.div>

        {/* Contact */}
        <Section id="contact" title="Contact" variants={reveal}>
          <dl className="mt-5 grid gap-x-6 sm:grid-cols-[6rem_1fr] sm:gap-y-3">
            <dt className="font-display font-semibold">Email</dt>
            <dd className="mb-3 sm:mb-0">
              <a href={`mailto:${profile.email}`} className={linkClass}>
                {profile.email}
              </a>
            </dd>
            <dt className="font-display font-semibold">LinkedIn</dt>
            <dd className="mb-3 sm:mb-0">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {profile.linkedinLabel}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </dd>
            <dt className="font-display font-semibold">Location</dt>
            <dd>{profile.location}</dd>
          </dl>

          <div className="no-print mt-7 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className="btn btn-coral">
              <EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
              Email me
            </a>
            <a href={profile.cv} download className="btn btn-mint">
              <DownloadSimple size={18} weight="bold" aria-hidden="true" />
              Download CV
            </a>
          </div>

          <p className="no-print mt-8 rounded-2xl bg-surface px-4 py-3.5 leading-relaxed sm:px-5">
            <span aria-hidden="true">🏙️ </span>
            Want the fun version? Seyf City is a little 3D town where every building is something I built.{" "}
            {onBackToCity ? (
              <button type="button" onClick={onBackToCity} className={linkClass}>
                Take the tour
              </button>
            ) : (
              <Link href="/" className={linkClass}>
                Take the tour
              </Link>
            )}
          </p>
        </Section>
      </motion.div>
    </div>
  )
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-display text-2xl leading-tight font-semibold">
      {children}
    </h2>
  )
}

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
      className={`mt-10 scroll-mt-6 border-t-2 border-line/10 pt-10 print:mt-8 print:pt-6 ${revealReset}`}
    >
      <SectionTitle id={titleId}>{title}</SectionTitle>
      {children}
    </motion.section>
  )
}

