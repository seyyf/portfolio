# Build log

An honest record of how this portfolio was built by Seyf Mejri working with Claude (Claude Code, Opus 5.5) and agentic tooling. Every entry describes something that actually happened. Numbers are measured, not estimated. Where something was skipped or went wrong, it says so.

Facts about Seyf come only from `cv.md`. Visual decisions follow `DESIGN.md`.

---

## Phase 0: Build 1, the conventional portfolio (2026-10-18)

The first version was a clean, single-page portfolio. It is the "before" for the redesign.

**Process**
1. Read the CV (supplied as a PDF; there was no `cv.md` yet) and `DESIGN.md` in full.
2. `image-to-code` skill: no image-generation tool was available, so per the brief's fallback a written visual spec per section was produced instead (`design/reference-spec.md`), with a grid, spacing, type and component analysis mapped to DESIGN.md tokens. Approved by Seyf before any code was written.
3. `design-taste-frontend` skill: drove the composition rules (left-aligned asymmetric hero, one eyebrow, no three-equal-card rows, no em-dashes, no fake screenshots).
4. Scaffolded Next.js 16.4 + TypeScript + Tailwind v4 + shadcn/ui. Wrote DESIGN.md tokens into `app/globals.css`.
5. `web-design-guidelines` skill: audited the code against the Vercel Web Interface Guidelines.
6. `playwright-cli` skill: verified in a real browser at 1440px and 390px.

**Issues found and fixed (all real)**
| Found | How it was found | Fix |
|---|---|---|
| shadcn's `cn` merger treated `text-body` (color) and `text-body-lg` (size) as conflicting and silently dropped one | Tested the merger in Node before using it | Registered DESIGN.md type, radius and shadow tokens with `createCn` |
| `new Date()` in the footer blocked static prerendering | `next build` error | Dropped the year from the copyright |
| OG image failed: Satori needs one text node per div | `next build` error | Template strings |
| Link blue `#0070f3` is 4.36:1 on `canvas-soft`, below WCAG AA | Contrast computed in Node during the audit | Links rest on `link-deep` (5.53:1) |
| `mute` `#888` is 3.4:1 on the page background | Same contrast script | Never used for text |
| Hydration mismatch: the scroll-reveal effect added classes before React finished hydrating | Playwright console log | Rewrote it with the Web Animations API |
| Mobile menu links changed the URL hash but the page did not scroll (Radix scroll lock) | Playwright: Skills section still 5287px below the fold after tapping "Skills" | Scroll after the sheet closes, then move focus; Skills landed at 64px |
| Hero mesh gradient clipped; the coral/amber "ship" stops were off-canvas | Playwright screenshot review | Elliptical mask, stops spread across the ellipse |
| Doubled divider in the case study; empty tile in the Skills bento | Screenshot review | Single divider; rebalanced bento rows |
| OG image lost its gradient twice (unsupported `circle 230px` syntax, then unsupported `inset`) | Opened the rendered PNG | Percentage stops, explicit box size |

**Result**: 7 routes prerendered static, 0 console errors or warnings in production, no horizontal overflow at 390px or 1440px.

**Screenshots kept**: `design/screenshots/home-1440.png`, `design/screenshots/home-390.png`, `design/screenshots/og-image.png`.
Honest note: the intermediate before/after screenshots from Build 1 were deleted during cleanup. From the redesign on, every screenshot is kept under `design/log/`.

---

## Phase 1: Redesign concepts (2026-10-18)

Brief: an award-level, animation-rich, mobile-first redesign. Concept direction: "Built by a developer and an AI, in the open."

**How the references were made**
The `image-to-code` skill asks for generated reference images first. No image-generation tool exists in this environment, so each concept was mocked up as a throwaway static HTML page (`design/concepts/*.html`, DESIGN.md tokens, no WebGL) and rendered with `playwright-cli` at 1440×900 and 390×844. That gives 12 reference images: a hero frame and a signature-section frame per concept, at both widths.

**Concepts proposed**
- **A. Signal**: the DESIGN.md mesh gradient becomes a live WebGL field on a dark hero; scroll retunes it section by section.
- **B. X-Ray**: a blueprint world; a lens reveals the design tokens and wireframe under the finished UI.
- **C. Session Replay**: the hero replays the real agent session that built the site.

