import Link from "next/link"

import { releaseHref, releaseLabel, releases, type JobRelease } from "@/data/releases"

/** "← v4.0 Uteek" (older) and "v6.0 Upcoming →" (newer), in changelog order. */
export function ReleaseNav({ release }: { release: JobRelease }) {
  const i = releases.findIndex((r) => r.version === release.version)
  const newer = releases[i - 1]
  const older = releases[i + 1]

  return (
    <nav aria-label="Other releases" className="grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
      {older ? (
        <Link href={releaseHref(older)} className="group rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-shadow hover:shadow-[var(--shadow-hover)]">
          <span className="font-mono text-xs text-muted">Previous release</span>
          <span className="mt-1 block text-lg font-semibold tracking-tight">
            <span aria-hidden="true" className="inline-block transition-transform group-hover:-translate-x-0.5">
              ←
            </span>{" "}
            {older.version} {releaseLabel(older)}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {newer && (
        <Link
          href={releaseHref(newer)}
          className="group rounded-[var(--radius-card)] border border-border bg-surface p-5 text-right transition-shadow hover:shadow-[var(--shadow-hover)] sm:col-start-2"
        >
          <span className="font-mono text-xs text-muted">Next release</span>
          <span className="mt-1 block text-lg font-semibold tracking-tight">
            {newer.version} {releaseLabel(newer)}{" "}
            <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </Link>
      )}
    </nav>
  )
}
