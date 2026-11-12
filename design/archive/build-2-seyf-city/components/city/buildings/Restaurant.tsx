"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import type { Group } from "three"

import { C } from "../materials"
import { gableGeometry } from "../shapes"
import { Building, facadeWindows, Part, Sign, Windows } from "./Building"

const W = 5
const D = 4
const H = 3

// Global ENR: restaurant with a striped awning, a terrace table, and steam rising from the chimney.
export function Restaurant() {
  return (
    <Building id="globalenr" labelHeight={6.4}>
      <RestaurantModel />
    </Building>
  )
}

function RestaurantModel() {
  const windows = useMemo(
    () =>
      facadeWindows({
        w: W,
        d: D,
        floors: 2,
        fh: 1.4,
        y0: 0.1,
        cols: 4,
        sideCols: 3,
        ww: 0.6,
        wh: 0.6,
        skip: (face, f, c) => face === "front" && f === 0 && (c === 1 || c === 2),
      }),
    []
  )
  return (
    <group>
      <Part color={C.mint} outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      <Part color={C.coral} outline geometry={gableGeometry(W + 0.4, D + 0.5, 1.5)} position={[0, H, 0]} />
      {/* chimney */}
      <Part color={C.creamDeep} position={[1.4, H + 1.1, -0.6]}>
        <boxGeometry args={[0.55, 1.4, 0.55]} />
      </Part>
      <Steam position={[1.4, H + 1.9, -0.6]} />
      {/* door */}
      <Part color={C.ink} position={[0, 0.65, D / 2 + 0.02]}>
        <boxGeometry args={[0.9, 1.3, 0.05]} />
      </Part>
      {/* striped awning */}
      {Array.from({ length: 8 }, (_, i) => (
        <Part
          key={i}
          color={i % 2 ? C.white : C.coral}
          position={[-W / 2 + 0.31 + i * 0.625, 1.75, D / 2 + 0.45]}
          rotation={[0.45, 0, 0]}
          castShadow={false}
        >
          <boxGeometry args={[0.625, 0.06, 1]} />
        </Part>
      ))}
      <Sign text="Global ENR" size={[2.6, 0.55]} position={[0, 2.5, D / 2 + 0.03]} bg={C.cream} border={C.ink} />
      {/* terrace table with parasol */}
      <group position={[W / 2 + 1.1, 0, 0.6]}>
        <Part color={C.white} position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.08, 12]} />
        </Part>
        <Part color={C.ink} position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
        </Part>
        <Part color={C.butter} position={[0, 1.8, 0]}>
          <coneGeometry args={[0.9, 0.45, 8]} />
        </Part>
      </group>
      <Windows items={windows} seed={37} />
    </group>
  )
}

function Steam(props: { position: [number, number, number] }) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    g.children.forEach((child, i) => {
      const p = (t * 0.35 + i / g.children.length) % 1
      child.position.set(Math.sin(p * 4 + i) * 0.15 + p * 0.5, p * 2.4, 0)
      const s = Math.sin(p * Math.PI) * 0.42 + 0.02
      child.scale.setScalar(s)
    })
  })
  return (
    <group ref={group} {...props}>
      {Array.from({ length: 5 }, (_, i) => (
        <Part key={i} color={C.white} castShadow={false}>
          <icosahedronGeometry args={[1, 0]} />
        </Part>
      ))}
    </group>
  )
}
