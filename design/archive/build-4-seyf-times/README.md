# The Seyf Times

Seyf Mejri's portfolio as a modern editorial newspaper. The front page leads with a project story, Projects is the news section, Career is the archive of past editions, Skills is the markets page, and Contact is the classifieds. There's a Morning Edition (light) and a Night Edition (dark), and `/print` is a one-page A4 print edition for recruiters.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all pages prerendered)
npm start          # serve the production build on http://localhost:3000
```

Stack: Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS v4, GSAP (ScrollTrigger, SplitText, DrawSVG, MorphSVG), Lenis, Framer Motion, next-themes, lucide-react.

## Pages

| URL | Section |
| --- | --- |
| `/` | Front page: lead story, "Who is Seyf?", more stories, bottom strip |
| `/projects` | All stories, filterable by section |
| `/projects/<slug>` | One project as a long-form article |
| `/career` | The archive: one "edition" per job, newest first |
| `/skills` | Markets: skills as index tables with sparklines |
| `/contact` | Classifieds: ways to reach Seyf and a "place an ad" contact form |
| `/print` | The print edition (A4, one page) |

Unknown project slugs return a real 404 (`proxy.ts`), not a soft 404.

## Where things live

| What | Where |
| --- | --- |
| Name, title, bio, email, site URL, newspaper name and motto, breaking news, section list | `data/profile.ts` |
| Projects: headline, story (problem, built, result), stack, images, live URL, TODO metrics | `data/projects.ts` |
| Career editions and education | `data/career.ts` |
| Skills and the market indices | `data/skills.ts` |
| Fonts, metadata, JSON-LD, page frame | `app/layout.tsx` |
| Colour tokens for both editions, paper grain, halftone, ticker, page turn, print styles, intro | `app/globals.css` |
| Masthead, section nav, sticky header, ticker, edition switch, footer | `components/layout/` |
| Page sections | `components/front/`, `projects/`, `article/`, `career/`, `skills/`, `contact/`, `print/` |
| Shared pieces: reveals, rules, halftone image, drop cap, intro, cursor, before/after slider, swipe deck | `components/shared/` |
| GSAP loading (`useGsapEffect`), Lenis, edition date | `lib/gsapLazy.ts`, `lib/lenis.ts`, `lib/date.ts` |

## Replacing placeholder images

Every image is a schematic SVG with a small "placeholder image" mark. To use real ones:

- **Project images**: `public/images/news/<slug>.svg`. Put the real image (PNG, JPG, WebP or SVG) in `public/images/news/`, then update that project's `hero` in `data/projects.ts` with its path, alt text, width and height. The `gallery` array works the same way for extra images on the article page. Images are shown as grayscale halftone prints and turn to colour on hover, focus or tap, so colour screenshots work well.
- **Educaro before/after**: `public/images/educaro-before.svg` and `educaro-after.svg`, used by the slider on the Educaro article (paths in `data/projects.ts`).
- **Portrait**: `public/images/portrait.svg`. Replace it with a real photo and update `profile.portrait` (path, width, height) in `data/profile.ts`. Remove "(placeholder)" from its alt text.
- **Open Graph image**: `app/opengraph-image.png` is a 1200x630 render of the front page. Re-render it after design changes (screenshot the front page at 1200x630) and update `app/opengraph-image.alt.txt` if the content changes.

Other placeholders:

- **Domain**: `profile.siteUrl` in `data/profile.ts` (canonical URLs, Open Graph, JSON-LD, sitemap). It is `https://example.com` until the site is deployed.
- **Live site links**: `url` on each project in `data/projects.ts`. Empty links hide the "Visit" button.
- **CV**: `public/cv/Seyf-Mejri-CV.pdf` is Seyf's real CV with the phone number redacted (removed from the text layer, not just covered). Redact any new version the same way before publishing it. The phone number must never appear on the site.

## Adding real metrics

