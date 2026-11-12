"use client"

import { buildingById, tourOrder, type BuildingId } from "@/data/city"
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap"
import { DAY_TIME, NIGHT_TIME, scrollToTime } from "@/lib/sky"
import { useCity } from "@/lib/store"
import { world, type CameraRig } from "@/lib/world"

// ---------- camera keyframes for the tour ----------

/** Sections of the tour: intro, one per stop, finale. */
export const TOUR_SECTIONS = ["intro", ...tourOrder, "finale"] as const
export const SECTION_COUNT = TOUR_SECTIONS.length

export const INTRO_RIG: CameraRig = { tx: 0, ty: 9, tz: 2, zoom: 0.55, side: 0 }
export const FINALE_RIG: CameraRig = { tx: 0, ty: 6.5, tz: 0, zoom: 0.84, side: 0 }

export function rigForStop(id: BuildingId, index: number): CameraRig {
  const b = buildingById[id]
  return {
    tx: b.position[0],
    ty: Math.min(b.size[2] * 0.45, 4.5),
    tz: b.position[1],
    zoom: b.zoom,
    // Alternate the card side so the camera swings left and right through the city.
    side: index % 2 === 0 ? 1 : -1,
  }
}

/**
 * The master tour timeline, scrubbed by scroll over the whole track. One timeline unit per section,
 * so section k is exactly at progress k / (sections - 1), which is also where snapping lands.
 */
export function createTourTimeline(track: HTMLElement, clouds: HTMLElement | null, opts: { snap: boolean }) {
  const last = SECTION_COUNT - 1
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut", duration: 1 },
    scrollTrigger: {
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      snap: opts.snap
        ? { snapTo: 1 / last, duration: { min: 0.25, max: 0.9 }, delay: 0.12, ease: "power2.inOut", inertia: false }
        : undefined,
      onUpdate: (self) => {
        world.progress = self.progress
        world.scrollTime = scrollToTime(self.progress)
        const section = Math.round(self.progress * last)
        const state = useCity.getState()
        if (section !== state.section) {
          const id = section >= 1 && section <= tourOrder.length ? tourOrder[section - 1] : null
          state.setStop(id, section)
        }
      },
    },
  })

  tl.set(world.rig, { ...INTRO_RIG }, 0)
  tourOrder.forEach((id, i) => tl.to(world.rig, { ...rigForStop(id, i) }, i))
  tl.to(world.rig, { ...FINALE_RIG, ease: "power3.inOut" }, last - 1)

  // Intro: dive through the clouds while the city assembles below.
  tl.fromTo(world, { assemble: 0 }, { assemble: 1, ease: "none", duration: 0.85 }, 0.05)
  if (clouds) tl.fromTo(clouds, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 2.4, ease: "power1.in", duration: 0.7 }, 0)

  return tl
}

// ---------- day / night toggle ----------

/**
 * Pins the sky to day or night in ~1.5s: the sun sets and the moon rises in an arc, lights come on in
 * staggered order (each has its own threshold) and Bloom ramps up, all because they follow world.time.
 */
export function animateTimeOfDay(target: "day" | "night", immediate = false) {
  const to = target === "night" ? NIGHT_TIME : DAY_TIME
  gsap.killTweensOf(world, "overrideBlend,overrideTime")
  const duration = immediate ? 0 : 1.5
  if (world.overrideBlend < 0.999) {
    // Start from wherever the scroll put the sky and sweep to the target.
    world.overrideTime = to
    gsap.to(world, { overrideBlend: 1, duration, ease: "power2.inOut" })
  } else {
    gsap.to(world, { overrideTime: to, duration, ease: "power2.inOut" })
  }
}

// ---------- text reveals ----------

/** Letter-by-letter bounce-in for the hero headline. Returns the SplitText for cleanup. */
export function bounceInHeadline(el: HTMLElement) {
  const split = SplitText.create(el, { type: "chars,words", charsClass: "inline-block will-change-transform" })
  gsap.from(split.chars, {
    yPercent: 120,
    rotate: () => gsap.utils.random(-28, 28),
    scale: 0.4,
    autoAlpha: 0,
    duration: 1.1,
    ease: "elastic.out(1, 0.5)",
    stagger: 0.055,
    delay: 0.2,
  })
  return split
}

/** Tour card entrance: slides in from its side, then the heading words and details stagger in. */
export function cardReveal(card: HTMLElement, side: number) {
  const heading = card.querySelector<HTMLElement>("[data-split]")
  const items = card.querySelectorAll<HTMLElement>("[data-reveal]")
  const split = heading ? SplitText.create(heading, { type: "words", mask: "words" }) : null
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out" },
  })
  tl.fromTo(card, { autoAlpha: 0, x: side * -70, rotate: side * -2 }, { autoAlpha: 1, x: 0, rotate: 0, duration: 0.7, ease: "back.out(1.4)" })
  if (split) tl.from(split.words, { yPercent: 110, duration: 0.6, stagger: 0.05 }, 0.15)
  tl.from(items, { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.06 }, 0.3)
  const st = ScrollTrigger.create({
    trigger: card,
    start: "top 78%",
    end: "bottom 22%",
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeaveBack: () => tl.reverse(),
  })
  return () => {
    st.kill()
    tl.kill()
    split?.revert()
  }
}
