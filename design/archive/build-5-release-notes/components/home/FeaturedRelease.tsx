import Image from "next/image"
import Link from "next/link"

import { ChangeList } from "@/components/release/ChangeList"
import { ChipList } from "@/components/ui/Chip"
import { Reveal } from "@/components/ui/Reveal"
import { latest } from "@/data/releases"

/** The current release (v5.0 Educaro) as a large card. */
export function FeaturedRelease() {
  const r = latest
  return (
    <section aria-labelledby="latest-title" className="mx-auto max-w-[1120px] px-4 pb-20 sm:px-6 md:pb-28">
      <h2 className="mb-5 font-mono text-sm font-normal tracking-normal text-muted">Latest release</h2>
      <Reveal>
        <article className="group relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface transition-shadow duration-300 hover:shadow-[var(--shadow-hover)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
            <div className="p-5 sm:p-8">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-muted">
                <span className="font-semibold text-accent">{r.version}</span>
                <span>{r.dates}</span>
                <span className="rounded-md bg-tag-improved-bg px-1.5 text-xs text-tag-improved">current stable</span>
              </p>
              <h3 id="latest-title" className="mt-3 text-[1.75rem] font-semibold sm:text-4xl">
                {r.title}
              </h3>
              <p className="mt-2 text-muted">
                {r.company} · {r.role}
              </p>

              <ChangeList changes={r.changes} className="mt-6" />
              <ChipList items={r.stack} label={`Stack for ${r.version}`} className="mt-6" />

              <Link
                href={`/releases/${r.slug}`}
                className="mt-7 inline-flex items-center gap-1 font-medium text-accent underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:underline"
              >
                Read full release notes →
              </Link>
            </div>
            <div className="border-t border-border bg-bg p-4 sm:p-6 lg:border-t-0 lg:border-l">
              <Image
                src={r.hero.src}
                alt={r.hero.alt}
                width={r.hero.width}
                height={r.hero.height}
                unoptimized
                sizes="(min-width: 1024px) 416px, 100vw"
                className="dim-at-night h-auto w-full rounded-lg border border-border transition-transform duration-500 group-hover:scale-[1.015] lg:sticky lg:top-24"
              />
            </div>
          </div>
        </article>
      </Reveal>
    </section>
  )
}
