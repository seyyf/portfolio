"use client"

import { Instance, Instances, RoundedBox } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { AdditiveBlending, BoxGeometry, type BufferGeometry, CanvasTexture, Color, type Group, type Object3D } from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { useCity } from "@/lib/store"
import { effectiveAssemble, smoothstep, world } from "@/lib/world"

import { C, mat } from "./materials"
import { BLOCKS, ISLAND, makeLamps, makeTrees, POND, ROAD_W, ROADS_X, ROADS_Z } from "./layout"

/** Merges a list of boxes into one geometry (one draw call for all static pieces of a color). */
function mergedBoxes(boxes: { w: number; h: number; d: number; x: number; y: number; z: number }[]) {
  const parts: BufferGeometry[] = boxes.map((b) => new BoxGeometry(b.w, b.h, b.d).translate(b.x, b.y, b.z))
  const merged = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  return merged
}

export function Island() {
  const quality = useCity((s) => s.quality)
  return (
    <group>
      <Ground />
      <Roads />
      <Trees max={quality === "high" ? 90 : 40} />
      <StreetLights />
    </group>
  )
}

function Ground() {
  const { sidewalks, lawns, plaza } = useMemo(() => {
    const centre = BLOCKS[4]
    return {
      sidewalks: mergedBoxes(
        BLOCKS.map((b) => ({ w: b.x1 - b.x0, h: 0.1, d: b.z1 - b.z0, x: (b.x0 + b.x1) / 2, y: 0.05, z: (b.z0 + b.z1) / 2 }))
      ),
      lawns: mergedBoxes(
        BLOCKS.filter((b) => b !== centre).map((b) => ({
          w: b.x1 - b.x0 - 1.6,
          h: 0.1,
          d: b.z1 - b.z0 - 1.6,
          x: (b.x0 + b.x1) / 2,
          y: 0.1,
          z: (b.z0 + b.z1) / 2,
        }))
      ),
      plaza: mergedBoxes([
        { w: centre.x1 - centre.x0 - 1.6, h: 0.1, d: centre.z1 - centre.z0 - 1.6, x: 0, y: 0.1, z: 0 },
      ]),
    }
  }, [])

  return (
    <group>
      {/* floating island: grass top, sandy cliff, lavender rock underneath */}
      <RoundedBox args={[ISLAND * 2 + 1, 2, ISLAND * 2 + 1]} radius={0.9} smoothness={2} position={[0, -1, 0]} receiveShadow material={mat(C.mintDeep)} />
      <RoundedBox args={[ISLAND * 2 - 0.5, 3, ISLAND * 2 - 0.5]} radius={1.2} smoothness={2} position={[0, -3, 0]} material={mat("#F2CFA6")} />
      <RoundedBox args={[ISLAND * 2 - 4, 3, ISLAND * 2 - 4]} radius={1.2} smoothness={2} position={[0, -5.2, 0]} material={mat(C.lavenderDeep)} />
      <mesh geometry={sidewalks} material={mat(C.sidewalk)} receiveShadow />
      <mesh geometry={lawns} material={mat(C.grass)} receiveShadow />
      <mesh geometry={plaza} material={mat(C.cream)} receiveShadow />
      {/* pond on the side-project street */}
      <mesh position={[POND.x, 0.16, POND.z]} material={mat(C.sky, { rough: 0.25 })} receiveShadow>
        <cylinderGeometry args={[POND.r, POND.r, 0.06, 18]} />
      </mesh>
      <mesh position={[POND.x, 0.12, POND.z]} material={mat(C.white)}>
        <cylinderGeometry args={[POND.r + 0.25, POND.r + 0.25, 0.08, 18]} />
      </mesh>
    </group>
  )
}

