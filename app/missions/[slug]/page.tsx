import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Door } from "@/components/game/Door"
import { BeforeAfter } from "@/components/mission/BeforeAfter"
import { MissionHeader, SideMissionHeader } from "@/components/mission/MissionHeader"
import { MissionMotion } from "@/components/mission/MissionMotion"
import { MissionNav, neighbours } from "@/components/mission/MissionNav"
import { MissionPassed, type PassedAction } from "@/components/mission/MissionPassed"
import { Metrics, shownMetrics } from "@/components/mission/Metrics"
import { Briefing, Objective, Section } from "@/components/mission/Section"
import { SwipeDemo } from "@/components/mission/SwipeDemo"
import { ChipList } from "@/components/ui/Chip"
import type { DoorId } from "@/data/game"
import { lockedMission, missionBySlug, missionPages, type Mission, type SideMission } from "@/data/missions"
import { pageMeta } from "@/lib/site"

// Every mission and side mission is prerendered. Unknown slugs get a real 404 from proxy.ts.
export function generateStaticParams() {
  return missionPages.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: PageProps<"/missions/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const page = missionBySlug(slug)
  if (!page) return {}
  const title = page.kind === "mission" ? `Mission ${page.number}: ${page.codename} (${page.company})` : `Side mission: ${page.name}`
  const description = page.objective
  const url = `/missions/${page.slug}`
  return {
    title,
    description,
    ...pageMeta(url, title, description, "article"),
  }
}

export default async function MissionPage({ params }: PageProps<"/missions/[slug]">) {
  const { slug } = await params
  const page = missionBySlug(slug)
  if (!page) notFound()
  return page.kind === "mission" ? <MainMission mission={page} /> : <SideMissionPage mission={page} />
}

/** Where each main mission hides its blue door (a collectible), so they're not all in one spot. */
const DOOR_SLOT: Record<string, "objective" | "briefing" | "gear" | "reward" | "nav"> = {
  "first-contract": "briefing",
  "table-service": "gear",
  "120-users": "objective",
  "book-it": "reward",
  "the-rebuild": "nav",
}

function DoorSpot({ slug, at }: { slug: string; at: (typeof DOOR_SLOT)[string] }) {
  if (DOOR_SLOT[slug] !== at) return null
  return (
    <div className="mt-4 flex justify-end">
      <Door id={slug as DoorId} />
    </div>
  )
}

/** Section headings are numbered in reading order, whichever optional sections a page has. */
function counter() {
  let n = 0
  return () => ++n
}

function MainMission({ mission: m }: { mission: Mission }) {
  const id = (s: string) => `${m.slug}-${s}`
  const next = counter()
  const hasMetrics = shownMetrics(m.metrics).length > 0
  const nextPage = neighbours(m).next
  const inProgress = m.status === "IN PROGRESS"
  const action: PassedAction = nextPage
    ? { type: "link", href: nextPage.href, label: `Next: ${nextPage.kicker}` }
    : { type: "phone", label: `Unlock Mission ${lockedMission.number}` }

  return (
    <article className="hud-safe">
      <MissionMotion slug={m.slug} />
      <MissionHeader mission={m} />
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <Objective id={id("objective")}>{m.objective}</Objective>
        <DoorSpot slug={m.slug} at="objective" />

        <Section id={id("briefing")} index={next()} title="Briefing">
          <Briefing items={m.briefing} />
          <DoorSpot slug={m.slug} at="briefing" />
        </Section>

        <Section id={id("gear")} index={next()} title="Gear">
          <ChipList items={m.gear} label={`Gear for ${m.codename}`} />
          <DoorSpot slug={m.slug} at="gear" />
        </Section>

        {hasMetrics && (
          <Section id={id("results")} index={next()} title="Results">
            <Metrics metrics={m.metrics} />
          </Section>
        )}

        {m.beforeAfter && (
          <Section id={id("before-after")} index={next()} title="Before / after">
            <BeforeAfter before={m.beforeAfter.before} after={m.beforeAfter.after} beforeLabel="Legacy AngularJS" afterLabel="New React app" />
          </Section>
        )}

        <Section id={id("reward")} index={next()} title={inProgress ? "Checkpoint" : "Reward"}>
          {inProgress && <p className="mb-5 max-w-[60ch] text-muted">Mission {m.number} is still in progress: it&apos;s Seyf&apos;s current role.</p>}
          <p className="font-mono text-sm text-gold lowercase">Skills unlocked</p>
          <ChipList items={m.skillsUnlocked} label="Skills unlocked" className="mt-3" />
          <DoorSpot slug={m.slug} at="reward" />
          <div className="mt-8">
            <MissionPassed
              key={m.slug}
              variant={inProgress ? "checkpoint" : "passed"}
              kicker={`Mission ${m.number} · ${m.codename}`}
              skills={m.skillsUnlocked}
              triggerLabel={inProgress ? "Reach checkpoint" : "Complete mission"}
              action={action}
            />
          </div>
        </Section>

        <div data-mm-nav className="pb-6">
          <MissionNav page={m} />
          <DoorSpot slug={m.slug} at="nav" />
        </div>
      </div>
    </article>
  )
}

function SideMissionPage({ mission: s }: { mission: SideMission }) {
  const id = (x: string) => `${s.slug}-${x}`
  const next = counter()
  const nextPage = neighbours(s).next
  const action: PassedAction = nextPage ? { type: "link", href: nextPage.href, label: `Next: ${nextPage.title}` } : { type: "link", href: "/#missions", label: "Back to the map" }

  return (
    <article className="hud-safe">
      <MissionMotion slug={s.slug} />
      <SideMissionHeader mission={s} />
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <Objective id={id("objective")}>{s.objective}</Objective>

        <Section id={id("about")} index={next()} title="About">
          <p className="max-w-[68ch]">{s.description}</p>
        </Section>

        {s.swipeDemo && (
          <Section id={id("demo")} index={next()} title="Try the swipe">
            <SwipeDemo />
          </Section>
        )}

        <Section id={id("reward")} index={next()} title="Reward">
          <p className="font-mono text-sm text-gold lowercase">Unlocked</p>
          <ChipList items={s.tags} label="Unlocked" className="mt-3" />
          <div className="mt-8">
            <MissionPassed key={s.slug} variant="side" kicker={`Side mission · ${s.name}`} skills={s.tags} skillsLabel="Unlocked:" triggerLabel="Complete side mission" action={action} />
          </div>
        </Section>

        <div data-mm-nav className="pb-6">
          <MissionNav page={s} />
        </div>
      </div>
    </article>
  )
}
