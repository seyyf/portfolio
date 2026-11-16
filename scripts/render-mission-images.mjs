// Renders the illustrations for the Educaro before/after slider: original app-like wireframes in
// the site palette. Replace the WebP files with real screenshots (same names and sizes) if you like.
//
//   node scripts/render-mission-images.mjs
//
// Output: public/images/missions/the-rebuild-legacy.webp and the-rebuild-new.webp.

import { mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const C = {
  bg: "#0B0F1A",
  surface: "#141A2A",
  surface2: "#1B2236",
  teal: "#0E3B43",
  ink: "#F5F1EA",
  muted: "#9AA3B5",
  line: "#2A3247",
  pink: "#FF4FA3",
  orange: "#FF8A3D",
  gold: "#FFC94A",
  violet: "#5B2A9E",
  sbs: "#2F6DB5",
}
const SANS = "Segoe UI, Inter, Arial, Helvetica, sans-serif"
const MONO = "Consolas, JetBrains Mono, Menlo, monospace"

// Small deterministic random, so re-running the script gives the same images.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const rect = (x, y, w, h, fill, r = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`
const text = (x, y, s, size, fill, { weight = 400, family = SANS, anchor = "start", spacing = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${esc(s)}</text>`
// A "text line" in a wireframe: a rounded bar.
const bar = (x, y, w, fill = C.line, h = 12) => rect(x, y, w, h, fill, h / 2)

function defs() {
  return `<defs>
    <linearGradient id="sunset" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.pink}"/><stop offset="0.55" stop-color="${C.orange}"/><stop offset="1" stop-color="${C.gold}"/></linearGradient>
    <linearGradient id="sunset-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.pink}"/><stop offset="0.55" stop-color="${C.orange}"/><stop offset="1" stop-color="${C.gold}"/></linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.violet}"/><stop offset="0.6" stop-color="${C.pink}"/><stop offset="1" stop-color="${C.orange}"/></linearGradient>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)"><rect width="14" height="14" fill="${C.surface}"/><line x1="0" y1="0" x2="0" y2="14" stroke="${C.line}" stroke-width="4"/></pattern>
  </defs>`
}

/** Browser window frame with an address bar. Returns [svg, contentBox]. */
function browser(W, H, url, { legacy = false } = {}) {
  const m = Math.round(W * 0.045)
  const x = m
  const y = m
  const w = W - m * 2
  const h = H - m * 2
  const chrome = 52
  const frameFill = legacy ? "#1D2230" : C.surface
  const svg = [
    rect(x, y, w, h, frameFill, legacy ? 4 : 18, `stroke="${C.line}" stroke-width="2"`),
    rect(x, y, w, chrome, legacy ? "#252B3B" : C.surface2, legacy ? 4 : 18),
    rect(x, y + chrome - 18, w, 18, legacy ? "#252B3B" : C.surface2),
    `<circle cx="${x + 28}" cy="${y + 26}" r="7" fill="${C.pink}"/><circle cx="${x + 50}" cy="${y + 26}" r="7" fill="${C.orange}"/><circle cx="${x + 72}" cy="${y + 26}" r="7" fill="${C.gold}"/>`,
    rect(x + 100, y + 12, Math.min(560, w - 140), 28, C.bg, 14),
    text(x + 118, y + 32, url, 15, C.muted, { family: MONO }),
  ].join("")
  return [svg, { x: x + 1, y: y + chrome, w: w - 2, h: h - chrome - 1 }]
}

// ---- Screens ---------------------------------------------------------------------------------

function sidebar(b, items = 6, { accent = C.orange } = {}) {
  const w = Math.round(b.w * 0.19)
  const out = [rect(b.x, b.y, w, b.h, C.bg), rect(b.x + 24, b.y + 26, 40, 40, "url(#sunset)", 10), bar(b.x + 76, b.y + 40, w - 110, C.ink)]
  for (let i = 0; i < items; i++) {
    const yy = b.y + 110 + i * 54
    if (i === 1) out.push(rect(b.x + 14, yy - 16, w - 28, 44, C.surface2, 10), rect(b.x + 14, yy - 16, 4, 44, accent, 2))
    out.push(rect(b.x + 30, yy - 2, 16, 16, i === 1 ? accent : C.line, 4), bar(b.x + 58, yy, (w - 100) * (0.5 + ((i * 37) % 40) / 100), i === 1 ? C.ink : C.line))
  }
  return [out.join(""), { x: b.x + w, y: b.y, w: b.w - w, h: b.h }]
}

function table(b, seed, { legacy = false, title = "Records", cols = 7, rowH = 46 } = {}) {
  const r = rng(seed)
  const out = []
  let c = b
  if (legacy) {
    // Old app: grey top nav, dense table, cramped form on the side.
    out.push(rect(b.x, b.y, b.w, 44, "#2B3346"))
    for (let i = 0; i < 8; i++) out.push(bar(b.x + 18 + i * 110, b.y + 17, 80, "#4A536A", 10))
    c = { x: b.x, y: b.y + 44, w: b.w, h: b.h - 44 }
    const fw = Math.round(c.w * 0.26)
    out.push(rect(c.x + c.w - fw - 12, c.y + 12, fw, c.h - 24, "#1F2533", 2, `stroke="#3A4258"`))
    for (let i = 0; i < 12; i++) {
      const yy = c.y + 30 + i * ((c.h - 60) / 12)
      out.push(bar(c.x + c.w - fw, yy, fw * 0.3, "#4A536A", 8), rect(c.x + c.w - fw + fw * 0.36, yy - 6, fw * 0.56, 20, "#141A2A", 2, `stroke="#3A4258"`))
    }
    c = { x: c.x, y: c.y, w: c.w - fw - 24, h: c.h }
  } else {
    const [side, cc] = sidebar(b, 6, { accent: C.pink })
    out.push(side)
    c = cc
  }
  const p = legacy ? 12 : 32
  if (!legacy) {
    out.push(text(c.x + p, c.y + 56, title, 30, C.ink, { weight: 700 }))
    out.push(rect(c.x + p, c.y + 82, 300, 40, C.surface2, 10), bar(c.x + p + 16, c.y + 96, 140))
    for (let i = 0; i < 3; i++) out.push(rect(c.x + p + 320 + i * 120, c.y + 82, 108, 40, i === 0 ? C.teal : C.surface2, 20), bar(c.x + p + 340 + i * 120, c.y + 96, 68, i === 0 ? C.ink : C.line))
  }
  const ty = c.y + (legacy ? 12 : 146)
  const tw = c.w - p * 2
  const rh = legacy ? 26 : rowH
  const head = legacy ? "#2B3346" : C.surface2
  out.push(rect(c.x + p, ty, tw, rh + (legacy ? 0 : 6), head, legacy ? 0 : 10))
  const colW = tw / cols
  for (let j = 0; j < cols; j++) out.push(bar(c.x + p + 14 + j * colW, ty + rh / 2 - 4, colW * 0.5, legacy ? "#5A6380" : C.muted, 8))
  const rows = Math.floor((c.h - (ty - c.y) - rh - p) / rh)
  for (let i = 0; i < rows; i++) {
    const yy = ty + rh + (legacy ? 0 : 6) + i * rh
    if (legacy) out.push(rect(c.x + p, yy, tw, rh, i % 2 ? "#1A1F2C" : "#20263A"), rect(c.x + p, yy + rh - 1, tw, 1, "#2E364A"))
    else out.push(rect(c.x + p, yy + rh - 1, tw, 1, C.line))
    for (let j = 0; j < cols; j++) {
      const w = colW * (0.3 + r() * 0.5)
      if (!legacy && j === cols - 1) out.push(rect(c.x + p + 14 + j * colW, yy + rh / 2 - 12, colW * 0.6, 24, [C.teal, "#3B1E4F", "#4A2A14"][i % 3], 12))
      else out.push(bar(c.x + p + 14 + j * colW, yy + rh / 2 - (legacy ? 3 : 5), w, legacy ? "#3E4660" : C.line, legacy ? 6 : 10))
    }
  }
  return out.join("")
}

// ---- Images ---------------------------------------------------------------------------------

function svg(W, H, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}${rect(0, 0, W, H, C.bg)}${body}</svg>`
}

function screen(W, H, url, draw, opts) {
  const [frame, b] = browser(W, H, url, opts)
  return frame + draw(b)
}

const M = { W: 1600, H: 1000 }

// Only the Educaro before/after slider uses images now (the screenshot galleries were removed).
const images = [
  ["missions/the-rebuild-legacy.webp", M, "Legacy AngularJS CRM", (W, H) => screen(W, H, "crm-legacy/#!/students", (b) => table(b, 53, { legacy: true, cols: 9 }), { legacy: true })],
  ["missions/the-rebuild-new.webp", M, "New React CRM", (W, H) => screen(W, H, "crm.app/students", (b) => table(b, 54, { title: "Students", cols: 5, rowH: 60 }))],
]

for (const [file, { W, H }, , draw] of images) {
  const out = path.join(root, "public/images", file)
  await mkdir(path.dirname(out), { recursive: true })
  const body = draw(W, H)
  await sharp(Buffer.from(svg(W, H, body)), { density: 72 }).webp({ quality: 82, effort: 5 }).toFile(out)
  console.log("wrote", path.relative(root, out))
}