/** Roads draw themselves from the centre outwards while the city assembles. */
function Roads() {
  const roads = useRef<(Group | null)[]>([])
  const dashes = useMemo(() => {
    const list: { x: number; z: number; along: "x" | "z" }[] = []
    for (const rx of ROADS_X)
      for (let z = -ISLAND + 1; z < ISLAND; z += 1.6)
        if (!ROADS_Z.some((rz) => Math.abs(z - rz) < ROAD_W)) list.push({ x: rx, z, along: "z" })
    for (const rz of ROADS_Z)
      for (let x = -ISLAND + 1; x < ISLAND; x += 1.6)
        if (!ROADS_X.some((rx) => Math.abs(x - rx) < ROAD_W)) list.push({ x, z: rz, along: "x" })
    return list
  }, [])

  const crossings = useMemo(() => {
    const list: { x: number; z: number; rot: number }[] = []
    for (const rx of ROADS_X)
      for (const rz of ROADS_Z) {
        for (let k = -2; k <= 2; k++) {
          list.push({ x: rx + k * 0.42, z: rz - ROAD_W / 2 - 0.55, rot: 0 })
          list.push({ x: rx - ROAD_W / 2 - 0.55, z: rz + k * 0.42, rot: Math.PI / 2 })
        }
      }
    return list
  }, [])

  const marks = useRef<Group>(null)

  useFrame(() => {
    const a = effectiveAssemble()
    roads.current.forEach((g, i) => {
      if (!g) return
      const p = smoothstep(0.02 + i * 0.05, 0.3 + i * 0.05, a)
      g.scale.set(Math.max(0.0001, p), 1, 1)
      g.visible = p > 0.001
    })
    if (marks.current) marks.current.visible = a > 0.42
  })

  const roadMat = mat(C.road)
  return (
    <group>
      {[...ROADS_X.map((x) => ({ x, z: 0, rot: Math.PI / 2 })), ...ROADS_Z.map((z) => ({ x: 0, z, rot: 0 }))].map((r, i) => (
        <group key={i} position={[r.x, 0.12, r.z]} rotation={[0, r.rot, 0]}>
          <group
            ref={(el) => {
              roads.current[i] = el
            }}
          >
            <mesh material={roadMat} receiveShadow>
              <boxGeometry args={[ISLAND * 2 + 0.6, 0.08, ROAD_W]} />
            </mesh>
          </group>
        </group>
      ))}
      <group ref={marks}>
        <Instances limit={dashes.length} material={mat(C.white)}>
          <boxGeometry args={[0.7, 0.02, 0.14]} />
          {dashes.map((d, i) => (
            <Instance key={i} position={[d.x, 0.17, d.z]} rotation={[0, d.along === "z" ? Math.PI / 2 : 0, 0]} />
          ))}
        </Instances>
        <Instances limit={crossings.length} material={mat(C.white)}>
          <boxGeometry args={[0.24, 0.02, 0.9]} />
          {crossings.map((c, i) => (
            <Instance key={i} position={[c.x, 0.17, c.z]} rotation={[0, c.rot, 0]} />
          ))}
        </Instances>
      </group>
    </group>
  )
}

const FOLIAGE = [C.mintDeep, "#8FD8A8", "#B5E39A"]

