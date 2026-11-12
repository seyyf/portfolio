"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Color, type Group, MeshBasicMaterial } from "three"

import { world } from "@/lib/world"

import { C } from "../materials"
import { gableGeometry } from "../shapes"
import { Building, facadeWindows, Part, Sign, Windows } from "./Building"

// The side-project street: furniture store, supply shop, Paris boutique and thrift shop.

export function FurnitureStore() {
  const W = 4
  const D = 4
  const H = 4
  const windows = useMemo(
    () => facadeWindows({ w: W, d: D, floors: 1, fh: 1.6, y0: 2.1, cols: 3, sideCols: 3, ww: 0.7, wh: 0.75 }),
    []
  )
  return (
    <Building id="febal">
      <Part color={C.cream} outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      <Part color={C.lavender} position={[0, 1, 0]}>
        <boxGeometry args={[W + 0.06, 2, D + 0.06]} />
      </Part>
      <Part color={C.lavenderDeep} position={[0, H + 0.12, 0]}>
        <boxGeometry args={[W + 0.25, 0.25, D + 0.25]} />
      </Part>
      {/* shop window */}
      <Part color={C.glass} position={[-0.4, 0.95, D / 2 + 0.04]} rough={0.2}>
        <boxGeometry args={[2.4, 1.4, 0.04]} />
      </Part>
      <Part color={C.ink} position={[1.35, 0.7, D / 2 + 0.04]}>
        <boxGeometry args={[0.7, 1.3, 0.04]} />
      </Part>
      <Sign text="Febal Casa" size={[2.6, 0.5]} position={[0, 1.85, D / 2 + 0.07]} bg={C.white} border={C.ink} />
      {/* sofa on display */}
      <group position={[-0.4, 0, D / 2 + 1.1]}>
        <Part color={C.creamDeep} position={[0, 0.06, 0]}>
          <boxGeometry args={[2.2, 0.12, 1]} />
        </Part>
        <Part color={C.coral} position={[0, 0.35, 0.05]}>
          <boxGeometry args={[1.6, 0.35, 0.65]} />
        </Part>
        <Part color={C.coral} position={[0, 0.65, -0.22]}>
          <boxGeometry args={[1.6, 0.5, 0.2]} />
        </Part>
        {[-0.85, 0.85].map((x) => (
          <Part key={x} color={C.coralDeep} position={[x, 0.45, 0.05]}>
            <boxGeometry args={[0.18, 0.5, 0.65]} />
          </Part>
        ))}
      </group>
      <Windows items={windows} seed={61} />
    </Building>
  )
}

