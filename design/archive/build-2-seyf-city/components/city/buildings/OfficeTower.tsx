"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Color, type Mesh, MeshBasicMaterial } from "three"

import { C, mat } from "../materials"
import { Building, facadeWindows, Part, Sign, Windows } from "./Building"

const W = 4
const D = 4
const FLOORS = 11
const FH = 0.95
const H = FLOORS * FH + 0.3

// Bertsch Innovation: the office tower where it all started. An "Est. 2020" plaque and a glass
// elevator that rides up and down the front.
export function OfficeTower() {
  return (
    <Building id="bertsch" labelHeight={H + 2.6}>
      <TowerModel />
    </Building>
  )
}

function TowerModel() {
  const car = useRef<Mesh>(null)
  const beacon = useMemo(() => new MeshBasicMaterial({ color: "#FF6B6B", toneMapped: false }), [])
  const windows = useMemo(
    () =>
      facadeWindows({
        w: W,
        d: D,
        floors: FLOORS,
        fh: FH,
        y0: 0.3,
        cols: 4,
        sideCols: 4,
        ww: 0.62,
        wh: 0.55,
        skip: (face, f, c) => (face === "front" && c === 3) || (face === "front" && f === 0 && c === 1),
      }),
    []
  )
  const red = useMemo(() => new Color("#FF6B6B"), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (car.current) {
      // Ease in and out between the ground floor and the top, pausing at each end.
      const cycle = (Math.sin(t * 0.45) + 1) / 2
      const eased = cycle * cycle * (3 - 2 * cycle)
      car.current.position.y = 0.75 + eased * (H - 1.6)
    }
    const blink = Math.sin(t * 3) > 0.6 ? 3 : 0.4
    beacon.color.copy(red).multiplyScalar(blink)
  })

  return (
    <group>
      <Part color={C.creamDeep} position={[0, 0.15, 0]}>
        <boxGeometry args={[W + 0.5, 0.3, D + 0.5]} />
      </Part>
      <Part color="#B9D7EA" outline position={[0, 0.3 + (H - 0.3) / 2, 0]}>
        <boxGeometry args={[W, H - 0.3, D]} />
      </Part>
      {/* corner pilasters */}
      {[
        [-W / 2, D / 2],
        [W / 2, D / 2],
        [W / 2, -D / 2],
      ].map(([x, z]) => (
        <Part key={`${x}${z}`} color={C.white} position={[x, H / 2 + 0.15, z]}>
          <boxGeometry args={[0.22, H - 0.3, 0.22]} />
        </Part>
      ))}
      {/* crown and antenna */}
      <Part color={C.lavender} outline position={[0, H + 0.3, 0]}>
        <boxGeometry args={[W - 0.6, 0.6, D - 0.6]} />
      </Part>
      <Part color={C.white} position={[0.6, H + 1.3, -0.5]}>
        <cylinderGeometry args={[0.05, 0.07, 1.6, 6]} />
      </Part>
      <mesh material={beacon} position={[0.6, H + 2.15, -0.5]}>
        <sphereGeometry args={[0.12, 8, 6]} />
      </mesh>
      {/* glass elevator shaft and car */}
      <mesh position={[1.5, H / 2 + 0.15, D / 2 + 0.32]} material={mat(C.glass, { rough: 0.2 })}>
        <boxGeometry args={[0.8, H - 0.3, 0.55]} />
      </mesh>
      <mesh ref={car} position={[1.5, 0.75, D / 2 + 0.32]} material={mat(C.butter)} castShadow>
        <boxGeometry args={[0.66, 0.8, 0.45]} />
      </mesh>
      {/* entrance and plaque */}
      <Part color={C.ink} position={[-0.5, 0.85, D / 2 + 0.02]}>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
      </Part>
      <Sign text="Bertsch" size={[1.9, 0.45]} position={[-0.5, 1.75, D / 2 + 0.03]} bg={C.white} border={C.ink} />
      <Sign text="Est. 2020" size={[1.3, 0.42]} position={[W / 2 + 0.03, 1.2, 0.6]} rotation={[0, Math.PI / 2, 0]} bg={C.butter} border={C.ink} />
      <Windows items={windows} seed={53} />
    </group>
  )
}
