"use client"

// Single place where GSAP plugins are registered, so every component imports the same instance.
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { Flip } from "gsap/Flip"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip)
}

export { gsap, useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip }
