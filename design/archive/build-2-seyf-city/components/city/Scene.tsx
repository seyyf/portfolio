"use client"

import { PerformanceMonitor, useProgress } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useState } from "react"

import { useCity } from "@/lib/store"

import { Billboard } from "./Billboard"
import { Buildings } from "./buildings"
import { CityCamera, ExploreControls } from "./Camera"
import { Effects } from "./Effects"
import { Island } from "./Island"
import { Cars, Scooter } from "./life/Cars"
import { Birds, Clouds, Fireflies } from "./life/Ambient"
import { People } from "./life/People"
import { Lights } from "./Lights"
import { SkyDome, SkyDriver } from "./Sky"

/** Marks the scene ready once assets are loaded and a few frames have rendered (shaders compiled). */
function ReadySignal() {
  const frames = useRef(0)
  const active = useProgress((s) => s.active)
  useFrame(() => {
    if (useCity.getState().sceneReady || active) return
    frames.current++
    if (frames.current > 3) useCity.getState().setSceneReady()
  })
  return null
}

export default function Scene({ paused = false }: { paused?: boolean }) {
  const quality = useCity((s) => s.quality)
  const mode = useCity((s) => s.mode)
  const setQuality = useCity((s) => s.setQuality)
  const [dpr, setDpr] = useState(quality === "high" ? 1.5 : 1.25)
  const high = quality === "high"

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      flat
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
      // During the tour the page must still scroll when a finger lands on the city.
      style={{ touchAction: mode === "tour" ? "pan-y" : "none" }}
    >
      <PerformanceMonitor
        onChange={({ factor }) => setDpr(Math.round((1 + factor * 0.5) * 4) / 4)}
        onDecline={() => {
          if (!useCity.getState().capture) setQuality("low")
        }}
        flipflops={3}
      />
      <CityCamera />
      {mode === "explore" && <ExploreControls />}
      <SkyDriver />
      <SkyDome />
      <Lights />
      <Island />
      <Buildings />
      <Billboard />
      <People count={high ? 36 : 14} />
      <Cars count={high ? 8 : 4} />
      <Scooter />
      <Birds />
      <Clouds />
      <Fireflies count={high ? 44 : 16} />
      {high && <Effects />}
      <ReadySignal />
    </Canvas>
  )
}
