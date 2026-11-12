// Synthesizes the site's sounds as small mono WAV files in public/sounds.
// Everything is generated from oscillators, so there are no licensing questions.
// Run: node scripts/generate-sounds.mjs

import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const RATE = 22050
const outDir = join(process.cwd(), "public", "sounds")
mkdirSync(outDir, { recursive: true })

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    data.writeInt16LE(Math.round(s * 32767), i * 2)
  }
  const header = Buffer.alloc(44)
  header.write("RIFF", 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write("WAVE", 8)
  header.write("fmt ", 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(RATE, 24)
  header.writeUInt32LE(RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write("data", 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

function pop() {
  const len = Math.floor(0.09 * RATE)
  const buf = new Float32Array(len)
  let phase = 0
  for (let i = 0; i < len; i++) {
    const p = i / len
    phase += (2 * Math.PI * (720 - 380 * p)) / RATE
    buf[i] = Math.sin(phase) * Math.exp(-p * 6) * 0.6
  }
  return buf
}

function click() {
  const len = Math.floor(0.04 * RATE)
  const buf = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const p = i / len
    buf[i] = Math.sin((2 * Math.PI * 1400 * i) / RATE) * Math.exp(-p * 9) * 0.5
  }
  return buf
}

function ding() {
  const len = Math.floor(0.7 * RATE)
  const buf = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const t = i / RATE
    const env = Math.exp(-t * 5)
    buf[i] = (Math.sin(2 * Math.PI * 1318.5 * t) * 0.5 + Math.sin(2 * Math.PI * 1975.5 * t) * 0.25) * env * 0.5
  }
  return buf
}

// A very short tick for key taps and icon presses.
function tap() {
  const len = Math.floor(0.025 * RATE)
  const buf = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const p = i / len
    buf[i] = Math.sin((2 * Math.PI * 2200 * i) / RATE) * Math.exp(-p * 12) * 0.35
  }
  return buf
}

const files = { "pop.wav": pop(), "click.wav": click(), "ding.wav": ding(), "tap.wav": tap() }
for (const [name, samples] of Object.entries(files)) {
  writeFileSync(join(outDir, name), wav(samples))
  console.log(`${name}: ${(samples.length / RATE).toFixed(2)}s`)
}
