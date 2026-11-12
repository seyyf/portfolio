import { container } from "@/components/site/primitives"
import { profile } from "@/lib/content"

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className={`${container} flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between`}>
        <p className="text-caption text-body">© {profile.name}</p>
        <p className="text-caption text-body">Built with Next.js, TypeScript, Tailwind CSS and shadcn/ui.</p>
        <ul className="flex gap-4">
          <li>
            <a href={`mailto:${profile.email}`} className="text-body-sm text-body transition-colors hover:text-ink">
              Email
            </a>
          </li>
          <li>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-sm text-body transition-colors hover:text-ink"
            >
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
