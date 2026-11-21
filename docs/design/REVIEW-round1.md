# T3 — Independent adversarial review: EBRU V3 "Night" (branch unslop/site)

Reviewer: design-adversary (did not build this design). Reviewed commit `97f6d9d` + fixes `9224a7c`.
Worktree: /root/marcchen.github.io/.agents/worktrees/dsh-57628ea7-40ce. Built with `npx next build` (39/39 static pages).
Evidence: /tmp/unslop-shots/t3/before/*.png (23 section/viewport shots), /tmp/unslop-shots/t3/audit-before.json,
/tmp/unslop-shots/t3/axe-details-before.json, /tmp/unslop-shots/t3/verify-after.json, /tmp/unslop-shots/t1/*.png.

## SCORES (1–10, harsh; "after" = after the safe fixes in this review)
- AI-slop: 6 / 10 (10 = clean)
- Typography: 7 / 10
- Layout: 6 / 10
- Color: 7 / 10 → 8 after the AA token fix
- Motion / a11y: 6 / 10 → 8 after the axe-clean pass
- Distinctiveness: 6.5 / 10
- Craft: 7.5 / 10 → 8 after fixes
- Overall: 6.5 / 10 → ~7 after fixes

Verdict: **PASS-WITH-FIXES** — builds and behaves; objective defects are fixed in `9224a7c`;
the remaining work is aesthetic (the repeated ledger formula, caps labels, missing imagery) and is
listed below as recommendations for a design round, not applied.

## TOP AI-SLOP TELLS

1. **Tiny tracked ALL-CAPS micro-labels used everywhere as decoration — the dominant tell.**
   37 selectors / 40 `text-transform: uppercase` declarations in `src/styles/globals.css` (lines 213,
   236, 335, 361, 400, 440, 469, 575, 613, 641, 681, 716, 759, 854, 877, 920, 1013, 1091, 1169, 1233,
   1256, 1278, 1314, 1385, 1445, 1516, 1561, 1580, 1615, 1716, 1748, 1850, 2024, 2046, 2090, 2134,
   2194, 2225, 2362, 2753), mostly 9–10.5px at 0.14–0.24em tracking. The brief allowed them
   "sparingly, real metadata only"; here they carry dates, categories, filter buttons, roles, tags,
   column headers, buttons, every link, and the footer. Screenshot evidence: 1440-projects.png
   (PROJECT PAGE / GITHUB, CO-FOUNDER, HOBBIES·MOBILE·FLUTTER…), 1440-education-open.png
   (COURSES / EXTRACURRICULAR ACTIVITIES / GPA / CLASS RANKING / BAC),
   1440-about.png (CURRENTLY / CERTIFIED / LANGUAGES / ALSO / THE RECORD), 1440-footer.png.
2. **Uniform section-head formula repeated 9×**: serif `h2` left + tiny tracked caps label right.
   `src/components/sections/SectionHead.tsx:17-28` + `globals.css:188-216`; labels from
   `src/lib/i18n.ts:70-77`. Home: THE RECORD / INDEX / ROLES / SELECTED / CERTIFICATES / ALL WRITING;
   blog + photos + post: ARCHIVE. Nothing in the label is needed; it is a decorative eyebrow moved
   beside the title.
3. **The same three-column ledger composition six times in a row** (left italic-serif date, middle
   serif title, right tiny caps meta): Skills lexicon `globals.css:886-931`, Experience
   `globals.css:940-1016`, Education `globals.css:1047-1124`, Selected work `globals.css:1194-1288`,
   Courses table `globals.css:1300-1395`, Latest writing `globals.css:1404-1448`; the blog index
   (`globals.css:1673-1720`) repeats the same row. `src/app/[locale]/page.tsx:51-145` stacks them
   directly. Screenshot: 1440 full-page and 1440-skills / -education-open / -projects are
   interchangeable at a glance; on 390 the whole page is one long stack of the same row
   (docHeight 13,748px, ~16 screens).
4. **Designer-colophon copy / "the record" register** (performative-label tell):
   `i18n.ts:57` "Marbled ink, night" (hero bottom-right, t1-desktop-hero.png),
   `i18n.ts:162` "Marbled ink — a material that never repeats." (footer, 1440-footer.png),
   `i18n.ts:70` "The record" (about label), `i18n.ts:147` "The contact sheet is still drying.",
   `i18n.ts:156` "This page is not in the record." Also the "A · B · C" family: `i18n.ts:53`
   "FR / EN / 中文", `Skills.tsx:81` `.join(" / ")`, `globals.css:1260` project-tags `" / "`
   separator, and spaced-em-dash labels `i18n.ts:167-169` "CV — English", `Hero.tsx` role line.
5. **Real imagery is missing from 8 of 10 home screens.** Only two photographs exist on home —
   the About portrait (`About.tsx:98-106`, grayscale per `globals.css:783`) and the graduation
   plate (`Achievements.tsx:16-23`); the rest is type + two generated canvas textures. Local assets
   that could carry the work are unused: `public/images/sections/projects/visionvendor-miniature.jpg`,
   `public/images/posts/ensta-uav-challenge/hexacopter.webp`, 8 bike photos in
   `public/images/posts/bike-images/`, `public/images/photos/mont-saint-michel.jpg`.
   Screenshot: 1440-projects.png and 1440-skills.png are 100% text on near-black.
6. **Italic-serif dates used as the same mannerism in every ledger**: `globals.css:948-954`,
   1054-1060, 1202-1208, 1412-1418, 1681-1687. Five sections share the identical date treatment.
7. **"Premium editorial" default cluster**: blue-tinted near-black ground `#0a0c0e`
   (`globals.css:11`, explicitly on the brief's tell list as "tinted near-black as black") +
   high-contrast serif display + hairline rules. Competently done, but the category default.
8. **The signature material is diluted into a repeated decorative band**: the marbling engine runs
   as hero (`globals.css:516-523`), footer band (`globals.css:1529-1540`) and the same band again
   on 404 (`globals.css:2373-2383`); the two narrow bands are nearly identical and read as ornament
   rather than concept. `MarblingCanvas.tsx` is one idea used 3×, then dropped for 10 screens.
9. Minor: faux system counter "13 ENTRIES" (`Skills.tsx:54-56`, `globals.css:871-879`) is in the
   big-number/small-label family even though the count is real.

## OBJECTIVE BUGS (evidence: axe-core 4.x WCAG A/AA/2.2AA + playwright, before fixes)

1. **AA contrast failure — 47 nodes, axe "serious"**: `--dim #7d7a72` on `--tone-1 #0e1113` = **4.42:1**
   (needs 4.5:1). Affected: Skills section label, 3 filter buttons, filter count, 13 lexicon
   categories; Projects section label, 3 filter buttons, 3 project dates, 3 project roles, ~20 tags.
   Ratio on `--tone-2` would be 4.28:1. (`globals.css:11-24`, `verify-after.json` has the post-fix axe run.)
2. **404 contrast failure** (axe serious): `.nf-label` `#121518` on `#0a0c0e` = **1.06:1** — the
   intentionally faint 216px "404" watermark sits in the text layer even though it is aria-hidden.
3. **label-content-name-mismatch** (axe serious, 2 nodes every page): language links
   `aria-label="English"/"Français"` with visible text "EN"/"FR" — visible text not in the
   accessible name. `Navbar.tsx:159-174`.
4. **Tap targets below 24px (WCAG 2.2 AA 2.5.8)**: 65 on home @1440, 57 @390; 27 post, 26 photos,
   8 on 404. Worst: language switcher **16×10 / 15×10 / 22×10 px**, nav links 45×22, filter buttons
   24×19, footer links 313×20, footer "Top" 21×9 @390, "All writing" 350×9 @390.
5. **Invalid ARIA**: `div.nav-lang[aria-label]` has no role, so the label is ignored by AT
   (`Navbar.tsx:159`, `NotFound.tsx:36`).
6. **H1 text is "MarcChen"** (no space): `Hero.tsx:24-27` splits the name into two block spans;
   copy/paste, find-in-page and text extraction get one word.
7. **404 page links claim `aria-current="page"`** on the three locale home links while on a 404
   (`NotFound.tsx:64`) — false "current page" announcement.
8. Not fixed (structural / out of scope): static export ships `<html lang="en">` on `/fr/` and
   `/zh-cn/` (the inner wrapper carries `lang="fr"`/`"zh-CN"` and JS corrects the root — SEO/no-JS
   only). Post metadata rail renders after the article + comments at ≤960 (`blog/[slug]/page.tsx:89-151`).
   Duplicate `@media (max-width: 960px)` blocks (`globals.css:2404` and `:2500`).

Checked clean before fixes: no horizontal overflow at 1440/1024/768/390/360 on all 7 page types; no
broken images; no console errors; no heading-level skips; all internal links + hash anchors resolve;
external links have `rel=noopener`; reduced motion gives a static, painted canvas frame with no
animations (`getAnimations()` empty) and `scroll-behavior:auto`; keyboard: skip link, visible 2px
bone focus on every stop, menu traps Tab, Escape closes and returns focus, `aria-expanded` toggles.

## FIXES APPLIED — commit `9224a7c` "fix(ebru-night): adversarial review safe fixes"
Files: `src/styles/globals.css`, `src/components/layout/Navbar.tsx`,
`src/components/layout/NotFound.tsx`, `src/components/sections/Hero.tsx`. No layout change:
home docHeight identical before/after (11,771 @1440, 13,748 @390).

- **AA token fix**: `--dim #7d7a72` → `#85827a` (4.42:1 fail → **4.94:1 on tone-1**; 5.10 on ink,
  4.78 on tone-2). axe color-contrast **47 → 0** on /en/ @1440 and @390, /fr/, /404, post, photos.
- **404 watermark**: text node moved to `.nf-label::before { content: "404" }` (element was already
  `aria-hidden`); axe color-contrast **1 → 0**, rendered result identical.
- **Language switcher accessible name**: `aria-label` replaced by visible label in
  `<span aria-hidden>` + `.sr-only` full language name (`Navbar.tsx`); axe
  label-content-name-mismatch **2 → 0**. `role="group"` added to both `.nav-lang` containers.
- **404 locale links**: dropped the false `aria-current="page"`.
- **Hero h1 text**: a real space is preserved between "Marc" and "Chen" for copy/extraction
  (`h1.textContent` "MarcChen" → "Marc Chen"); visual unchanged.
- **Pointer targets (2.5.8)**: 23 small link/button selectors now get ≥24px hit areas from an
  `::after` overlay (`inset: -2px/-4px/-5px/-6px/-8px 0` per element height) with
  `position: relative`, zero visual/layout impact. Verified by computed `::after` styles
  (absolute, correct insets) and axe-clean; e.g. language "EN" 16×10 becomes a ≥26px-tall hit area.

## RECOMMENDATIONS FOR DESIGN LEAD (aesthetic; NOT applied; ranked by impact)

1. **Break the ledger formula — highest impact.** Keep at most two ledger sections (Experience,
   Latest writing) and recompose the other four so each has its own shape: Skills → open 2-column
   "lexicon" index, name + one-line gloss, no per-row category, no right meta; Projects → large
   project plates (image + name + one paragraph) instead of rows, using
   `public/images/sections/projects/visionvendor-miniature.jpg`,
   `public/images/posts/ensta-uav-challenge/hexacopter.webp`, and a bike photo from
   `public/images/posts/bike-images/`; Education → degree left / disclosure right on a shared
   spine (drop the years column); Courses → compact list grouped by issuer, no 4-column table.
   Vary the shared left edges (currently only two: gutter and ~270px).
2. **Bring real imagery into the middle of the page.** Home shows 2 photographs in ~13,000px of
   scroll. Put images in Projects (plates), About (second photo next to the portrait, e.g.
   bike/mont-saint-michel), blog index (one lead image per row), and Latest writing. The
   photographer angle is in the copy but not on the page.
3. **Cut the ALL-CAPS micro-label system by ~80%.** Delete the right-aligned section labels
   entirely (fold any needed word into the heading); convert ledger dates/categories/tags to
   sentence-case 11–12px `--ash`; keep caps for at most the nav or nothing. This is the single
   cheapest change that stops the page reading as templated; also reduces the 9px text and the
   type-scale sprawl (13.5/14/14.5/15/15.5/16/16.5px near-steps).
4. **Drop the designer-colophon register.** Remove "Marbled ink, night", "Marbled ink — a material
   that never repeats.", "The record", "This page is not in the record.", "The contact sheet is
   still drying." — replace with plain factual copy; replace "A / B / C" slash meta strings with
   real separators or nothing; keep the spaced em dash out of UI labels ("CV — English").
5. **Use the marbling once, or make it structural.** Keep it as the hero's live material (it is
   genuinely good) and remove the two nearly identical narrow bands (footer + 404), or vary them
   materially (crop/scale/ink density) so the motif reads as a system rather than 3 stamps; the
   body could carry a trace of it (e.g., a shared ink texture on the section dividers) instead of
   more hairline rules.
6. **Design mobile as its own composition.** 390px is 16 screens of stacked desktop rows. Skills as
   a 2-column index, Experience compact without the right-meta column, Courses collapsed to
   issuer groups; move post date/tags above the article at ≤960 (currently they appear after the
   comments); fill the empty hero-facts cell in the 2×2 grid.

## WHAT IS GENUINELY GOOD
1. **The hero is a real idea, not a template**: a live, low-resolution marbling bath under a huge
   Caslon name with a left-to-right scrim — specific to this person (ink/photography/data), and it
   fits 1440×900 with nav and facts visible; on 390 it still fits one clear screen.
2. **Motion and keyboard discipline**: 26/18fps cap, RAF paused off-screen and when hidden,
   `prefers-reduced-motion` paints exactly one static frame with no animations; skip link, 2px
   bone `:focus-visible` everywhere, menu focus trap + Escape + focus return, language switch
   preserves the path. This is better than most shipped portfolios.
3. **Content integrity and restraint**: real data in 3 complete locales, designed 404 and photos
   empty state, no cards/gradients/glass/emoji/fake stats, no console errors, no overflow from
   1440 to 360, links 200, AA-clean after the fixes.

## BUILD AFTER FIXES
`npx next build` → pass, **39/39 static pages**; axe WCAG A/AA/2.2AA → **0 violations** on /en/
@1440/@390, /fr/, 404, post, photos; 0 console errors; no layout shift from the fixes.
HEAD: **9224a7c** (branch unslop/site, 4 commits over main 4daf531).
