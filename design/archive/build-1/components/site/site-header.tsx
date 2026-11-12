import { Button } from "@/components/ui/button"
import { profile } from "@/lib/content"

import { MobileNav } from "./mobile-nav"
import { container } from "./primitives"

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#case-study", label: "Case study" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
]

export function Monogram() {
  return (
    <span
      aria-hidden
      className="grid size-7 place-items-center rounded-sm bg-ink text-[11px] font-semibold tracking-[-0.3px] text-on-primary"
    >
      {profile.initials}
    </span>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <div className={`${container} flex h-16 items-center justify-between gap-6`}>
        <a href="#top" className="-mx-1 flex items-center gap-2 rounded-sm px-1 py-1 transition-opacity hover:opacity-75">
          <Monogram />
          <span className="text-body-sm font-medium text-ink">{profile.name}</span>
        </a>

        <div className="flex items-center gap-2">
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-0.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Button asChild variant="ghost" size="nav">
                    <a href={link.href}>{link.label}</a>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          <Button asChild size="sm" className="hidden md:ml-2 md:inline-flex">
            <a href={`mailto:${profile.email}`}>Email me</a>
          </Button>
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  )
}
