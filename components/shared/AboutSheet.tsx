"use client"

import { ExternalLink, FileText } from "lucide-react"

import { Sheet } from "@/components/shared/Sheet"
import { projectById, type ProjectId } from "@/data/projects"
import { useOSNav } from "@/lib/nav"

/** "About this project": role, dates, what I did, stack and links. */
export function AboutSheet({ project, open, onOpenChange }: { project: ProjectId; open: boolean; onOpenChange: (o: boolean) => void }) {
  const p = projectById[project]
  const { resume } = useOSNav()
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={`About ${p.name}`} description={p.tagline}>
      {p.roles.length > 0 && (
        <ul className="space-y-1.5">
          {p.roles.map((r) => (
            <li key={r.company + r.title} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-semibold">
                {r.title}
                {r.company && r.company !== p.name ? `, ${r.company}` : ""}
              </span>
              {r.start && (
                <span className="text-sm text-text-soft tabular-nums">
                  {r.start} – {r.end}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <h3 className="mt-5 text-sm font-semibold text-text-soft">What I did</h3>
      <ul className="mt-2 space-y-2">
        {p.story.map((line) => (
          <li key={line} className="flex gap-2.5 leading-relaxed">
            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-coral" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {p.stack.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-semibold text-text-soft">Stack</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Stack">
            {p.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {p.url && (
          <a className="btn" href={p.url} target="_blank" rel="noreferrer">
            <ExternalLink size={18} aria-hidden="true" />
            Visit live site
          </a>
        )}
        <button type="button" className="btn btn-soft" onClick={resume}>
          <FileText size={18} aria-hidden="true" />
          See the résumé
        </button>
      </div>
    </Sheet>
  )
}
