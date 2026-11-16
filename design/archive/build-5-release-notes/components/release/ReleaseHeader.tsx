import Link from "next/link"

import type { JobRelease } from "@/data/releases"
import { profile } from "@/data/profile"

export function ReleaseHeader({ release: r }: { release: JobRelease }) {
  const current = r.version === profile.currentVersion
  return (
    <header>
      <nav aria-label="Breadcrumb" className="font-mono text-sm text-muted">
        <Link href="/#releases" className="hover:text-ink">
          Releases
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{r.version}</span>
      </nav>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm">
        <span className="rounded-md bg-accent px-2 py-0.5 font-semibold text-on-accent">{r.version}</span>
        {current && <span className="rounded-md bg-tag-improved-bg px-2 py-0.5 text-tag-improved">current stable</span>}
        <span className="text-muted">{r.dates}</span>
      </div>

      <p className="mt-5 text-lg text-muted">
        {r.company} · {r.role} · {r.location}
      </p>
      <h1 className="mt-2 max-w-[22ch] text-[2.25rem] font-semibold sm:text-5xl lg:text-[3.5rem]">{r.title}</h1>
      <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted md:text-xl">{r.summary}</p>
    </header>
  )
}
