import { IntroController } from "@/components/intro/IntroController"
import { LoadingPanel } from "@/components/intro/LoadingPanel"
import { introCss } from "@/components/intro/styles"
import { Tips } from "@/components/intro/Tips"
import { profile } from "@/data/profile"

/**
 * First visit of the session on "/": a ~3s loading screen (panels, tips, a title card), then a
 * flight into the map. Server-rendered and hidden by CSS unless <html> has .intro-pending (set
 * before first paint by the layout's head script), so it is on screen from the first frame and
 * never shows to returning visitors or with reduced motion. z-80: under the "Skip to CV" link.
 */
export function LoadingScreen() {
  return (
    <div id="ow-intro" className="loading-screen fixed inset-0 z-[80] overflow-hidden bg-bg">
      <style href="ow-intro" precedence="medium">
        {introCss}
      </style>
      <div aria-hidden="true" className="ow-glow absolute inset-0" />

      <div aria-hidden="true" className="absolute inset-x-4 top-[4.25rem] bottom-[12rem] flex flex-col gap-3 lg:inset-x-12 sm:bottom-[9.5rem] lg:top-[5.5rem] lg:bottom-[10rem] lg:flex-row lg:gap-5">
        {/* sizes: on phones the panels are full width but decorative, so ~2x density is plenty ("70vw");
            on desktop the side panels are ~32vw and the middle one ~45vw. */}
        <LoadingPanel src={profile.portrait.src} first sizes="(min-width: 1024px) 32vw, 70vw" position="50% 42%" tint="linear-gradient(#1a2230,#2f5a87)" />
        <LoadingPanel src="/images/intro/sunset.webp" sizes="(min-width: 1024px) 45vw, 70vw" position="50% 62%" tint="linear-gradient(#1a2230,#2f5a87 70%,#1a2230)" className="lg:flex-[1.5]" />
        <LoadingPanel src="/images/intro/sidi-bou-said.webp" sizes="(min-width: 1024px) 32vw, 70vw" position="50% 58%" tint="linear-gradient(#1a2230,#4f8fd0 55%,#dde2ea 56%)" />
      </div>
      <div aria-hidden="true" className="ow-dim pointer-events-none absolute inset-0" />

      {/* Title card */}
      <div aria-hidden="true" className="ow-card pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className="ow-band absolute -inset-x-[5%] -inset-y-6 bg-bg/85 shadow-[0_0_0_1px_rgb(0_0_0/0.25)] lg:-inset-y-9" />
        <div className="relative px-4 text-center">
          <p className="ow-title-text font-display text-[clamp(3.5rem,16vw,10rem)]">
            <span className="text-blue">{profile.name}</span>
          </p>
          <p className="ow-sub mt-3 font-mono text-xs text-ink lowercase sm:text-sm lg:mt-4">
            {profile.title} <span className="text-blue">·</span> {profile.edition}
          </p>
        </div>
      </div>

      {/* Tips, skip, loading bar */}
      <div className="ow-foot absolute inset-x-4 bottom-5 lg:inset-x-12 lg:bottom-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div aria-hidden="true" className="min-w-0 flex-1">
            <Tips tips={profile.loadingTips} />
          </div>
          <button
            type="button"
            data-intro-skip
            className="h-11 shrink-0 self-end rounded-lg border border-ink/25 bg-bg/60 px-4 font-mono text-xs text-ink lowercase backdrop-blur-sm transition-colors hover:border-blue hover:text-blue"
          >
            <span className="ow-skip-key">Press any key to skip</span>
            <span className="ow-skip-touch">Tap to skip</span>
          </button>
        </div>
        <div aria-hidden="true" className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div className="ow-bar bg-blue h-full rounded-full" />
        </div>
        <p aria-hidden="true" className="mt-2 flex justify-between font-mono text-[0.6875rem] text-muted lowercase">
          <span>Loading Greater Tunis</span>
          <span className="hidden sm:inline">{profile.edition}</span>
        </p>
      </div>

      <IntroController />
    </div>
  )
}
