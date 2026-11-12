"use client"

import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { MeshBasicMaterial, MeshStandardMaterial, type Mesh } from "three"

import { C } from "../materials"
import { qrTexture } from "../shapes"
import { Building, facadeWindows, Part, Sign, useBuildingActive, Windows } from "./Building"

const W = 4.5
const D = 3.5
const H = 3

// Opus Lab: café with a terrace. Signature: the QR code on a table scans with a light sweep.
export function Cafe() {
  return (
    <Building id="opuslab">
      <CafeModel />
    </Building>
  )
}

function CafeModel() {
  const windows = useMemo(
    () =>
      facadeWindows({
        w: W,
        d: D,
        floors: 2,
        fh: 1.35,
        y0: 0.1,
        cols: 3,
        sideCols: 2,
        ww: 0.7,
        wh: 0.65,
        skip: (face, f, c) => face === "front" && f === 0 && c === 1,
      }),
    []
  )
  return (
    <group>
      <Part color={C.sky} outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      <Part color={C.butter} position={[0, H + 0.12, 0]}>
        <boxGeometry args={[W + 0.25, 0.25, D + 0.25]} />
      </Part>
      <Part color={C.ink} position={[0, 0.65, D / 2 + 0.02]}>
        <boxGeometry args={[0.85, 1.3, 0.05]} />
      </Part>
      {/* awning */}
      {Array.from({ length: 6 }, (_, i) => (
        <Part
          key={i}
          color={i % 2 ? C.white : C.butter}
          position={[-W / 2 + 0.375 + i * 0.75, 1.72, D / 2 + 0.4]}
          rotation={[0.5, 0, 0]}
          castShadow={false}
        >
          <boxGeometry args={[0.75, 0.06, 0.9]} />
        </Part>
      ))}
      <Sign text="Opus Lab" size={[2.4, 0.55]} position={[0, 2.45, D / 2 + 0.03]} bg={C.cream} border={C.ink} />
      {/* rooftop pizza slice sign */}
      <group position={[0, H + 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
        <Part color={C.butter} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.7, 1.3, 3]} />
        </Part>
        <Part color={C.coral} position={[0, 0.25, 0.22]}>
          <sphereGeometry args={[0.13, 8, 6]} />
        </Part>
      </group>
      {/* terrace */}
      <Table position={[-1.2, 0, D / 2 + 1.7]} />
      <Table position={[1.3, 0, D / 2 + 1.7]} qr />
      <Windows items={windows} seed={41} />
    </group>
  )
}

function Table({ position, qr }: { position: [number, number, number]; qr?: boolean }) {
  return (
    <group position={position}>
      <Part color={C.white} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.07, 12]} />
      </Part>
      <Part color={C.ink} position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 6]} />
      </Part>
      {[-0.65, 0.65].map((x) => (
        <Part key={x} color={C.coral} position={[x, 0.28, 0]}>
          <boxGeometry args={[0.3, 0.06, 0.3]} />
        </Part>
      ))}
      {qr && <QrTent />}
    </group>
  )
}

/** Table tent with the QR code. A glowing bar sweeps across it while the café is featured. */
function QrTent() {
  const active = useBuildingActive()
  const sweep = useRef<Mesh>(null)
  const { face, sweepMat } = useMemo(() => {
    const tex = qrTexture()
    return {
      face: new MeshStandardMaterial({ map: tex, roughness: 0.9 }),
      sweepMat: new MeshBasicMaterial({ color: C.mint, toneMapped: false, transparent: true, opacity: 0.85 }),
    }
  }, [])
  useEffect(
    () => () => {
      face.map?.dispose()
      face.dispose()
      sweepMat.dispose()
    },
    [face, sweepMat]
  )
  useFrame(({ clock }) => {
    const s = sweep.current
    if (!s) return
    s.visible = active
    if (active) {
      const p = (clock.elapsedTime * 0.8) % 1
      s.position.y = 0.58 + p * 0.34
      sweepMat.color.set(C.mint).multiplyScalar(2.2)
    }
  })
  return (
    <group position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
      <mesh material={face} position={[0, 0.75, 0.03]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.02]} />
      </mesh>
      <mesh ref={sweep} material={sweepMat} position={[0, 0.6, 0.06]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.46, 0.035, 0.01]} />
      </mesh>
    </group>
  )
}
