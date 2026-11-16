"use client"

import { Download, Printer } from "lucide-react"

import { education, jobs } from "@/data/career"
import { paper, profile } from "@/data/profile"
import { projectBySlug } from "@/data/projects"
import { indices } from "@/data/skills"
import { cn } from "@/lib/utils"

// Static content only (no scroll animations): whatever is on screen must also be on paper.

const SELECTED_PROJECTS = ["fripa", "febal-casa-usa", "aurelia-gloves", "weedy"]

/** Plain résumé labels for the market index names. */
const SKILL_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  databases: "Databases",
  devops: "DevOps",
  tools: "Tools",
}

const skillGroups = indices
  .filter((i) => i.id !== "languages")
  .map((i) => ({
    label: SKILL_LABELS[i.id] ?? i.title,
    items: i.skills.map((s) => (i.id === "tools" && s.detail ? `${s.name} (${s.detail})` : s.name)),
  }))

const languages = indices.find((i) => i.id === "languages")?.skills ?? []

const selectedProjects = SELECTED_PROJECTS.map((slug) => projectBySlug[slug]).filter(Boolean)

const muted = "text-gray print:text-neutral-700"
const sectionTitle =
  "border-b border-ink pb-1 font-sans text-[0.78rem] font-bold tracking-[0.16em] uppercase print:border-black print:pb-0.5 print:text-[7.5pt]"

function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-ink">
      <Printer size={16} aria-hidden="true" />
      Print / Save as PDF
    </button>
  )
}

/**
 * The résumé as a one-page "Print Edition": newspaper typography on screen, plain black on white
 * on A4 paper. Two columns (experience and projects; skills, education and languages).
 */
export function PrintEdition() {
  return (
    <div className="mx-auto w-full max-w-[210mm]">
      <div className="no-print mb-6 flex flex-wrap items-center justify-end gap-3">
        <PrintButton />
        <a href={profile.cv} download={profile.cvFileName} className="btn-ink btn-outline">
          <Download size={16} aria-hidden="true" />
          Download CV
        </a>
      </div>

      <article
        className={cn(
          "border border-ink/25 bg-paper px-5 py-8 text-[1.0625rem] leading-[1.6] shadow-[0_18px_40px_-28px_color-mix(in_srgb,var(--ink)_55%,transparent)] sm:px-12 sm:py-12",
          "print:border-0! print:bg-transparent! print:p-0! print:text-[9pt]! print:leading-[1.38]! print:text-black! print:shadow-none! print:[--accent:#000] print:[--gray:#3a3a3a] print:[--ink:#000] print:[--paper:#fff] print:[--rule:#000]"
        )}
      >
        <header className="text-center">
          <p className={cn("label", muted)}>
            {paper.name} · Print Edition
          </p>
          <h1 className="mt-2 font-headline text-[2.6rem] leading-none font-black tracking-tight sm:text-[3.4rem] print:mt-1 print:text-[26pt]!">
            {profile.name}
          </h1>
          <p className="mt-2 font-headline text-[1.2rem] italic print:mt-1 print:text-[11pt]">{profile.title}</p>
          <div className="rule-double mt-4 print:mt-2 print:border-black" aria-hidden="true" />
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 font-sans text-[0.9rem] print:py-1 print:text-[8.5pt]">
            <li>{profile.location}</li>
            <li>
              <a href={`mailto:${profile.email}`} className="underline decoration-1 underline-offset-4 hover:text-accent-ink print:no-underline">
                {profile.email}
              </a>
            </li>
            <li>
              <a
                href={profile.linkedin}
                className="break-all underline decoration-1 underline-offset-4 hover:text-accent-ink print:no-underline"
              >
                {profile.linkedinLabel}
              </a>
            </li>
          </ul>
          <div className="rule-thin print:border-black" aria-hidden="true" />
        </header>

        <section aria-labelledby="pe-summary" className="mt-6 print:mt-3">
          <h2 id="pe-summary" className="sr-only">
            Summary
          </h2>
          <p className="drop-cap print:[&::first-letter]:text-[3.2em]">{profile.summary}</p>
        </section>

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_15rem] print:mt-4 print:grid-cols-[minmax(0,1fr)_52mm]! print:gap-6">
          {/* Main column */}
          <div className="min-w-0">
            <section aria-labelledby="pe-experience">
              <h2 id="pe-experience" className={sectionTitle}>
                Experience
              </h2>
              <ol className="mt-4 space-y-6 print:mt-2 print:space-y-2.5">
                {jobs.map((job) => (
                  <li key={`${job.company}-${job.start}`} className="break-inside-avoid">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="font-headline text-[1.2rem] leading-snug font-bold print:text-[10.5pt]">
                        {job.role}, <span className="font-normal italic">{job.company}</span>
                      </h3>
                      <p className={cn("font-sans text-[0.85rem] whitespace-nowrap print:text-[8pt]", muted)}>
                        {job.start} – {job.end}
                      </p>
                    </div>
                    <p className={cn("font-sans text-[0.85rem] print:text-[8pt]", muted)}>{job.location}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-accent-ink print:mt-1 print:space-y-0.5 print:pl-4 print:marker:text-black">
                      {job.stories.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                    <p className={cn("mt-1.5 font-sans text-[0.85rem] print:mt-0.5 print:text-[8pt]", muted)}>
                      <span className="sr-only">Stack: </span>
                      {job.stack.join(" · ")}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="pe-projects" className="mt-8 break-inside-avoid print:mt-4">
              <h2 id="pe-projects" className={sectionTitle}>
                Selected projects
              </h2>
              <ul className="mt-3 space-y-2 print:mt-1.5 print:space-y-1">
                {selectedProjects.map((p) => (
                  <li key={p.slug}>
                    <strong className="font-semibold">{p.name}</strong> — {p.summary}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Side column */}
          <aside className="min-w-0 space-y-8 print:space-y-4" aria-label="Skills, education and languages">
            <section aria-labelledby="pe-skills" className="break-inside-avoid">
              <h2 id="pe-skills" className={sectionTitle}>
                Skills
              </h2>
              <dl className="mt-3 space-y-2.5 text-[0.95rem] leading-snug print:mt-1.5 print:space-y-1.5 print:text-[8.5pt]">
                {skillGroups.map((g) => (
                  <div key={g.label}>
                    <dt className="font-sans text-[0.8rem] font-bold tracking-wide uppercase print:text-[7.5pt]">{g.label}</dt>
                    <dd>{g.items.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="pe-education" className="break-inside-avoid">
              <h2 id="pe-education" className={sectionTitle}>
                Education
              </h2>
              <ul className="mt-3 space-y-3 text-[0.95rem] leading-snug print:mt-1.5 print:space-y-1.5 print:text-[8.5pt]">
                {education.map((e) => (
                  <li key={e.degree}>
                    <p className="font-semibold">{e.degree}</p>
                    <p className={muted}>
                      {e.school} · {e.years}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="pe-languages" className="break-inside-avoid">
              <h2 id="pe-languages" className={sectionTitle}>
                Languages
              </h2>
              <ul className="mt-3 space-y-1 text-[0.95rem] leading-snug print:mt-1.5 print:space-y-0.5 print:text-[8.5pt]">
                {languages.map((l) => (
                  <li key={l.name}>
                    <span className="font-semibold">{l.name}</span>
                    {l.detail ? <span className={muted}> · {l.detail}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </article>
    </div>
  )
}
