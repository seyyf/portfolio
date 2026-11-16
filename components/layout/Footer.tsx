import Link from "next/link"

import { profile } from "@/data/profile"

export function Footer() {
  return (
    <footer className="no-print border-t border-border">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-4 py-8 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-[0.8125rem]">
          © {profile.copyrightYear} {profile.name} · Built with Next.js · Last release: {profile.currentVersion}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <Link href="/cv" className="hover:text-ink">
              CV
            </Link>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={`mailto:${profile.email}`} className="hover:text-ink">
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
