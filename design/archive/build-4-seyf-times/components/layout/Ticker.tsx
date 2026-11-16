import { breakingNews } from "@/data/profile"

/**
 * Breaking news ticker: a red BREAKING label and an endless marquee (CSS, pauses on hover/focus,
 * static for reduced motion). Screen readers get the headlines once, as a list.
 */
export function Ticker() {
  const run = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {breakingNews.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="px-5">{item}</span>
          <span aria-hidden="true" className="text-accent-ink">
            ✦
          </span>
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-label="Breaking news" className="ticker flex items-stretch border-y border-rule bg-paper font-sans text-[0.82rem] font-medium">
      <p className="label flex shrink-0 items-center bg-accent px-3 py-2 text-white">Breaking</p>
      <div className="relative min-w-0 flex-1 overflow-hidden py-2" tabIndex={0} aria-label="Breaking news headlines (hover or focus to pause)">
        <div className="ticker-track flex w-max" style={{ ["--ticker-duration" as string]: "38s" }}>
          {run(false)}
          {run(true)}
        </div>
      </div>
    </section>
  )
}
