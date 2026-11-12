"use client"

// Single place where GSAP plugins are registered, so every component imports the same instance.
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { Flip } from "gsap/Flip"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, CustomEase, Flip, MorphSVGPlugin, ScrollTrigger, SplitText)
  // OS-like curves: a quick settle with a touch of overshoot, and a soft deceleration.
  CustomEase.create("os.spring", "M0,0 C0.18,0.9 0.32,1.08 0.52,1.03 0.7,0.99 0.84,1 1,1")
  CustomEase.create("os.out", "M0,0 C0.2,0.8 0.25,1 1,1")
}

export { gsap, useGSAP, CustomEase, Flip, MorphSVGPlugin, ScrollTrigger, SplitText }
