import Link from "next/link"

import { paper, profile } from "@/data/profile"

/** Small newspaper footer. */
export function Footer() {
  return (
    <footer className="no-print mt-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="rule-double" />
        <div className="flex flex-col items-center gap-4 py-8 text-center md:flex-row md:justify-between md:text-left">
          <p className="label text-gray">
            © 2026 {paper.name} · {paper.footer}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <li>
              <a className="label hover:text-accent-ink" href={profile.cv} download={profile.cvFileName}>
                CV
              </a>
            </li>
            <li>
              <a className="label hover:text-accent-ink" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="label hover:text-accent-ink" href={`mailto:${profile.email}`}>
                Email
              </a>
            </li>
            <li>
              <Link className="label hover:text-accent-ink" href="/print">
                Print Edition
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
