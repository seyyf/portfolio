import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { profile } from "@/lib/content"

export const alt = `${profile.name}, ${profile.title}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const fontDir = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans")

// Brand mesh gradient (develop -> preview -> ship), each stop a soft circle fully inside the canvas.
const mesh = [
  "radial-gradient(circle at 58% 40%, rgba(0,124,240,0.75) 0%, rgba(0,124,240,0) 26%)",
  "radial-gradient(circle at 66% 20%, rgba(0,223,216,0.7) 0%, rgba(0,223,216,0) 22%)",
  "radial-gradient(circle at 73% 46%, rgba(121,40,202,0.7) 0%, rgba(121,40,202,0) 25%)",
  "radial-gradient(circle at 80% 25%, rgba(255,0,128,0.65) 0%, rgba(255,0,128,0) 22%)",
  "radial-gradient(circle at 86% 52%, rgba(255,77,77,0.65) 0%, rgba(255,77,77,0) 23%)",
  "radial-gradient(circle at 92% 28%, rgba(249,203,40,0.7) 0%, rgba(249,203,40,0) 22%)",
].join(", ")

// Cached so the image is still prerendered at build time (file reads are uncached data).
async function loadFonts() {
  "use cache"
  const [semiBold, regular] = await Promise.all([
    readFile(join(fontDir, "Geist-SemiBold.ttf")),
    readFile(join(fontDir, "Geist-Regular.ttf")),
  ])
  return { semiBold: new Uint8Array(semiBold), regular: new Uint8Array(regular) }
}

export default async function OpengraphImage() {
  const { semiBold, regular } = await loadFonts()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#ffffff",
          color: "#171717",
          fontFamily: "Geist",
          padding: 80,
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", backgroundImage: mesh }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 14,
              background: "#171717",
              color: "#ffffff",
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: -1,
            }}
          >
            SM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 88, fontWeight: 600, letterSpacing: -4.4, lineHeight: 1 }}>{profile.name}</div>
            <div style={{ marginTop: 16, fontSize: 48, fontWeight: 600, letterSpacing: -2.4, color: "#4d4d4d" }}>
              {`${profile.title}.`}
            </div>
            <div style={{ marginTop: 32, fontSize: 26, fontWeight: 400, color: "#4d4d4d" }}>
              {`React · Next.js · Node.js · TypeScript · ${profile.location}`}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: semiBold.buffer, weight: 600, style: "normal" },
        { name: "Geist", data: regular.buffer, weight: 400, style: "normal" },
      ],
    }
  )
}