**Self-critique of the first renders (real bugs, fixed before showing)**
- Nav ignored the page gutter in all three mockups (absolutely positioned inside a padded container).
- A: a "field reacts to cursor" micro-label was decorative clutter (taste skill) and was removed.
- B: the lens's outlined copy of the name wrapped onto two lines, so the x-ray layer missed "Mejri"; the "press and hold" hint leaked onto desktop; AngularJS labels were clipped below the scan line; the dot field was invisible; an annotation collided with the pitch text.
- C: the unresolved "ri" glyphs wrapped onto their own line at 1440px; the mobile log frame left a large empty gap.
- All three: "⌘K" was shown on mobile, where it means nothing. Changed to "Menu".

**Status**: waiting for Seyf to choose a concept.

---

## Phase 2: Build 2, "Seyf City" (2026-11-12)

Seyf replaced the three redesign concepts with a new brief: a cozy low-poly isometric 3D town where every building is a product he built, toured by scrolling from sunrise to night, with explore mode and a plain Recruiter Mode. The brief fixed the palette (cream, mint, coral, sky, butter, lavender; night blue/purple with warm glow), the fonts (Fredoka, Nunito) and the stack (R3F + drei + postprocessing, GSAP with ScrollTrigger/SplitText/DrawSVG/MorphSVG/Flip, Lenis, Framer Motion, Howler, Zustand). It overrides DESIGN.md for this build.

**Process**
1. Build 1 was uncommitted, so instead of deleting it, it was moved to `design/archive/build-1/` and excluded from TypeScript and ESLint.
2. All copy moved to one typed file, `data/city.ts`. Facts come from `cv.md`; Fripa (personal project) and the brief's wording for Weedy ("e-commerce store in France") come from the brief.
3. Two subagents built self-contained parts in parallel against `data/city.ts`, the store and the CSS tokens: the eight panel widgets, and Recruiter Mode. The 3D city, scroll tour, header and shell were built in the main session.
4. Verified with `playwright-cli` in dev and production at 1440x900 and on an iPhone 15 profile, plus print media and reduced motion. Screenshots are in `design/log/city/`.

**Architecture decisions**
- One mutable `world` object (`lib/world.ts`) holds per-frame values (scroll progress, time of day, camera rig, assembly progress). GSAP writes it, R3F reads it in `useFrame`, so nothing per-frame goes through React state.
- The tour is a fixed canvas behind real HTML sections. One scrubbed GSAP timeline (one unit per section) drives the camera rig and the city assembly; ScrollTrigger snap lands on each section.
- Sky: drei `Sky`/`Stars` assume a perspective camera and render as a flat colour with an orthographic one, so the sky is one full-screen shader (gradient, twinkling stars, sun and crescent moon on arcs) driven by the same time value.
- Windows, bulbs, people, cars, trees, lamps and fireflies are instanced; ground pieces are merged with `mergeGeometries`.
- Sounds are synthesized by `scripts/generate-sounds.mjs` (no third-party recordings). The CV PDF, Open Graph image and reduced-motion still are real outputs of the site itself (print of `/recruiter`, captures of `/?capture=night`).

