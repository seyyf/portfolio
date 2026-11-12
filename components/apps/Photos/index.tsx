"use client"

import { LayoutGroup, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useCallback, useRef, useState } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { projects } from "@/data/projects"
import { useBackLayer } from "@/lib/backStack"
import { useOS } from "@/lib/store"

import { Viewer, type Album } from "./Viewer"

const albums: Album[] = projects
  .filter((p) => p.images.length > 0)
  .map((p) => ({
    id: p.id,
    name: p.name,
    photos: p.images.map((img, i) => ({ ...img, key: `${p.id}-${i}` })),
  }))

const total = albums.reduce((n, a) => n + a.photos.length, 0)

/** Thumbnails keep a pleasant shape in the grid: very tall page captures are cropped from the top. */
const thumbRatio = (w: number, h: number) => Math.min(1.7, Math.max(0.62, w / h))

export type ViewState = { album: number; index: number; dir: number; hero: string | null }

/** Photos: project screenshots as albums in a masonry grid, with a full-screen viewer. */
export default function PhotosApp() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [view, setView] = useState<ViewState | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  const openPhoto = (album: number, index: number, el: HTMLElement) => {
    opener.current = el
    setView({ album, index, dir: 0, hero: reduce ? null : albums[album].photos[index].key })
  }

  const navigate = useCallback((dir: number) => {
    setView((v) => {
      if (!v) return v
      const index = v.index + dir
      if (index < 0 || index >= albums[v.album].photos.length) return v
      // Once you move away from the photo you opened, closing fades instead of flying back.
      return { ...v, index, dir, hero: null }
    })
  }, [])

  const close = useCallback(() => {
    // Two steps: first mark the slide as closing (dir 0, so it fades instead of sliding), then remove it.
    setView((v) => (v ? { ...v, dir: 0 } : v))
    requestAnimationFrame(() => {
      setView(null)
      opener.current?.focus({ preventScroll: true })
    })
  }, [])
  // The phone's back button closes the full-screen photo before the app.
  useBackLayer(view !== null, close)

  return (
    <AppScreen title="Photos" subtitle={`${total} photos in ${albums.length} albums`}>
      <LayoutGroup id="photos">
        <ul className="columns-2 gap-3 px-4 pb-4" aria-label="Albums">
          {albums.map((album, a) => (
            <li key={album.id} className="mb-5 break-inside-avoid">
              <section aria-labelledby={`album-${album.id}`}>
                <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
                  <h2 id={`album-${album.id}`} className="truncate font-display text-[1.05rem] leading-tight font-semibold">
                    {album.name}
                  </h2>
                  <span className="shrink-0 text-xs font-semibold text-text-soft tabular-nums">
                    {album.photos.length} {album.photos.length === 1 ? "photo" : "photos"}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {album.photos.map((photo, i) => {
                    const active = view?.album === a && view.index === i
                    return (
                      <li key={photo.key}>
                        <motion.button
                          type="button"
                          layoutId={reduce ? undefined : `photo-${photo.key}`}
                          onClick={(e) => openPhoto(a, i, e.currentTarget)}
                          aria-haspopup="dialog"
                          aria-current={active ? "true" : undefined}
                          className="relative block w-full overflow-hidden bg-surface-2 shadow-(--shadow) transition-[filter] hover:brightness-[1.03] active:brightness-95"
                          style={{ aspectRatio: thumbRatio(photo.width, photo.height), borderRadius: 16 }}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                        >
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            width={photo.width}
                            height={photo.height}
                            sizes="(max-width: 430px) 50vw, 200px"
                            unoptimized={photo.src.endsWith(".svg")}
                            draggable={false}
                            className="pointer-events-none size-full object-cover object-top"
                          />
                        </motion.button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            </li>
          ))}
        </ul>
        <p className="px-5 pb-2 text-center text-xs text-text-soft">Tap a photo to open it. Swipe to browse an album.</p>

        <Viewer albums={albums} view={view} onNavigate={navigate} onClose={close} reduce={reduce} />
      </LayoutGroup>
    </AppScreen>
  )
}
