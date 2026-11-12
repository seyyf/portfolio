"use client"

import { useFrame } from "@react-three/fiber"
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing"
import type { BloomEffect, VignetteEffect } from "postprocessing"
import { useRef } from "react"

import { world } from "@/lib/world"

/** Bloom makes windows, lamps and signs glow at night; a soft vignette frames the diorama. */
export function Effects() {
  const bloom = useRef<BloomEffect>(null)
  const vignette = useRef<VignetteEffect>(null)

  useFrame(() => {
    const n = world.night
    if (bloom.current) bloom.current.intensity = 0.25 + n * 1.1
    if (vignette.current) vignette.current.darkness = 0.32 + n * 0.25
  })

  return (
    <EffectComposer multisampling={4}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} radius={0.72} intensity={0.3} />
      <Vignette ref={vignette} offset={0.32} darkness={0.35} />
    </EffectComposer>
  )
}
