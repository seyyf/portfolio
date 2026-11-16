import { Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { ButtonAnchor, ButtonLink } from "@/components/ui/Button"
import { profile } from "@/data/profile"

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-[1120px] px-4 pt-10 pb-16 sm:px-6 md:pt-20 md:pb-24">
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_17rem] lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div>
          <Image
            src={profile.portrait.src}
            alt={profile.portrait.alt}
            width={profile.portrait.width}
            height={profile.portrait.height}
            priority
            unoptimized
            className="dim-at-night mb-6 size-20 rounded-[var(--radius-card)] border border-border bg-surface md:hidden"
          />
          <p className="font-mono text-sm text-muted">
            {profile.location} · {profile.yearsShipping} years shipping
          </p>
          <h1 id="hero-title" className="mt-4 max-w-[18ch] text-[2.5rem] font-semibold sm:text-5xl lg:text-[4rem]">
            {profile.headline}
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-muted md:text-xl">{profile.sub}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonAnchor href={profile.cvPdf} download>
              <Download aria-hidden="true" className="size-4" />
              Download CV
            </ButtonAnchor>
            <ButtonLink href="/#contact" variant="outline">
              Contact me
            </ButtonLink>
            <Link href="/cv" className="px-1 text-[0.9375rem] text-muted underline decoration-border underline-offset-4 hover:text-ink hover:decoration-ink">
              One-page résumé
            </Link>
          </div>

          <ul aria-label="At a glance" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 font-mono text-sm text-muted">
            {profile.atAGlance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <Image
          src={profile.portrait.src}
          alt=""
          width={profile.portrait.width}
          height={profile.portrait.height}
          priority
          unoptimized
          className="dim-at-night hidden aspect-square w-full rounded-[var(--radius-card)] border border-border bg-surface md:block"
        />
      </div>
    </section>
  )
}
