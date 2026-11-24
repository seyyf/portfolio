import { FileText } from "lucide-react"
import type { Metadata } from "next"

import { Door } from "@/components/game/Door"
import { Progress } from "@/components/game/Progress"
import { StatsMenu } from "@/components/stats/StatsMenu"
import { ButtonLink } from "@/components/ui/Button"
import { DisplayTitle } from "@/components/ui/Gradient"
import { profile } from "@/data/profile"
import { statTabs } from "@/data/skills"
import { pageMeta } from "@/lib/site"

const description = `Career stats and skills of ${profile.name}, ${profile.title}: frontend, backend, databases, DevOps, tools and languages, labelled by how they've been used.`

export const metadata: Metadata = {
  title: "Stats",
  description,
  ...pageMeta("/stats", `Stats · ${profile.name}`, description),
}

/** The stats menu: career numbers, skills by category (no percentages, no ratings), then game progress. */
export default function StatsPage() {
  return (
    <div className="hud-safe">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="pt-6 lg:pt-10">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Player profile · {profile.name}</p>
          <DisplayTitle className="mt-2 text-6xl sm:text-7xl lg:text-8xl">Stats</DisplayTitle>
          <p className="mt-4 max-w-[60ch] text-muted">{profile.intro}</p>
        </header>

        <section aria-labelledby="career-stats" className="hud-panel cut-br relative mt-8 rounded-t-2xl px-5 pt-5 pb-8 sm:px-7">
          <Door id="stats" className="absolute top-2 right-2" />
          <h2 id="career-stats" className="font-mono text-xs tracking-[0.2em] text-gold uppercase">
            Career stats
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
            {profile.careerStats.map((s) => (
              <li key={s.label} className="border-l-2 border-orange/60 pl-4">
                <span className="block font-mono text-5xl leading-none font-semibold text-ink tabular-nums lg:text-6xl">{s.value}</span>
                <span className="mt-2 block font-mono text-xs tracking-[0.16em] text-muted uppercase">{s.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="skills-heading" className="mt-12">
          <h2 id="skills-heading" className="font-display text-4xl text-ink lg:text-5xl">
            <span className="lean">Skills</span>
          </h2>
          <p className="mt-3 mb-6 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted">
            <strong className="font-semibold text-gold">Daily use</strong>: in my current job · <strong className="font-semibold text-orange">Production</strong>: shipped in an
            earlier job · <strong className="font-semibold text-ink">Experienced</strong>: in my toolbox. Languages use CEFR levels.
          </p>
          <StatsMenu tabs={statTabs} />
        </section>

        <Progress />

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/cv" variant="outline">
            <FileText aria-hidden="true" className="size-4" />
            Open the CV
          </ButtonLink>
          <ButtonLink href="/#missions" variant="ghost">
            See the missions
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
