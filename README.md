# Seyf Mejri — Open World

Seyf Mejri's portfolio, styled like the UI of a modern open-world game and set in Greater Tunis: a loading screen, a map with mission markers, a HUD, an in-game phone and a stats menu. Every job is a mission. Recruiters can always click **Skip to CV →** (top-left) for a plain one-page résumé.

All art, names and sounds are original. The site uses no game names, logos, lettering, characters, screenshots, music or fonts from any existing game, and no crime themes.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (every page prerendered)
npm start          # serve the production build on http://localhost:3000
```

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP (MISSION PASSED overlay), Framer Motion (phone, pause menu, briefings, swipe demo), Howler (optional sounds), lucide-react. Fonts: Anton (titles), Inter (body and UI), JetBrains Mono (HUD numbers).

## Pages

| URL | What |
| --- | --- |
| `/` | Loading screen (a visitor's first visit only), then the map hub: intro card, map of Greater Tunis, mission list |
| `/missions/<slug>` | A mission: `first-contract`, `table-service`, `120-users`, `book-it`, `the-rebuild`; side missions: `fripa`, `febal-casa-usa`, `aurelia-gloves`, `weedy` |
| `/stats` | Career stats and skills, in tabs |
| `/contact` | The phone's Messages and Contacts, as a page |
| `/cv` | Recruiter mode: a one-page A4 résumé with "Print / Save as PDF" |

Everywhere: **Esc** (or the Menu button) opens the pause menu (Map, Missions, Stats, Phone, Settings, Recruiter mode). The phone button (bottom-right) opens the phone, and the minimap (bottom-left) goes to the full map. Settings has **Sound** (off by default) and **Reduce motion**.

## Where things live

| What | Where |
| --- | --- |
| Name, intro card text, HUD line, career stats, loading tips, CV path, site URL | `data/profile.ts` |
| Missions, tutorials (education), side missions, the locked Mission 06, map districts and marker positions, metrics | `data/missions.ts` |
| Skills and their status labels | `data/skills.ts` |
| Colours, gradient, diagonal cuts, HUD styles, grain, reduced motion, print | `app/globals.css` |
| HUD, recruiter button, minimap, pause menu | `components/hud/` |
| Loading screen (CSS timeline in `styles.ts`) | `components/intro/` |
| Map hub: map art and geometry, markers, cards, briefings, mission list, pan/zoom | `components/map/` |
| Mission pages, MISSION PASSED overlay, before/after slider, swipe demo | `components/mission/` |
| Phone, Messages, Contacts, Map and Settings apps | `components/phone/` |
| Stats menu | `components/stats/` |
| Settings store, sound, overlay store, GSAP setup | `lib/prefs.ts`, `lib/sound.ts`, `lib/ui.ts`, `lib/gsap.ts` |
| Contact route (Formspree) | `app/api/contact/route.ts` |

## Replacing placeholder illustrations

Every image is an original placeholder that says so. The SVG sources are rendered to WebP by two scripts, and `next/image` then serves them as AVIF or WebP.

- **Loading-screen panels** (portrait, Tunis sunset, Sidi Bou Said): `public/images/intro/*.webp`. To use a real photo for the portrait, drop it in `public/images/intro/` and update `profile.portrait` in `data/profile.ts` (path, width, height; remove "(placeholder)" from the alt text). To redraw a panel, edit the SVG in `scripts/intro-art/` and run `node scripts/render-intro-images.mjs`.
- **The Rebuild's before/after slider** (the only images on mission pages): `public/images/missions/the-rebuild-legacy.webp` and `the-rebuild-new.webp`. Replace them with real screenshots (same names, or update `beforeAfter` in `data/missions.ts`). They are illustrations (no "placeholder" mark); `node scripts/render-mission-images.mjs` regenerates them.
- **Open Graph image**: `app/opengraph-image.png` is the loading screen's title card at 1200x630. If you change the panels or name, re-capture it: open `/` in a fresh tab at 1200x630, and screenshot at about 1.9s (title card fully in, before the exit at 2.15s).
- **Domain**: the base URL for canonical URLs, Open Graph/Twitter images, the sitemap, robots.txt and JSON-LD comes from `lib/site.ts`: `NEXT_PUBLIC_SITE_URL` if set (use it for a custom domain), otherwise the Vercel production domain (automatic on Vercel, so previews still point at production), otherwise `http://localhost:3000`.
- **Live links**: add `url` to a side mission in `data/missions.ts` to link it.

## Adjusting map markers

Marker positions are in `data/missions.ts`, as `map: { x, y, district }` on each mission, tutorial, side mission and the locked Mission 06. The coordinates use the map's 1600×1000 grid: x runs west to east, y north to south. For reference, the sea and the coast are on the right (east), Les Berges du Lac is at about (920, 450), and Manouba is on the left (300, 560). District label positions are in `districts` in the same file. The shapes are drawn in `components/map/geometry.ts`, which also holds small label offsets so labels never sit under a marker.

The positions are illustrative and stay at district level, never real addresses; the map says so in its legend. Keyboard users move between markers with the arrow keys, so a marker you move becomes reachable in its new direction automatically.

## Filling the `TODO: add metric` spots

No number on the site is invented. Search the code for `TODO: add metric`. Each one is a metric in `data/missions.ts` without a value:

```ts
metrics: [
  { label: "Daily active users" }, // TODO: add metric
],
```

In development (`npm run dev`), each shows as a dashed "TODO: add metric" box on its mission page. Production builds hide them. To publish a figure, give it a value, and it becomes a stat card:

```ts
{ label: "Daily active users", value: "350" },
```

Mission 03 already has one real metric from the CV: "About 120" people ordering with the PWA.

## Contact form setup (Formspree)

The phone's Messages app (and `/contact`) posts to `app/api/contact/route.ts`. The route validates the message (20 KB limit, honeypot field) and forwards it to Formspree, with Reply-To set to the visitor. On success the bubble shows "Delivered ✓".

1. Create a free account at [formspree.io](https://formspree.io) and a new form. Set its email to Seyf's address and confirm it.
2. In the form's **Settings**, turn **reCAPTCHA off**. Messages are sent from the server, so a captcha would make Formspree reject them.
3. Copy the form endpoint (`https://formspree.io/f/xxxxxxx`) or just its ID.
4. Locally: copy `.env.example` to `.env.local`, set `FORMSPREE_ENDPOINT`, and restart `npm run dev`.
5. When deploying, add the same `FORMSPREE_ENDPOINT` in the host's environment settings.

Until it's set, Messages replies that messages aren't connected yet and offers a prefilled email instead.

## Motion, accessibility and performance

- **Loading screen:** shown only on a visitor's first visit to `/` (a `localStorage` flag, `ow-intro-seen`, skips it afterwards), for 2.5 seconds at most, never with reduced motion. Any key, click or tap skips it, and "Skip to CV" stays clickable above it. It's CSS only, so it starts with the first paint.
- **Mission pages (GSAP):** as you scroll, the header's sun sinks and the palms move at different depths and sway, the objective rises word by word, section headings wipe in, briefing bullets slide in, chips pop in and the before/after frame opens on a diagonal. GSAP loads on the first scroll; content already on screen never re-animates.
- **MISSION PASSED:** plays when you reach the end of a mission (or press "Complete mission"). It's skippable with any key, a click or the Skip button. Mission 05 says "Checkpoint reached" instead, because it's the current job.
- **Reduced motion** (the OS setting or Settings → Reduce motion): no loading screen, no map flights, an instant MISSION PASSED card, and opacity-only transitions.
- **Keyboard:**
  - Map markers are buttons; the arrow keys move between them, Home/End jump to the ends, and Enter opens a briefing.
  - The pause menu, phone and overlay are modal dialogs that keep focus inside and return it on close.
  - The before/after slider and the swipe demo work with the arrow keys.
- **Text:** body text is at least 17px on phones. Gradient text falls back to solid orange where gradient clipping isn't supported.
- **Lighthouse 12, mobile, on a production build served locally:**

  | Page | Performance | Accessibility / Best Practices / SEO |
  | --- | --- | --- |
  | `/missions/the-rebuild` | 92 | 100 / 100 / 100 |
  | `/missions/fripa` | 93 | 100 / 100 / 100 |
  | `/stats` | 94 | 100 / 100 / 100 |
  | `/contact` | 92 | 100 / 100 / 100 |
  | `/cv` | 94 | 100 / 100 / 100 |
  | `/` | 43 to 92 across 15 runs (usually 55 to 80) | 100 / 100 / 100 |

  **The home page is below the 90 target.** Its scores vary because of main-thread rendering work during the first visit. In the slow runs, Chrome lays out the whole page twice at about 170 ms each: once while the web fonts are still loading, and again when they arrive. On top of that comes the 3-second animated loading screen. The test machine was also short of memory, which made it worse. Measure the deployed site with PageSpeed Insights; if it's still under 90, the next levers are a lighter first-visit loading screen and fewer font files.

## Earlier builds

Kept for reference, not part of the app. `design/archive/` is git-ignored (Vercel would otherwise try to compile the old `app/` folders): the folders live on this machine, and in git history up to commit `795ee7d`:
- `design/archive/build-2-seyf-city` (a 3D city)
- `design/archive/build-4-seyf-times` (an editorial newspaper)
- `design/archive/build-5-release-notes` (a product changelog, also in git as commit `35c6949`)

SeyfOS is in the git history and on the local `seyfos` branch.
