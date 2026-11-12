"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { Color, ShaderMaterial, Vector2 } from "three"

import { createSkyState, sampleSky } from "@/lib/sky"
import { useCity } from "@/lib/store"
import { smoothstep, world } from "@/lib/world"

/** Sky palette for the current frame, shared with the lights. */
export const skyState = createSkyState()

/**
 * Resolves the effective time of day every frame (scroll time blended with the header toggle),
 * samples the palette, and tells React when night starts or ends.
 */
export function SkyDriver() {
  useFrame(() => {
    world.time = world.scrollTime + (world.overrideTime - world.scrollTime) * world.overrideBlend
    sampleSky(world.time, skyState)
    world.night = skyState.night
    const isNight = world.night > 0.5
    if (isNight !== useCity.getState().isNight) useCity.getState().setIsNight(isNight)
  }, -2)
  return null
}

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform float uNight;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uSun;
  uniform float uSunO;
  uniform vec2 uMoon;
  uniform float uMoonO;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));

    // Stars: one candidate per grid cell, twinkling, fading in with the night.
    vec2 grid = vUv * vec2(uAspect, 1.0) * 70.0;
    vec2 id = floor(grid);
    vec2 f = fract(grid) - 0.5;
    float h = hash(id);
    if (h > 0.955) {
      vec2 o = (vec2(hash(id + 1.3), hash(id + 2.7)) - 0.5) * 0.6;
      float tw = 0.55 + 0.45 * sin(uTime * (1.5 + h * 3.0) + h * 40.0);
      float d = length(f - o);
      col += vec3(1.0, 0.96, 0.85) * smoothstep(0.09, 0.0, d) * tw * uNight * 1.6;
    }

    // Sun: disc plus a soft halo.
    vec2 sp = (vUv - uSun) * vec2(uAspect, 1.0);
    float sd = length(sp);
    col += vec3(1.0, 0.86, 0.55) * (smoothstep(0.062, 0.056, sd) * 0.9 + exp(-sd * 10.0) * 0.35) * uSunO;

    // Moon: crescent plus a cool glow.
    vec2 mp = (vUv - uMoon) * vec2(uAspect, 1.0);
    float md = length(mp);
    float bite = smoothstep(0.046, 0.04, length(mp - vec2(0.022, 0.014)));
    float moon = smoothstep(0.048, 0.043, md) * (1.0 - bite);
    col += vec3(1.0, 0.95, 0.8) * moon * 1.5 * uMoonO;
    col += vec3(0.55, 0.6, 1.0) * exp(-md * 8.0) * 0.18 * uMoonO;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

/** Full-screen sky drawn behind everything: gradient, stars, sun and moon on arcs. */
export function SkyDome() {
  const size = useThree((s) => s.size)
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        uniforms: {
          uTop: { value: new Color() },
          uBottom: { value: new Color() },
          uNight: { value: 0 },
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uSun: { value: new Vector2() },
          uSunO: { value: 1 },
          uMoon: { value: new Vector2() },
          uMoonO: { value: 0 },
        },
      }),
    []
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    const u = material.uniforms
    const t = world.time
    u.uTop.value.copy(skyState.top)
    u.uBottom.value.copy(skyState.bottom)
    u.uNight.value = skyState.night
    u.uTime.value = clock.elapsedTime
    u.uAspect.value = size.width / size.height
    // Sun arcs from the left (sunrise) to the right (dusk); the moon rises on the left at night.
    const k = Math.min(1, t / 0.9)
    u.uSun.value.set(0.08 + k * 0.84, 0.42 + Math.sin(k * Math.PI) * 0.45)
    u.uSunO.value = 1 - smoothstep(0.82, 0.92, t)
    const m = smoothstep(0.8, 1, t)
    u.uMoon.value.set(0.12 + m * 0.12, 0.35 + m * 0.5)
    u.uMoonO.value = m
  })

  return (
    <mesh material={material} frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
