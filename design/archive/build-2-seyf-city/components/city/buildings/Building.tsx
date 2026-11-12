"use client"

import { Html, Outlines, useCursor } from "@react-three/drei"
import { useFrame, type ThreeElements } from "@react-three/fiber"
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Color, type Group, type InstancedMesh, MeshStandardMaterial, Object3D } from "three"

import { buildingById, type BuildingId } from "@/data/city"
import { gsap } from "@/lib/gsap"
import { playSfx } from "@/lib/sound"
import { useCity } from "@/lib/store"
import { effectiveAssemble, rand, world } from "@/lib/world"

import { labelsPortal } from "../labelsPortal"
import { C, createTextTexture, mat } from "../materials"

const HoverContext = createContext(false)
/** True while the building this part belongs to is hovered or keyboard-focused. */
export const useBuildingHovered = () => useContext(HoverContext)

const ActiveContext = createContext(false)
/** True while the building is the current tour stop or its panel is open (signature animations). */
export const useBuildingActive = () => useContext(ActiveContext)

// Order in which buildings rise while the city assembles during the intro.
const RISE_ORDER: BuildingId[] = ["educaro", "bertsch", "opuslab", "globalenr", "uteek", "workshop", "house", "febal", "aurelia", "weedy", "fripa"]

export function Building({ id, children, labelHeight }: { id: BuildingId; children: ReactNode; labelHeight?: number }) {
  const b = buildingById[id]
  const outer = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const rise = useRef({ v: 0 })
  const risenRef = useRef(false)
  const [risen, setRisen] = useState(false)
  const lift = useRef(0)
  const [pointerOver, setPointerOver] = useState(false)
  const hovered = useCity((s) => s.hovered === id)
  const active = useCity((s) => (s.mode === "tour" && s.stop === id) || s.panel === id)
  const setHovered = useCity((s) => s.setHovered)
  const openPanel = useCity((s) => s.openPanel)
  useCursor(pointerOver)

  const threshold = 0.06 + RISE_ORDER.indexOf(id) * 0.065

  useEffect(() => () => void gsap.killTweensOf(rise.current), [])

  useFrame((_, dt) => {
    const should = effectiveAssemble() > threshold
    if (should !== risenRef.current) {
      risenRef.current = should
      setRisen(should)
      gsap.killTweensOf(rise.current)
      gsap.to(
        rise.current,
        should ? { v: 1, duration: 1.4, ease: "elastic.out(1, 0.4)" } : { v: 0, duration: 0.35, ease: "power2.in" }
      )
    }
    const s = rise.current.v
    if (outer.current) {
      outer.current.scale.set(1, Math.max(0.0001, s), 1)
      outer.current.visible = s > 0.003
    }
    lift.current += ((hovered ? 0.4 : 0) - lift.current) * Math.min(1, dt * 12)
    if (inner.current) inner.current.position.y = lift.current
  })

  return (
    <group position={[b.position[0], 0, b.position[1]]}>
      <group
        ref={outer}
        onPointerOver={(e) => {
          e.stopPropagation()
          setPointerOver(true)
          setHovered(id)
          playSfx("pop")
        }}
        onPointerOut={() => {
          setPointerOver(false)
          if (useCity.getState().hovered === id) setHovered(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          playSfx("click")
          openPanel(id)
        }}
      >
        <group ref={inner}>
          <HoverContext.Provider value={hovered}>
            <ActiveContext.Provider value={active}>{children}</ActiveContext.Provider>
          </HoverContext.Provider>
        </group>
      </group>
      <BuildingLabel id={id} y={labelHeight ?? b.size[2] + 1.2} active={hovered || active} visible={risen} />
    </group>
  )
}

function BuildingLabel({ id, y, active, visible }: { id: BuildingId; y: number; active: boolean; visible: boolean }) {
  const b = buildingById[id]
  const setHovered = useCity((s) => s.setHovered)
  const openPanel = useCity((s) => s.openPanel)
  const mode = useCity((s) => s.mode)
  const quality = useCity((s) => s.quality)
  // On small screens during the tour only the active building keeps its label, to avoid clutter.
  const compact = quality === "low" && mode === "tour" && !active
  const capture = useCity((s) => s.capture)
  if (capture) return null
  return (
    <Html portal={labelsPortal as React.RefObject<HTMLElement>} position={[0, y, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <button
        type="button"
        className="city-label"
        data-active={active}
        aria-label={`${b.place}, ${b.name}. Open details`}
        style={{ opacity: visible && !compact ? 1 : 0, visibility: visible ? "inherit" : "hidden" }}
        onClick={() => {
          playSfx("click")
          openPanel(id)
        }}
        onFocus={() => setHovered(id)}
        onBlur={() => {
          if (useCity.getState().hovered === id) setHovered(null)
        }}
        onPointerEnter={() => setHovered(id)}
        onPointerLeave={() => {
          if (useCity.getState().hovered === id) setHovered(null)
        }}
      >
        <span className="label-emoji" aria-hidden="true">
          {b.emoji}
        </span>
        {b.name}
      </button>
    </Html>
  )
}

type PartProps = ThreeElements["mesh"] & { color: string; outline?: boolean; rough?: number }

/** A flat-shaded mesh in the city palette. `outline` draws the hover outline around it. */
export function Part({ color, outline, rough, children, ...props }: PartProps) {
  const hovered = useBuildingHovered()
  return (
    <mesh castShadow receiveShadow material={mat(color, { rough })} {...props}>
      {children}
      {outline && <Outlines visible={hovered} thickness={0.07} color={C.ink} />}
    </mesh>
  )
}

// ---------- windows ----------

export type WindowSpec = { p: [number, number, number]; ry: number; w: number; h: number; floor: number }

/**
 * Window grid on the two faces the isometric camera sees: front (+z) and right (+x).
 * `skip` removes windows (e.g. where the door is) by returning true.
 */
export function facadeWindows(o: {
  w: number
  d: number
  floors: number
  fh: number
  y0?: number
  cols: number
  sideCols: number
  ww?: number
  wh?: number
  skip?: (face: "front" | "side", floor: number, col: number) => boolean
}): WindowSpec[] {
  const out: WindowSpec[] = []
  const ww = o.ww ?? 0.45
  const wh = o.wh ?? 0.5
  const y0 = o.y0 ?? 0
  for (let f = 0; f < o.floors; f++) {
    const y = y0 + f * o.fh + o.fh * 0.55
    for (let c = 0; c < o.cols; c++) {
      if (o.skip?.("front", f, c)) continue
      const x = -o.w / 2 + ((c + 0.5) * o.w) / o.cols
      out.push({ p: [x, y, o.d / 2 + 0.02], ry: 0, w: ww, h: wh, floor: f })
    }
    for (let c = 0; c < o.sideCols; c++) {
      if (o.skip?.("side", f, c)) continue
      const z = o.d / 2 - ((c + 0.5) * o.d) / o.sideCols
      out.push({ p: [o.w / 2 + 0.02, y, z], ry: Math.PI / 2, w: ww, h: wh, floor: f })
    }
  }
  return out
}

const DAY_GLASS = new Color(C.glass)
const NIGHT_OFF = new Color("#2E3462")
const GLOW = new Color(C.glow)
const tmpColor = new Color()
const dummy = new Object3D()

/**
 * All windows of one building in a single instanced draw call. At night each window switches on at its
 * own moment (staggered), and `floorLight` lights whole floors in order for the school's signature.
 */
export function Windows({ items, seed = 1, floorLight }: { items: WindowSpec[]; seed?: number; floorLight?: { current: number } }) {
  const ref = useRef<InstancedMesh>(null)
  const thresholds = useMemo(() => items.map((_, i) => 0.12 + rand(seed * 97 + i) * 0.75), [items, seed])
  const last = useRef(-1)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    items.forEach((it, i) => {
      dummy.position.set(...it.p)
      dummy.rotation.set(0, it.ry, 0)
      dummy.scale.set(it.w, it.h, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, DAY_GLASS)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    last.current = -1
  }, [items])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const n = world.night
    const fl = floorLight?.current ?? 0
    const key = Math.round(n * 120) + Math.floor(fl * 4) * 1000
    if (key === last.current) return
    last.current = key
    for (let i = 0; i < items.length; i++) {
      const lit = n > thresholds[i] || fl > items[i].floor + 0.5
      if (lit) tmpColor.copy(GLOW).multiplyScalar(2.6)
      else tmpColor.copy(DAY_GLASS).lerp(NIGHT_OFF, Math.min(1, n * 1.4))
      mesh.setColorAt(i, tmpColor)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

// ---------- signs ----------

type SignProps = Omit<ThreeElements["mesh"], "args"> & {
  text: string
  lines?: string[]
  size: [number, number]
  bg?: string
  fg?: string
  border?: string
  /** How strongly the sign glows at night. */
  glow?: number
  canvas?: [number, number]
}

/** A flat sign with text drawn in Fredoka. It glows at night so Bloom picks it up. */
export function Sign({ text, lines, size, bg = C.cream, fg = C.ink, border, glow = 1, canvas, ...props }: SignProps) {
  const ratio = size[0] / size[1]
  const material = useMemo(() => {
    const h = canvas?.[1] ?? 128
    const w = canvas?.[0] ?? Math.round(h * ratio)
    const tex = createTextTexture(text, { width: w, height: h, bg, fg, border, lines })
    return new MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: new Color("#ffffff"),
      emissiveIntensity: 0,
      transparent: true,
      roughness: 0.8,
    })
  }, [text, lines, bg, fg, border, ratio, canvas])

  useEffect(
    () => () => {
      material.map?.dispose()
      material.dispose()
    },
    [material]
  )

  useFrame(() => {
    material.emissiveIntensity = 0.15 + world.night * 0.9 * glow
  })

  return (
    <mesh material={material} {...props}>
      <planeGeometry args={size} />
    </mesh>
  )
}
