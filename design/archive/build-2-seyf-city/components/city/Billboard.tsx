"use client"

import { useFrame } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { Color, type Group, type InstancedMesh, MeshStandardMaterial, Object3D } from "three"

import { profile } from "@/data/city"
import { effectiveAssemble, world } from "@/lib/world"

import { BILLBOARD } from "./layout"
import { C, createTextTexture, mat } from "./materials"

const BW = 7.4
const BH = 2.3
const Y = 5.2

const ON = new Color(C.glow)
const OFF = new Color("#D8CBB2")
const tmp = new Color()
const dummy = new Object3D()

/** The tagline billboard. It lights up (text and bulbs) when night falls. */
export function Billboard() {
  const group = useRef<Group>(null)
  const bulbs = useRef<InstancedMesh>(null)
  const material = useMemo(() => {
    const tex = createTextTexture(profile.tagline, {
      width: 1024,
      height: 320,
      bg: C.cream,
      fg: C.ink,
      border: C.ink,
      radius: 36,
      font: 78,
      lines: ["I build the apps", "people use every day."],
    })
    return new MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new Color("#ffffff"), emissiveIntensity: 0, roughness: 0.8 })
  }, [])
  useEffect(
    () => () => {
      material.map?.dispose()
      material.dispose()
    },
    [material]
  )

  const bulbPositions = useMemo(() => {
    const pts: [number, number][] = []
    for (let i = 0; i <= 14; i++) pts.push([-BW / 2 + (i * BW) / 14, BH / 2 + 0.12], [-BW / 2 + (i * BW) / 14, -BH / 2 - 0.12])
    for (let j = 1; j < 5; j++) pts.push([-BW / 2 - 0.12, -BH / 2 + (j * BH) / 5], [BW / 2 + 0.12, -BH / 2 + (j * BH) / 5])
    return pts
  }, [])

  useLayoutEffect(() => {
    const m = bulbs.current
    if (!m) return
    bulbPositions.forEach(([x, y], i) => {
      dummy.position.set(x, Y + y, 0.12)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, OFF)
    })
    m.instanceMatrix.needsUpdate = true
  }, [bulbPositions])

  useFrame(({ clock }) => {
    const n = world.night
    const a = effectiveAssemble()
    const g = group.current
    if (g) {
      const s = Math.min(1, Math.max(0.0001, (a - 0.55) / 0.2))
      g.scale.set(1, s, 1)
      g.visible = s > 0.01
    }
    material.emissiveIntensity = n * 0.62
    const m = bulbs.current
    if (!m) return
    // Bulbs switch on in a sweep around the frame as night falls, then twinkle.
    for (let i = 0; i < bulbPositions.length; i++) {
      const on = n > 0.35 + (i / bulbPositions.length) * 0.5
      const twinkle = 0.75 + 0.25 * Math.sin(clock.elapsedTime * 4 + i)
      tmp.copy(on ? ON : OFF)
      if (on) tmp.multiplyScalar(3 * twinkle)
      m.setColorAt(i, tmp)
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  return (
    <group ref={group} position={[BILLBOARD.x, 0, BILLBOARD.z]} rotation={[0, BILLBOARD.rotation, 0]}>
      {[-2.4, 2.4].map((x) => (
        <mesh key={x} position={[x, Y / 2, -0.1]} material={mat(C.ink)} castShadow>
          <boxGeometry args={[0.22, Y, 0.22]} />
        </mesh>
      ))}
      <mesh position={[0, Y, -0.05]} material={mat(C.coral)} castShadow>
        <boxGeometry args={[BW + 0.5, BH + 0.5, 0.15]} />
      </mesh>
      <mesh position={[0, Y, 0.04]} material={material}>
        <planeGeometry args={[BW, BH]} />
      </mesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, bulbPositions.length]} frustumCulled={false}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