/** Instanced trees that pop in with a spring and sway gently. */
function Trees({ max }: { max: number }) {
  const trees = useMemo(() => makeTrees(max), [max])
  const trunks = useRef<(Object3D | null)[]>([])
  const crowns = useRef<(Object3D | null)[]>([])
  const springs = useMemo(() => trees.map(() => ({ x: 0, v: 0 })), [trees])

  useFrame(({ clock }, dt) => {
    const a = effectiveAssemble()
    const t = clock.elapsedTime
    const step = Math.min(dt, 1 / 30)
    trees.forEach((tree, i) => {
      const sp = springs[i]
      const target = a > 0.35 + tree.delay * 0.45 ? 1 : 0
      // Under-damped spring: overshoots a little, like a pop.
      sp.v += (target - sp.x) * 180 * step
      sp.v *= Math.exp(-11 * step)
      sp.x += sp.v * step
      const s = Math.max(0.0001, sp.x) * tree.s
      const sway = Math.sin(t * 1.3 + tree.x * 0.7 + tree.z * 0.3) * 0.05
      const trunk = trunks.current[i]
      const crown = crowns.current[i]
      if (trunk) trunk.scale.set(s, s, s)
      if (crown) {
        crown.scale.set(s, s, s)
        crown.position.y = 0.15 + (tree.kind === "pine" ? 1.25 : 1.15) * s
        crown.rotation.z = sway
        crown.rotation.x = sway * 0.6
      }
    })
  })

  const round = trees.map((t, i) => ({ t, i })).filter((x) => x.t.kind === "round")
  const pine = trees.map((t, i) => ({ t, i })).filter((x) => x.t.kind === "pine")

  return (
    <group>
      <Instances limit={trees.length} material={mat(C.trunk)} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.9, 5]} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.x, 0.6, t.z]}
            scale={0.0001}
            ref={(el: Object3D | null) => {
              trunks.current[i] = el
            }}
          />
        ))}
      </Instances>
      <Instances limit={round.length} material={mat(C.white)} castShadow receiveShadow>
        <icosahedronGeometry args={[0.75, 0]} />
        {round.map(({ t, i }) => (
          <Instance
            key={i}
            position={[t.x, 1.3, t.z]}
            color={FOLIAGE[t.hue]}
            scale={0.0001}
            ref={(el: Object3D | null) => {
              crowns.current[i] = el
            }}
          />
        ))}
      </Instances>
      <Instances limit={Math.max(1, pine.length)} material={mat(C.white)} castShadow receiveShadow>
        <coneGeometry args={[0.6, 1.7, 6]} />
        {pine.map(({ t, i }) => (
          <Instance
            key={i}
            position={[t.x, 1.4, t.z]}
            color={FOLIAGE[(t.hue + 1) % 3]}
            scale={0.0001}
            ref={(el: Object3D | null) => {
              crowns.current[i] = el
            }}
          />
        ))}
      </Instances>
    </group>
  )
}

const LAMP_ON = new Color(C.glow)
const LAMP_OFF = new Color("#EDE3D2")
const POOL_ON = new Color(C.glow)
const black = new Color(0, 0, 0)

/** Soft radial falloff for the light pools (white centre, black edge; additive blending). */
function radialTexture() {
  const c = document.createElement("canvas")
  c.width = c.height = 128
  const ctx = c.getContext("2d")!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, "#ffffff")
  g.addColorStop(0.45, "#8a8a8a")
  g.addColorStop(1, "#000000")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
}

/** Streetlights switch on one by one as night falls; each casts a soft additive pool of light. */
function StreetLights() {
  const lamps = useMemo(() => makeLamps(), [])
  const heads = useRef<({ color: Color } & Object3D)[]>([])
  const pools = useRef<({ color: Color } & Object3D)[]>([])
  const group = useRef<Group>(null)
  const poolMap = useMemo(() => radialTexture(), [])

  useFrame(() => {
    const n = world.night
    if (group.current) group.current.visible = effectiveAssemble() > 0.5
    lamps.forEach((l, i) => {
      const lit = n > l.th
      heads.current[i]?.color.copy(lit ? LAMP_ON : LAMP_OFF).multiplyScalar(lit ? 3 : 1)
      pools.current[i]?.color.copy(lit ? POOL_ON : black).multiplyScalar(lit ? 0.55 * n : 0)
    })
  })

  return (
    <group ref={group}>
      <Instances limit={lamps.length} material={mat(C.ink)} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.2, 5]} />
        {lamps.map((l, i) => (
          <Instance key={i} position={[l.x, 1.2, l.z]} />
        ))}
      </Instances>
      <Instances limit={lamps.length}>
        <sphereGeometry args={[0.17, 10, 8]} />
        <meshBasicMaterial toneMapped={false} />
        {lamps.map((l, i) => (
          <Instance
            key={i}
            position={[l.x, 2.35, l.z]}
            color={LAMP_OFF}
            ref={(el: ({ color: Color } & Object3D) | null) => {
              if (el) heads.current[i] = el
            }}
          />
        ))}
      </Instances>
      <Instances limit={lamps.length}>
        <circleGeometry args={[1.8, 24]} />
        <meshBasicMaterial map={poolMap} toneMapped={false} transparent blending={AdditiveBlending} depthWrite={false} />
        {lamps.map((l, i) => (
          <Instance
            key={i}
            position={[l.x, 0.19, l.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            color={black}
            ref={(el: ({ color: Color } & Object3D) | null) => {
              if (el) pools.current[i] = el
            }}
          />
        ))}
      </Instances>
    </group>
  )
}
