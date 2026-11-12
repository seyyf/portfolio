import { CanvasTexture, Color, MeshStandardMaterial, SRGBColorSpace } from "three"

// Shared flat-shaded pastel materials, cached by color so the whole city uses a handful of programs.

const cache = new Map<string, MeshStandardMaterial>()

export function mat(color: string, opts: { rough?: number; metal?: number; emissive?: string; emissiveIntensity?: number } = {}) {
  const key = `${color}|${opts.rough ?? 0.85}|${opts.metal ?? 0}|${opts.emissive ?? ""}|${opts.emissiveIntensity ?? 0}`
  let m = cache.get(key)
  if (!m) {
    m = new MeshStandardMaterial({
      color,
      flatShading: true,
      roughness: opts.rough ?? 0.85,
      metalness: opts.metal ?? 0,
    })
    if (opts.emissive) {
      m.emissive = new Color(opts.emissive)
      m.emissiveIntensity = opts.emissiveIntensity ?? 1
    }
    cache.set(key, m)
  }
  return m
}

/** City palette for buildings and props. */
export const C = {
  cream: "#FFF4E6",
  creamDeep: "#F7E4CD",
  mint: "#A8E6CF",
  mintDeep: "#7FD3B0",
  grass: "#B9EBC8",
  coral: "#FF8B94",
  coralDeep: "#F2727D",
  sky: "#A0D2EB",
  skyDeep: "#7DBCDD",
  butter: "#FFD97D",
  lavender: "#C3B1E1",
  lavenderDeep: "#A895CF",
  ink: "#2B2D42",
  road: "#C9C6D9",
  sidewalk: "#F3E6D6",
  white: "#FFFDF8",
  wood: "#D9A47A",
  trunk: "#B98A66",
  peach: "#FFD3B8",
  slate: "#8A93B8",
  glass: "#CFE8F5",
  glow: "#FFC46B",
  night: "#1B1F3B",
}

/** Reads the Fredoka family that next/font registered, for drawing text on canvases. */
export function displayFontFamily() {
  if (typeof document === "undefined") return "sans-serif"
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-fredoka").trim()
  return v || "sans-serif"
}

type TextTextureOptions = {
  width?: number
  height?: number
  bg?: string
  fg?: string
  font?: number
  weight?: number
  radius?: number
  border?: string
  lines?: string[]
}

/** Draws a rounded sign with centred text into a texture. Redraws once web fonts are ready. */
export function createTextTexture(text: string, o: TextTextureOptions = {}) {
  const width = o.width ?? 512
  const height = o.height ?? 128
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4

  const draw = () => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    if (o.bg) {
      const r = o.radius ?? height * 0.3
      ctx.fillStyle = o.bg
      ctx.beginPath()
      ctx.roundRect(4, 4, width - 8, height - 8, r)
      ctx.fill()
      if (o.border) {
        ctx.lineWidth = 6
        ctx.strokeStyle = o.border
        ctx.stroke()
      }
    }
    ctx.fillStyle = o.fg ?? C.ink
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const lines = o.lines ?? [text]
    const size = o.font ?? height * 0.5
    ctx.font = `${o.weight ?? 600} ${size}px ${displayFontFamily()}`
    const lh = size * 1.15
    const y0 = height / 2 - ((lines.length - 1) * lh) / 2
    lines.forEach((line, i) => {
      // Shrink to fit long lines.
      let s = size
      while (ctx.measureText(line).width > width * 0.88 && s > 10) {
        s -= 2
        ctx.font = `${o.weight ?? 600} ${s}px ${displayFontFamily()}`
      }
      ctx.fillText(line, width / 2, y0 + i * lh + size * 0.04)
      ctx.font = `${o.weight ?? 600} ${size}px ${displayFontFamily()}`
    })
    texture.needsUpdate = true
  }

  draw()
  if (typeof document !== "undefined" && document.fonts) {
    document.fonts
      .load(`${o.weight ?? 600} 40px ${displayFontFamily()}`)
      .then(draw)
      .catch(() => {})
  }
  return texture
}
