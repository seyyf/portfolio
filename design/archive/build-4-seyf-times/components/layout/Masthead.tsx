import Link from "next/link"

import { SectionNav, SectionsMenu } from "@/components/layout/SectionNav"
import { Rule } from "@/components/shared/Rule"
import { paper } from "@/data/profile"

/** The full masthead: blackletter title, motto, double rule, section navigation. */
export function Masthead() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <div className="flex flex-col items-center pt-4 pb-3 text-center sm:pt-6">
        <Link href="/" aria-label={`${paper.name}, front page`} className="block">
          <span
            id="masthead-title"
            className="font-masthead block text-[clamp(2.35rem,10.5vw,6.6rem)] leading-[1.05] tracking-[0.005em]"
          >
            {paper.name}
          </span>
        </Link>
        <p className="mt-1 font-body text-[0.98rem] text-gray italic sm:text-lg">&ldquo;{paper.motto}&rdquo;</p>
      </div>
      <div id="masthead-rule">
        <Rule double />
      </div>
      <div className="relative flex items-center justify-center py-0.5">
        <SectionNav id="masthead" />
        <SectionsMenu className="w-full text-center" />
      </div>
      <div className="rule-thin" />
    </div>
  )
}
