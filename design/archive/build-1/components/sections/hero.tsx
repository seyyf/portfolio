import { Badge } from "@/components/ui/badge"
import { ContactButtons, MeshGradient, container } from "@/components/site/primitives"
import { profile } from "@/lib/content"

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden bg-canvas">
      <MeshGradient className="-top-24 -right-36 h-[360px] w-[460px] opacity-45 [mask-image:radial-gradient(closest-side,black_60%,transparent)] md:-top-28 md:-right-24 md:h-[640px] md:w-[880px] md:opacity-75" />
      <div className={`${container} relative pt-16 pb-24 md:pt-24 md:pb-32`}>
        <div className="hero-enter max-w-[792px]">
          <Badge variant="soft">Based in {profile.location}</Badge>
          <h1 id="hero-heading" className="mt-6 text-display-lg text-ink md:text-display-xl">
            {profile.name}{" "}
            <span className="block text-body">{profile.title}.</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-body-lg text-body">{profile.pitch}</p>
          <ContactButtons className="mt-8" />
        </div>
      </div>
    </section>
  )
}
