"use client"

import { Float } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { type Group, MeshStandardMaterial } from "three"

import { gsap } from "@/lib/gsap"

import { C, createTextTexture } from "../materials"
import { gableGeometry } from "../shapes"
import { Building, facadeWindows, Part, Sign, useBuildingActive, Windows } from "./Building"

const W = 5
const D = 4
const H = 3

// A few headline tools pop out of the toolbox as 3D badges; the full list is in the panel.
const BADGES = [
  { label: "React", color: C.sky },
  { label: "Next.js", color: C.white },
  { label: "TypeScript", color: C.sky },
  { label: "Node.js", color: C.mint },
  { label: "Tailwind", color: C.mint },
  { label: "Docker", color: C.lavender },
  { label: "MongoDB", color: C.butter },
  { label: "PHP", color: C.lavender },
]

export function Workshop() {
  return (
    <Building id="workshop" labelHeight={6}>
      <WorkshopModel />
    </Building>
  )
}

function WorkshopModel() {
  const windows = useMemo(
    () => facadeWindows({ w: W, d: D, floors: 1, fh: 1.6, y0: 1.1, cols: 0, sideCols: 3, ww: 0.6, wh: 0.6 }),
    []
  )
  return (
    <group>
      <Part color={C.lavender} outline position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      <Part color={C.sky} outline geometry={gableGeometry(W + 0.4, D + 0.4, 1.4)} position={[0, H, 0]} />
      {/* striped garage door */}
      {Array.from({ length: 5 }, (_, i) => (
        <Part key={i} color={i % 2 ? C.white : C.butter} position={[-0.4, 0.2 + i * 0.4, D / 2 + 0.03]} castShadow={false}>
          <boxGeometry args={[2.6, 0.38, 0.05]} />
        </Part>
      ))}
      <Sign text="Workshop" size={[2.4, 0.5]} position={[-0.4, 2.45, D / 2 + 0.04]} bg={C.cream} border={C.ink} />
      {/* workbench */}
      <Part color={C.wood} position={[1.9, 0.45, D / 2 + 0.6]}>
        <boxGeometry args={[1, 0.12, 0.6]} />
      </Part>
      {[1.5, 2.3].map((x) => (
        <Part key={x} color={C.wood} position={[x, 0.2, D / 2 + 0.6]}>
          <boxGeometry args={[0.08, 0.4, 0.5]} />
        </Part>
      ))}
      <Toolbox position={[W / 2 + 1.2, 0, 1.6]} />
      <Windows items={windows} seed={89} />
    </group>
  )
}

function Toolbox({ position }: { position: [number, number, number] }) {
  const active = useBuildingActive()
  const lid = useRef<Group>(null)
  const tools = useRef<Group>(null)
  const badgeRefs = useRef<(Group | null)[]>([])
  const state = useRef({ open: 0 })

  useEffect(() => {
    const tween = gsap.to(state.current, {
      open: active ? 1 : 0,
      duration: active ? 0.9 : 0.4,
      ease: active ? "back.out(1.6)" : "power2.in",
    })
    const badges = badgeRefs.current.filter(Boolean) as Group[]
    const pops = badges.map((b, i) =>
      gsap.to(b.scale, {
        x: active ? 1 : 0.001,
        y: active ? 1 : 0.001,
        z: active ? 1 : 0.001,
        duration: active ? 0.7 : 0.25,
        delay: active ? 0.35 + i * 0.09 : 0,
        ease: active ? "elastic.out(1, 0.5)" : "power2.in",
      })
    )
    return () => {
      tween.kill()
      pops.forEach((p) => p.kill())
    }
  }, [active])

  useFrame(() => {
    const o = state.current.open
    if (lid.current) lid.current.rotation.x = -o * 1.9
    if (tools.current) {
      tools.current.position.y = 0.2 + o * 0.45
      tools.current.visible = o > 0.05
    }
  })

  return (
    <group position={position} rotation={[0, Math.PI / 4, 0]}>
      <Part color={C.coral} outline position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.6, 0.7]} />
      </Part>
      <group ref={lid} position={[0, 0.6, -0.35]}>
        <Part color={C.coralDeep} position={[0, 0.06, 0.35]}>
          <boxGeometry args={[1.22, 0.12, 0.72]} />
        </Part>
        <Part color={C.ink} position={[0, 0.2, 0.35]}>
          <boxGeometry args={[0.5, 0.08, 0.08]} />
        </Part>
      </group>
      {/* wrench and hammer peeking out */}
      <group ref={tools} position={[0, 0.2, 0]}>
        <Part color={C.slate} position={[-0.25, 0.4, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.1, 0.8, 0.06]} />
        </Part>
        <Part color={C.slate} position={[-0.17, 0.82, 0]}>
          <torusGeometry args={[0.1, 0.04, 4, 8, Math.PI * 1.4]} />
        </Part>
        <Part color={C.wood} position={[0.25, 0.4, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.08, 0.8, 0.08]} />
        </Part>
        <Part color={C.slate} position={[0.3, 0.8, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.36, 0.14, 0.14]} />
        </Part>
      </group>
      {/* skill badges in an arc above the box */}
      <group>
        {BADGES.map((b, i) => {
          const a = Math.PI * (0.08 + (0.84 * i) / (BADGES.length - 1))
          return (
            <group
              key={b.label}
              ref={(el) => {
                badgeRefs.current[i] = el
              }}
              scale={0.001}
              position={[Math.cos(a) * 2.1, 1.3 + Math.sin(a) * 1.6, 0]}
            >
              <Float speed={2.4} rotationIntensity={0.2} floatIntensity={0.6}>
                <Badge label={b.label} color={b.color} />
              </Float>
            </group>
          )
        })}
      </group>
    </group>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  const material = useMemo(() => {
    const tex = createTextTexture(label, { width: 256, height: 256, bg: color, border: C.ink, radius: 128, font: 52, weight: 700 })
    return new MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7, emissiveMap: tex, emissive: "#ffffff", emissiveIntensity: 0.25 })
  }, [label, color])
  useEffect(
    () => () => {
      material.map?.dispose()
      material.dispose()
    },
    [material]
  )
  return (
    <mesh material={material}>
      <planeGeometry args={[0.95, 0.95]} />
    </mesh>
  )
}
