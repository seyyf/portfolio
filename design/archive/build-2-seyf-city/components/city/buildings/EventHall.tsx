"use client"

import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, type InstancedMesh, Object3D } from "three"

import { world } from "@/lib/world"

import { C } from "../materials"
import { Building, facadeWindows, Part, Sign, useBuildingActive, Windows } from "./Building"

const W = 6
const D = 5
const H = 3.2

// Uteek: event hall with a marquee sign of chasing bulbs (faster while featured).
export function EventHall() {
  return (
    <Building id="uteek">
      <EventHallModel />
    </Building>
  )
}

function EventHallModel() {
  const windows = useMemo(
    () => facadeWindows({ w: W, d: D, floors: 1, fh: 1.6, y0: 1.4, cols: 0, sideCols: 4, ww: 0.6, wh: 0.7 }),
    []
  )
  return (
    <group>
      <Part color={C.lavender} outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      {/* barrel roof */}
      <Part color={C.coral} outline position={[0, H, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.55]}>
        <cylinderGeometry args={[D / 2 + 0.15, D / 2 + 0.15, W + 0.3, 12, 1, false, 0, Math.PI]} />
      </Part>
      {/* doors */}
      {[-1.6, 0, 1.6].map((x) => (
        <Part key={x} color={C.coralDeep} position={[x, 0.7, D / 2 + 0.02]}>
          <boxGeometry args={[0.9, 1.4, 0.05]} />
        </Part>
      ))}
      {/* canopy */}
      <Part color={C.butter} outline position={[0, 2.05, D / 2 + 0.6]}>
        <boxGeometry args={[4.6, 0.22, 1.2]} />
      </Part>
      {[-2, 2].map((x) => (
        <Part key={x} color={C.white} position={[x, 1.0, D / 2 + 1.05]}>
          <cylinderGeometry args={[0.07, 0.07, 2, 6]} />
        </Part>
      ))}
      <Sign text="Uteek" size={[3.2, 0.9]} position={[0, 2.75, D / 2 + 0.75]} bg={C.night} fg={C.butter} glow={1.4} />
      <Sign text="Live tonight" size={[2, 0.55]} position={[W / 2 + 0.03, 2.2, 0.6]} rotation={[0, Math.PI / 2, 0]} bg={C.butter} />
      <Bulbs />
      <Windows items={windows} seed={23} />
    </group>
  )
}

const BULB_ON = new Color(C.glow)
const BULB_OFF = new Color("#9A8A6A")
const tmp = new Color()
const dummy = new Object3D()

function Bulbs() {
  const ref = useRef<InstancedMesh>(null)
  const active = useBuildingActive()
  // Bulbs around the marquee sign frame.
  const positions = useMemo(() => {
    const pts: [number, number, number][] = []
    const w = 3.5
    const h = 1.15
    const z = D / 2 + 0.8
    const nx = 9
    const ny = 3
    for (let i = 0; i <= nx; i++) {
      const x = -w / 2 + (i * w) / nx
      pts.push([x, 2.75 + h / 2, z], [x, 2.75 - h / 2, z])
    }
    for (let j = 1; j < ny; j++) {
      const y = 2.75 - h / 2 + (j * h) / ny
      pts.push([-w / 2, y, z], [w / 2, y, z])
    }
    return pts
  }, [])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    positions.forEach((p, i) => {
      dummy.position.set(...p)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, BULB_OFF)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [positions])

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    const speed = active ? 9 : 3
    const step = Math.floor(clock.elapsedTime * speed)
    const brightness = 1.2 + world.night * 2.2
    for (let i = 0; i < positions.length; i++) {
      const on = (i + step) % 3 === 0
      tmp.copy(on ? BULB_ON : BULB_OFF)
      if (on) tmp.multiplyScalar(brightness)
      mesh.setColorAt(i, tmp)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]} frustumCulled={false}>
      <sphereGeometry args={[0.08, 8, 6]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
