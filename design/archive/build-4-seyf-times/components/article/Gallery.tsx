import { Halftone } from "@/components/shared/Halftone"
import type { Img } from "@/data/projects"
import { cn } from "@/lib/utils"

/** "In Pictures": the story's images with captions. Renders nothing without images. */
export function Gallery({ images, className }: { images: Img[]; className?: string }) {
  if (images.length === 0) return null
  return (
    <section aria-labelledby="gallery-heading" className={className}>
      <h2 id="gallery-heading" className="border-b border-rule pb-2 font-headline text-2xl font-black tracking-tight sm:text-3xl">
        In Pictures
      </h2>
      <div className={cn("mt-6 grid gap-x-10 gap-y-8", images.length > 1 && "md:grid-cols-2")}>
        {images.map((img) => (
          <figure key={img.src}>
            <Halftone
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes={images.length > 1 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1180px) 1100px, 100vw"}
            />
            {img.caption && <figcaption className="mt-2 font-sans text-xs text-gray">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  )
}
