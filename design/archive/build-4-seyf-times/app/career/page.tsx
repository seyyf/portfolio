import type { Metadata } from "next"

import { Timeline } from "@/components/career/Timeline"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"
import { Rule } from "@/components/shared/Rule"
import { education, jobs } from "@/data/career"
import { profile } from "@/data/profile"

const description = `${profile.name}'s career, newest first: ${jobs.length} roles as a frontend and fullstack developer in Tunis since ${jobs[jobs.length - 1].start.split(" ")[1]}, from ${jobs[0].company} back to ${jobs[jobs.length - 1].company}.`

export const metadata: Metadata = {
  title: "Career: From the Archive",
  description,
  alternates: { canonical: "/career" },
}

export default function CareerPage() {
  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <header className="text-center">
          <p className="kicker">Career</p>
          <Reveal as="h1" variant="words" className="mt-3 font-headline text-[2.6rem] leading-[1.05] font-black sm:text-[3.6rem]">
            From the Archive
          </Reveal>
          <p className="mx-auto mt-4 max-w-[58ch] text-[1.125rem] leading-relaxed text-gray">
            Every job {profile.firstName} has held, filed as a past front page. Newest edition on top.
          </p>
        </header>

        <Rule double className="mt-8 mb-10 sm:mb-14" />

        <Timeline jobs={jobs} />

        <section aria-labelledby="earlier-editions" className="mt-16 sm:mt-20">
          <Rule double />
          <h2 id="earlier-editions" className="mt-6 font-headline text-[1.75rem] leading-tight font-bold">
            <span className="kicker mb-1.5 block font-sans">Education</span>
            Earlier editions
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {education.map((e) => (
              <li key={e.degree} className="border border-ink/25 px-4 py-4">
                <p className="label text-gray">{e.years}</p>
                <h3 className="mt-1.5 font-headline text-[1.2rem] leading-snug font-bold">{e.degree}</h3>
                <p className="byline mt-1 text-[1rem]">{e.school}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageTransition>
  )
}
