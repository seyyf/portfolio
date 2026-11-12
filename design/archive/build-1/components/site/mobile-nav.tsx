"use client"

import { useRef, useState, type MouseEvent } from "react"
import { ListIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { profile } from "@/lib/content"

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const pendingHash = useRef<string | null>(null)

  // The sheet locks page scroll while open, so an anchor jump fired during close is
  // swallowed. Remember the target, close, then scroll once the sheet has unmounted.
  function onLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault()
    pendingHash.current = href
    setOpen(false)
  }

  function onCloseAutoFocus(event: Event) {
    const hash = pendingHash.current
    if (!hash) return
    event.preventDefault()
    pendingHash.current = null
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(hash)
      if (!target) return
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      history.pushState(null, "", hash)
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
      // Move focus to the section so keyboard and screen-reader users land there too.
      target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="md:hidden" aria-label="Open menu">
          <ListIcon aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        onCloseAutoFocus={onCloseAutoFocus}
        className="w-full gap-0 border-l-0 bg-canvas sm:max-w-none"
      >
        <div className="flex h-16 items-center px-4 sm:px-6">
          <SheetTitle className="text-body-sm font-medium text-ink">Menu</SheetTitle>
        </div>
        <nav aria-label="Mobile" className="px-4 pt-4 sm:px-6">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => onLinkClick(event, link.href)}
                  className="flex min-h-14 items-center border-b border-hairline text-display-md text-ink transition-colors hover:text-body"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto px-4 pb-8 sm:px-6">
          <Button asChild className="w-full">
            <a href={`mailto:${profile.email}`}>Email me</a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
