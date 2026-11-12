import { CopyEmail } from "@/components/site/copy-email"
import { ContactButtons, MeshGradient, container } from "@/components/site/primitives"
import { profile } from "@/lib/content"

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="relative overflow-hidden bg-canvas py-24 md:py-32">
      <MeshGradient className="-right-40 -bottom-32 h-[380px] w-[480px] opacity-45 [mask-image:radial-gradient(closest-side,black_60%,transparent)] md:-right-24 md:-bottom-40 md:h-[600px] md:w-[860px] md:opacity-70" />
      <div className={`${container} relative`}>
        <div data-reveal className="max-w-[792px]">
          <h2 id="contact-heading" className="text-display-lg text-ink md:text-display-xl">
            Get in touch.
          </h2>
          <p className="mt-4 max-w-[560px] text-body-lg text-body">
            Email is the quickest way to reach me. I’m also on LinkedIn.
          </p>
          <ContactButtons className="mt-8" />
          <CopyEmail email={profile.email} className="mt-6" />
        </div>
      </div>
    </section>
  )
}
