import { SiteHeader } from "@/components/site/site-header"
import { About } from "@/components/sections/about"
import { CaseStudy } from "@/components/sections/case-study"
import { Contact } from "@/components/sections/contact"
import { Education } from "@/components/sections/education"
import { Experience } from "@/components/sections/experience"
import { Hero } from "@/components/sections/hero"
import { Projects } from "@/components/sections/projects"
import { SiteFooter } from "@/components/sections/site-footer"
import { Skills } from "@/components/sections/skills"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <CaseStudy />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
