"use client"

import { Clone, useGLTF } from "@react-three/drei"
import { Suspense, type ComponentType } from "react"

import { buildings, type BuildingId } from "@/data/city"

import { Building } from "./Building"
import { Cafe } from "./Cafe"
import { EventHall } from "./EventHall"
import { House } from "./House"
import { OfficeTower } from "./OfficeTower"
import { Restaurant } from "./Restaurant"
import { School } from "./School"
import { FurnitureStore, ParisBoutique, SupplyShop, ThriftShop } from "./Shops"
import { Workshop } from "./Workshop"

/** Procedural model for each building. */
const PROCEDURAL: Record<BuildingId, ComponentType> = {
  educaro: School,
  uteek: EventHall,
  globalenr: Restaurant,
  opuslab: Cafe,
  bertsch: OfficeTower,
  fripa: ThriftShop,
  febal: FurnitureStore,
  aurelia: SupplyShop,
  weedy: ParisBoutique,
  house: House,
  workshop: Workshop,
}

/**
 * To swap a building for a real model: export a .glb (base at y = 0, centred, roughly the footprint in
 * data/city.ts `size`), put it in /public/models and set `model: "/models/name.glb"` on the building.
 * It keeps the label, hover, click and rise animation; the procedural signature animation is dropped.
 */
function GltfBuilding({ id, url }: { id: BuildingId; url: string }) {
  const { scene } = useGLTF(url)
  return (
    <Building id={id}>
      <Clone object={scene} castShadow receiveShadow />
    </Building>
  )
}

export function Buildings() {
  return (
    <>
      {buildings.map((b) => {
        if (b.model) {
          const Fallback = PROCEDURAL[b.id]
          return (
            <Suspense key={b.id} fallback={<Fallback />}>
              <GltfBuilding id={b.id} url={b.model} />
            </Suspense>
          )
        }
        const Model = PROCEDURAL[b.id]
        return <Model key={b.id} />
      })}
    </>
  )
}
