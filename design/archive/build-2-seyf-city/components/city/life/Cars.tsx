"use client"

import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, type Group, type InstancedMesh, Object3D } from "three"

import { effectiveAssemble, world } from "@/lib/world"

import { CAR_PATHS, SCOOTER_PATH, samplePath } from "../layout"
import { C, mat } from "../materials"

const PAINT = [C.coral, C.sky, C.butter, C.lavender, C.mint, "#FFB3BA", C.white]
const LIGHT_DAY = new Color("#FFF6DA")
const LIGHT_NIGHT = new Color("#FFE7A8")
const tmp = new Color()
const dummy = new Object3D()
const p0 = { x: 0, z: 0 }
const p1 = { x: 0, z: 0 }

/** Toy cars looping the roads. Bodies, cabins and headlights are three instanced meshes. */
export function Cars({ count }: { count: number }) {
  const bodies = useRef<InstancedMesh>(null)
  const cabins = useRef<InstancedMesh>(null)
  const lights = useRef<InstancedMesh>(null)

  const cars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const path = CAR_PATHS[i % CAR_PATHS.length]
        const lap = Math.floor(i / CAR_PATHS.length)
        return { path, offset: (lap * 0.5 + i * 0.13) * path.length, speed: 2.6 + (i % 3) * 0.5, paint: PAINT[i % PAINT.length] }
      }),
    [count]
  )

  useLayoutEffect(() => {
    cars.forEach((c, i) => bodies.current?.setColorAt(i, tmp.set(c.paint)))
    if (bodies.current?.instanceColor) bodies.current.instanceColor.needsUpdate = true
  }, [cars])

  useFrame(({ clock }) => {
    const b = bodies.current
    const c = cabins.current
    const l = lights.current
    if (!b || !c || !l) return
    const visible = effectiveAssemble() > 0.5
    b.visible = c.visible = l.visible = visible
    if (!visible) return
    const t = clock.elapsedTime
    const n = world.night
    tmp.copy(LIGHT_DAY).lerp(LIGHT_NIGHT, n).multiplyScalar(1 + n * 3)
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i]
      const d = car.offset + t * car.speed
      samplePath(car.path, d - 0.35, p0)
      samplePath(car.path, d + 0.35, p1)
      const x = (p0.x + p1.x) / 2
      const z = (p0.z + p1.z) / 2
      const yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z) - Math.PI / 2
      const bump = Math.sin(t * 14 + i) * 0.012

      dummy.position.set(x, 0.38 + bump, z)
      dummy.rotation.set(0, yaw, 0)
      dummy.updateMatrix()
      b.setMatrixAt(i, dummy.matrix)

      dummy.position.y = 0.7 + bump
      dummy.translateX(-0.08)
      dummy.updateMatrix()
      c.setMatrixAt(i, dummy.matrix)

      for (const side of [-1, 1]) {
        dummy.position.set(x, 0.38 + bump, z)
        dummy.rotation.set(0, yaw, 0)
        dummy.translateX(0.56)
        dummy.translateZ(side * 0.2)
        dummy.updateMatrix()
        const k = i * 2 + (side > 0 ? 1 : 0)
        l.setMatrixAt(k, dummy.matrix)
        l.setColorAt(k, tmp)
      }
    }
    b.instanceMatrix.needsUpdate = true
    c.instanceMatrix.needsUpdate = true
    l.instanceMatrix.needsUpdate = true
    if (l.instanceColor) l.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, cars.length]} material={mat(C.white)} castShadow frustumCulled={false}>
        <boxGeometry args={[1.1, 0.36, 0.62]} />
      </instancedMesh>
      <instancedMesh ref={cabins} args={[undefined, undefined, cars.length]} material={mat(C.glass, { rough: 0.3 })} castShadow frustumCulled={false}>
        <boxGeometry args={[0.6, 0.3, 0.54]} />
      </instancedMesh>
      <instancedMesh ref={lights} args={[undefined, undefined, cars.length * 2]} frustumCulled={false}>
        <boxGeometry args={[0.05, 0.1, 0.12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

/** Delivery scooter riding from the restaurant to my house and back. */
export function Scooter() {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    g.visible = effectiveAssemble() > 0.6
    const L = SCOOTER_PATH.length
    const speed = 2.2
    const raw = (clock.elapsedTime * speed) % (L * 2 + 6)
    // Ride there, pause 1.5s at the house, ride back, pause at the restaurant.
    let d: number
    let dir: number
    if (raw < L) {
      d = raw
      dir = 1
    } else if (raw < L + 3) {
      d = L
      dir = 1
    } else if (raw < L * 2 + 3) {
      d = L - (raw - L - 3)
      dir = -1
    } else {
      d = 0
      dir = -1
    }
    samplePath(SCOOTER_PATH, d - 0.2 * dir, p0)
    samplePath(SCOOTER_PATH, d + 0.2 * dir, p1)
    g.position.set((p0.x + p1.x) / 2, 0.18, (p0.z + p1.z) / 2)
    if (Math.hypot(p1.x - p0.x, p1.z - p0.z) > 0.01) g.rotation.y = Math.atan2(p1.x - p0.x, p1.z - p0.z) - Math.PI / 2
  })
  return (
    <group ref={group}>
      <mesh material={mat(C.mint)} position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.8, 0.18, 0.28]} />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} material={mat(C.ink)} position={[x, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 10]} />
        </mesh>
      ))}
      <mesh material={mat(C.ink)} position={[0.35, 0.45, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
      </mesh>
      {/* rider */}
      <mesh material={mat(C.coral)} position={[-0.05, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.25, 2, 6]} />
      </mesh>
      <mesh material={mat(C.butter)} position={[-0.05, 0.92, 0]}>
        <sphereGeometry args={[0.13, 8, 6]} />
      </mesh>
      {/* delivery box */}
      <mesh material={mat(C.coral)} position={[-0.38, 0.5, 0]} castShadow>
        <boxGeometry args={[0.32, 0.3, 0.32]} />
      </mesh>
    </group>
  )
}
