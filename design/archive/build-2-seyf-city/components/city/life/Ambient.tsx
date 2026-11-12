"use client"

import { useFrame } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { BufferGeometry, Color, type Group, IcosahedronGeometry, type InstancedMesh, MeshStandardMaterial, Object3D } from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { rand, world } from "@/lib/world"

import { ISLAND } from "../layout"
import { C, mat } from "../materials"

// Birds by day, drifting clouds, fireflies by night.

/** A V formation of birds crossing the sky during the day. */
export function Birds() {
  const flock = useRef<Group>(null)
  const wings = useRef<(Group | null)[]>([])
  const offsets = useMemo(
    () => [
      [0, 0, 0],
      [-1.1, -0.15, 1.1],
      [-1.1, -0.15, -1.1],
      [-2.2, -0.3, 2.2],
      [-2.2, -0.3, -2.2],
    ],
    []
  )
  useFrame(({ clock }) => {
    const g = flock.current
    if (!g) return
    const day = 1 - world.night
    g.visible = day > 0.2
    if (!g.visible) return
    const t = clock.elapsedTime
    const p = ((t / 26) % 1) * 2 - 1 // -1..1 across the island
    g.position.set(p * 34, 13 + Math.sin(t * 0.6) * 0.6, -p * 12 - 4)
    g.scale.setScalar(day)
    wings.current.forEach((w, i) => {
      if (w) w.rotation.x = Math.sin(t * 10 + Math.floor(i / 2) * 0.7) * 0.7
    })
  })
  return (
    <group ref={flock} rotation={[0, -0.34, 0]}>
      {offsets.map((o, i) => (
        <group key={i} position={o as [number, number, number]}>
          <mesh material={mat(C.ink)}>
            <boxGeometry args={[0.45, 0.1, 0.12]} />
          </mesh>
          {[-1, 1].map((side) => (
            <group
              key={side}
              scale={[1, 1, side]}
              ref={(el) => {
                wings.current[i * 2 + (side > 0 ? 1 : 0)] = el
              }}
            >
              <mesh material={mat(C.ink)} position={[0, 0, 0.28]}>
                <boxGeometry args={[0.22, 0.03, 0.5]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Low-poly clouds drifting behind the island. Shared geometry, one material that dims at night. */
export function Clouds() {
  const group = useRef<Group>(null)
  const geometry = useMemo(() => {
    const parts: BufferGeometry[] = [
      new IcosahedronGeometry(1.2, 0).translate(0, 0, 0),
      new IcosahedronGeometry(0.9, 0).translate(1.2, -0.15, 0.2),
      new IcosahedronGeometry(0.85, 0).translate(-1.15, -0.2, -0.1),
      new IcosahedronGeometry(0.7, 0).translate(0.4, 0.55, -0.3),
    ]
    const g = mergeGeometries(parts)
    parts.forEach((p) => p.dispose())
    return g
  }, [])
  const material = useMemo(() => new MeshStandardMaterial({ color: C.white, flatShading: true, roughness: 1, emissive: C.white, emissiveIntensity: 0.55 }), [])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )
  const clouds = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: -40 + i * 15 + rand(i) * 6,
        y: 9 + rand(i + 10) * 6,
        z: -27 - rand(i + 20) * 8,
        s: 1.3 + rand(i + 30) * 1.2,
        speed: 0.5 + rand(i + 40) * 0.5,
      })),
    []
  )
  const day = useMemo(() => new Color(C.white), [])
  const night = useMemo(() => new Color("#5C6196"), [])
  useFrame(({ clock }) => {
    material.color.copy(day).lerp(night, world.night)
    material.emissive.copy(material.color)
    const g = group.current
    if (!g) return
    g.children.forEach((child, i) => {
      const c = clouds[i]
      const x = ((c.x + clock.elapsedTime * c.speed + 45) % 90) - 45
      child.position.set(x, c.y, c.z + x * -0.35)
    })
  })
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <mesh key={i} geometry={geometry} material={material} scale={[c.s * 1.6, c.s * 0.8, c.s]} />
      ))}
    </group>
  )
}

const dummy = new Object3D()
const FIREFLY = new Color("#EAFF8F")
const tmp = new Color()

/** Fireflies that drift over the lawns once it's dark. */
export function Fireflies({ count }: { count: number }) {
  const ref = useRef<InstancedMesh>(null)
  const flies = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (rand(i * 3) * 2 - 1) * (ISLAND - 2),
        z: (rand(i * 3 + 1) * 2 - 1) * (ISLAND - 2),
        y: 0.5 + rand(i * 3 + 2) * 2,
        phase: rand(i * 7) * Math.PI * 2,
        speed: 0.3 + rand(i * 11) * 0.5,
      })),
    [count]
  )
  useLayoutEffect(() => {
    if (ref.current) ref.current.visible = false
  }, [])
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    const n = world.night
    m.visible = n > 0.05
    if (!m.visible) return
    const t = clock.elapsedTime
    for (let i = 0; i < flies.length; i++) {
      const f = flies[i]
      const a = t * f.speed + f.phase
      dummy.position.set(f.x + Math.sin(a) * 1.4, f.y + Math.sin(a * 1.7) * 0.4, f.z + Math.cos(a * 0.8) * 1.4)
      dummy.scale.setScalar(n)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      const flicker = 0.5 + 0.5 * Math.sin(t * 3 + f.phase * 5)
      tmp.copy(FIREFLY).multiplyScalar(0.6 + flicker * 3)
      m.setColorAt(i, tmp)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.06, 6, 4]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
