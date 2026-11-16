import { ArrowUpRight, Download } from "lucide-react"

import { profile } from "@/data/profile"

import { ContactForm } from "./ContactForm"

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-border bg-surface/60">
      <div className="mx-auto grid max-w-[1120px] gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
        <div>
          <p className="font-mono text-sm text-muted">v6.0 · upcoming</p>
          <h2 id="contact-title" className="mt-3 text-4xl font-semibold sm:text-5xl">
            Ship v6.0 together
          </h2>
          <p className="mt-4 text-muted">{profile.availability}</p>

          <a
            href={`mailto:${profile.email}`}
            className="mt-10 inline-block text-[clamp(1.375rem,5.4vw,2.25rem)] font-semibold tracking-tight break-all text-accent underline decoration-accent/30 decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent"
          >
            {profile.email}
          </a>

          <ul className="mt-8 grid gap-3 text-[1.0625rem]">
            <li>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                LinkedIn
                <span className="font-mono text-sm text-muted">{profile.linkedinLabel.replace("linkedin.com", "")}</span>
                <ArrowUpRight aria-hidden="true" className="size-4 text-muted" />
              </a>
            </li>
            <li>
              <a href={profile.cvPdf} download className="inline-flex items-center gap-2 hover:text-accent">
                Download CV
                <span className="font-mono text-sm text-muted">PDF</span>
                <Download aria-hidden="true" className="size-4 text-muted" />
              </a>
            </li>
          </ul>
        </div>

        <ContactForm />
      </div>
    </section>
  )
}
