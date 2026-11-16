import type { Metadata } from "next"

import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"
import { Rule } from "@/components/shared/Rule"
import { MarketTable } from "@/components/skills/MarketTable"
import { SkillTicker } from "@/components/skills/SkillTicker"
import { jobs } from "@/data/career"
import { profile } from "@/data/profile"
import { indices, skillTicker } from "@/data/skills"

export const metadata: Metadata = {
  title: "Markets: Skills",
  description: `${profile.name}'s skills as newspaper market tables: frontend, backend, databases, DevOps, tools and languages, with how many of his ${jobs.length} roles used each one.`,
  alternates: { canonical: "/skills" },
}

export default function SkillsPage() {
  return (
    <PageTransition>
      <SkillTicker items={skillTicker} />

      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="kicker">Skills</p>
          <Reveal as="h1" variant="words" className="mt-3 font-headline text-[2.8rem] leading-[1.05] font-black sm:text-[4rem]">
            Markets
          </Reveal>
          <p className="mx-auto mt-4 max-w-[60ch] text-[1.125rem] leading-relaxed">
            {profile.firstName}&apos;s skills, as the financial pages would print them. The charts are decorative; the only number is how
            many of his roles used each skill.
          </p>
          <p className="label mt-4 text-gray">
            <span aria-hidden="true" className="text-market">
              ▲
            </span>{" "}
            Roles: how many of his {jobs.length} jobs used the skill · —: not counted
          </p>
        </header>

        <Rule double className="mt-8 mb-10" />

        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
          {indices.map((index) => (
            <MarketTable key={index.id} index={index} totalRoles={jobs.length} />
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
