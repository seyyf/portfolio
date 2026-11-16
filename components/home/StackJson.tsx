import { Reveal } from "@/components/ui/Reveal"
import { profile } from "@/data/profile"
import { locales, skillGroupLabels, skills } from "@/data/skills"

const Key = ({ k }: { k: string }) => <span className="text-accent">&quot;{k}&quot;</span>
// Short strings never break inside; only the long tool descriptions may wrap.
const Str = ({ s }: { s: string }) => <span className={s.length < 28 ? "whitespace-nowrap text-tag-improved" : "text-tag-improved"}>&quot;{s}&quot;</span>
const P = ({ children }: { children: React.ReactNode }) => <span className="text-muted">{children}</span>

/** The stack as a package.json card (for developers), then the same skills as plain chips (for everyone). */
export function StackJson() {
  const groups = Object.entries(skills) as [keyof typeof skills, readonly string[]][]

  return (
    <section id="stack" aria-labelledby="stack-title" className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 md:py-28">
      <h2 id="stack-title" className="text-3xl font-semibold sm:text-4xl">
        Stack
      </h2>
      <p className="mt-3 max-w-[60ch] text-muted">What I build with, as a developer would read it. No versions, no percentages: just what I use.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <Reveal>
          <figure className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
            <figcaption className="flex items-center gap-2 border-b border-border px-4 py-2.5 font-mono text-[0.8125rem] text-muted">
              <span aria-hidden="true" className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
              </span>
              <span className="ml-2">package.json</span>
            </figcaption>
            {/* Real text, laid out as JSON: wraps on small screens instead of scrolling sideways. */}
            <div className="p-4 font-mono text-[0.8125rem] leading-[1.75] text-ink sm:p-6 sm:text-sm" translate="no">
              <P>{"{"}</P>
              <div className="pl-[2ch]">
                <div>
                  <Key k="name" />
                  <P>: </P>
                  <Str s="seyf-mejri" />
                  <P>,</P>
                </div>
                <div>
                  <Key k="description" />
                  <P>: </P>
                  <Str s={profile.title} />
                  <P>,</P>
                </div>
                {groups.map(([group, list]) => (
                  <div key={group} className="pl-[2ch] -indent-[2ch]">
                    <Key k={group} />
                    <P>: [</P>
                    {list.map((s, i) => (
                      <span key={s}>
                        <Str s={s} />
                        {i < list.length - 1 && <P>, </P>}
                      </span>
                    ))}
                    <P>],</P>
                  </div>
                ))}
                <div>
                  <Key k="locales" />
                  <P>: {"{"} </P>
                  {locales.map((l, i) => (
                    <span key={l.code}>
                      <Key k={l.code} />
                      <P>: </P>
                      <Str s={l.level} />
                      {i < locales.length - 1 && <P>, </P>}
                    </span>
                  ))}
                  <P> {"}"}</P>
                </div>
              </div>
              <P>{"}"}</P>
            </div>
          </figure>
        </Reveal>

        <Reveal delay={0.08}>
          <h3 className="text-lg font-semibold tracking-tight">The same, in plain English</h3>
          <dl className="mt-5 grid gap-5">
            {groups.map(([group, list]) => (
              <div key={group}>
                <dt className="text-sm text-muted">{skillGroupLabels[group]}</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {list.map((s) => (
                    <span key={s} className="rounded-md border border-border bg-surface px-2.5 py-1 text-[0.9375rem]">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
            <div>
              <dt className="text-sm text-muted">{skillGroupLabels.locales}</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {locales.map((l) => (
                  <span key={l.code} className="rounded-md border border-border bg-surface px-2.5 py-1 text-[0.9375rem]">
                    {l.language} <span className="text-muted">({l.level})</span>
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
