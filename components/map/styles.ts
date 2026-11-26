import { districts } from "@/data/missions"

// Layout of the world map in CSS, so it is framed correctly from the first paint (no JS):
// --u is the size of one map unit in px. Phones open the map full screen, centred on the lake;
// desktop frames every marker (plus a strip of sea) in the space right of the intro card.

const highlight = Object.keys(districts)
  .map((id) => `[data-active-district="${id}"] [data-cell="${id}"]`)
  .join(",")

export const mapCss = `
.ow-map-viewport{container-type:size}
.ow-map-viewport[data-dragging]{cursor:grabbing}
.ow-map-world{--u:max(calc((100cqw - 32px) / 1340),.55px);--inv:1;position:absolute;left:calc(50cqw - 860 * var(--u));top:calc(4rem + (100cqh - 9rem) / 2 - 500 * var(--u));width:calc(1600 * var(--u));height:calc(1000 * var(--u));transform-origin:0 0}
@media (min-width:1024px){.ow-map-world{--u:max(.4px,min(calc((100cqw - 504px) / 1340),calc((100cqh - 200px) / 760)));left:calc(480px + (100cqw - 504px - 1340 * var(--u)) / 2 - 220 * var(--u));top:calc(88px + (100cqh - 200px - 760 * var(--u)) / 2 - 120 * var(--u))}}
.ow-marker{transform:translate(-50%,-50%) scale(var(--inv))}
.ow-ping{animation:ow-ping 2.6s cubic-bezier(0,0,.2,1) infinite}
@keyframes ow-ping{0%{transform:scale(1);opacity:.6}75%,100%{transform:scale(2.1);opacity:0}}
[data-cell]{transition:fill .4s}
${highlight}{fill:#3a2560}
`
