// Inline <head> scripts (plain strings, safe to import from server components). They run before
// first paint: apply the saved "Reduce motion" setting, and start the loading screen on the first
// visit of the session to the home page. Keep the storage key in sync with lib/prefs.ts.

export const PREFS_KEY = "ow-prefs"

const prefs = `try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");if(p.reduceMotion)document.documentElement.classList.add("reduce-motion")}catch(e){}`

const intro = `try{var d=document.documentElement;if(location.pathname==="/"&&!sessionStorage.getItem("ow-loaded")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!d.classList.contains("reduce-motion"))d.classList.add("intro-pending")}catch(e){}`

export const headScript = prefs + intro
