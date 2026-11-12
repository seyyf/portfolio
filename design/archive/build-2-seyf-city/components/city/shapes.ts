import { BufferAttribute, BufferGeometry, CanvasTexture, NearestFilter, SRGBColorSpace } from "three"

import { rand } from "@/lib/world"

const gables = new Map<string, BufferGeometry>()

/** Triangular-prism roof with the ridge along x, base at y = 0. Cached by size. */
export function gableGeometry(w: number, d: number, h: number) {
  const key = `${w}|${d}|${h}`
  const hit = gables.get(key)
  if (hit) return hit
  const x = w / 2
  const z = d / 2
  const FL = [-x, 0, z]
  const FR = [x, 0, z]
  const BL = [-x, 0, -z]
  const BR = [x, 0, -z]
  const RL = [-x, h, 0]
  const RR = [x, h, 0]
  const tris = [FL, FR, RR, FL, RR, RL, BR, BL, RL, BR, RL, RR, BL, FL, RL, FR, BR, RR, FL, BL, BR, FL, BR, FR]
  const g = new BufferGeometry()
  g.setAttribute("position", new BufferAttribute(new Float32Array(tris.flat()), 3))
  g.computeVertexNormals()
  gables.set(key, g)
  return g
}

/** A decorative QR-like pattern (21x21 with finder squares). Not a real code. */
export function qrTexture() {
  const N = 21
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = N * 4 + 16
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#2B2D42"
  const finder = (cx: number, cy: number) =>
    (cx < 7 && cy < 7) || (cx >= N - 7 && cy < 7) || (cx < 7 && cy >= N - 7)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let on = rand(x * 31 + y * 7) > 0.52
      if (finder(x, y)) {
        const fx = x < 7 ? x : x - (N - 7)
        const fy = y < 7 ? y : y - (N - 7)
        const ring = Math.max(Math.abs(fx - 3), Math.abs(fy - 3))
        on = ring !== 2
      }
      if (on) ctx.fillRect(8 + x * 4, 8 + y * 4, 4, 4)
    }
  }
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.magFilter = NearestFilter
  return tex
}
