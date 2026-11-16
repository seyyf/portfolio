"use client"

// GSAP with the plugins this site uses. Import from here (not "gsap") so plugins are registered once.
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText, useGSAP }
