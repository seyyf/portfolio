import { LoadingScreen } from "@/components/intro/LoadingScreen"
import { IntroCard } from "@/components/map/IntroCard"
import { MapArt } from "@/components/map/MapArt"
import { MapPreview } from "@/components/map/MapPreview"
import { MissionList } from "@/components/map/MissionList"
import { mapCss } from "@/components/map/styles"
import { WorldMap } from "@/components/map/WorldMap"

// The map hub: a loading screen on the first visit of the session, the intro card (the page's
// h1 and the recruiter actions), the full map of Greater Tunis with every mission, and the
// mission list. On phones the map is a static preview that opens a full-screen map.
export default function Home() {
  return (
    <>
      <LoadingScreen />
      <style href="ow-map" precedence="medium">
        {mapCss}
      </style>
      <section id="map" aria-labelledby="hub-title" className="relative lg:h-svh lg:min-h-[40rem] lg:overflow-hidden">
        <IntroCard />
        <MapPreview />
        <WorldMap>
          <MapArt />
        </WorldMap>
      </section>
      <MissionList />
    </>
  )
}
