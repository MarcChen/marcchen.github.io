# EBRU V3 — Night

Shipped direction for the marcchen.github.io redesign: **marble ink on a night ground**.
Approved from three independent design-lab explorations (branches `design/a-record`,
`design/b-field-notes`, `design/c-night-gallery`); built full-site on branch
`design/ebru-night` (HEAD `97f6d9d`) and shipped through the `unslop/site` PR.

## Concept

One material, no ornament. The page is a night bath in which ink is marbled: colour comes
from the marbling, from photography (b/w or warm) and from nothing else — no chromatic
accent, no gradient decoration. Structure is carried by type and tone steps, not by cards,
shadows or glass. Square corners, left-aligned, asymmetric. Sections each have their own
composition (ledger, register, lexicon, full-bleed photo) instead of repeating card grids.

## Tokens

`src/styles/globals.css` holds a single token layer.

| Token | Value | Role |
|---|---|---|
| `--ink` | `#0a0c0e` | page ground |
| `--tone-1` | `#0e1113` | raised surface (ledgers, rows) |
| `--tone-2` | `#121518` | second raised surface |
| `--bone` | `#efece4` | headings, primary ink, also `::selection` ground |
| `--ash` | `#b9b5ac` | body text |
| `--ash-bright` | `#c9c5bc` | emphasised body |
| `--dim` | `#85827a` | meta and captions only (AA 4.94:1 on tone-1) |
| `--hair` | `rgba(239,236,228,.14)` | real rules only (tables, ledgers) |
| `--hair-soft` / `--hair-strong` | `.075` / `.26` alpha | quieter / stronger real rules |

Links are bone and underline on hover; focus is a 2 px bone outline, 3 px offset.

### Type

- Display: **Libre Caslon Display 400** — `--font-caslon`.
- Text/UI: **Archivo 400/500/600** — `--font-archivo`.
- Loaded with `next/font/google`, `display: swap`; CJK fallbacks only, no third family.
- Hero: `clamp(70px, 8.4vw, 140px)`, leading .88, tracking −.025em. Section h2: `clamp(38px, 4.4vw, 62px)`.
  Subheads 22–26 px; body 16–17 px / 1.7; meta 10–11 px uppercase sparingly, real metadata only.

### Layout

- Content max `1560px`; gutter `46px` desktop / `20px` mobile; nav `76px`; section rhythm
  `160px` (`132 / 108 / 84px` at 1180 / 960 / 760 breakpoints); two–three shared left edges; no centred hero.

## Motion budget

- **Hero marbling canvas** (`MarblingCanvas variant="hero"`): ~420×400 internal buffer, slow
  drift (`t += 0.00018` per ms, 26 fps desktop / 18 fps coarse pointer), cursor stir on fine pointers only.
- **One footer marble band** (`variant="band"`, 680×200, 22/16 fps). Nothing else loops; the 404 is type-only.
- UI transitions: `--fast: 170ms` (colour, underline, border); buttons 140 ms.
- `prefers-reduced-motion: reduce` → one static painted frame, no RAF, smooth scroll off; RAF also
  stops off-screen (`IntersectionObserver`) and when the tab is hidden. Canvas is `aria-hidden`.

## What changed

- Removed the glassmorphism / violet-gradient UI: `GlassCard`, `CursorGlow`, `MagneticButton`,
  `AnimatedHeading`, `SectionWrapper`, `Icons`, `SocialSidebar`, `src/styles/variables.css` and
  15 per-component CSS modules; `globals.css` rewritten as one stylesheet (~3,000 lines).
- Added `MarblingCanvas`, `SectionHead`, `InlineText`, `NotFound` (designed 404), `DocumentLang`,
  and a blog markdown renderer (`src/components/blog/markdown.ts`).
- All home sections rebuilt in the night system; blog index/post pages, photos page (intentional
  empty state until `public/photos` exists), designed 404, single dark theme (theme toggle removed,
  `themeColor #0a0c0e`).
