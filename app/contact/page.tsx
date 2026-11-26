import type { Metadata } from "next"

import { Door } from "@/components/game/Door"
import { Contacts } from "@/components/phone/Contacts"
import { Messages } from "@/components/phone/Messages"
import { DisplayTitle } from "@/components/ui/DisplayTitle"
import { profile } from "@/data/profile"
import { pageMeta } from "@/lib/site"

const description = `Contact ${profile.name}, ${profile.title} in Tunis: send a message, copy the email, open LinkedIn or download the CV.`

export const metadata: Metadata = {
  title: "Contact",
  description,
  ...pageMeta("/contact", `Contact · ${profile.name}`, description),
}

/** The phone's Messages and Contacts apps as a plain page: works without the overlay. */
export default function ContactPage() {
  return (
    <div className="hud-safe">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="relative pt-6 lg:pt-10">
          <Door id="contact" className="absolute right-0 bottom-0" />
          <p className="font-mono text-xs text-muted lowercase">Phone · {profile.name}</p>
          <DisplayTitle className="mt-2 text-6xl sm:text-7xl lg:text-8xl">Contact</DisplayTitle>
          <p className="mt-4 max-w-[60ch] text-muted">Send a message below, or pick whichever channel suits you.</p>
        </header>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12">
          <section aria-labelledby="contact-options">
            <h2 id="contact-options" className="font-display text-3xl text-ink lg:text-4xl">
              <span>Contacts</span>
            </h2>
            <Contacts className="mt-5" />
          </section>

          <section aria-labelledby="contact-message">
            <h2 id="contact-message" className="font-display text-3xl text-ink lg:text-4xl">
              <span>Messages</span>
            </h2>
            <div className="mt-5 overflow-hidden rounded-3xl border border-ink/12 bg-bg shadow-[0_30px_80px_-40px_rgb(0_0_0/0.5)]">
              <div className="flex items-center gap-3 border-b border-ink/10 bg-surface px-4 py-3">
                <span aria-hidden="true" className="bg-blue flex size-9 items-center justify-center rounded-full font-display text-sm text-bg">
                  S
                </span>
                <span>
                  <span className="block leading-tight font-semibold text-ink">{profile.name}</span>
                  <span className="block text-sm leading-tight text-muted">{profile.title}</span>
                </span>
              </div>
              <Messages variant="page" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
