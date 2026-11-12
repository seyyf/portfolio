"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import type { Group } from "three"

import { useCity } from "@/lib/store"

import { C } from "../materials"
import { gableGeometry } from "../shapes"
import { Building, facadeWindows, Part, Windows } from "./Building"

const W = 4
const D = 4
const H = 2.6

// My house: about me. The mailbox opens the contact form; its flag pops up once a message is prepared.
export function House() {
  return (
    <Building id="house" labelHeight={6}>
      <HouseModel />
    </Building>
  )
}

function HouseModel() {
  const flag = useRef<Group>(null)
  const mailSent = useCity((s) => s.mailSent)
  const windows = useMemo(
    () =>
      facadeWindows({
        w: W,
        d: D,
        floors: 1,
        fh: 1.6,
        y0: 0.4,
        cols: 3,
        sideCols: 2,
        ww: 0.6,
        wh: 0.6,
        skip: (face, f, c) => face === "front" && c === 1,
      }),
    []
  )

  useFrame((_, dt) => {
    const f = flag.current
    if (!f) return
    const target = mailSent ? -Math.PI / 2 : 0
    f.rotation.z += (target - f.rotation.z) * Math.min(1, dt * 6)
  })

  return (
    <group>
      <Part color={C.butter} outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      <Part color={C.coral} outline geometry={gableGeometry(W + 0.5, D + 0.5, 1.7)} position={[0, H, 0]} />
      <Part color={C.creamDeep} position={[-1, H + 1.1, -0.5]}>
        <boxGeometry args={[0.45, 1.1, 0.45]} />
      </Part>
      {/* door, step and round window */}
      <Part color={C.sky} position={[0, 0.7, D / 2 + 0.03]}>
        <boxGeometry args={[0.85, 1.4, 0.06]} />
      </Part>
      <Part color={C.white} position={[0, 0.06, D / 2 + 0.35]}>
        <boxGeometry args={[1.3, 0.12, 0.6]} />
      </Part>
      <Part color={C.glass} position={[0, H + 0.55, D / 2 + 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 12]} />
      </Part>
      {/* garden fence */}
      {Array.from({ length: 9 }, (_, i) => (
        <Part key={i} color={C.white} position={[-2.4 + i * 0.6, 0.3, D / 2 + 1.9]}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
        </Part>
      ))}
      <Part color={C.white} position={[-0.0, 0.42, D / 2 + 1.9]}>
        <boxGeometry args={[4.9, 0.08, 0.06]} />
      </Part>
      {/* flower beds */}
      {[-1.6, 1.6].map((x) => (
        <group key={x} position={[x, 0, D / 2 + 1]}>
          <Part color={C.mintDeep} position={[0, 0.12, 0]}>
            <boxGeometry args={[1.2, 0.24, 0.6]} />
          </Part>
          {[-0.35, 0, 0.35].map((dx, i) => (
            <Part key={dx} color={[C.coral, C.butter, C.lavender][i]} position={[dx, 0.32, 0]}>
              <icosahedronGeometry args={[0.13, 0]} />
            </Part>
          ))}
        </group>
      ))}
      {/* mailbox */}
      <group position={[2.6, 0, D / 2 + 2.3]} rotation={[0, Math.PI / 4, 0]}>
        <Part color={C.ink} position={[0, 0.45, 0]}>
          <boxGeometry args={[0.09, 0.9, 0.09]} />
        </Part>
        <Part color={C.sky} outline position={[0, 1.02, 0]}>
          <boxGeometry args={[0.38, 0.32, 0.6]} />
        </Part>
        <Part color={C.sky} position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.6, 10, 1, false, 0, Math.PI]} />
        </Part>
        <group ref={flag} position={[0.22, 1.0, 0.18]}>
          <Part color={C.coral} position={[0, 0.2, 0]}>
            <boxGeometry args={[0.04, 0.4, 0.04]} />
          </Part>
          <Part color={C.coral} position={[0, 0.34, -0.1]}>
            <boxGeometry args={[0.04, 0.14, 0.2]} />
          </Part>
        </group>
      </group>
      <Windows items={windows} seed={83} />
    </group>
  )
}
