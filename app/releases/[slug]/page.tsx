import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { BeforeAfterSlider } from "@/components/release/BeforeAfterSlider"
import { ChangeList } from "@/components/release/ChangeList"
import { Metrics } from "@/components/release/Metrics"
import { ReleaseHeader } from "@/components/release/ReleaseHeader"
import { ReleaseNav } from "@/components/release/ReleaseNav"
import { ChipList } from "@/components/ui/Chip"
import { Reveal } from "@/components/ui/Reveal"
import { jobBySlug, jobs } from "@/data/releases"

// Unknown slugs get a real 404 status from proxy.ts.
export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }))
}

export async function generateMetadata({ params }: PageProps<"/releases/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const r = jobBySlug(slug)
  if (!r) return {}
  const title = `${r.version} ${r.company}: ${r.title}`
  return {
    title,
    description: r.summary,
    alternates: { canonical: `/releases/${r.slug}` },
    openGraph: { title, description: r.summary, url: `/releases/${r.slug}`, type: "article" },
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = title.toLowerCase().replace(/\s+/g, "-")
  return (
    <Reveal as="section" className="border-t border-border py-10 md:grid md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10 md:py-12">
      <h2 id={id} className="text-xl font-semibold md:sticky md:top-24 md:self-start">
        {title}
      </h2>
      <div className="mt-4 md:mt-0">
        {children}
      </div>
    </Reveal>
  )
}

export default async function ReleasePage({ params }: PageProps<"/releases/[slug]">) {
  const { slug } = await params
  const r = jobBySlug(slug)
  if (!r) notFound()

  return (
    <article className="mx-auto max-w-[1120px] px-4 pt-8 pb-20 sm:px-6 md:pt-12 md:pb-28">
      <ReleaseHeader release={r} />

      <Image
        src={r.hero.src}
        alt={r.hero.alt}
        width={r.hero.width}
        height={r.hero.height}
        priority
        unoptimized
        className="dim-at-night mt-10 h-auto w-full rounded-[var(--radius-card)] border border-border bg-surface md:mt-14"
      />

      <div className="mt-12 md:mt-16">
        <Section title="Context">
          <div className="grid max-w-[68ch] gap-4">
            {r.context.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>

        <Section title="Changes">
          <ChangeList changes={r.changes} size="lg" />
        </Section>

        {r.beforeAfter && (
          <Section title="Before and after">
            <BeforeAfterSlider before={r.beforeAfter.before} after={r.beforeAfter.after} beforeLabel="Legacy AngularJS" afterLabel="New React app" />
          </Section>
        )}

        <Section title="Impact">
          <ul className="grid max-w-[68ch] list-disc gap-3 pl-5 marker:text-muted">
            {r.impact.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <Metrics metrics={r.metrics} />
        </Section>

        <Section title="Under the hood">
          <ChipList items={r.stack} label={`Stack for ${r.version}`} />
        </Section>
      </div>

      <div className="mt-6">
        <ReleaseNav release={r} />
      </div>
    </article>
  )
}
