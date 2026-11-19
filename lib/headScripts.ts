// Inline <head> scripts (plain strings, safe to import from server components). They run before
// first paint: apply the saved "Reduce motion" setting, and start the loading screen on a visitor's
// first visit to the home page (never again after that). lib/prefs.ts imports PREFS_KEY from here.

export const PREFS_KEY = "ow-prefs"
/** Set (in localStorage) once the loading screen has played, so returning visitors skip it. */
export const INTRO_SEEN_KEY = "ow-intro-seen"

const prefs = `try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");if(p.reduceMotion)document.documentElement.classList.add("reduce-motion")}catch(e){}`

// Loading screen: first visit only (localStorage flag), home page only, never with reduced motion
// (OS setting or the in-site setting). If storage is blocked the try/catch skips the intro.
const intro = `try{var d=document.documentElement;if(location.pathname==="/"&&!localStorage.getItem("${INTRO_SEEN_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!d.classList.contains("reduce-motion"))d.classList.add("intro-pending")}catch(e){}`

export const headScript = prefs + intro
