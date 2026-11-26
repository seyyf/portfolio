// The loading screen's timeline, in CSS so it runs from the first paint, before any JavaScript.
// .loading-screen is display:none unless <html> has .intro-pending (see globals.css), so every
// animation below starts at first paint and the screen hides itself at 3s with or without JS.
//
//   0.05–1.05s  three panels slide in diagonally      0.10–2.50s  loading bar
//   0.15–3.00s  tips, one after another               1.45–2.30s  title card
//   2.60–3.00s  exit (zoom + fade); the map behind flies in from 2.55s
//
// IntroController (client) adds, after hydration: skip on any key / click / tap and sessionStorage.
// The whole sequence is CSS (a GSAP layer was removed: loading GSAP during the first seconds cost
// up to 2s of main-thread time on mobile). Classes it may put on <html>:
//   intro-skip      fast CSS exit (and a fast map flight)
//   intro-landing   kept ~1s after the screen is gone so the map flight can finish

const EASE_OUT = "cubic-bezier(.16,1,.3,1)"
const EASE_IN = "cubic-bezier(.7,0,.84,0)"

export const introCss = `
#ow-intro{animation:ow-out .35s ${EASE_IN} 2.15s forwards}
@keyframes ow-out{to{opacity:0;visibility:hidden;transform:scale(1.06)}}
@keyframes ow-out-skip{to{opacity:0;visibility:hidden;transform:scale(1.04)}}
.ow-glow{background:radial-gradient(120% 55% at 50% 112%,rgb(108 182 255/.32),transparent 62%),radial-gradient(70% 45% at 50% 105%,rgb(108 182 255/.22),transparent 70%),radial-gradient(60% 40% at 50% -10%,rgb(74 63 117/.35),transparent 70%)}

.ow-panel{--skx:0deg;--sky:-4deg;transform:skew(var(--skx),var(--sky));animation:ow-panel-in .65s ${EASE_OUT} both}
.ow-panel:nth-child(1){--fx:-70vw;--fy:-12vh;animation-delay:.05s}
.ow-panel:nth-child(2){--fx:70vw;--fy:10vh;animation-delay:.17s}
.ow-panel:nth-child(3){--fx:-70vw;--fy:14vh;animation-delay:.29s}
@media (min-width:1024px){
  .ow-panel{--skx:-8deg;--sky:0deg}
  .ow-panel:nth-child(1){--fx:-24vw;--fy:70vh}
  .ow-panel:nth-child(2){--fx:18vw;--fy:-80vh}
  .ow-panel:nth-child(3){--fx:24vw;--fy:70vh}
}
@keyframes ow-panel-in{from{opacity:0;transform:translate(var(--fx),var(--fy)) skew(var(--skx),var(--sky))}to{opacity:1;transform:skew(var(--skx),var(--sky))}}
.ow-panel-art{transform:skew(calc(var(--skx) * -1),calc(var(--sky) * -1)) scale(1.04);animation:ow-drift 2.6s linear both}
@keyframes ow-drift{from{transform:skew(calc(var(--skx) * -1),calc(var(--sky) * -1)) scale(1.16)}to{transform:skew(calc(var(--skx) * -1),calc(var(--sky) * -1)) scale(1.04)}}

.ow-dim{background:linear-gradient(180deg,rgb(20 23 28/.35),rgb(20 23 28/.78));opacity:0;animation:ow-fade .45s 1.15s both}
@keyframes ow-fade{to{opacity:1}}
.ow-band{transform:skewY(-4deg) scaleX(0);transform-origin:left center;animation:ow-band .5s cubic-bezier(.76,0,.24,1) 1.15s both}
@keyframes ow-band{to{transform:skewY(-4deg) scaleX(1)}}
.ow-title-text{animation:ow-reveal .6s ${EASE_OUT} 1.32s both}
@keyframes ow-reveal{from{clip-path:inset(-20% 100% -20% 0);transform:translateX(-.25em)}to{clip-path:inset(-20% -10% -20% -10%);transform:none}}
.ow-sub{animation:ow-up .45s ${EASE_OUT} 1.56s both}
@keyframes ow-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

.ow-bar{transform:scaleX(0);transform-origin:left center;animation:ow-load 1.95s .1s both}
@keyframes ow-load{0%{transform:scaleX(0);animation-timing-function:ease-out}22%{transform:scaleX(.36)}34%{transform:scaleX(.42);animation-timing-function:ease-in-out}62%{transform:scaleX(.8)}78%{transform:scaleX(.86);animation-timing-function:ease-out}100%{transform:scaleX(1)}}

.ow-tip{opacity:0;animation:ow-tip var(--d) linear var(--delay) both}
.ow-tip-last{animation-name:ow-tip-last}
@keyframes ow-tip{0%{opacity:0;transform:translateY(6px)}14%,86%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-6px)}}
@keyframes ow-tip-last{0%{opacity:0;transform:translateY(6px)}14%,100%{opacity:1;transform:none}}

.ow-skip-touch{display:inline}.ow-skip-key{display:none}
@media (hover:hover) and (pointer:fine){.ow-skip-touch{display:none}.ow-skip-key{display:inline}}

html.intro-pending [data-intro-flight],html.intro-landing [data-intro-flight]{animation:ow-flight 1s ${EASE_OUT} 2.1s both}
html.intro-skip [data-intro-flight]{animation:ow-flight-now .9s ${EASE_OUT} both}
@keyframes ow-flight{from{transform:scale(1.22) translateY(3%)}to{transform:none}}
@keyframes ow-flight-now{from{transform:scale(1.22) translateY(3%)}to{transform:none}}
html.intro-pending [data-intro-rise],html.intro-landing [data-intro-rise]{animation:ow-rise .7s ${EASE_OUT} 2.17s both}
html.intro-skip [data-intro-rise]{animation:ow-rise-now .6s ${EASE_OUT} .15s both}
@keyframes ow-rise{from{transform:translateY(22px)}to{transform:none}}
@keyframes ow-rise-now{from{transform:translateY(22px)}to{transform:none}}

html.intro-skip #ow-intro{animation:ow-out-skip .3s ${EASE_IN} forwards}
`
