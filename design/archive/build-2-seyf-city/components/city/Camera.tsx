"use client"

import { MapControls, OrthographicCamera } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Matrix4, type OrthographicCamera as OrthoCam, Vector3 } from "three"
import type { MapControls as MapControlsImpl } from "three-stdlib"

import { gsap } from "@/lib/gsap"
import { useCity } from "@/lib/store"
import { world } from "@/lib/world"

// Isometric-style view direction (from +x, +y, +z towards the city) and camera distance.
const DIR = new Vector3(1, 0.86, 1).normalize()
const DIST = 90
const basis = new Matrix4().lookAt(DIR, new Vector3(0, 0, 0), new Vector3(0, 1, 0))
const RIGHT = new Vector3().setFromMatrixColumn(basis, 0)
const UP = new Vector3().setFromMatrixColumn(basis, 1)

/** Shared camera state, so explore mode can start where the tour camera is and hand back smoothly. */
export const camState = {
  target: new Vector3(),
  /** Blend from the explore pose back to the tour rig (1 = fully on the rig). */
  blend: { v: 1 },
  from: { pos: new Vector3(), target: new Vector3(), zoom: 1 },
}

/** Overview zoom that fits the island on screen. */
export function baseZoom(width: number, height: number) {
  return Math.min(width / 58, height / 36)
}

const target = new Vector3()
const drift = new Vector3()
const pos = new Vector3()

export function CityCamera() {
  const cam = useRef<OrthoCam>(null)
  const mode = useCity((s) => s.mode)
  const reduced = useCity((s) => s.reducedMotion)
  const size = useThree((s) => s.size)

  // Subtle pointer drift on desktop (disabled for touch and reduced motion).
  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return
    const onMove = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      world.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [reduced])

  // Leaving explore mode: remember the explore pose and blend back onto the rig.
  const prevMode = useRef(mode)
  useEffect(() => {
    const c = cam.current
    if (prevMode.current === "explore" && mode === "tour" && c) {
      camState.from.pos.copy(c.position)
      camState.from.target.copy(camState.target)
      camState.from.zoom = c.zoom
      camState.blend.v = 0
      gsap.to(camState.blend, { v: 1, duration: reduced ? 0.01 : 1.4, ease: "power3.inOut" })
    }
    prevMode.current = mode
  }, [mode, reduced])

  useFrame((_, dt) => {
    const c = cam.current
    if (!c || useCity.getState().mode === "explore") return
    const { width, height } = size
    const r = world.rig
    const narrow = width < 860
    const zoom = baseZoom(width, height) * r.zoom * (narrow && Math.abs(r.side) > 0 ? 1.3 : 1)

    // Frame the building beside the tour card: to the right/left on desktop, above it on phones.
    const offX = narrow ? 0 : -r.side * 0.2 * width
    const offY = narrow ? -Math.abs(r.side) * 0.2 * height : 0
    target.set(r.tx, r.ty, r.tz).addScaledVector(RIGHT, offX / zoom).addScaledVector(UP, offY / zoom)

    drift.lerp(
      new Vector3().addScaledVector(RIGHT, world.pointer.x * 0.5).addScaledVector(UP, -world.pointer.y * 0.35),
      Math.min(1, dt * 2)
    )
    target.add(drift)

    pos.copy(target).addScaledVector(DIR, DIST)
    let z = zoom
    const b = camState.blend.v
    if (b < 1) {
      pos.lerpVectors(camState.from.pos, pos, b)
      target.lerpVectors(camState.from.target, target, b)
      z = camState.from.zoom + (zoom - camState.from.zoom) * b
    }
    c.position.copy(pos)
    c.lookAt(target)
    c.zoom = z
    c.updateProjectionMatrix()
    camState.target.copy(target)
  })

  return <OrthographicCamera ref={cam} makeDefault near={1} far={260} position={[DIST, DIST, DIST]} zoom={20} />
}

const LIMIT = 19

/** Free exploration: pan, zoom and a little rotation, clamped so the city can't be lost. */
export function ExploreControls() {
  const controls = useRef<MapControlsImpl>(null)
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera)
  const base = baseZoom(size.width, size.height)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    c.target.copy(camState.target)
    c.update()
  }, [])

  return (
    <MapControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      screenSpacePanning={false}
      minZoom={base * 0.75}
      maxZoom={base * 4}
      minPolarAngle={0.85}
      maxPolarAngle={1.12}
      minAzimuthAngle={Math.PI / 4 - 0.6}
      maxAzimuthAngle={Math.PI / 4 + 0.6}
      onChange={() => {
        const c = controls.current
        if (!c) return
        const t = c.target
        const cx = Math.max(-LIMIT, Math.min(LIMIT, t.x))
        const cz = Math.max(-LIMIT, Math.min(LIMIT, t.z))
        const dx = cx - t.x
        const dz = cz - t.z
        if (dx || dz) {
          t.x = cx
          t.z = cz
          camera.position.x += dx
          camera.position.z += dz
        }
        camState.target.copy(t)
      }}
    />
  )
}
