"use client"

import { useRef } from "react"

import { Magnetic } from "@/components/ui/Magnetic"
import { buildingById, education, finale, hero, languages, profile, skillGroups, tourOrder, type BuildingId } from "@/data/city"
import { bounceInHeadline, cardReveal, createTourTimeline } from "@/lib/animations"
import { useGSAP } from "@/lib/gsap"
import { playSfx } from "@/lib/sound"
import { useCity } from "@/lib/store"

/**
 * "A day in Seyf City": every stop is a real HTML section. Scrolling through them scrubs one GSAP
 * timeline that flies the camera and moves the sun; snapping lands on each section.
 */
export function Tour({ hidden }: { hidden: boolean }) {
  const track = useRef<HTMLDivElement>(null)
  const clouds = useRef<HTMLDivElement>(null)
  const headline = useRef<HTMLHeadingElement>(null)
  const reduced = useCity((s) => s.reducedMotion)

  useGSAP(
    () => {
      if (!track.current) return
      createTourTimeline(track.current, clouds.current, { snap: !reduced })
      const cleanups = Array.from(track.current.querySelectorAll<HTMLElement>("[data-card]")).map((card) =>
        cardReveal(card, Number(card.dataset.side))
      )
      let split: { revert: () => void } | null = null
      let cancelled = false
      if (!reduced) {
        document.fonts.ready.then(() => {
          if (!cancelled && headline.current) split = bounceInHeadline(headline.current)
        })
      }
      return () => {
        cancelled = true
        cleanups.forEach((c) => c())
        split?.revert()
      }
    },
    { scope: track, dependencies: [reduced] }
  )

  return (
    <div
      ref={track}
      id="tour"
      className={`relative z-10 overflow-x-clip transition-opacity duration-500 ${hidden ? "invisible opacity-0" : "opacity-100"}`}
    >
      <CloudLayer ref={clouds} />
      <Intro headlineRef={headline} />
      {tourOrder.map((id, i) => (
        <Stop key={id} id={id} index={i} />
      ))}
      <Finale />
    </div>
  )
}

function Intro({ headlineRef }: { headlineRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <section id="intro" aria-labelledby="hero-title" className="pointer-events-none relative flex h-svh flex-col justify-start px-5 pt-28 sm:px-10 md:pt-36">
      <div className="relative z-10 max-w-3xl">
        <h1
          ref={headlineRef}
          id="hero-title"
          className="font-display text-[clamp(3.6rem,13vw,9.5rem)] leading-[0.95] font-semibold tracking-[-0.02em] text-text [text-shadow:0_4px_0_color-mix(in_srgb,var(--color-cream)_70%,transparent)]"
        >
          {hero.greeting}
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed font-semibold text-text sm:text-xl">{hero.intro}</p>
        <p className="mt-2 text-base text-text-soft">
          {profile.name}, {profile.title} with {profile.yearsExperience} years of experience.
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center">
        <p className="flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-2 font-display text-sm font-semibold text-ink shadow-[0_3px_0_var(--color-ink)]">
          <span className="inline-block motion-safe:animate-bounce" aria-hidden="true">
            ↓
          </span>
          {hero.scrollHint}
        </p>
      </div>
    </section>
  )
}

