import type { Metadata } from "next"

import { BottomStrip } from "@/components/front/BottomStrip"
import { LeadStory } from "@/components/front/LeadStory"
import { MoreStories } from "@/components/front/MoreStories"
import { WhoIsSeyf } from "@/components/front/WhoIsSeyf"
import { Ticker } from "@/components/layout/Ticker"
import { PageTransition } from "@/components/shared/PageTransition"
import { Rule } from "@/components/shared/Rule"
import { paper, profile } from "@/data/profile"

const title = `${paper.name} · ${profile.name}, ${profile.title}`
const description = `${profile.name}, ${profile.title} in ${profile.city}, with ${profile.yearsExperience} years of experience building React/Next.js frontends and Node.js backends. Case studies, career and contact, printed as a newspaper.`

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: paper.name, title, description, url: "/" },
}

export default function FrontPage() {
  return (
    <PageTransition>
      <div>
        <Ticker />
        <div className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-16 sm:px-6 lg:pt-10 lg:pb-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-8">
              <LeadStory />
            </div>
            <WhoIsSeyf className="rule-double mt-12 pt-8 lg:col-span-4 lg:mt-0 lg:border-t-0 lg:pt-0" />
          </div>

          <Rule double className="my-12 lg:my-16" />
          <MoreStories />

          <Rule double className="my-12 lg:my-16" />
          <BottomStrip />
        </div>
      </div>
    </PageTransition>
  )
}
