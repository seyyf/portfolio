# Portfolio reference spec (replaces reference images)

No image-generation tool was available, so this written spec is the visual reference
for implementation (Step 4) and for screenshot comparison (Step 6).

Design read: developer portfolio for hiring managers and tech leads, in a Vercel-style
stark ink-on-white language (DESIGN.md), with asymmetric left-aligned composition
(taste skill). Dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 4, VISUAL_DENSITY 3.

## Global frame

| Item | Desktop (1440) | Mobile (390) | Token |
|---|---|---|---|
| Content max-width | 1200px, centered (120px side margin at 1440) | full width | `--geist-page-width` 1200 |
| Side gutters | 24px | 16px | `spacing.lg` / `spacing.md` |
| Grid | 12 cols, 24px gap (col = 78px) | 1 col (2 col where noted) | `--geist-gap` 24 |
| Section padding (y) | 96px | 64px | `spacing.5xl` / `spacing.4xl` |
| Breakpoints | 600 / 960 / 1200 / 1400 | | DESIGN.md Responsive |
| Fonts | Geist (400/500/600), Geist Mono (400) via `next/font` | | typography.* |
| Radius system | Interactive = pill 100px everywhere; cards 8px; large cards 12px | | `rounded.pill`, `rounded.md`, `rounded.lg` |
| Focus ring | 2px `link` #0070f3, 2px offset | | `colors.link` |

Band sequence (surface rhythm): Hero `canvas` → About `canvas-soft` → Case study `primary`
(the one polarity flip) → Experience `canvas-soft` → Projects `canvas` → Skills `canvas-soft`
→ Education & Languages `canvas-soft` (hairline top) → Contact `canvas` + mesh → Footer `canvas`.

Contrast rule from the token audit: `mute` #888 on `canvas-soft` is 3.4:1, so it fails AA
for 12-14px text. All small text uses `body` #4d4d4d (8.4:1). `mute` is never used for text.

---

## 0. Nav (`nav-bar`)
- Sticky, 64px tall, `canvas` at 85% + backdrop blur, 1px `hairline` bottom border (always on).
- Left: 28px ink rounded-square monogram "SM" (white, 12px/600) + "Seyf Mejri" `body-sm-strong` ink.
- Right: links About, Work, Experience, Skills, Contact in `nav-link` (body-sm, `body`,
  8/12 padding, ghost pill `canvas-soft-2` on hover, text to ink). Then `button-primary-sm`
  "Email me" (32px tall pill).
- Below 960px (not 600px): monogram + name left, 44x44 `icon-button-circular` hamburger right (six links do not fit one line at tablet width). Opens a
  full-screen overlay (shadcn Sheet) with links stacked in `display-md` + full-width "Email me".

## 1. Hero (`hero-band`, `canvas`)
- Padding: 96px top, 128px bottom (desktop); 64 / 96 mobile.
- Content in cols 1-8, left-aligned. Stack:
  1. Mono badge: pill, `canvas-soft` fill, inset hairline ring, 24px tall, 0 8px padding,
     `caption-mono` `body`: "Based in Tunis, Tunisia"
  2. 24px gap. H1 `display-xl` (48/48, -2.4px, 600), two lines:
     line 1 "Seyf Mejri" in `ink`; line 2 "Fullstack JavaScript Developer." in `body`.
     Mobile uses `display-lg` (32/40, -1.28px): 3 lines.
  3. 16px gap. Lead `body-lg` (18/28) `body`, max-width 560px:
     "Six years building React and Next.js frontends and Node.js backends for SaaS, ERP,
     e-commerce and booking products." (18 words)
  4. 32px gap. CTA row, 12px gap: `button-primary` "Email me" (48px pill, envelope icon) +
     `button-secondary` "LinkedIn" (48px white pill, inset hairline ring, arrow-up-right icon).
- Mesh gradient: the three DESIGN.md pairs (develop blue→teal, preview violet→pink,
  ship coral→amber) as layered blurred radial gradients, absolutely positioned top-right,
  bleeding off the right edge, about 900x600 at desktop, masked to fade into `canvas`
  toward bottom-left so the text column stays on near-white. Mobile: anchored top-right,
  about 420x360, lower opacity, masked so the headline sits on white.
- Total height at 1440x900: about 590px, so the About headline peeks above the fold.