**Issues found and fixed (all real)**
| Found | How it was found | Fix |
|---|---|---|
| Building palette used `C.night`, which did not exist | Widget subagent's `tsc` run | Added it to the palette |
| Morning lawns rendered muddy olive; 3D clouds read as brown crystals | Screenshot review | Brighter, cooler sunrise hemisphere light; clouds get emissive fill |
| Finale text unreadable over lit buildings, heading wrapped to 3 lines | Screenshot review | Camera framed lower, wider heading, theme-aware text halo |
| Streetlight pools were flat beige discs | Screenshot review | Radial falloff texture on the additive pools |
| Hero subline lowercased "JavaScript" | Screenshot review | Stopped transforming the title |
| Recruiter Mode opened mid-page; returning landed on the wrong stop (2700px instead of 4500px) | `scrollY` checks in Playwright | Swap views in one commit instead of `AnimatePresence` (the exiting tour's snap fought the reset), and `lenis.resize()` before restoring (Lenis clamped to the shorter recruiter page) |
| 3D labels set `visibility: visible`, leaking into the accessibility tree in Recruiter Mode | Accessibility snapshot | `visibility: inherit` |
| School's department signature stayed on in explore mode | Explore screenshot | Signature follows the tour stop only while touring |
| Phone layout viewport 451px wide on a 393px screen; header and panel clipped | `innerWidth` vs `visualViewport` check, then element bounds scan | Cards waiting off-screen (GSAP `x`) and the scaling cloud layer are now clipped by their containers; tighter header buttons under 420px |
| Department chips overlapped on phones | Mobile screenshot | Phones show only the floor that is lighting up |
| The School's label was missing (10 of 11 labels), in dev and production | DOM count of `.city-label` | drei `Html` re-creates its React root when its mount target changes after the canvas connects; the deferred unmount wiped the School's new root. All labels now render into a stable portal container. This also removed the 11 "synchronously unmount a root" console errors, which had first looked like dev-only noise |
| Focus did not return to the label after closing a panel with Escape | Focus event trace in Playwright | Restore focus in `AnimatePresence` `onExitComplete` |
| Billboard tagline washed out by Bloom in the night render | Open Graph render review | Lower emissive on the billboard |
| `@page` margin was dropped from the compiled CSS, so the CV PDF ran edge to edge | Compared served CSS with `globals.css` | Nested `@page` inside `@media print` |
| Dev-server indicator baked into the first Open Graph render | Looked at the PNG | Removed the overlay before capture |

**Not fixed / known**
- three.js logs one deprecation warning (`THREE.Clock`) from inside React Three Fiber; it is not in this codebase.
- React Compiler lint rules `react-hooks/immutability` and `react-hooks/refs` are turned off for `components/city/**` only, because R3F mutates three.js objects inside `useFrame` by design.
- The contact form has no backend; it opens the visitor's email app (`mailto:`).
- Placeholders to replace: `profile.siteUrl`, the CV PDF (currently a print of `/recruiter`), and the Educaro before/after images (schematic illustrations, not screenshots).
- Not measured: real-device frame rates. Performance tiering (DPR cap, `PerformanceMonitor`, low tier for phones) is in place but was only exercised in headless Chrome.

**Result**: `next build` passes with every route static (`/`, `/recruiter`, OG image, icons, robots, sitemap). TypeScript and ESLint clean. Production console during a full tour, sound on and explore mode: 0 errors, 1 library warning.

---

## Phase 3: Build 3, "SeyfOS" (2026-11-12)

New brief from Seyf: the portfolio is an original smartphone OS. Every app is a product he built; system apps hold the bio (Messages), gallery (Photos), career timeline (Calendar), skills (Settings), CV (Files) and contact (Mail). Full screen on phones, a framed phone on desktop, `/resume` for recruiters. No 3D.

**Process**
1. Seyf City (uncommitted) was moved to `design/archive/build-2-seyf-city/` and excluded from the build. The 3D dependencies were removed; Vaul and lucide-react were added.
2. Content split into `data/profile.ts`, `data/projects.ts` and `data/apps.ts`. Facts from `cv.md`; Fripa from the brief. Demo content inside mini-games (CRM numbers, menu items, events, catalog products) is labelled "demo" in the UI.
3. I wrote the foundation first (store, navigation, theme, Tunis clock, sound, tokens, `AppScreen`, `Sheet`, `AboutSheet`), then three subagents built in parallel against it: the six project apps with their shared pieces and placeholder screenshots, the six system apps with the contact route, and the résumé. The OS shell (phone, lock screen, status bar, live pill, home, icons, app windows, control center, desktop stage, routes) was built in the main session.
4. Verified with `playwright-cli` on production builds at 360px, 390px (iPhone 15 profile) and 1440x900, in light and dark, with reduced motion. Screenshots in `design/log/os/`.

**Architecture decisions**
- The OS shell lives in the `app/(os)` route-group layout, so it stays mounted while the URL changes between `/`, `/app/<id>` and `/resume`. Every app URL is prerendered (`generateStaticParams`) with its own metadata, and the app is server-rendered inside the phone on that URL.
- App open/close: the window animates `clip-path: inset()` from the icon's exact rectangle to full screen (no content distortion), with the icon's tile fading out on top. A swipe up on the home bar shrinks the window under the finger.
- No scaling transform on the desktop phone (it is 390px wide and shortens to fit the window), so measurements, Framer layout animations and Vaul sheets work unmodified. The screen element uses `transform: translateZ(0)` to be the containing block for fixed overlays, so sheets stay inside the phone.

**Issues found and fixed (all real)**
| Found | How it was found | Fix |
|---|---|---|
| `useNow` returned a new `Date.now()` on every snapshot read (React would re-render forever) | Code review while writing it | Stable snapshot, updated once per second |
| lucide v1 no longer ships `Linkedin` | Checked exports before use | Inline LinkedIn mark |
| Store updated during render (previous path) | Code review | Moved into an effect |
| Framer `scale` on the wrapping `<main>` would make it the containing block for the fixed stage mid-animation | Code review | `<main>` itself is the fixed full-screen element |
| Every page returned 500 on the dev server already running on :3001 (`useOS is not a function` in SSR) | curl + stack trace from the error page | A fresh production build rendered everything, so it was a stale module graph in a dev server started before `lib/store.ts` was rewritten. That server belongs to Seyf and was left alone; it needs a restart |
| Lock screen was see-through: home widgets and dock showed behind the clock | 390px screenshot | Lock screen has its own opaque wallpaper |
| ~450 ms between tapping an icon and the window starting to open | Sampled the window's computed `clip-path` every frame after a click | Optimistic open: the window opens in client state on tap while the URL updates in the background (the URL stays the source of truth for back/forward and deep links). Routes are also prefetched on icon hover/press. After the fix the animation starts on the first frame (~40 ms) |
| Home pages misaligned by half a screen after using apps | Screenshots, then found `scrollLeft = 211` on an `overflow: hidden` container | `focus()` can scroll hidden-overflow containers; switched the OS containers to `overflow: clip` |
| Settings skills looked switched off on arrival | Screenshot after 3 s | The observer waited for 30% of a 10-row section to be visible; it now fires when the section's top enters the view |
| Greeting text stuck invisible with reduced motion | 360px reduced-motion screenshot | The reveal starts before the reduced-motion flag is read and its tweens were created asynchronously; now `contextSafe` and `revertOnUpdate: true` so the half-played reveal is undone |
| Second icon row clipped on short phones and short desktop windows | Open Graph render at 1200x630 | A container query drops the "Now" shortcut when the home page is under 430px tall |
| "Vintage denim jacket" drawn as a tan coat (the 🧥 emoji) | Fripa screenshot | Renamed to "Vintage jacket" in the game and the placeholder |
| Dock Mail icon showed as a blank rectangle | Home screenshot | Removed the white fill that hid the envelope flap |
| Mixed-in all-caps skill labels in the résumé | Screenshot review | Sentence case |

**Not fixed / known**
- Browser address-bar hosts (`febalcasa-usa.com`, `aureliagloves.com`, `weedy.fr`) are guesses, marked PLACEHOLDER in `data/apps.ts`; project `url`s are empty until real links are added.
- Uteek's seat buttons are 30–36px (eight seats and an aisle don't fit 44px targets at 360px); arrow keys move between seats.
- The contact form needs `FORMSPREE_ENDPOINT` (or another service) to actually send; until then Mail offers a prefilled email link.
- The CV PDF is the one printed from the previous build's recruiter page (same facts); the Open Graph image is a real render of the home screen.
- Not measured: Lighthouse scores and real-device frame rates. Gestures (swipe up, swipe between pages, drag down, long-press) were exercised through their button/keyboard alternatives and pointer events in headless Chrome, not on a physical phone.

