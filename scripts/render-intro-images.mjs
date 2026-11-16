// Renders the loading-screen illustrations (original SVG art in scripts/intro-art/) to WebP.
// next/image then serves them resized as AVIF/WebP.
//
//   node scripts/render-intro-images.mjs
//
// Output: public/images/intro/portrait.webp (placeholder portrait, 900x1200),
// sunset.webp (1200x800) and sidi-bou-said.webp (900x1200).

import { mkdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const src = path.join(root, "scripts", "intro-art")
const out = path.join(root, "public", "images", "intro")

const images = [
  { name: "portrait", width: 900, height: 1200 },
  { name: "sunset", width: 1200, height: 800 },
  { name: "sidi-bou-said", width: 900, height: 1200 },
]

await mkdir(out, { recursive: true })

for (const { name, width, height } of images) {
  const svg = await readFile(path.join(src, `${name}.svg`))
  const file = path.join(out, `${name}.webp`)
  await sharp(svg, { density: 96 }).resize(width, height).webp({ quality: 80, effort: 6, smartSubsample: true }).toFile(file)
  const { size } = await stat(file)
  console.log(`${path.relative(root, file)}  ${width}x${height}  ${(size / 1024).toFixed(1)} KB`)
}