## 2. About (`canvas-soft`)
- H2 `display-lg` cols 1-8: "From database design to deployment."
- 24px gap. `body-lg` `body`, cols 1-7, two short paragraphs:
  "I'm a fullstack JavaScript developer with six years of experience across SaaS, ERP,
  e-commerce and booking products. Most recently I led the full rebuild of Educaro's CRM
  from AngularJS to React and TypeScript."
  "I like owning features end to end, and I use AI tooling to ship faster without cutting
  corners on quality."
- 48px gap. Fact row cols 1-12 with a single `hairline` top border, 3 columns, 24px top padding,
  no cards: label `caption-mono` `body`, value `display-sm` ink.
  Experience / 6 years · Focus / React, Next.js, Node.js · Education / Master's in Media Engineering
- Mobile: fact row stacks to 1 col, 16px between items.

## 3. Featured case study (`showcase-band-dark`, `primary` #171717)
- Text `on-primary`; secondary text `hairline-strong` #a1a1a1 (7.4:1 on #171717).
- H2 `display-lg` white, cols 1-9: "Case study: rebuilding the Educaro CRM."
- 16px gap. `body-lg` #a1a1a1: "Fullstack Developer at Educaro, Jan 2025 - Present.
  An internal CRM used every day by staff across six departments."