- Preserved: content and data untouched (`src/data`, `src/content`), three locales, language switch
  with path preservation, section anchors, skills/project filters, Giscus comments as an on-request
  disclosure, analytics and Cal.com scripts, static export with **39 routes**, no new npm dependencies.
- 68 files changed, +5,401 / −6,305.

## How to verify

```bash
npx next build                                          # 39/39 static routes
python3 -m http.server 4310 --bind 127.0.0.1 --directory out
```

- Zero horizontal overflow at 1440 / 1024 / 768 / 390 / 360.
- axe WCAG A/AA clean on `/en/`, `/en/blog/`, a post, `/en/photos/` and the 404.
- `/fr/` and `/zh-cn/` render the same layout with their own strings; language switch keeps the path.
- Keyboard walk, visible focus, Escape closes the mobile menu and returns focus; reduced motion
  gives a static frame; no console errors; internal links 200; no missing local images.
- Process and gate: `docs/design/WORKFLOW.md`.

## Round 2 — section variety, imagery, voice (commit `2a2d4dc`)

The independent adversarial review scored the first build 6.5/10 and flagged the same three-column
ledger repeated six times, 40 tracked ALL-CAPS declarations, missing body imagery and designer-colophon
copy. Round 2 addressed those recommendations:

- **Compositions split**: Skills is a two-column lexicon index; Experience is the only ruled ledger;
  Education sets the degree as a display statement above a two-column detail field (not a left/right
  spine); Selected work is editorial image plates (Vision Vendor brand banner, Dassault hexacopter, RBM
  typographic); Courses & certificates is an issuer-grouped register; Latest writing is an asymmetric
  two-column list and stays imageless because no local asset belongs to those posts; the blog index
  carries a real local lead image per post.
- **Photography**: a second real photo (Mont-Saint-Michel, grayscale) fills the empty About column;
  project plates use the local assets; no hotlinks, nothing fabricated.
- **Voice**: section-head caps labels, dates/categories/tags/roles sentence-cased; 40 uppercase
  declarations reduced to 4 (nav only); colophon strings removed in all three locales ("Marbled ink,
  night", "a material that never repeats", "the contact sheet is still drying", "this page is not in
  the record", slash meta strings).
- **Marbling once**: hero canvas + one footer band; the duplicate 404 band is gone.
- **Mobile**: post date/tags moved above the article at ≤960, compact ledgers, 2-column skills index,
  hero facts fill the row (no empty grid cell).
- Verification after round 2: 39/39 routes, axe WCAG 2.2 AA clean, 0 overflow at 1440/1024/768/390/360,
  0 console errors, locales intact.


## Known limits

- Static export ships html lang="en" on /fr/ and /zh-cn/: the inner wrapper carries the correct
  language and DocumentLang fixes the root after paint; no-JS/SEO sees English. Structural export limit.
- GitHub Pages deep-404: unknown /fr/... or /zh-cn/... URLs boot the static English 404 and re-render in
  the URL locale (recoverable React hydration warning); the final DOM, lang and title are correct.
- Comments are third-party Giscus threads; a thread that does not exist logs one external 404 when opened.
- The "Professional" projects filter has no matching data, so it shows the localized empty state.
- Marbling canvas: on the constrained CI virtual machine the hero was measured at ~60 ms/frame
  (420x400 buffer), above the documented 26 fps budget. The loop is bounded (fps caps, off-screen and
  hidden-tab pauses, static reduced-motion frame); a precomputed-noise or worker version is a follow-up.
- Deferred cleanups (not in this PR): ~20 unused i18n compatibility keys, now-unused framer-motion /
  lucide-react dependencies, unreferenced public/theme-init.js, and splitting the 3,033-line globals.css
  if it keeps growing.
- Vision Vendor has no local photograph (its brand banner is used); RBM is typographic. Nothing invented.

## Evidence

- Before - the old front-end: assets/before-hero.webp
- After - hero: assets/after-hero.webp
- After - full page: assets/after-full.webp
- After - mobile full page: assets/after-mobile-full.webp
- Independent adversarial review, round 1: REVIEW-round1.md
