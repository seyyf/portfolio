"use client"

import { motion, useReducedMotion } from "framer-motion"
import { CalendarDays, ChevronRight, Download, Eye, FileText, Folder, Globe, Images, type LucideIcon } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { Sheet } from "@/components/shared/Sheet"
import { profile } from "@/data/profile"
import { projects } from "@/data/projects"
import { fade, springs } from "@/lib/animations"
import { useOSNav } from "@/lib/nav"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

const photoCount = projects.reduce((n, p) => n + p.images.length, 0)

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Fires the "CV downloaded" live activity in the pill. */
function announceDownload() {
  useOS.getState().showActivity({ id: "cv", icon: "📄", label: "CV downloaded", tone: "success" }, 2600)
  playSfx("pop")
}

/** Files: the CV (preview and download), plus shortcuts to the résumé and the project apps. */
export default function FilesApp() {
  const { open, resume } = useOSNav()
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [preview, setPreview] = useState(false)
  const [size, setSize] = useState<string | null>(null)

  // Real file size from a HEAD request; the row simply says "PDF" until (or unless) it arrives.
  useEffect(() => {
    const ctrl = new AbortController()
    fetch(profile.cv, { method: "HEAD", signal: ctrl.signal })
      .then((res) => {
        const len = Number(res.headers.get("content-length"))
        if (res.ok && len > 0) setSize(formatSize(len))
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  const meta = size ? `PDF · ${size}` : "PDF document"

  const folders: { icon: LucideIcon; tint: string; label: string; detail: string; onClick: () => void }[] = [
    { icon: Images, tint: "bg-coral", label: "Screenshots", detail: `${photoCount} photos in Photos`, onClick: () => open("photos") },
    { icon: Globe, tint: "bg-sky", label: "Websites", detail: "Febal Casa, Aurelia, Weedy", onClick: () => open("browser") },
    { icon: CalendarDays, tint: "bg-butter", label: "Career", detail: "Timeline in Calendar", onClick: () => open("calendar") },
  ]

  return (
    <AppScreen title="Files">
      <div className="flex flex-col gap-6 px-4 pb-6">
        {/* Featured file */}
        <motion.section
          aria-labelledby="files-cv"
          className="card flex flex-col items-center p-5 text-center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduce ? fade : springs.bouncy}
        >
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="rounded-2xl p-1 transition-transform active:scale-95"
            aria-label={`Preview ${profile.cvFileName}`}
          >
            <PdfThumb />
          </button>
          <h2 id="files-cv" className="mt-3 text-[1.05rem] font-semibold break-all">
            {profile.cvFileName}
          </h2>
          <p className="text-sm text-text-soft">{meta}</p>
          <div className="mt-4 grid w-full grid-cols-2 gap-2">
            <button type="button" onClick={() => setPreview(true)} className="btn btn-soft">
              <Eye size={18} aria-hidden="true" />
              Preview
            </button>
            <a href={profile.cv} download={profile.cvFileName} onClick={announceDownload} className="btn btn-accent">
              <Download size={18} aria-hidden="true" />
              Download
            </a>
          </div>
        </motion.section>

        <FileGroup title="Documents">
          <FileRow icon={FileText} tint="bg-coral" label={profile.cvFileName} detail={meta} onClick={() => setPreview(true)} first />
          <FileRow icon={FileText} tint="bg-lavender" label="Résumé, one page" detail="Opens Focus Mode" onClick={resume} />
        </FileGroup>

        <FileGroup title="Projects">
          {folders.map((f, i) => (
            <FileRow key={f.label} icon={f.icon} tint={f.tint} label={f.label} detail={f.detail} onClick={f.onClick} first={i === 0} folder />
          ))}
        </FileGroup>
      </div>

      <Sheet open={preview} onOpenChange={setPreview} title={profile.cvFileName} description={meta}>
        <div className="overflow-hidden rounded-2xl bg-surface-2">
          <object data={`${profile.cv}#view=FitH`} type="application/pdf" aria-label={`${profile.name} CV`} className="block h-[min(58vh,520px)] w-full">
            <div className="flex h-[min(40vh,280px)] flex-col items-center justify-center gap-3 p-6 text-center">
              <PdfThumb small />
              <p className="text-sm text-text-soft">This browser can&apos;t show the PDF here.</p>
              <a href={profile.cv} target="_blank" rel="noreferrer" className="btn btn-soft">
                Open the PDF
              </a>
            </div>
          </object>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={profile.cv} target="_blank" rel="noreferrer" className="btn btn-soft">
            Open in new tab
          </a>
          <a href={profile.cv} download={profile.cvFileName} onClick={announceDownload} className="btn btn-accent">
            <Download size={18} aria-hidden="true" />
            Download
          </a>
        </div>
      </Sheet>
    </AppScreen>
  )
}

function FileGroup({ title, children }: { title: string; children: ReactNode }) {
  const id = `files-${title.toLowerCase()}`
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-1.5 px-4 text-[0.8125rem] font-semibold text-text-soft">
        {title}
      </h2>
      <ul className="overflow-hidden rounded-[22px] bg-surface shadow-[0_1px_2px_rgba(31,34,51,0.05)]">{children}</ul>
    </section>
  )
}

type FileRowProps = {
  icon: LucideIcon
  tint: string
  label: string
  detail: string
  onClick: () => void
  first?: boolean
  folder?: boolean
}

function FileRow({ icon: Icon, tint, label, detail, onClick, first, folder }: FileRowProps) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex min-h-14 w-full items-stretch gap-3 pl-3.5 text-left transition-colors active:bg-surface-2">
        <span className="relative my-auto grid size-9 shrink-0 place-items-center" aria-hidden="true">
          {folder ? (
            <>
              <Folder size={36} strokeWidth={1.5} className="absolute text-sky" fill="currentColor" />
              <Icon size={14} strokeWidth={2.4} className="relative mt-1.5 text-ink" />
            </>
          ) : (
            <span className={cn("grid size-8 place-items-center rounded-[9px] text-ink", tint)}>
              <Icon size={17} strokeWidth={2.2} />
            </span>
          )}
        </span>
        <span className={cn("flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-4", !first && "border-t border-line")}>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.96875rem] font-medium">{label}</span>
            <span className="block truncate text-[0.8125rem] text-text-soft">{detail}</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-text-soft" aria-hidden="true" />
        </span>
      </button>
    </li>
  )
}

/** A little paper icon for the PDF (original drawing). */
function PdfThumb({ small }: { small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 80"
      className={cn("drop-shadow-[0_6px_14px_rgba(31,34,51,0.18)]", small ? "h-16 w-13" : "h-24 w-19")}
    >
      <path d="M8 2h34l20 20v52a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" fill="#fff" />
      <path d="M42 2v16a4 4 0 0 0 4 4h16z" fill="#e9e6f2" />
      <rect x="12" y="30" width="30" height="4" rx="2" fill="#d9d6e6" />
      <rect x="12" y="39" width="40" height="3" rx="1.5" fill="#e6e3ef" />
      <rect x="12" y="46" width="36" height="3" rx="1.5" fill="#e6e3ef" />
      <rect x="12" y="53" width="38" height="3" rx="1.5" fill="#e6e3ef" />
      <rect x="10" y="62" width="26" height="12" rx="4" fill="#ff8b94" />
      <text x="23" y="71.2" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1f2233" fontFamily="system-ui, sans-serif">
        PDF
      </text>
    </svg>
  )
}
