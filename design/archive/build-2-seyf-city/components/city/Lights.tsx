"use client"

import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import type { DirectionalLight, HemisphereLight } from "three"

import { useCity } from "@/lib/store"

import { skyState } from "./Sky"

const DEG = Math.PI / 180

/**
 * Sun (or moon) and sky light, both following the time of day. A low sun gives long shadows,
 * noon gives short ones. Shadows are only cast on the high quality tier.
 */
export function Lights() {
  const sun = useRef<DirectionalLight>(null)
  const hemi = useRef<HemisphereLight>(null)
  const quality = useCity((s) => s.quality)

  useEffect(() => {
    const l = sun.current
    if (!l) return
    l.castShadow = quality === "high"
    l.shadow.mapSize.set(2048, 2048)
    const cam = l.shadow.camera
    cam.left = -30
    cam.right = 30
    cam.top = 30
    cam.bottom = -30
    cam.near = 1
    cam.far = 120
    cam.updateProjectionMatrix()
    l.shadow.bias = -0.0006
    l.shadow.normalBias = 0.03
    l.target.position.set(0, 0, 0)
    l.target.updateMatrixWorld()
  }, [quality])

  useFrame(() => {
    const l = sun.current
    const h = hemi.current
    if (!l || !h) return
    // Clamp the elevation used for shadows so sunrise shadows don't cover the whole island.
    const el = Math.max(16, skyState.elevation) * DEG
    const az = skyState.azimuth * DEG
    const r = 60
    // Azimuth 0 = sun behind the viewer's left shoulder at noon; the light swings east to west.
    l.position.set(Math.sin(az + Math.PI / 4) * Math.cos(el) * r, Math.sin(el) * r, Math.cos(az + Math.PI / 4) * Math.cos(el) * r)
    l.color.copy(skyState.sun)
    l.intensity = skyState.sunIntensity
    h.color.copy(skyState.hemiSky)
    h.groundColor.copy(skyState.hemiGround)
    h.intensity = skyState.hemiIntensity
  })

  return (
    <>
      <directionalLight ref={sun} />
      <hemisphereLight ref={hemi} />
    </>
  )
}
