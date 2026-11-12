import { container } from "@/components/site/primitives"
import { about } from "@/lib/content"

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-canvas-soft py-16 md:py-24">
      <div className={container} data-reveal>
        <h2 id="about-heading" className="max-w-[792px] text-display-lg text-ink">
          {about.heading}
        </h2>
        <div className="mt-6 max-w-[690px] space-y-4 text-body-lg text-body">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <dl className="mt-12 grid gap-4 border-t border-hairline pt-6 sm:grid-cols-3 sm:gap-6">
          {about.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="font-mono text-caption text-body">{fact.label}</dt>
              <dd className="mt-2 text-display-sm text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
