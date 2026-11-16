# Seyf Mejri — Release Notes

Seyf Mejri's portfolio, presented as a product changelog. Each job is a major version, newest first (v1.0 Bertsch Innovation → v5.0 Educaro, the current stable release). Each release lists its changes with plain-English tags: NEW, IMPROVED, FIXED, SECURITY, INFRA. v6.0, "Upcoming release: your team?", is the call to action.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (every page is prerendered)
npm start          # serve the production build on http://localhost:3000
```

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, next-themes, cmdk, lucide-react. Fonts: Geist and Geist Mono (next/font).

## Pages

| URL | What |
| --- | --- |
| `/` | Hero, latest release (v5.0), changelog with version scrubber, side releases (projects), stack as `package.json`, contact |
| `/releases/<slug>` | Full release notes for one job: `educaro`, `uteek`, `global-enr`, `opus-lab`, `bertsch-innovation` |
| `/cv` | One-page A4 résumé with "Print / Save as PDF" |

Unknown release slugs return a real 404 status (`proxy.ts`). Press **⌘K** or **Ctrl+K** (or the search button in the header) for the command palette.

## Where things live

| What | Where |
| --- | --- |
| Name, headline, email, LinkedIn, CV path, site URL, at-a-glance row, header links | `data/profile.ts` |
| Releases: versions, dates, change lists, stack, context, impact, metrics, images | `data/releases.ts` |
| Side projects and their filter tags | `data/projects.ts` |
| Skills (`package.json` groups) and languages | `data/skills.ts` |
| Colours for both themes, tag colours, print styles | `app/globals.css` |
| Header, mobile menu, footer, theme toggle, command palette, providers | `components/layout/` |
| Home sections | `components/home/` |
| Release page parts: header, change list, before/after slider, metrics, previous/next | `components/release/` |
| Tag, chip, button, reveal | `components/ui/` |
| Contact route (Formspree) | `app/api/contact/route.ts` |

## Replacing placeholder images

Every image is a schematic SVG that says "Placeholder" and names its own file. Replace each file with a real image (PNG, JPG, WebP or SVG), then update the path, alt text, width and height in the data file:

- **Portrait**: `public/images/portrait.svg` → `profile.portrait` in `data/profile.ts`. Remove "(placeholder)" from the alt text.
- **Release screenshots**: `public/images/releases/<slug>.svg` → `hero` on each release in `data/releases.ts`.
- **Educaro before/after slider**: `public/images/releases/educaro-legacy.svg` and `educaro-new.svg` → `beforeAfter` on the Educaro release.
- **Project images**: `public/images/projects/<slug>.svg` → `image` on each project in `data/projects.ts`. Add a `url` to a project to show a "Visit" link on its card.
- **Open Graph image**: `app/opengraph-image.png` is a 1200x630 screenshot of the hero. Retake it after changing the portrait or headline, and update `app/opengraph-image.alt.txt` if the text changes.

Images use `next/image`. SVGs are served as is (`unoptimized`); for real photos you can remove `unoptimized` to get resized, modern-format images.

Also replace `profile.siteUrl` (`https://example.com`) with the real domain. It's used for canonical URLs, Open Graph, the sitemap and JSON-LD.

## Adding real metrics

No number on the site is invented. Where a real figure belongs, the release has a metric without a value, marked with a comment. Search the code for `TODO: add metric`:

```ts
metrics: [
  { label: "Daily active users" }, // TODO: add metric
  { label: "Page load time, legacy vs new" }, // TODO: add metric
],
```

In development (`npm run dev`), each one shows as a dashed "TODO: add metric" box in the release's Impact section. Production builds hide them, so the live site never shows an empty figure.

To add a metric, give it a value. It then appears as a stat card, in development and production:

```ts
{ label: "Daily active users", value: "350" },
```

You can also add a sentence with the number to the release's `impact` list.

## Contact form setup (Formspree)

The form posts to `app/api/contact/route.ts`. The route validates the message (20 KB limit, honeypot field) and forwards it to Formspree, with Reply-To set to the visitor. On success the visitor sees `✓ Message delivered`.

1. Create a free account at [formspree.io](https://formspree.io) and a new form. Set its email to Seyf's address and confirm it when Formspree emails you.
2. In the form's **Settings**, turn **reCAPTCHA off**. Messages are sent from the server, so a captcha would make Formspree reject them.
3. Copy the form endpoint (`https://formspree.io/f/xxxxxxx`) or just its ID.
4. Locally: copy `.env.example` to `.env.local`, set `FORMSPREE_ENDPOINT`, and restart `npm run dev`.
5. When deploying, add the same `FORMSPREE_ENDPOINT` variable in the host's environment settings.

Until it's set, the form says it isn't connected yet and offers the visitor's email app with the message prefilled. To use another email service instead, replace `forward()` in the route; the file explains how.

## Accessibility, motion and performance

- Semantic landmarks, one `h1` per page, a skip link, visible focus rings, and full keyboard use: the palette (arrows, Enter, Esc), the mobile menu (a native modal dialog that returns focus), the version scrubber (plain links), the project filter (`aria-pressed`) and the before/after slider (arrow keys, Home, End).
- WCAG AA in both themes. Every tag pill is at least 6:1, muted text at least 5.1:1, and the accent at least 5.5:1.
- Motion is limited to: fade and slide-up on scroll (once, only for content that starts below the fold), the version scrubber's indicator, hover states, the theme switch, the palette and the project filter. With `prefers-reduced-motion`, nothing moves.
- Framer Motion's animation features and the command palette (cmdk) load after the page is interactive.
- Lighthouse 12 on a production build served locally:

  | Page | Mobile (Performance / Accessibility / Best Practices / SEO) | Desktop |
  | --- | --- | --- |
  | `/` | 95 / 100 / 100 / 100 (median of 5 runs: 85, 95, 95, 96, 96) | 100 / 100 / 100 / 100 |
  | `/releases/educaro` | 96 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
  | `/cv` | 96 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

  The one 85 on the home page was a run with a 378 ms hydration task while the machine was busy. Check the deployed site with PageSpeed Insights.

## Earlier builds

Earlier concepts are kept for reference and are not part of the app: `design/archive/build-2-seyf-city` (a 3D city) and `design/archive/build-4-seyf-times` (an editorial newspaper). SeyfOS, the smartphone OS, is in the git history and on the local `seyfos` branch.