function Stop({ id, index }: { id: BuildingId; index: number }) {
  const b = buildingById[id]
  const openPanel = useCity((s) => s.openPanel)
  const side = index % 2 === 0 ? 1 : -1
  return (
    <section
      id={`stop-${id}`}
      aria-labelledby={`stop-title-${id}`}
      className={`pointer-events-none relative flex h-svh flex-col justify-end px-4 pb-24 sm:px-8 md:flex-row md:items-center md:pb-0 ${
        side > 0 ? "md:justify-start" : "md:justify-end"
      } md:px-12`}
    >
      <article data-card data-side={side} className="card pointer-events-auto w-full max-w-[26rem] p-5 sm:p-7">
        <p data-reveal className="flex items-center gap-2 text-sm font-bold text-text-soft">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-full border-2 border-line bg-butter text-base">
            {b.emoji}
          </span>
          {b.place}
          <span className="ml-auto font-display text-xs font-semibold tabular-nums">
            Stop {index + 1} of {tourOrder.length}
          </span>
        </p>
        <h2 data-split id={`stop-title-${id}`} className="mt-3 font-display text-3xl leading-tight font-semibold sm:text-4xl">
          {b.name}
        </h2>
        {(b.role || b.period) && (
          <p data-reveal className="mt-1 font-semibold text-text-soft">
            {b.role}
            {b.role && b.period ? ", " : ""}
            {b.period}
          </p>
        )}
        <p data-reveal className="mt-3 leading-relaxed">
          {b.summary}
        </p>
        {b.stack.length > 0 && (
          <ul data-reveal className="mt-4 hidden flex-wrap gap-1.5 sm:flex" aria-label="Tech used">
            {b.stack.slice(0, 6).map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
        )}
        {/* Full story for screen readers and search engines; sighted visitors open it with "Step inside". */}
        <div className="sr-only">
          <ul>
            {b.story.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {id === "workshop" &&
            skillGroups.map((g) => (
              <p key={g.label}>
                {g.label}: {g.items.join(", ")}.
              </p>
            ))}
          {b.stack.length > 6 && <p>Also used: {b.stack.slice(6).join(", ")}.</p>}
        </div>
        <div data-reveal className="mt-5">
          <button
            type="button"
            className="btn btn-coral"
            onClick={() => {
              playSfx("click")
              openPanel(id)
            }}
          >
            Step inside
          </button>
        </div>
      </article>
    </section>
  )
}

function Finale() {
  const openPanel = useCity((s) => s.openPanel)
  const setMode = useCity((s) => s.setMode)
  return (
    <section id="finale" aria-labelledby="finale-title" className="pointer-events-none relative flex h-svh flex-col items-center justify-start px-5 pt-24 text-center md:pt-24">
      <div className="pointer-events-auto max-w-4xl legible">
        <h2 id="finale-title" className="font-display text-[clamp(2.4rem,7vw,5rem)] leading-[1] font-semibold text-text">
          {finale.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg font-semibold text-text">{finale.body}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <button type="button" className="btn btn-coral text-base" onClick={() => openPanel("house")}>
              ✉️ Contact me
            </button>
          </Magnetic>
          <Magnetic>
            <a className="btn btn-mint text-base" href={profile.cv} download>
              📄 Download CV
            </a>
          </Magnetic>
        </div>
        <div className="sr-only">
          <h3>About me</h3>
          {buildingById.house.story.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            Education: {education.map((e) => `${e.degree}, ${e.school}, ${e.years}`).join("; ")}.
          </p>
          <p>Languages: {languages.map((l) => `${l.name} (${l.level})`).join(", ")}.</p>
          <p>
            Email <a href={`mailto:${profile.email}`}>{profile.email}</a>, LinkedIn <a href={profile.linkedin}>{profile.linkedinLabel}</a>.
          </p>
        </div>
        <button type="button" className="mt-5 font-display font-semibold text-text underline decoration-2 underline-offset-4" onClick={() => setMode("explore")}>
          Or explore the city freely
        </button>
      </div>
    </section>
  )
}

/** The sea of clouds you start above. It scales up and fades as you dive into the city. */
function CloudLayer({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
    <div ref={ref} className="absolute inset-0 origin-[50%_70%]">
      <svg className="absolute bottom-[-6%] left-[-10%] w-[120%] min-w-[900px] motion-safe:animate-[drift_40s_ease-in-out_infinite_alternate]" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice">
        <g fill="var(--cloud-shade, #E9E2F5)">
          <circle cx="80" cy="260" r="120" />
          <circle cx="260" cy="230" r="150" />
          <circle cx="470" cy="250" r="130" />
          <circle cx="680" cy="215" r="160" />
          <circle cx="900" cy="250" r="140" />
          <circle cx="1100" cy="230" r="150" />
          <rect x="0" y="260" width="1200" height="200" />
        </g>
        <g fill="var(--cloud, #FFFFFF)">
          <circle cx="140" cy="300" r="110" />
          <circle cx="340" cy="275" r="130" />
          <circle cx="560" cy="300" r="120" />
          <circle cx="760" cy="270" r="140" />
          <circle cx="980" cy="300" r="120" />
          <circle cx="1160" cy="285" r="110" />
          <rect x="0" y="310" width="1200" height="140" />
        </g>
      </svg>
      <svg className="absolute top-[18%] right-[-4%] w-[38%] min-w-[280px] opacity-90 motion-safe:animate-[drift_26s_ease-in-out_infinite_alternate-reverse]" viewBox="0 0 400 160">
        <g fill="var(--cloud, #FFFFFF)">
          <circle cx="110" cy="100" r="55" />
          <circle cx="190" cy="80" r="70" />
          <circle cx="280" cy="100" r="55" />
          <rect x="60" y="100" width="280" height="55" rx="27" />
        </g>
      </svg>
      <svg className="absolute top-[40%] left-[-6%] w-[26%] min-w-[200px] opacity-80 motion-safe:animate-[drift_32s_ease-in-out_infinite_alternate]" viewBox="0 0 400 160">
        <g fill="var(--cloud, #FFFFFF)">
          <circle cx="120" cy="100" r="50" />
          <circle cx="200" cy="85" r="62" />
          <circle cx="270" cy="105" r="45" />
          <rect x="70" y="100" width="250" height="50" rx="25" />
        </g>
      </svg>
    </div>
    </div>
  )
}