No numbers on the site are invented. Where a real figure would make a story stronger, the project has a `todo` list in `data/projects.ts`, for example `"Load time before vs after"`. In development (`npm run dev`), each article shows these as a dashed "TODO: add metric" box under the story. In production builds the box is hidden.

To add a metric:

1. Put the real figure in the project's `result` list (or `summary`, `deck` or `pullQuote`), for example `"Page load went from 4.2 s to 1.1 s after the rebuild."`
2. Remove that line from the project's `todo` list. When `todo` is empty, the box disappears.

On the Skills page, the only figure is how many of Seyf's roles used each skill. It is counted from the job stacks in `data/career.ts`, so it updates when the career data changes. The sparklines are decorative and say so.

## Contact form setup (Formspree)

The Classifieds form posts to `app/api/contact/route.ts`, which validates the message (20 KB limit, honeypot field) and forwards it to Formspree. Messages arrive with Reply-To set to the visitor. When a message is sent, the ad gets a "RECEIVED" stamp.

1. Create a free account at [formspree.io](https://formspree.io) and a new form. Set its email to Seyf's address and confirm it when Formspree emails you.
2. In the form's **Settings**, turn **reCAPTCHA off**. Messages are sent from the server, so a captcha would make Formspree reject them.
3. Copy the form endpoint (`https://formspree.io/f/xxxxxxx`) or just its ID.
4. Locally: copy `.env.example` to `.env.local`, set `FORMSPREE_ENDPOINT`, and restart `npm run dev`.
5. When deploying, add the same `FORMSPREE_ENDPOINT` variable in the host's environment settings.

Until it is set, the form tells visitors that sending isn't set up and offers their email app with the message prefilled. If Formspree refuses a message, the server logs only the status and error code, never the message.

## Motion

- **Intro**: on the first visit of a session, the masthead is inked in and the rule drawn under it (CSS, 1.3 s, with a Skip button). It doesn't hide the page, so content is readable at once.
- **Page turns**: React's `<ViewTransition>` with a page-turn animation in `globals.css`. Browsers without View Transitions just switch pages.
- **Scroll reveals** (headlines word by word, paragraphs fading up, images unmasking, rules drawing, career editions, market numbers counting up) use GSAP. GSAP and Lenis load on the visitor's first scroll, touch, key press or mouse move, not with the page. Nothing below the fold can be seen before then, so no animation is lost, and the first paint and hydration don't pay for them. Content on screen when a visit starts is shown as is.
- **Reduced motion** (`prefers-reduced-motion`): no intro, a static ticker, no reveals, no smooth scrolling, and instant page changes.

## Accessibility and performance

- Every page has a skip link, one `h1`, labelled landmarks and visible keyboard focus. The edition switch, sections menu, filter, before/after slider and swipe demo all work with a keyboard.
- Small red text uses a darker red (`--accent-text`, 5.3:1 on paper). The brand red `#D7263D` is kept for large type and fills, where it passes.
- Lighthouse 12 on a production build served locally:

  | Page | Mobile (simulated slow 4G, 4x CPU) | Desktop |
  | --- | --- | --- |
  | `/` | Performance 87, Accessibility 100, Best Practices 100, SEO 100 | 99 / 100 / 100 / 100 |
  | `/projects/educaro-crm` | 88 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
  | `/skills` | 88 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
  | `/career` | 90 / 100 / 100 / 100 | not measured |
  | `/projects`, `/contact`, `/print` | 85 to 88 / 100 / 100 / 100 | not measured |

  Mobile Performance is below the 95 target. Blocking time is about 70 ms and layout shift is 0, so what remains is LCP (3.6 to 4.0 s simulated, about 0.3 s measured). Lighthouse's simulation charges everything downloaded before the first paint to LCP: the five web fonts the design uses (about 265 KB) and the React runtime. Merging two type families, for example Inter into Newsreader, would be the next lever. Measure the deployed site with PageSpeed Insights, since a real network changes this picture.
