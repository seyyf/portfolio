import { container } from "@/components/site/primitives"
import { education, languages } from "@/lib/content"

export function Education() {
  return (
    <section id="education" aria-label="Education and languages" className="bg-canvas-soft pb-16 md:pb-24">
      <div
        data-reveal
        className={`${container} grid gap-12 border-t border-hairline pt-12 md:grid-cols-12 md:gap-6 md:pt-16`}
      >
        <div className="md:col-span-7">
          <h2 className="text-display-md text-ink">Education.</h2>
          <ul className="mt-6 space-y-6">
            {education.map((item) => (
              <li key={item.degree} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div>
                  <p className="text-body-md font-medium text-ink">{item.degree}</p>
                  <p className="text-body-sm text-body">{item.school}</p>
                </div>
                <p className="shrink-0 font-mono text-caption text-body">{item.years}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <h2 className="text-display-md text-ink">Languages.</h2>
          <dl className="mt-6 space-y-4">
            {languages.map((lang) => (
              <div key={lang.name} className="flex items-baseline justify-between gap-6">
                <dt className="text-body-md font-medium text-ink">{lang.name}</dt>
                <dd className="font-mono text-caption text-body">{lang.level}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