**Result**: `next build` passes; every app URL, `/` and `/resume` prerender. TypeScript and ESLint clean. Production console across all 12 apps, unlock, control center, dark mode and the résumé: 0 errors, 0 warnings.

### Phase 3 follow-up: the back button works like a phone (2026-11-12)

Seyf asked whether "go back" behaves like a normal phone on mobile. It didn't fully: overlays and in-app screens had no history entries, so back closed the whole app, and going home after a deep link left the app one back-press away.

**Change**: `lib/backStack.ts`. Every overlay and in-app screen (control center, long-press menu, all sheets, the photo viewer, Uteek's event detail) owns one same-URL history entry while open; back closes only the top one, and closing it from the UI removes the entry. Going home rewinds exactly the screens SeyfOS opened since home, or replaces the URL when the visitor arrived on a deep link. Navigating while an overlay is open replaces its entry, so the overlay's cleanup can't undo the navigation.

**Verified** with the browser's back button on an iPhone 15 profile (production build):
| Scenario | Result |
|---|---|
| App with control center open: back, back | Control center closes, then the app; history length unchanged |
| Uteek: event, seat sheet: back x3 | Sheet, then event, then app |
| Sheet closed with Esc, then back | Goes home (no dead step left behind) |
| Messages to Settings via a chat reply, home, back | Leaves the site (home rewound both apps) |
| Control center Focus Mode, back, back | Résumé, then Order, then home |
| Deep link `/app/mail`, home, back | Leaves the site instead of reopening Mail |
| Photos full-screen photo: back, back | Photo closes, then the app |

Console: 0 errors. Still true and not fixable from a website: back on the home screen leaves the site (like any web page), and iOS Safari plays its own slide animation on the edge-swipe gesture. Not tested on a physical phone.

### Phase 3 follow-up: real CV and working contact form (2026-11-12)

Seyf shared his real CV (PDF) and asked to make the contact form work. He chose: redact the phone number from the public PDF, use the newer Desktop copy, and Formspree for email.

**CV**
- `public/cv/Seyf-Mejri-CV.pdf` is now his real CV with the phone number removed by true redaction (MuPDF, run from a scratch folder; nothing added to the project). Verified: the number is gone from the extracted text, the file has one fewer stream than the original (the old page content was replaced, not left as an orphan object), and page 1 renders identically apart from a blank gap where the number was.
- First attempt garbled every glyph on the page: MuPDF's `clean` save option rewrote an embedded font it can't parse. Caught by rendering page 1 and comparing extracted text; fixed by saving with `garbage=3,compress` only. A version without garbage collection kept the old content stream (with the number) as an orphan, so that option was rejected too.
- Site text synced with the real CV: the summary no longer has the "AI tooling" sentence; `cv.md` now mirrors the real CV (still without the phone).

**Contact form**
- `app/api/contact/route.ts` accepts the Formspree URL or just the form ID, and logs why Formspree refused a message (status and error code, never the content). `.env.example` documents `FORMSPREE_ENDPOINT` and is no longer caught by the `.env*` ignore rule. Setup steps are in the README.
- Tested end to end against a local mock of Formspree's JSON API: the route sent `{name, email, _replyto, _subject, subject, message}` with `Accept: application/json`, and Mail showed "Sent ✅". With the mock answering 403 like a reCAPTCHA block, the visitor got the "send it from your email app" fallback and the server logged `Formspree answered 403 [CAPTCHA_FAILED] (turn reCAPTCHA off in the form settings)`. Not tested against the real Formspree service (needs Seyf's account).

