import { ArrowLeft, Download } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { missions, sideMissions, tutorials } from "@/data/missions"
import { profile } from "@/data/profile"
import { statTabs } from "@/data/skills"
import { pageMeta } from "@/lib/site"

import { PrintButton } from "./PrintButton"

const description = `One-page résumé of ${profile.name}, ${profile.title} in Tunis. Print it or save it as a PDF.`

export const metadata: Metadata = {
  title: "CV",
  description,
  ...pageMeta("/cv", `CV · ${profile.name}`, description),
}

const jobs = [...missions].reverse()

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="border-b border-[#ddd] pb-1 text-[0.8125rem] font-bold text-[#111] print:text-[8.5pt]">{children}</h2>
)

/**
 * Recruiter mode: a plain one-page A4 résumé. Black on white, IBM Plex Sans, one thin sunset line.
 * No HUD, no animations. Same facts as the PDF.
 */
export default function CvPage() {
  return (
    <div className="min-h-dvh bg-[#f4f4f2] text-[#111] print:bg-white">
      <div className="no-print mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 pt-6 pb-4 sm:px-0">
        <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg px-1 font-semibold text-[#111] underline-offset-4 hover:underline">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to the open world
        </Link>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
          <a
            href={profile.cvPdf}
            download
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#ccc] bg-white px-4 text-[0.9375rem] font-semibold text-[#111] hover:border-[#111]"
          >
            <Download aria-hidden="true" className="size-4" />
            Download PDF
          </a>
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-5 py-8 text-[0.9375rem] leading-[1.5] shadow-[0_1px_3px_rgb(0_0_0/0.08)] sm:px-12 sm:py-12 print:max-w-none print:p-0 print:text-[9.2pt] print:leading-[1.38] print:shadow-none">
        <header>
          <h1 className="text-[2rem] font-bold tracking-tight print:text-[20pt]">{profile.name}</h1>
          <p className="text-lg print:text-[11pt]">{profile.title}</p>
          <p className="mt-1 text-[0.875rem] text-[#444] print:text-[8.5pt]">
            {profile.location} · <a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.linkedin}>{profile.linkedinLabel}</a>
          </p>
          <div aria-hidden="true" className="mt-4 h-[3px] w-24 rounded-full bg-[linear-gradient(90deg,#ff4fa3,#ff8a3d_55%,#ffc94a)] print:mt-2.5" />
        </header>

        <p className="mt-4 print:mt-2.5">{profile.summary}</p>

        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_13rem] print:mt-3 print:grid-cols-[minmax(0,1fr)_44mm] print:gap-5">
          <div className="grid content-start gap-4 print:gap-2.5">
            <H>Experience</H>
            {jobs.map((j) => (
              <section key={j.slug} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-base font-bold print:text-[9.8pt]">
                    {j.role} · {j.company}
                  </h3>
                  <p className="text-[0.8125rem] text-[#555] print:text-[8pt]">
                    {j.dates} · {j.location}
                  </p>
                </div>
                <ul className="mt-1 list-disc pl-4 marker:text-[#888] print:mt-0.5">
                  {j.briefing.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="mt-0.5 text-[0.8125rem] text-[#555] print:text-[7.8pt]">Stack: {j.gear.join(", ")}</p>
              </section>
            ))}

            <H>Selected projects</H>
            <ul className="grid gap-1">
              {sideMissions.map((p) => (
                <li key={p.slug}>
                  <span className="font-bold">{p.name}</span>: {p.description}
                </li>
              ))}
            </ul>
          </div>

          <aside className="grid content-start gap-4 print:gap-2.5">
            <H>Skills</H>
            {statTabs
              .filter((t) => t.id !== "languages")
              .map((t) => (
                <div key={t.id}>
                  <h3 className="text-[0.8125rem] font-bold print:text-[8.3pt]">{t.label}</h3>
                  <p className="text-[0.8125rem] text-[#333] print:text-[8pt]">{t.skills.map((s) => s.name).join(", ")}</p>
                </div>
              ))}

            <H>Education</H>
            {[...tutorials].reverse().map((t) => (
              <div key={t.slug} className="text-[0.8125rem] print:text-[8pt]">
                <p className="font-bold">{t.degree}</p>
                <p className="text-[#555]">
                  {t.school}, {t.dates}
                </p>
              </div>
            ))}

            <H>Languages</H>
            <ul className="text-[0.8125rem] print:text-[8pt]">
              {statTabs
                .find((t) => t.id === "languages")!
                .skills.map((l) => (
                  <li key={l.name}>
                    {l.name} <span className="text-[#555]">({l.status.toLowerCase() === "native" ? "native" : l.status})</span>
                  </li>
                ))}
            </ul>
          </aside>
        </div>
      </article>
      <div className="no-print h-10" />
    </div>
  )
}
