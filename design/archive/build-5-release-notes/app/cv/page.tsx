import { Download } from "lucide-react"
import type { Metadata } from "next"

import { ButtonAnchor } from "@/components/ui/Button"
import { profile } from "@/data/profile"
import { projects } from "@/data/projects"
import { education, jobs } from "@/data/releases"
import { locales, skillGroupLabels, skills } from "@/data/skills"

import { PrintButton } from "./PrintButton"

export const metadata: Metadata = {
  title: "Résumé",
  description: `One-page résumé of ${profile.name}, ${profile.title} in Tunis. Print it or save it as a PDF.`,
  alternates: { canonical: "/cv" },
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="border-b border-border pb-1 font-mono text-[0.75rem] font-semibold text-accent print:text-[8pt]">{children}</h2>
)

/** One-page A4 résumé. Always printed on white, whatever the site theme. Same facts as the PDF. */
export default function CvPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 md:py-12 print:p-0">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <p className="text-muted">The web version of my CV, formatted for one A4 page.</p>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
          <ButtonAnchor href={profile.cvPdf} download variant="outline">
            <Download aria-hidden="true" className="size-4" />
            Download PDF
          </ButtonAnchor>
        </div>
      </div>

      <article className="force-light mx-auto max-w-[210mm] rounded-[var(--radius-card)] border border-border bg-white p-6 text-[0.9375rem] leading-[1.5] text-ink sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:text-[9.2pt] print:leading-[1.38]">
        <header className="flex flex-col gap-1 border-b-2 border-ink pb-4 print:pb-2.5">
          <h1 className="text-[2rem] font-semibold print:text-[19pt]">{profile.name}</h1>
          <p className="text-lg print:text-[10.5pt]">{profile.title}</p>
          <p className="font-mono text-[0.8125rem] text-muted print:text-[7.8pt]">
            {profile.location} · <a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.linkedin}>{profile.linkedinLabel}</a>
          </p>
        </header>

        <p className="mt-4 print:mt-2.5">{profile.summary}</p>

        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_13rem] print:mt-3 print:grid-cols-[minmax(0,1fr)_42mm] print:gap-5">
          <div className="grid content-start gap-4 print:gap-2.5">
            <H>Experience</H>
            {jobs.map((j) => (
              <section key={j.slug} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-base font-semibold tracking-tight print:text-[9.5pt]">
                    {j.role} · {j.company}
                  </h3>
                  <p className="font-mono text-[0.75rem] text-muted print:text-[7.5pt]">
                    {j.version} · {j.dates}
                  </p>
                </div>
                <ul className="mt-1 list-disc pl-4 marker:text-muted print:mt-0.5">
                  {j.changes.map((c) => (
                    <li key={c.text}>{c.text}</li>
                  ))}
                </ul>
                <p className="mt-0.5 font-mono text-[0.75rem] text-muted print:text-[7.3pt]">{j.stack.join(", ")}</p>
              </section>
            ))}

            <H>Selected projects</H>
            <ul className="grid gap-1">
              {projects.map((p) => (
                <li key={p.slug}>
                  <span className="font-semibold">{p.name}</span>: {p.description}
                </li>
              ))}
            </ul>
          </div>

          <aside className="grid content-start gap-4 print:gap-2.5">
            <H>Skills</H>
            {(Object.entries(skills) as [keyof typeof skills, readonly string[]][]).map(([g, list]) => (
              <div key={g}>
                <h3 className="text-[0.8125rem] font-semibold print:text-[8pt]">{skillGroupLabels[g]}</h3>
                <p className="text-[0.8125rem] text-ink/85 print:text-[7.8pt]">{list.join(", ")}</p>
              </div>
            ))}

            <H>Education</H>
            {education.map((e) => (
              <div key={e.version} className="text-[0.8125rem] print:text-[7.8pt]">
                <p className="font-semibold">{e.degree}</p>
                <p className="text-muted">
                  {e.school}, {e.dates}
                </p>
              </div>
            ))}

            <H>Languages</H>
            <ul className="text-[0.8125rem] print:text-[7.8pt]">
              {locales.map((l) => (
                <li key={l.code}>
                  {l.language} <span className="text-muted">({l.level})</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </article>
    </div>
  )
}
