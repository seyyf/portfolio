import { Changelog } from "@/components/home/Changelog"
import { Contact } from "@/components/home/Contact"
import { FeaturedRelease } from "@/components/home/FeaturedRelease"
import { Hero } from "@/components/home/Hero"
import { Projects } from "@/components/home/Projects"
import { StackJson } from "@/components/home/StackJson"

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedRelease />
      <Changelog />
      <Projects />
      <StackJson />
      <Contact />
    </>
  )
}