export function SupplyShop() {
  const W = 3.5
  const D = 3.5
  const H = 3.2
  const glove = useRef<Group>(null)
  const windows = useMemo(
    () =>
      facadeWindows({
        w: W,
        d: D,
        floors: 2,
        fh: 1.4,
        y0: 0.1,
        cols: 3,
        sideCols: 2,
        ww: 0.6,
        wh: 0.55,
        skip: (face, f, c) => face === "front" && f === 0 && c === 1,
      }),
    []
  )
  useFrame(({ clock }) => {
    if (glove.current) glove.current.rotation.z = Math.sin(clock.elapsedTime * 2.2) * 0.25
  })
  return (
    <Building id="aurelia" labelHeight={6.2}>
      <Part color="#EEF7FB" outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      <Part color={C.sky} position={[0, H - 0.25, 0]}>
        <boxGeometry args={[W + 0.06, 0.5, D + 0.06]} />
      </Part>
      <Part color={C.ink} position={[0, 0.65, D / 2 + 0.02]}>
        <boxGeometry args={[0.8, 1.3, 0.05]} />
      </Part>
      <Sign text="Aurelia" size={[2.2, 0.5]} position={[0, 1.6, D / 2 + 0.04]} bg={C.white} border={C.ink} />
      {/* giant waving glove on the roof */}
      <group position={[0, H + 0.1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <group ref={glove}>
          <Part color={C.lavender} position={[0, 0.55, 0]}>
            <boxGeometry args={[0.95, 1.1, 0.35]} />
          </Part>
          {[-0.34, -0.11, 0.12, 0.35].map((x, i) => (
            <Part key={x} color={C.lavender} position={[x, 1.35 + (i === 1 || i === 2 ? 0.08 : 0), 0]}>
              <capsuleGeometry args={[0.1, 0.5, 2, 6]} />
            </Part>
          ))}
          <Part color={C.lavender} position={[-0.6, 0.75, 0]} rotation={[0, 0, 0.8]}>
            <capsuleGeometry args={[0.11, 0.4, 2, 6]} />
          </Part>
          <Part color={C.white} position={[0, 0.05, 0]}>
            <boxGeometry args={[1, 0.18, 0.4]} />
          </Part>
        </group>
      </group>
      <Windows items={windows} seed={67} />
    </Building>
  )
}

export function ParisBoutique() {
  const W = 3.5
  const D = 3.5
  const H = 2.6
  const windows = useMemo(
    () =>
      facadeWindows({
        w: W,
        d: D,
        floors: 2,
        fh: 1.2,
        y0: 0.15,
        cols: 3,
        sideCols: 3,
        ww: 0.5,
        wh: 0.65,
        skip: (face, f, c) => face === "front" && f === 0 && c === 1,
      }),
    []
  )
  return (
    <Building id="weedy" labelHeight={5.6}>
      <Part color={C.cream} outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      {/* mansard roof */}
      <Part color={C.slate} outline position={[0, H + 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[1.75, 2.62, 1, 4]} />
      </Part>
      {/* dormers */}
      {[-0.8, 0.8].map((x) => (
        <Part key={x} color={C.white} position={[x, H + 0.55, D / 2 - 0.25]}>
          <boxGeometry args={[0.45, 0.55, 0.3]} />
        </Part>
      ))}
      {/* balcony rail */}
      <Part color={C.ink} position={[0, 1.45, D / 2 + 0.18]}>
        <boxGeometry args={[W - 0.3, 0.06, 0.06]} />
      </Part>
      {/* awning */}
      {Array.from({ length: 6 }, (_, i) => (
        <Part
          key={i}
          color={i % 2 ? C.white : C.mintDeep}
          position={[-W / 2 + 0.29 + i * 0.583, 1.1, D / 2 + 0.35]}
          rotation={[0.5, 0, 0]}
          castShadow={false}
        >
          <boxGeometry args={[0.583, 0.05, 0.7]} />
        </Part>
      ))}
      <Part color={C.ink} position={[0, 0.5, D / 2 + 0.02]}>
        <boxGeometry args={[0.75, 1, 0.05]} />
      </Part>
      <Sign text="Weedy" size={[1.6, 0.42]} position={[W / 2 + 0.03, 1.9, 0.4]} rotation={[0, Math.PI / 2, 0]} bg={C.mint} border={C.ink} />
      <EiffelLamp position={[-2.6, 0, 2.6]} />
      {/* cobblestones of the French corner */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return (
          <Part key={i} color={i % 2 ? C.creamDeep : C.sidewalk} position={[-2.6 + Math.cos(a) * 1.1, 0.03, 2.6 + Math.sin(a) * 1.1]} castShadow={false}>
            <cylinderGeometry args={[0.28, 0.28, 0.06, 6]} />
          </Part>
        )
      })}
      <Windows items={windows} seed={71} />
    </Building>
  )
}

/** A mini Eiffel-style lamp post whose lantern lights up at night. */
function EiffelLamp({ position }: { position: [number, number, number] }) {
  const lantern = useMemo(() => new MeshBasicMaterial({ color: C.glow, toneMapped: false }), [])
  const base = useMemo(() => new Color(C.glow), [])
  const day = useMemo(() => new Color("#E9DCC4"), [])
  useFrame(() => {
    const n = world.night
    lantern.color.copy(day).lerp(base, n).multiplyScalar(1 + n * 2.5)
  })
  return (
    <group position={position}>
      {/* four splayed legs */}
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i * Math.PI) / 2
        return (
          <Part
            key={i}
            color={C.slate}
            position={[Math.cos(a) * 0.32, 0.55, Math.sin(a) * 0.32]}
            rotation={[Math.sin(a) * -0.35, 0, Math.cos(a) * 0.35]}
          >
            <boxGeometry args={[0.08, 1.15, 0.08]} />
          </Part>
        )
      })}
      <Part color={C.slate} position={[0, 1.15, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.55]} />
      </Part>
      <Part color={C.slate} position={[0, 1.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.06, 0.24, 1.4, 4]} />
      </Part>
      <Part color={C.slate} position={[0, 2.6, 0]}>
        <boxGeometry args={[0.22, 0.06, 0.22]} />
      </Part>
      <mesh material={lantern} position={[0, 2.78, 0]}>
        <sphereGeometry args={[0.14, 10, 8]} />
      </mesh>
      <Part color={C.slate} position={[0, 3.05, 0]}>
        <coneGeometry args={[0.06, 0.35, 4]} />
      </Part>
    </group>
  )
}

export function ThriftShop() {
  const W = 3.5
  const D = 3.5
  const H = 3
  const rack = useRef<Group>(null)
  const windows = useMemo(
    () =>
      facadeWindows({
        w: W,
        d: D,
        floors: 2,
        fh: 1.3,
        y0: 0.15,
        cols: 3,
        sideCols: 2,
        ww: 0.6,
        wh: 0.55,
        skip: (face, f) => face === "front" && f === 0,
      }),
    []
  )
  useFrame(({ clock }) => {
    rack.current?.children.forEach((c, i) => {
      c.rotation.z = Math.sin(clock.elapsedTime * 1.6 + i) * 0.12
    })
  })
  return (
    <Building id="fripa">
      <Part color="#FFB3BA" outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      <Part color={C.white} geometry={gableGeometry(W + 0.3, D + 0.3, 0.9)} position={[0, H, 0]} />
      {/* big shop window and door */}
      <Part color={C.glass} position={[-0.5, 0.75, D / 2 + 0.03]} rough={0.2}>
        <boxGeometry args={[1.8, 1.1, 0.04]} />
      </Part>
      <Part color={C.ink} position={[1.05, 0.65, D / 2 + 0.03]}>
        <boxGeometry args={[0.7, 1.3, 0.04]} />
      </Part>
      <Sign text="Fripa" size={[1.8, 0.5]} position={[0, 1.65, D / 2 + 0.05]} bg={C.butter} border={C.ink} />
      {/* clothes rack outside */}
      <group position={[W / 2 + 0.9, 0, 0.2]}>
        {[-0.8, 0.8].map((z) => (
          <Part key={z} color={C.ink} position={[0, 0.75, z]}>
            <cylinderGeometry args={[0.04, 0.04, 1.5, 6]} />
          </Part>
        ))}
        <Part color={C.ink} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 1.7, 6]} />
        </Part>
        <group ref={rack}>
          {[C.sky, C.coral, C.butter, C.mint, C.lavender].map((col, i) => (
            <group key={col} position={[0, 1.48, -0.6 + i * 0.3]}>
              <Part color={col} position={[0, -0.35, 0]}>
                <boxGeometry args={[0.55, 0.65, 0.08]} />
              </Part>
            </group>
          ))}
        </group>
      </group>
      <Windows items={windows} seed={79} />
    </Building>
  )
}
