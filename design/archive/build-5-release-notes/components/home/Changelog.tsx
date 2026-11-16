import { releases } from "@/data/releases"

import { ReleaseEntry } from "./ReleaseEntry"
import { VersionScrubber } from "./VersionScrubber"

/** Every release, newest first: v6.0 (upcoming), the jobs, then education. */
export function Changelog() {
  return (
    <section id="releases" aria-labelledby="changelog-title" className="mx-auto max-w-[1120px] px-4 pb-20 sm:px-6 md:pb-28">
      <div className="mb-8 lg:pl-[10.5rem]">
        <h2 id="changelog-title" className="text-3xl font-semibold sm:text-4xl">
          Changelog
        </h2>
        <p className="mt-3 max-w-[60ch] text-muted">Every job is a major version, newest first. Each release lists what changed.</p>
      </div>

      <div className="lg:grid lg:grid-cols-[8.5rem_minmax(0,1fr)] lg:gap-8">
        <VersionScrubber />
        <ol className="mt-6 lg:mt-0">
          {releases.map((r) => (
            <ReleaseEntry key={r.version} release={r} />
          ))}
        </ol>
      </div>
    </section>
  )
}
