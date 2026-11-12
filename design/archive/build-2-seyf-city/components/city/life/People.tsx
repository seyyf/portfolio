"use client"

import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, type InstancedMesh, Object3D } from "three"

import { effectiveAssemble, rand, world } from "@/lib/world"

import { samplePath, WALK_PATHS } from "../layout"
import { C, mat } from "../materials"

const SHIRTS = [C.coral, C.sky, C.butter, C.lavender, C.mintDeep, "#FFB3BA", C.white]
const SKIN = ["#F5D0B5", "#E0AC8A", "#C68863", "#8D5A3B"]
const PHONE_ON = new Color("#BFE6FF")
const PHONE_OFF = new Color(C.ink)
const tmp = new Color()
const dummy = new Object3D()
const p0 = { x: 0, z: 0 }
const p1 = { x: 0, z: 0 }

/**
 * Little low-poly people walking around the blocks: three instanced meshes (bodies, heads, phones)
 * for the whole crowd. Some hold phones that glow at night.
 */
export function People({ count }: { count: number }) {
  const bodies = useRef<InstancedMesh>(null)
  const heads = useRef<InstancedMesh>(null)
  const phones = useRef<InstancedMesh>(null)

  const people = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        path: WALK_PATHS[i % WALK_PATHS.length],
        offset: rand(i * 13 + 1) * 100,
        speed: (0.55 + rand(i * 7 + 2) * 0.45) * (rand(i * 5 + 3) > 0.5 ? 1 : -1),
        phone: i % 3 === 0,
        shirt: SHIRTS[i % SHIRTS.length],
        skin: SKIN[Math.floor(rand(i * 3 + 4) * SKIN.length)],
      })),
    [count]
  )
  const phoneOwners = useMemo(() => people.map((p, i) => (p.phone ? i : -1)).filter((i) => i >= 0), [people])

  useLayoutEffect(() => {
    people.forEach((p, i) => {
      bodies.current?.setColorAt(i, tmp.set(p.shirt))
      heads.current?.setColorAt(i, tmp.set(p.skin))
    })
    if (bodies.current?.instanceColor) bodies.current.instanceColor.needsUpdate = true
    if (heads.current?.instanceColor) heads.current.instanceColor.needsUpdate = true
  }, [people])

  useFrame(({ clock }) => {
    const b = bodies.current
    const h = heads.current
    const ph = phones.current
    if (!b || !h || !ph) return
    const visible = effectiveAssemble() > 0.6
    b.visible = h.visible = ph.visible = visible
    if (!visible) return
    const t = clock.elapsedTime
    let k = 0
    for (let i = 0; i < people.length; i++) {
      const p = people[i]
      const d = p.offset + t * p.speed
      samplePath(p.path, d, p0)
      samplePath(p.path, d + Math.sign(p.speed) * 0.25, p1)
      const yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z)
      const bob = Math.abs(Math.sin(t * 9 + i)) * 0.06
      const sway = Math.sin(t * 9 + i) * 0.08

      dummy.position.set(p0.x, 0.42 + bob, p0.z)
      dummy.rotation.set(0, yaw, sway)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      b.setMatrixAt(i, dummy.matrix)

      dummy.position.y = 0.82 + bob
      dummy.updateMatrix()
      h.setMatrixAt(i, dummy.matrix)

      if (p.phone) {
        // Phone held up in front of the face.
        dummy.position.set(p0.x + Math.sin(yaw) * 0.18, 0.66 + bob, p0.z + Math.cos(yaw) * 0.18)
        dummy.rotation.set(-0.5, yaw, 0)
        dummy.updateMatrix()
        ph.setMatrixAt(k, dummy.matrix)
        const glow = world.night
        tmp.copy(PHONE_OFF).lerp(PHONE_ON, glow).multiplyScalar(1 + glow * 2.5)
        ph.setColorAt(k, tmp)
        k++
      }
    }
    b.instanceMatrix.needsUpdate = true
    h.instanceMatrix.needsUpdate = true
    ph.instanceMatrix.needsUpdate = true
    if (ph.instanceColor) ph.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, people.length]} material={mat(C.white)} castShadow frustumCulled={false}>
        <capsuleGeometry args={[0.13, 0.3, 2, 6]} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, people.length]} material={mat(C.white)} castShadow frustumCulled={false}>
        <icosahedronGeometry args={[0.12, 1]} />
      </instancedMesh>
      <instancedMesh ref={phones} args={[undefined, undefined, Math.max(1, phoneOwners.length)]} frustumCulled={false}>
        <boxGeometry args={[0.1, 0.16, 0.02]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