- 64px gap. Highlight row, 1px `body` #4d4d4d dividers top and bottom, 32px vertical padding:
  - cols 1-6: "AngularJS" (`display-lg`, #a1a1a1) + arrow icon + "React + TypeScript"
    (`display-lg`, white). Caption below `caption-mono` #a1a1a1: "Full rebuild from scratch"
  - cols 7-9: "70" `display-xl` white + `body-sm` #a1a1a1 "staff use it daily"
  - cols 10-12: "6" `display-xl` white + `body-sm` #a1a1a1 "departments"
- 64px gap. Three narrative rows, 32px padding each, 1px #4d4d4d divider between rows:
  label column cols 1-3 (`caption-mono` #a1a1a1), content cols 4-12.
  - Problem: `body-lg` white: "Educaro's internal CRM ran on AngularJS. It had recurring
    bugs and couldn't support the features the team needed, while 70 staff in admissions,
    sales, support, recruiting, finance and teaching relied on it daily."
  - What I did: 2-col sub-grid (24px gap), each item = `body-md-strong` white title +
    `body-md` #a1a1a1 sentence. Last item spans both columns.
    Rebuilt from scratch / Led the migration from AngularJS to React and TypeScript.
    Mobile-first redesign / A modern UI with animations, built on a shadcn/ui component library.
    Secure authentication / Reworked login and authentication to strengthen security.
    APIs and data / REST APIs in Node.js and PHP on MongoDB and MySQL.
    Delivery / Containerized with Docker. GitLab CI/CD deploys to DigitalOcean and runs
    database migrations on every release.
  - Result: `body-lg` white: "A React and TypeScript CRM that 70 staff use daily, with the
    legacy app's recurring bugs resolved and new features the old system couldn't support."
    Then 16px gap and stack tags: pills, transparent, 1px #4d4d4d border, `caption-mono`
    white, 24px tall: React, TypeScript, shadcn/ui, Node.js, PHP, MongoDB, MySQL, Docker,
    DigitalOcean, GitLab CI/CD.
- Mobile: labels sit above content; highlight row = migration full width, then 70 and 6
  side by side (2 cols).

## 4. Experience (`canvas-soft`)
- H2 `display-lg`: "Experience."
- 48px gap. Timeline, 5 entries, 48px between entries.
  - cols 1-3: dates `body-sm-strong` ink ("Feb 2024 - Dec 2024"), location `body-sm` `body`.
  - cols 4-12: 1px `hairline-strong` vertical rail on the left edge, 24px left padding.
    Marker per entry: 11px circle on the rail aligned to the role line; current role filled
    `ink`, past roles `canvas` with 1px `hairline-strong` ring (marks "current", not decoration).
  - Role line: `display-sm` ink "Fullstack Developer" + `display-sm` `body` "at Educaro".
  - Bullets: `body-md` `body`, 8px apart, 16px hanging indent with a 6px `hairline-strong` dash.
  - Stack tags, 16px below: `badge-secondary` pills (`canvas` fill + inset hairline ring on this
    band), `caption-mono` `body`, 24px tall, 8px gap.
- Educaro entry is condensed to two bullets + inline `link-inline` "Read the case study" (anchors
  to section 3), to avoid repeating the case study.
- Mobile: dates and location above the role, rail at the left content edge.

## 5. Selected projects (`canvas`)
- H2 `display-lg`: "Selected projects."
- 48px gap. Bento of exactly 3 cells, 24px gap:
  - Febal Casa USA: cols 1-7, spans both rows. `card-marketing-large` chrome
    (`canvas`, 12px radius, Level 2 shadow + inset hairline), 16px padding. Thumbnail fills
    remaining height (min 16:10), 8px radius, `canvas-soft-2` placeholder with centered
    `caption-mono` `body` "[ADD SCREENSHOT]". Below: name `display-md`.
  - Aurelia Gloves, Weedy: cols 8-12, stacked. Same chrome, 16:9 thumbnails, name `display-sm`.
  - Under each name: one-line `body-sm` `body` description from the CV, then a row with a
    `badge-secondary` type tag (Website / Product site / E-commerce) and a `link` text link
    "[ADD LINK]" with arrow-up-right icon.
- Hover: card shadow goes Level 2 → Level 4, thumbnail darkens slightly. No movement on cards.
- Mobile: single column, all thumbnails 16:9.

## 6. Skills (`canvas-soft`)
- H2 `display-lg`: "Skills."
- 48px gap. Bento of exactly 5 cells in two balanced rows, 24px gap, all 12px radius:
  - Row 1: Frontend cols 1-7, polarity-flipped (`primary` fill, white text, 32px padding),
    label `caption-mono` #a1a1a1, pills transparent with 1px #4d4d4d border. Backend cols 8-12.
  - Row 2: Databases cols 1-3, DevOps cols 4-6, Tools cols 7-12 (Git and AI-assisted
    development as two labelled pill groups).
  - Light cells: `canvas`, 24px padding, Level 1 inset hairline; pills `canvas-soft` + inset hairline.
  - (Changed during verification: the original 2-row-tall Frontend tile left a large empty block.)
- No bars, no percentages, no levels.
- Mobile: single column, Frontend first.

## 7. Education and languages (`canvas-soft`, compact)
- 64px vertical padding, single `hairline` top border.
- cols 1-7: H2 `display-md` "Education." Two rows, 24px apart: degree `body-md-strong` ink,
  school `body-sm` `body`, years `caption-mono` `body` right-aligned.
- cols 9-12: H2 `display-md` "Languages." Three rows: language `body-md-strong` ink, level
  `caption-mono` `body` right-aligned (Native, C1, B2).
- Mobile: stacked, 48px apart.

## 8. Contact (`feature-mesh-band`, `canvas`)
- Padding 128px y (desktop), 96px (mobile). Mesh gradient bleeding from the bottom-right,
  same stop order as the hero, masked toward top-left.
- cols 1-8: H2 `display-xl` "Get in touch." 16px gap. `body-lg` `body`:
  "Email is the quickest way to reach me. I'm also on LinkedIn."
  32px gap. Same CTA pair as the hero ("Email me", "LinkedIn").
  24px gap. Email shown as `code` text "mejri.seyf@gmail.com" + 32px `icon-button-circular`
  copy button (44px hit area on touch), label swaps to "Copied" for 2s with aria-live.
- No phone number anywhere.

## 9. Footer (`footer`, `canvas`)
- 1px `hairline` top, 32px y padding (compact; site has no footer nav columns).
- Left: `caption` `body` "© Seyf Mejri" (no year: a computed year blocks static prerendering, a hardcoded one goes stale). Center/right: `caption` `body` "Built with
  Next.js, TypeScript, Tailwind CSS and shadcn/ui." Right: Email, LinkedIn `body-sm` links.
- Mobile: stacked left-aligned.

## Motion (MOTION_INTENSITY 4)
- Hero: one staggered fade-up on load (opacity 0→1, translateY 8px→0, 500ms,
  cubic-bezier(0.16,1,0.3,1), 60ms stagger). Communicates reading order.
- Sections: fade-up once when 20% in view (IntersectionObserver, no scroll listeners).
- Buttons: primary hover `primary` at 88%, secondary hover `canvas-soft-2`, active scale 0.98.
- Everything off under `prefers-reduced-motion: reduce`.

## Meta
- Title "Seyf Mejri · Fullstack JavaScript Developer"; description from the summary;
  Open Graph image generated at build (ink "SM" mark, name, title, mesh gradient band).
- Favicon: "SM" in white on an ink rounded square (app/icon), plus apple-icon.