**Also fixed**: in apps, content scrolled up under the status bar and showed through the clock and pill (visible in Seyf's screenshot). Apps now have a frosted strip behind the status bar.

### Phase 3 follow-up: rearranging the home screen (2026-11-12)

Seyf asked for edit mode to work like a phone: move apps wherever he wants.

**Change**: `lib/homeLayout.ts` (arrangement model, capacity rules, validated localStorage), `components/os/useIconDrag.ts` (drag engine), HomeScreen and AppIcon updates. A floating copy of the icon follows the pointer while the real slots reorder live (Framer layout animations slide the others aside); holding at a screen edge flips the page; the dock accepts icons until full. Long-press then drag works in one motion. Page swipes now start from horizontal movement instead of the press, so a long-press can become an icon drag. Keyboard alternative: Move left / right / to the other page / to the dock in each icon's "⋯" menu, with focus returned to the moved icon. "Reset" restores the default.

**Verified** with real pointer drags on a production build (1440x900): reorder within a page; dock to page; edge-hold to the other page; page to dock; drop into a full page refused; long-press then drag without edit mode; arrangement survives reload; menu move actions (disabled with a reason when the target is full); Reset clears the saved layout. Console: 0 errors.

**Not tested**: touch drags on a physical phone (icons use `touch-action: none` and pointer capture so the browser doesn't take over the gesture, but this was only exercised with a mouse).

---

## Phase 4: Build 4, "The Seyf Times" (2026-11-13)

New brief from Seyf: the portfolio as a modern editorial newspaper. Morning Edition (light) and Night Edition (dark), a blackletter masthead, a breaking-news ticker, halftone images, page-turn transitions, skills as the markets page, contact as classifieds, and a printable A4 edition. Targets: mobile-first, reduced motion, accessible, Lighthouse 95+ in all four categories, no invented numbers.

**Process**
1. SeyfOS is kept on the local `seyfos` branch and in the pushed `main` history. Its code, sounds and dependencies (Zustand, Vaul, Howler) were removed from the working tree. next-themes was added.
2. Content was rewritten into `data/profile.ts`, `data/projects.ts` (nine stories), `data/career.ts` and `data/skills.ts`. Facts come from `cv.md`. Skills show only one number: how many roles used each skill, counted from the career data. Missing figures are `todo` lists, shown only in development.
3. I built the frame first (fonts, tokens for both editions, masthead, ticker, sticky header, sections menu, footer, intro, reveals, halftone, theme switch, page transitions, the 404 proxy). Subagents then built the sections against it: the front page, project index and articles; then career, skills, contact and print. Images are schematic SVG placeholders, marked as such.
4. Verified with `playwright-cli` on production builds at 390px and 1440x900, in both editions and with reduced motion. Screenshots are in `design/log/times/`.

**Decisions**
- Page turns use React's `<ViewTransition>` with CSS keyframes instead of Framer Motion. It is native, works with the App Router, and costs no JavaScript. Framer Motion handles the interactive pieces: the project filter's layout animation, the RECEIVED stamp, the form states, the before/after slider and the swipe deck.
- The intro is CSS (masthead inked in, rule drawn) and never hides the page, so the first paint is the real page.
- GSAP and Lenis load on the first scroll, touch, key press or mouse move (`lib/gsapLazy.ts`). Content on screen at load is shown as is; everything below the fold still reveals.

**Issues found and fixed (all real)**
| Found | How | Fix |
|---|---|---|
| `/projects/nope` answered 200 with a noindex "not found" page (soft 404) | curl | With partial prerendering the status is sent before `notFound()` runs, so `proxy.ts` rewrites unknown slugs to the 404 page with status 404 |
| Reused SeyfOS components still had SeyfOS classes | Screenshots | Restyled to the newspaper tokens |
| Theme colours snapped instead of gliding | Manual check | Removed next-themes' `disableTransitionOnChange` |
| Masthead printed on the print edition | Print preview | `no-print` on the header |
| Front page Lighthouse Performance 52 (LCP 5.7 s, TBT 1.3 s, CLS 0.077) | Lighthouse 12, mobile | Intro no longer hides `<main>`; reveals skip what is on screen at load; date placeholder stops the layout shift; Framer removed from always-mounted components |
| Small red kickers at 4.40:1 contrast | Lighthouse accessibility | `--accent-text` (#c21f36, 5.26:1) for small red text; the brand red stays for large type and fills |
| Edition switch's accessible name didn't contain its visible text | Lighthouse (label-content-name-mismatch) | The name now starts with the visible label |
| Front page still 57 after lazy-loading GSAP: TBT 1.1 s | Lighthouse trace | GSAP loaded during hydration because every reveal requested it on mount. It now loads on first interaction (TBT about 70 ms) |
| First layout took 193 ms unthrottled | Chrome trace | `text-wrap: pretty` on every paragraph and list item; now only on article body copy (layout 73 ms) |
| Career card label at 4.28:1 (grey on the card's darker paper) | Lighthouse accessibility | Ink at 75% on that surface (7.24:1); the brand grey is unchanged elsewhere |
| One Lighthouse run gave TBT 4 to 6 s | Benchmark index 330 against about 2,400 normally | Machine under load; discarded, and each page re-run 3 times |

**Result**: TypeScript and ESLint clean; `next build` passes with every page prerendered; console has 0 errors. Lighthouse mobile: Accessibility, Best Practices and SEO are 100 on every page. Performance is 85 to 90 (`/` 87, `/career` 90), with CLS 0 to 0.02 and TBT about 70 ms. Desktop: 99 to 100.

**Not reached / known**
- Mobile Performance is below the 95 target. The remaining cost is LCP in Lighthouse's simulation (3.6 to 4.0 s; about 0.3 s measured locally). The simulation charges the five web fonts (about 265 KB) and the React runtime to LCP. Dropping or merging a type family is the next lever, but the brief names all five. Not yet measured on a deployed site.
- `profile.siteUrl` is `https://example.com` until a domain is chosen. All images, including the portrait, are placeholders.
- Page turns use View Transitions; Firefox versions without them switch pages without the animation.
- Not tested on a physical phone; mobile was checked in headless Chrome at 390px.

---

## Phase 5: Build 5, "Seyf Mejri — Release Notes" (2026-11-16)

New brief from Seyf: the career as a product changelog. Each job is a major version, newest first; each release lists its changes with tags (NEW, IMPROVED, FIXED, SECURITY, INFRA); v6.0 "Upcoming release: your team?" is the call to action. Calm and premium, readable in five seconds. Strict restraint: two font families (Geist and Geist Mono), one accent (Sidi Bou Said blue), no custom cursor, intro, page turns, smooth-scroll library or ticker.

**Process**
1. The Seyf Times (uncommitted) was copied to `design/archive/build-4-seyf-times/` (source, images, screenshots), then removed from the app. GSAP and Lenis were uninstalled; cmdk was added.
2. Content went into typed files: `data/profile.ts`, `data/releases.ts` (version map, change lists and stacks exactly as in the brief), `data/projects.ts` and `data/skills.ts`. Context and impact paragraphs only restate CV facts. Every missing figure is a metric with no value, marked `// TODO: add metric`.
3. Built in the main session in the brief's order: tokens and fonts; header, mobile menu, footer and theme toggle; hero, featured release, changelog and version scrubber; projects, `package.json` stack and contact; release pages with the before/after slider; the CV page; the command palette.
4. Verified with `playwright-cli` on production builds at 360, 390, 768, 1280, 1440 and 1536px, in both themes and with reduced motion, using a mock Formspree for the contact form.

**Decisions**
- The command palette and mobile menu are native modal `<dialog>` elements, with cmdk inside the palette. This gives an inert background, Esc and focus return for free, and the palette code downloads only when it's first opened. Open and close are CSS transitions (`@starting-style`), not Framer Motion.
- Framer Motion runs through `LazyMotion`, with its features loaded after hydration. Reveals render visible on the server and hide only what starts below the fold, so nothing on the first screen waits for JavaScript.
- The version scrubber is one component: a sticky strip of pills under the header on mobile, a sticky rail in the left gutter on desktop. Both use plain hash links.
- `TODO: add metric` boxes render only in development; production hides metrics that have no value.

**Issues found and fixed (all real)**
| Found | How | Fix |
|---|---|---|
| Page 430px wide at 390px | `scrollWidth` check | The theme toggle and CV button had both `hidden` and `inline-flex`, and `inline-flex` won; they're now wrapped in a container hidden below `lg` |
| Rail dot for v1.0 off the line | 1440px screenshot | Its long hidden label shrank the dot; the dot no longer shrinks |
| Dates wrapping in the changelog's version column | 1440px screenshot | Column widened to 10rem |
| `package.json` strings breaking mid-word ("REST / APIs") | 1440px screenshot | Short strings don't wrap; only the long tool descriptions may |
| Palette opened with focus on a `div`, so typing did nothing | Checked `document.activeElement` after Ctrl+K | `showModal()` ignores React's `autoFocus`; the input is focused explicitly |
| Searching "fripa" opened Opus Lab | Listed the ranked items after typing | cmdk's fuzzy score matched scattered letters in keywords; replaced with a filter where every typed word must appear and name matches rank first |
| An empty form submit made a server round trip and logged a 422 in the console | Playwright request log | The same validation now runs in the browser first; the server still validates |
| Home-page Lighthouse run at 76 | Benchmark index 1,122 (normally about 2,300) | Machine under load; discarded and re-run 5 times |

**Result**: TypeScript and ESLint clean; `next build` passes with every page prerendered; no console errors; no horizontal scroll at any tested width; the CV prints on one A4 page. Lighthouse mobile: `/` 95 (median of 85, 95, 95, 96, 96), `/releases/educaro` 96, `/cv` 96, with Accessibility, Best Practices and SEO at 100. Desktop: 100 in every category on all three.

**Not done / known**
- All images, including the portrait and the Open Graph image (a screenshot of the hero with the placeholder portrait), are placeholders. `profile.siteUrl` is `https://example.com`.
- Projects have no live URLs yet, so their cards show no "Visit" link.
- The contact form needs `FORMSPREE_ENDPOINT` to send; until then it offers a prefilled email.
- Not tested on a physical phone or with a screen reader; keyboard paths were tested in headless Chrome.
