import type { Metadata } from "next"

import { ClassifiedAd } from "@/components/contact/ClassifiedAd"
import { PlaceAdForm } from "@/components/contact/PlaceAdForm"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"
import { Rule } from "@/components/shared/Rule"
import { profile } from "@/data/profile"

export const metadata: Metadata = {
  title: "Classifieds: Contact",
  description: `Contact ${profile.name}, ${profile.title} in Tunis, open to remote work: email ${profile.email}, LinkedIn, CV download, or place an ad with the contact form.`,
  alternates: { canonical: "/contact" },
}

const linkClass = "underline decoration-1 underline-offset-4 hover:text-accent-ink break-words"

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="kicker">Contact</p>
          <Reveal as="h1" variant="words" className="mt-3 font-headline text-[2.8rem] leading-[1.05] font-black sm:text-[4rem]">
            Classifieds
          </Reveal>
          <p className="mx-auto mt-4 max-w-[58ch] text-[1.125rem] leading-relaxed text-gray">
            Notices, wants and offers. Reply by email, or place your own ad below.
          </p>
        </header>

        <Rule double className="mt-8 mb-8" />

        <Reveal variant="fade">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ClassifiedAd featured category="Situations wanted" heading="Wanted:" className="sm:col-span-2 lg:row-span-2">
              <p>
                A team that needs a fullstack developer who ships. {profile.yearsExperience} years experience. React, Next.js, Node.js.
              </p>
              <p className="mt-4 font-sans text-[1rem] font-semibold tracking-wide uppercase">
                Reply to:{" "}
                <a href={`mailto:${profile.email}`} className={`${linkClass} normal-case`}>
                  {profile.email}
                </a>
              </p>
            </ClassifiedAd>

            <ClassifiedAd category="Networking" heading="LinkedIn">
              <p>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {profile.linkedinLabel}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            </ClassifiedAd>

            <ClassifiedAd category="Documents" heading="CV available">
              <p>
                <a href={profile.cv} download={profile.cvFileName} className={linkClass}>
                  Download the CV (PDF)
                </a>
              </p>
            </ClassifiedAd>

            <ClassifiedAd category="Location" heading={`Based in ${profile.city}`}>
              <p>Open to remote.</p>
            </ClassifiedAd>

            <ClassifiedAd category="Languages" heading="Speaks Arabic, English, French" />
          </div>
        </Reveal>

        <section aria-label="Contact form" className="mx-auto mt-14 max-w-3xl sm:mt-20">
          <PlaceAdForm />
        </section>
      </div>
    </PageTransition>
  )
}
