import { Download } from "lucide-react"
import Link from "next/link"

import { Halftone } from "@/components/shared/Halftone"
import { Rule } from "@/components/shared/Rule"
import { atAGlance, profile } from "@/data/profile"
import { cn } from "@/lib/utils"

/** Side column of the front page: who Seyf is, CV, contact and the key facts. */
export function WhoIsSeyf({ className }: { className?: string }) {
  return (
    <aside aria-labelledby="who-is-seyf" className={cn("relative", className)}>
      {/* Column rule between the lead story and this column (desktop only). */}
      <Rule vertical className="absolute top-0 -left-6 hidden lg:block" />

      <h2 id="who-is-seyf" className="font-headline text-3xl font-black tracking-tight">
        Who is Seyf?
      </h2>

      <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:grid-cols-1">
        <figure className="max-w-[15rem] sm:max-w-none">
          <Halftone
            src={profile.portrait.src}
            alt={profile.portrait.alt}
            width={profile.portrait.width}
            height={profile.portrait.height}
            sizes="(min-width: 1024px) 26vw, (min-width: 640px) 13rem, 15rem"
            className="aspect-[4/5]"
          />
        </figure>

        <div>
          <p className="font-headline text-2xl leading-tight font-bold">{profile.name}</p>
          <p className="label mt-1.5 text-gray">{profile.title}</p>
          <p className="byline mt-1">
            {profile.yearsExperience} years · {profile.location}
          </p>
          <p className="mt-4 leading-relaxed">{profile.bio}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={profile.cv} download={profile.cvFileName} className="btn-ink">
              <Download size={16} aria-hidden="true" />
              Download CV
            </a>
            <Link href="/contact" className="btn-ink btn-outline">
              Contact me
            </Link>
          </div>
        </div>
      </div>

      <section aria-labelledby="at-a-glance" className="mt-8 border border-rule p-5">
        <h3 id="at-a-glance" className="label">
          At a glance
        </h3>
        <dl className="mt-3 divide-y divide-rule/20">
          {atAGlance.map((item) => (
            <div key={item.label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="font-sans text-xs font-semibold tracking-[0.1em] text-gray uppercase">{item.label}</dt>
              <dd className="text-right font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Link href="/print" className="group mt-5 inline-flex min-h-11 items-center gap-1.5 font-sans text-sm font-semibold">
        <span className="headline-link">Read the Print Edition (one-page résumé)</span>
        <span aria-hidden="true">→</span>
      </Link>
    </aside>
  )
}
