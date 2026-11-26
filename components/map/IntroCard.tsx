import { ArrowDown } from "lucide-react"

import { Door } from "@/components/game/Door"
import { IntroActions } from "@/components/map/IntroActions"
import { profile } from "@/data/profile"

/**
 * The 5-second card: who, what, and the three things a recruiter wants (story, CV, contact).
 * Holds the page's only <h1>. In the flow on phones; floating over the map on desktop.
 */
export function IntroCard() {
  return (
    <div
      id="map-intro"
      data-intro-rise
      className="relative z-10 px-4 pt-[calc(var(--hud-top)+1rem)] sm:px-6 lg:absolute lg:top-[5.5rem] lg:left-6 lg:w-[26rem] lg:rounded-2xl lg:border lg:border-ink/12 lg:bg-bg/85 lg:p-6 lg:shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] lg:backdrop-blur-md"
    >
      <div aria-hidden="true" className="bg-blue absolute inset-x-0 top-0 hidden h-1 rounded-t-2xl lg:block" />
      <Door id="hub" className="absolute top-[calc(var(--hud-top)+0.25rem)] right-3 lg:top-3 lg:right-3" />
      <p className="flex items-center gap-2 font-mono text-xs text-muted lowercase">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-red" />
        {profile.edition} · Greater Tunis
      </p>
      <h1 id="hub-title" className="mt-3 lg:mt-2">
        <span className="block font-display text-[3.5rem] sm:text-7xl lg:text-[3.625rem]">
          <span className="text-blue">{profile.name}</span>
        </span>
        <span className="mt-2 block text-xl font-semibold text-ink lg:mt-1.5">{profile.title}</span>
      </h1>
      <p className="mt-3 max-w-[60ch] text-ink/85 lg:text-[1.0625rem] lg:leading-relaxed">{profile.intro}</p>
      <div className="mt-5">
        <IntroActions />
      </div>
      <a href="#missions" className="mt-3 hidden items-center gap-1.5 text-sm font-semibold text-ink/80 underline-offset-4 hover:text-blue hover:underline [@media(min-width:1024px)_and_(min-height:721px)]:inline-flex">
        Or browse the mission list <ArrowDown aria-hidden="true" className="size-4" />
      </a>
    </div>
  )
}
