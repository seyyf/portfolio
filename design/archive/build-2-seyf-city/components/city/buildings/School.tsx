"use client"

import { Html } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Group } from "three"

import { educaroDepartments } from "@/data/city"
import { gsap } from "@/lib/gsap"

import { labelsPortal } from "../labelsPortal"
import { C } from "../materials"
import { Building, facadeWindows, Part, Sign, useBuildingActive, Windows } from "./Building"

const W = 9
const D = 5.6
const FLOORS = 6
const FH = 0.85
const BASE = 0.3
const H = FLOORS * FH

// Educaro: the biggest building, in the middle of town. Signature: when featured, the floors light up
// one by one, one per department, each with a small label.
export function School() {
  return (
    <Building id="educaro" labelHeight={10.4}>
      <SchoolModel />
    </Building>
  )
}

function SchoolModel() {
  const active = useBuildingActive()
  const floorLight = useMemo(() => ({ current: 0 }), [])
  const [litFloors, setLitFloors] = useState(0)
  const flag = useRef<Group>(null)

  const windows = useMemo(
    () =>
      facadeWindows({
        w: W,
        d: D,
        floors: FLOORS,
        fh: FH,
        y0: BASE,
        cols: 9,
        sideCols: 5,
        ww: 0.5,
        wh: 0.48,
        // Keep the ground floor centre free for the entrance.
        skip: (face, f, c) => face === "front" && f === 0 && c >= 3 && c <= 5,
      }),
    []
  )

  useEffect(() => {
    const t = gsap.to(floorLight, {
      current: active ? FLOORS : 0,
      duration: active ? 2.6 : 0.6,
      delay: active ? 0.5 : 0,
      ease: active ? "none" : "power2.in",
      onUpdate: () => setLitFloors(Math.floor(floorLight.current + 0.5)),
    })
    return () => void t.kill()
  }, [active, floorLight])

  useFrame(({ clock }) => {
    if (flag.current) flag.current.rotation.y = Math.sin(clock.elapsedTime * 3) * 0.25
  })

  return (
    <group>
      {/* plinth and steps */}
      <Part color={C.creamDeep} position={[0, BASE / 2, 0]}>
        <boxGeometry args={[W + 0.6, BASE, D + 0.6]} />
      </Part>
      <Part color={C.white} position={[0, 0.12, D / 2 + 0.75]}>
        <boxGeometry args={[3, 0.24, 0.9]} />
      </Part>
      {/* main body */}
      <Part color={C.peach} outline position={[0, BASE + H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
      </Part>
      {/* floor bands */}
      {Array.from({ length: FLOORS - 1 }, (_, i) => (
        <Part key={i} color={C.white} position={[0, BASE + (i + 1) * FH, 0]} castShadow={false}>
          <boxGeometry args={[W + 0.12, 0.08, D + 0.12]} />
        </Part>
      ))}
      {/* roof parapet */}
      <Part color={C.coral} position={[0, BASE + H + 0.15, 0]}>
        <boxGeometry args={[W + 0.3, 0.3, D + 0.3]} />
      </Part>
      {/* portico: columns and pediment */}
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <Part key={x} color={C.white} position={[x, BASE + 0.8, D / 2 + 0.35]}>
          <cylinderGeometry args={[0.13, 0.15, 1.6, 8]} />
        </Part>
      ))}
      <Part color={C.coral} position={[0, BASE + 1.75, D / 2 + 0.35]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.3, 0.9]} />
      </Part>
      <Part color={C.ink} position={[0, BASE + 0.55, D / 2 + 0.01]}>
        <boxGeometry args={[0.9, 1.1, 0.05]} />
      </Part>
      <Sign text="Educaro" size={[2.6, 0.55]} position={[0, BASE + 2.35, D / 2 + 0.03]} bg={C.butter} border={C.ink} />
      {/* clock tower */}
      <Part color={C.lavender} outline position={[0, BASE + H + 1.2, -0.6]}>
        <boxGeometry args={[2, 2.4, 2]} />
      </Part>
      <Part color={C.coral} position={[0, BASE + H + 3.1, -0.6]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.6, 1.4, 4]} />
      </Part>
      <Part color={C.white} position={[0, BASE + H + 1.45, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 20]} />
      </Part>
      <Part color={C.ink} position={[0, BASE + H + 1.55, 0.46]}>
        <boxGeometry args={[0.06, 0.4, 0.02]} />
      </Part>
      <Part color={C.ink} position={[0.12, BASE + H + 1.45, 0.46]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 0.3, 0.02]} />
      </Part>
      {/* flag */}
      <Part color={C.white} position={[3.6, BASE + H + 1.1, 1.8]}>
        <cylinderGeometry args={[0.04, 0.04, 2.2, 6]} />
      </Part>
      <group ref={flag} position={[3.6, BASE + H + 1.85, 1.8]}>
        <group position={[0.4, 0, 0]}>
          <Part color={C.sky}>
            <boxGeometry args={[0.8, 0.5, 0.03]} />
          </Part>
        </group>
      </group>
      <Windows items={windows} seed={11} floorLight={floorLight} />
      {active && <DepartmentLabels lit={litFloors} />}
    </group>
  )
}

function DepartmentLabels({ lit }: { lit: number }) {
  // Floors are only a few pixels apart on phones, so show just the floor that is lighting up.
  const compact = useThree((s) => s.size.width < 640)
  return (
    <group>
      {educaroDepartments.map((name, i) => (
        <Html key={name} portal={labelsPortal as React.RefObject<HTMLElement>} position={[-W / 2 - 0.2, BASE + i * FH + FH * 0.55, D / 2]} zIndexRange={[19, 0]} style={{ pointerEvents: "none" }}>
          <DepartmentChip name={name} visible={compact ? i === lit - 1 : i < lit} />
        </Html>
      ))}
    </group>
  )
}

function DepartmentChip({ name, visible }: { name: string; visible: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.to(ref.current, {
      autoAlpha: visible ? 1 : 0,
      x: visible ? 0 : 12,
      scale: visible ? 1 : 0.6,
      duration: visible ? 0.5 : 0.2,
      ease: visible ? "back.out(2.4)" : "power1.in",
    })
  }, [visible])
  return (
    <span aria-hidden="true" className="block -translate-x-full -translate-y-1/2">
    <span
      ref={ref}
      style={{ opacity: 0, visibility: "hidden" }}
      className="block whitespace-nowrap rounded-full border-2 border-ink bg-glow px-2.5 py-0.5 font-display text-xs font-semibold text-ink shadow-[0_2px_0_var(--color-ink)]"
    >
      {name}
    </span>
    </span>
  )
}

