# Portfolio Website Bug Fixes & UX Improvements

## TL;DR

> **Quick Summary**: Fix 2 reported bugs (Hero button navigation + language dropdown hover) and 12 additional issues (i18n, accessibility, code quality, SEO) across the Next.js portfolio site.
> 
> **Deliverables**:
> - "Explore Projects" button scrolls to #projects section
> - Language dropdown stays open when hovering toward options
> - All hardcoded English strings internationalized (3 locales)
> - Keyboard navigation + focus-visible styles added
> - Skills tooltip accessible via keyboard
> - MagneticButton null check fixed
> - `!important` overrides replaced with proper specificity
> - Z-index stacking corrected for mobile menu
> - Magic numbers extracted to constants
> - Hero interval pauses when tab is backgrounded
> - Blog listing uses Next.js Image
> - Twitter Card + canonical URL meta tags added
> - Unused copyright i18n key cleaned up
> - Missing rolePrefix CSS class added
> 
> **Estimated Effort**: Medium (14 fixes across 12+ files)
> **Parallel Execution**: YES - 3 waves + final verification
> **Critical Path**: Task 7 (i18n) → Task 8 (focus styles) → Task 10 (tooltip) → F1-F4

---

## Context

### Original Request
Fix two reported bugs: (1) "Explore Projects" button not navigating to project section anchors, (2) language switcher dropdown disappearing when moving mouse toward it. Also identify and fix any other issues found on the website.

### Interview Summary
**Key Discussions**:
- User confirmed all 14 issues should be fixed (the 2 bugs + 12 additional)
- User chose no automated tests, only agent-executed QA scenarios
- Full scope includes i18n, accessibility, code quality, and SEO improvements

**Research Findings**:
- Framework: Next.js 16.2.1, React 19.2.4, TypeScript, framer-motion
- i18n: 3 locales (en, fr, zh-cn), YAML content files + i18n.ts translations with `t()` function
- Sections have IDs in YAML, rendered via SectionWrapper with `id={id}`
- Navbar's `scrollToSection()` is the correct pattern to follow for Hero fix
- Language dropdown gap caused by `top: calc(100% + var(--space-2))` between button and dropdown
- ~18 hardcoded English strings found (not 4 as initially estimated)
- Footer already uses `new Date().getFullYear()` — i18n `copyright` key is dead code
- Blog uses `next.config.ts` with `images: { unoptimized: true }` for static export

### Metis Review
**Identified Gaps** (addressed):
- i18n scope was underestimated (4 → ~18 strings): expanded to full list
- `!important` overrides are needed for AnimatedHeading overrides: fix with specificity, not deletion
- Skills `pointer-events: none` is intentional: add keyboard focus support, don't remove
- Blog Image conversion has low value with `unoptimized: true`: included but noted
- Twitter Card needs `generateMetadata()`, not just adding meta tags: prescribed approach

---

## Work Objectives

### Core Objective
Fix 2 user-reported bugs and 12 additional issues to improve navigation, accessibility, internationalization, code quality, and SEO across the portfolio website.

### Concrete Deliverables
- Hero.tsx: `scrollToContent()` targets `#projects` instead of first `.section`
- Navbar.tsx + CSS: Language dropdown has hover bridge to prevent accidental close
- i18n.ts: ~18 new translation keys in all 3 locales
- Hero.tsx + Projects.tsx + Navbar.tsx + Footer.tsx: All hardcoded strings use `t()`
- globals.css: Global `:focus-visible` styles added
- Navbar.tsx: Keyboard event handlers on nav buttons
- Skills.module.css: `pointer-events: auto` on `:focus-within`
- MagneticButton.tsx: Null check replaces `ref.current!`
- Footer.module.css + FeaturedPosts.module.css: `!important` replaced with specificity
- Navbar.module.css: Mobile menu z-index fixed
- Navbar.tsx + Hero.tsx: Magic numbers extracted to constants
- Hero.tsx: `visibilitychange` listener pauses/resumes interval
- blog/page.tsx: `<img>` → `<Image>`
- `[locale]/layout.tsx`: `generateMetadata()` with canonical URL + Twitter Card
- i18n.ts: Unused `copyright` key removed
- Hero.module.css: Missing `.rolePrefix` class added

### Definition of Done
- [ ] "Explore Projects" button navigates to `#projects` section anchor
- [ ] Language dropdown stays visible when hovering from button to options
- [ ] No hardcoded English strings in component files (all use `t()`)
- [ ] Tab key navigates through all interactive elements with visible focus ring
- [ ] Skills tooltip is accessible via keyboard focus
- [ ] MagneticButton doesn't crash if ref is null
- [ ] No `!important` in Footer.module.css or FeaturedPosts.module.css
- [ ] Mobile menu z-index is above all content
- [ ] Hero interval pauses when tab is backgrounded
- [ ] Blog listing uses `<Image>` component
- [ ] Page `<head>` includes canonical URL and Twitter Card meta

### Must Have
- Bug 1 fix: Hero "Explore Projects" scrolls to `#projects`
- Bug 2 fix: Language dropdown stays open during mouse transition
- All ~18 hardcoded strings internationalized with `t()`
- Focus-visible styles on all interactive elements
- Keyboard navigation on navbar
- Null check in MagneticButton

### Must NOT Have (Guardrails)
- Do NOT remove `pointer-events: none` from Skills tooltip — add `:focus-within` support instead
- Do NOT simply delete `!important` — replace with proper specificity
- Do NOT convert markdown-generated images in `simpleMarkdownToHtml` — out of scope
- Do NOT i18n the Cal.com embed string in `layout.tsx` — requires fundamentally different approach
- Do NOT refactor adjacent code unrelated to the specific fix
- Do NOT consolidate `data/` vs `src/data/` directories
- Do NOT change the z-index variable scale in `variables.css` — only fix mobile menu stacking
- Do NOT extract decorative blob sizes to constants — only layout-affecting values
- Do NOT add automated unit tests — user confirmed QA via agent-executed scenarios only

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (package.json with eslint)
- **Automated tests**: None (user chose no automated tests)
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, click, assert DOM, screenshot
- **CSS/Styling**: Use Playwright — Hover, focus, assert computed styles
- **i18n**: Use Bash (grep) — Verify translation keys exist in all locales
- **Code Quality**: Use Bash (eslint, tsc) — Lint and type-check

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — quick bug fixes, no dependencies):
├── Task 1: Fix Hero scroll target [quick]
├── Task 2: Fix language dropdown hover gap [quick]
├── Task 3: Fix MagneticButton null assertion [quick]
├── Task 4: Fix Hero interval tab backgrounding [quick]
├── Task 5: Extract magic numbers to constants [quick]
└── Task 6: Fix mobile menu z-index stacking [quick]

Wave 2 (After Wave 1 — accessibility + i18n, MAX PARALLEL):
├── Task 7: Internationalize all hardcoded strings [deep]
├── Task 8: Add global focus-visible styles [quick]
├── Task 9: Add keyboard navigation to Navbar [quick]
├── Task 10: Make Skills tooltip keyboard-accessible [quick]
└── Task 11: Fix !important overrides with proper specificity [unspecified-high]

Wave 3 (After Wave 2 — SEO + cleanup):
├── Task 12: Add missing rolePrefix CSS class to Hero [quick]
├── Task 13: Remove unused copyright i18n key [quick]
├── Task 14: Convert blog listing images to Next Image [unspecified-low]
└── Task 15: Add Twitter Card + canonical URL meta tags [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 7 (i18n) → Task 8 (focus) → Task 10 (tooltip) → Wave 3 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 6 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1    | -         | -      | 1    |
| 2    | -         | -      | 1    |
| 3    | -         | -      | 1    |
| 4    | -         | -      | 1    |
| 5    | -         | -      | 1    |
| 6    | -         | -      | 1    |
| 7    | -         | -      | 2    |
| 8    | -         | -      | 2    |
| 9    | -         | -      | 2    |
| 10   | -         | -      | 2    |
| 11   | -         | -      | 2    |
| 12   | 7         | -      | 3    |
| 13   | 7         | -      | 3    |
| 14   | -         | -      | 3    |
| 15   | -         | -      | 3    |

### Agent Dispatch Summary

- **Wave 1**: 6 tasks — T1-T5 → `quick`, T6 → `quick`
- **Wave 2**: 5 tasks — T7 → `deep`, T8-T10 → `quick`, T11 → `unspecified-high`
- **Wave 3**: 4 tasks — T12-T13 → `quick`, T14 → `unspecified-low`, T15 → `unspecified-high`
- **FINAL**: 4 tasks — F1 → `oracle`, F2-F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Fix Hero "Explore Projects" scroll target

  **What to do**:
  - In `src/components/sections/Hero.tsx`, change `scrollToContent()` function (line 29-34) to target the `#projects` section ID instead of the first `.section` element
  - Change `document.querySelector(".section")` to `document.getElementById("projects")`
  - Also update the scroll indicator button (line 117) which reuses `scrollToContent` — it should also scroll to projects
  - Ensure the function handles the case where the element doesn't exist (fallback to first section)

  **Must NOT do**:
  - Don't change Navbar's `scrollToSection` (already correct)
  - Don't add any new dependencies
  - Don't change the smooth scroll behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-6)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/components/layout/Navbar.tsx:71-81` — `scrollToSection()` shows the correct pattern for section scrolling with `scrollIntoView({ behavior: 'smooth' })`
  - `src/components/ui/SectionWrapper.tsx:27` — Confirms sections get their `id` from YAML data via `id={id}`

  **API/Type References**:
  - `src/data/en/sections/projects.yaml:4` — Projects section has `id: projects`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Explore Projects button scrolls to projects section
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Wait for Hero section to render (selector: `.heroActions`)
      3. Click the "Explore Projects" button (selector: `.heroActions button`)
      4. Wait 1 second for smooth scroll to complete
      5. Get the current scroll position and the `#projects` section position
      6. Assert: viewport is within 100px of the `#projects` section top
    Expected Result: Page scrolls to the Projects section, not the About section
    Failure Indicators: Viewport is at the About section (first section) instead
    Evidence: .sisyphus/evidence/task-1-scroll-to-projects.png

  Scenario: Scroll indicator also navigates to projects
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Click the scroll indicator at bottom of hero (selector: `.scrollIndicator`)
      3. Wait 1 second for smooth scroll
      4. Assert: viewport is near `#projects` section
    Expected Result: Both buttons scroll to the same destination
    Failure Indicators: Scroll indicator goes to a different section
    Evidence: .sisyphus/evidence/task-1-scroll-indicator.png
  ```

  **Commit**: YES
  - Message: `fix(hero): make Explore Projects button scroll to #projects section`
  - Files: `src/components/sections/Hero.tsx`

- [ ] 2. Fix language dropdown hover gap

  **What to do**:
  - In `src/styles/components/Navbar.module.css`, add an invisible hover bridge between the Globe button and the dropdown
  - Add `::after` pseudo-element on `.iconBtn` (inside `.langContainer`) that fills the gap between button and dropdown with `position: absolute; content: ''; bottom: calc(-1 * var(--space-2)); left: 0; right: 0; height: var(--space-2)`
  - Alternatively, add it on `.langContainer::after` positioned to cover the gap area
  - Test that moving mouse from Globe icon down to dropdown menu items keeps the dropdown visible

  **Must NOT do**:
  - Don't change the animation or dropdown positioning
  - Don't reduce the visual gap (the `top` of the dropdown should stay aesthetically the same)
  - Don't add JavaScript timers or delays — pure CSS solution only

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-6)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/styles/components/Navbar.module.css:145-162` — `.langContainer` and `.langDropdown` positioning, shows the gap is `top: calc(100% + var(--space-2))`
  - `src/components/layout/Navbar.tsx:126-158` — The hover state management (`onMouseEnter`/`onMouseLeave`) shows the container div wraps both button and dropdown

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Language dropdown stays visible when hovering toward options
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Hover over the Globe icon button (selector: `.iconBtn` with aria-label "Switch language")
      3. Wait for dropdown to appear (selector: `.langDropdown`)
      4. Move mouse from the Globe button down into the dropdown menu
      5. Assert: dropdown remains visible during the entire transition
      6. Assert: all 3 language options are visible (English, Français, 简体中文)
    Expected Result: Dropdown stays open when moving from button to options
    Failure Indicators: Dropdown closes when mouse leaves the button area
    Evidence: .sisyphus/evidence/task-2-dropdown-hover.png

  Scenario: Language dropdown still closes when mouse leaves entirely
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Hover over Globe icon to open dropdown
      3. Move mouse completely away from the language container (not toward dropdown)
      4. Assert: dropdown closes within 300ms
    Expected Result: Dropdown closes properly when mouse leaves
    Failure Indicators: Dropdown stays open indefinitely
    Evidence: .sisyphus/evidence/task-2-dropdown-close.png
  ```

  **Commit**: YES
  - Message: `fix(nav): prevent language dropdown from closing on hover`
  - Files: `src/styles/components/Navbar.module.css`

- [ ] 3. Fix MagneticButton null assertion

  **What to do**:
  - In `src/components/ui/MagneticButton.tsx`, replace `ref.current!.getBoundingClientRect()` (line 34) with a null-safe version
  - Add early return if ref is null: `const rect = ref.current?.getBoundingClientRect(); if (!rect) return;`
  - Then use `rect` instead of the destructured values from the non-null assertion
  - Keep the existing magnetic effect behavior unchanged

  **Must NOT do**:
  - Don't change the MagneticButton API or props
  - Don't add error boundaries or try/catch blocks
  - Don't change the magnetic animation parameters

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-2, 4-6)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/components/ui/MagneticButton.tsx:29-38` — The `handleMouse` function with the `ref.current!` assertion that needs fixing

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: MagneticButton doesn't crash when ref is null
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Scroll to Projects section
      3. Hover over any MagneticButton (Live Preview or Source Code)
      4. Move mouse around within the button area
      5. Assert: button follows mouse with magnetic effect (slight offset from center)
      6. Assert: no console errors
    Expected Result: Magnetic effect works normally, no crashes
    Failure Indicators: TypeError about null ref, button doesn't move with mouse
    Evidence: .sisyphus/evidence/task-3-magnetic-button.png

  Scenario: MagneticButton handles rapid hover in/out
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Rapidly move mouse in and out of a MagneticButton 5 times
      3. Assert: no errors in console, button resets to center each time
    Expected Result: Smooth magnetic effect with no errors
    Failure Indicators: TypeError, button stuck in offset position
    Evidence: .sisyphus/evidence/task-3-rapid-hover.png
  ```

  **Commit**: YES
  - Message: `fix(ui): add null check in MagneticButton ref access`
  - Files: `src/components/ui/MagneticButton.tsx`

- [ ] 4. Fix Hero role cycling interval on tab backgrounding

  **What to do**:
  - In `src/components/sections/Hero.tsx`, add a `visibilitychange` event listener
  - When the document becomes hidden (tab backgrounded), clear the interval
  - When the document becomes visible (tab foregrounded), restart the interval
  - Use `useEffect` with document.visibilityState to manage the interval lifecycle
  - Keep the existing 4000ms interval for role cycling

  **Must NOT do**:
  - Don't change the cycling animation or timing
  - Don't add new state variables for visibility — just manage the interval
  - Don't change the role data or cycling logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-6)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/components/sections/Hero.tsx:21-27` — Current `useEffect` with `setInterval` that doesn't handle visibility changes

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Role cycling pauses when tab is hidden
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Note the current role text (e.g., "Data Engineer")
      3. Wait for the role to cycle to the next one
      4. Switch to a different browser tab for 10+ seconds
      5. Switch back to the portfolio tab
      6. Assert: role is showing a valid line from summaryLines (not stuck on wrong state)
      7. Assert: cycling resumes normally after 4 seconds
    Expected Result: Role cycling pauses when hidden, resumes when visible
    Failure Indicators: Role shows wrong state, looks "stale" after returning
    Evidence: .sisyphus/evidence/task-4-visibility.png
  ```

  **Commit**: YES
  - Message: `fix(hero): pause role cycling when tab is backgrounded`
  - Files: `src/components/sections/Hero.tsx`

- [ ] 5. Extract magic numbers to named constants

  **What to do**:
  - In `src/components/layout/Navbar.tsx`, extract magic numbers to named constants at the top of the component:
    - `80` (scroll threshold) → `SCROLL_THRESHOLD = 80`
    - `200` (section detection pixel buffer) → `SECTION_DETECT_BUFFER = 200`
  - In `src/components/sections/Accomplishments.tsx`, extract:
    - `400` (scroll amount) → `SCROLL_AMOUNT = 400`
  - In `src/components/layout/CursorGlow.tsx`, extract:
    - `400` (width/height) → `GLOW_SIZE = 400`
  - Do NOT extract decorative CSS values (blob sizes, margins) — only JavaScript runtime values

  **Must NOT do**:
  - Don't extract CSS values that are already in CSS modules
  - Don't extract decorative dimensions (Hero blob sizes, etc.)
  - Don't change any behavior — just name the values

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/components/layout/Navbar.tsx:50` — `setIsScrolled(window.scrollY > 80)` — scroll threshold
  - `src/components/layout/Navbar.tsx:58` — `rect.top <= 200` — section detection buffer
  - `src/components/sections/Accomplishments.tsx:44` — scroll amount constant
  - `src/components/layout/CursorGlow.tsx:62-63` — glow size constants

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: No magic numbers remain in Navbar
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run: grep -n 'scrollY > 80' src/components/layout/Navbar.tsx
      2. Assert: no matches (should use constant name instead)
      3. Run: grep -n '<= 200' src/components/layout/Navbar.tsx
      4. Assert: no matches
      5. Run: grep -n 'SCROLL_THRESHOLD\|SECTION_DETECT_BUFFER' src/components/layout/Navbar.tsx
      6. Assert: both constants found
    Expected Result: All numeric thresholds replaced with named constants
    Failure Indicators: Any raw magic numbers still in the code
    Evidence: .sisyphus/evidence/task-5-magic-numbers.txt

  Scenario: Build succeeds after refactoring
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run: npx tsc --noEmit
      2. Assert: exit code 0, no type errors
    Expected Result: Clean TypeScript compilation
    Failure Indicators: Type errors or build failures
    Evidence: .sisyphus/evidence/task-5-build.txt
  ```

  **Commit**: YES
  - Message: `refactor(nav): extract magic numbers to named constants`
  - Files: `src/components/layout/Navbar.tsx`, `src/components/sections/Accomplishments.tsx`, `src/components/layout/CursorGlow.tsx`

- [ ] 6. Fix mobile menu z-index stacking

  **What to do**:
  - In `src/styles/components/Navbar.module.css`, change the mobile menu z-index from `calc(var(--z-sticky) - 1)` to `calc(var(--z-sticky) + 1)` so it sits above the navbar
  - Verify the stacking order: mobile menu > navbar > content
  - Test that mobile menu clicks still work properly after the z-index change

  **Must NOT do**:
  - Don't refactor the entire z-index scale in `variables.css`
  - Don't change navbar z-index or content z-index values
  - Don't change the glassmorphism or backdrop-filter on the mobile menu

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/styles/components/Navbar.module.css:206` — Mobile menu `.mobileMenu` has `z-index: calc(var(--z-sticky) - 1)` which puts it BELOW the navbar (z-sticky = 1020, so mobile menu = 1019)
  - `src/styles/globals.css` or `src/styles/variables.css` — Check `--z-sticky` and `--z-default` values

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Mobile menu appears above navbar
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000, viewport set to mobile (< 1024px)
    Steps:
      1. Navigate to `http://localhost:3000/en/` with mobile viewport
      2. Click the hamburger menu button
      3. Assert: mobile menu overlay covers the navbar
      4. Click a nav link in the mobile menu
      5. Assert: mobile menu closes and scrolls to section
    Expected Result: Mobile menu appears above navbar, links are clickable
    Failure Indicators: Navbar overlaps mobile menu, links unclickable
    Evidence: .sisyphus/evidence/task-6-mobile-menu.png
  ```

  **Commit**: YES
  - Message: `fix(nav): correct mobile menu z-index stacking`
  - Files: `src/styles/components/Navbar.module.css`

- [ ] 7. Internationalize all hardcoded strings

  **What to do**:
  - Find ALL hardcoded English strings in component files (approximately 18 strings, not just 4)
  - Add translation keys to `src/lib/i18n.ts` in ALL 3 locale objects (en, fr, zh-cn)
  - Replace hardcoded strings in components with `t(locale, "key")` calls
  - Complete list of strings to internationalize:
    1. Hero: "Explore Projects" (line 109)
    2. Hero: "Specialize in " (line 81)
    3. Hero: "Bridging the gap between raw data and actionable intelligence. Turning complex models into scalable systems." (line 100)
    4. Projects: "05. Work" (line 36)
    5. Projects: "Featured Project" (line 92)
    6. Projects: "Live Preview" (line 117)
    7. Projects: "Source Code" (line 122)
    8. Projects: "Role" (line 100)
    9. Projects: "No projects found for the selected filter." (line 211)
    10. Navbar: "Blog" (line 120, 211)
    11. Footer: "Let's build something great" (line 36)
    12. Footer: "Open for new opportunities, consulting, and collaboration." (line 37)
    13. Footer: "Book a call" (line 60) — note: `t(locale, "book_a_call")` already exists in i18n.ts but isn't used here
    14. Navbar: "Switch language" aria-label (line 131)
    15. Navbar: "Toggle theme" aria-label (line 163)
    16. Footer: "Copy Email" aria-label (line 47) — check exact text
    17. Blog: "No posts yet." (check slug page)
    18. Blog: "Comments" (check slug page)
  - For each string: add a key to all 3 locale objects, then replace the hardcoded string in the component with `t(locale, "key")`
  - Note: "Blog" in Navbar is a special case since it's a link label; ensure it's translatable

  **Must NOT do**:
  - Don't i18n the Cal.com embed string ("Book a call" in layout.tsx Script tag) — too complex for this scope
  - Don't change the YAML data files — those are already locale-specific
  - Don't modify the `t()` function signature
  - Don't touch strings inside YAML content (already localized)
  - Don't i18n dynamic content like author.name or section names (comes from YAML)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - **Reason**: Large scope touching many files with translations in 3 languages

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-11)
  - **Blocks**: Tasks 12, 13 (need i18n system stable)
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/lib/i18n.ts:106-108` — `t(locale, key)` function pattern to follow
  - `src/lib/i18n.ts:22-103` — Existing translations object with 3 locales, shows the key/value pattern
  - `src/components/sections/Projects.tsx` — Contains multiple hardcoded strings
  - `src/components/sections/Hero.tsx` — Contains "Explore Projects", "Specialize in", hardcoded bio
  - `src/components/layout/Footer.tsx` — Contains hardcoded CTA text, "Book a call"
  - `src/components/layout/Navbar.tsx` — Contains "Blog", aria-labels
  - NOTE: Footer.tsx line 60 already has `t(locale, "book_a_call")` available but may not be using it

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: All new translation keys exist in all 3 locales
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run: grep -c 'explore_projects\|specialize_in\|hero_bio\|section_work_label\|featured_project\|live_preview\|source_code\|role_label\|no_projects\|blog_label\|cta_heading\|cta_subheading\|copy_email' src/lib/i18n.ts
      2. Assert: each key appears at least 3 times (once per locale)
      3. Run: grep 'explore_projects' src/lib/i18n.ts
      4. Assert: key exists in en, fr, and zh-cn sections
    Expected Result: All new keys have translations in all 3 locales
    Failure Indicators: Missing keys in any locale
    Evidence: .sisyphus/evidence/task-7-i18n-keys.txt

  Scenario: French locale shows French strings
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/fr/`
      2. Assert: Hero button shows French text (not "Explore Projects")
      3. Assert: Projects section label shows French text
      4. Assert: No visible English strings on the page
    Expected Result: All UI strings are in French
    Failure Indicators: Any English strings visible on French page
    Evidence: .sisyphus/evidence/task-7-fr-locale.png

  Scenario: Chinese locale shows Chinese strings
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/zh-cn/`
      2. Assert: Hero button shows Chinese text
      3. Assert: Projects section label shows Chinese text
      4. Assert: No visible English strings on the page
    Expected Result: All UI strings are in Chinese
    Failure Indicators: Any English strings visible on Chinese page
    Evidence: .sisyphus/evidence/task-7-zh-locale.png
  ```

  **Commit**: YES
  - Message: `feat(i18n): internationalize all hardcoded UI strings`
  - Files: `src/lib/i18n.ts`, `src/components/sections/Hero.tsx`, `src/components/sections/Projects.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`

- [ ] 8. Add global focus-visible styles

  **What to do**:
  - In `src/styles/globals.css` (or the global stylesheet), add `:focus-visible` outline styles for all interactive elements
  - Add a base rule: `*:focus-visible { outline: 2px solid hsl(var(--accent)); outline-offset: 2px; border-radius: 2px; }`
  - Add `*:focus { outline: none; }` to remove default outline (replaced by focus-visible)
  - Ensure button focus and link focus both show the accent-colored ring
  - Test that tabbing through navbar links, language switcher, and project buttons shows visible focus rings

  **Must NOT do**:
  - Don't add focus rings per-component — use global styles only
  - Don't change `:focus` styles on form inputs (those should keep their defaults)
  - Don't override existing `:focus-visible` styles if any exist

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9-11)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/styles/globals.css` — Global stylesheet where focus styles should be added
  - `src/styles/variables.css` — CSS custom properties including `--accent` color token

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Tab navigation shows visible focus rings
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Press Tab key 5 times to navigate through navbar elements
      3. After each Tab press, assert: focused element has a visible outline (computed outline-style !== 'none')
      4. Navigate to Projects section
      5. Tab through project buttons
      6. Assert: each focused button shows focus ring
    Expected Result: All interactive elements show accent-colored focus ring on Tab
    Failure Indicators: No visible focus indicator, or default browser outline
    Evidence: .sisyphus/evidence/task-8-focus-visible.png
  ```

  **Commit**: YES
  - Message: `a11y(style): add global focus-visible styles`
  - Files: `src/styles/globals.css`

- [ ] 9. Add keyboard navigation to Navbar

  **What to do**:
  - In `src/components/layout/Navbar.tsx`, verify that `<button>` elements for section navigation already handle Enter/Space natively (they should, since they're `<button>` elements)
  - If any nav items are `<a>` or `<div>` elements that need keyboard handlers, add `onKeyDown` handlers for Enter/Space
  - Add `aria-current="true"` or `aria-current="page"` to the active section button for screen readers
  - Test that pressing Enter or Space on a focused nav button scrolls to the section

  **Must NOT do**:
  - Don't change `<button>` to `<a>` or vice versa
  - Don't add complex keyboard navigation (arrow keys, etc.) — just Enter/Space activation
  - Don't modify the mobile menu keyboard handling (it uses native buttons already)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-8, 10-11)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/components/layout/Navbar.tsx:100-115` — Desktop nav buttons that call `scrollToSection()` on click
  - `src/components/layout/Navbar.tsx:197-205` — Mobile nav buttons

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Keyboard activation of nav buttons
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Press Tab until a navbar section button is focused
      3. Press Enter
      4. Assert: page scrolls to the corresponding section
      5. Press Tab to the next nav button
      6. Press Space
      7. Assert: page scrolls to the corresponding section
    Expected Result: Enter and Space both activate the section scroll
    Failure Indicators: Section doesn't scroll, page doesn't respond
    Evidence: .sisyphus/evidence/task-9-keyboard-nav.png
  ```

  **Commit**: YES
  - Message: `a11y(nav): add keyboard navigation support`
  - Files: `src/components/layout/Navbar.tsx`

- [ ] 10. Make Skills tooltip keyboard-accessible

  **What to do**:
  - In `src/styles/components/Skills.module.css`, add a rule that makes the tooltip interactive on keyboard focus:
    ```css
    .skillPill:focus-within .tooltip,
    .skillPill:focus .tooltip {
      pointer-events: auto;
      opacity: 1;
      visibility: visible;
      /* Keep existing transform styles */
    }
    ```
  - Ensure `.skillPill` elements are focusable (they may need `tabindex="0"` or be `<a>`/`<button>` elements)
  - Check if the skill pills in `src/components/sections/Skills.tsx` are focusable elements — if they're `<div>` or `<span>`, add `tabIndex={0}` and `role="button"`

  **Must NOT do**:
  - Don't remove `pointer-events: none` from the default (hover) state — it prevents flickering
  - Don't change the tooltip animation or positioning
  - Don't change the visual hover behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-9, 11)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/styles/components/Skills.module.css` — Contains `.tooltip` styles with `pointer-events: none` (check around line 145-155)
  - `src/components/sections/Skills.tsx` — Contains skill pill elements that need to be focusable

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Skills tooltip visible on keyboard focus
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Tab to the Skills section
      3. Continue tabbing until a skill pill is focused
      4. Assert: tooltip becomes visible (opacity > 0, visibility: visible)
      5. Press Tab again to move to next skill
      6. Assert: previous tooltip hides, new tooltip shows
    Expected Result: Tooltips appear on keyboard focus, are accessible
    Failure Indicators: Tooltips never appear on Tab focus
    Evidence: .sisyphus/evidence/task-10-tooltip-keyboard.png
  ```

  **Commit**: YES
  - Message: `a11y(skills): make tooltip keyboard-accessible`
  - Files: `src/styles/components/Skills.module.css`, `src/components/sections/Skills.tsx`

- [ ] 11. Fix !important overrides with proper specificity

  **What to do**:
  - In `src/styles/components/Footer.module.css`, find all `!important` declarations and replace with higher-specificity selectors
  - In `src/styles/components/FeaturedPosts.module.css`, find all `!important` declarations and replace with higher-specificity selectors
  - Common approach: use double class selectors (`.class.class`), `:where()` pseudo-class, or increase nesting depth
  - For `Footer.module.css`: the `!important` overrides are on `.ctaHeadingOverride` which overrides AnimatedHeading's internal styles — use a more specific selector path like `.ctaCard .ctaHeadingOverride` or increase the selector weight
  - For `FeaturedPosts.module.css`: check what the `!important` is overriding and use proper specificity
  - **Verify after each removal**: test that the layout still looks correct (no visual regression)

  **Must NOT do**:
  - Don't just delete `!important` without a replacement — this WILL break the layout
  - Don't change AnimatedHeading's internal styles (those are in a different component)
  - Don't use `!important` somewhere else as a "fix"

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Reason**: Needs careful CSS specificity understanding

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-10)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/styles/components/Footer.module.css:52` — `margin-bottom: var(--space-8) !important` on `.ctaHeadingOverride`
  - `src/styles/components/FeaturedPosts.module.css:16` — `margin-bottom: 0 !important`
  - Use `lsp_find_references` on AnimatedHeading to understand what internal styles are being overridden
  - `src/components/ui/AnimatedHeading.tsx` — The component whose styles are being overridden

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: No !important in Footer or FeaturedPosts CSS
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run: grep '!important' src/styles/components/Footer.module.css
      2. Assert: no matches
      3. Run: grep '!important' src/styles/components/FeaturedPosts.module.css
      4. Assert: no matches
    Expected Result: Zero !important declarations in these files
    Failure Indicators: Any !important still present
    Evidence: .sisyphus/evidence/task-11-no-important.txt

  Scenario: Footer CTA card still looks correct
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Scroll to footer
      3. Assert: CTA heading has correct margins (no extra bottom margin)
      4. Assert: CTA card layout is not broken
    Expected Result: Visual appearance unchanged after removing !important
    Failure Indicators: Heading margins broken, card layout broken
    Evidence: .sisyphus/evidence/task-11-footer-cta.png
  ```

  **Commit**: YES
  - Message: `refactor(style): replace !important with proper specificity`
  - Files: `src/styles/components/Footer.module.css`, `src/styles/components/FeaturedPosts.module.css`

- [ ] 12. Add missing rolePrefix CSS class to Hero

  **What to do**:
  - In `src/styles/components/Hero.module.css`, add a `.rolePrefix` class with appropriate styling
  - The class should style the "Specialize in " prefix text — likely a subtle, muted style that complements `roleText`
  - Check what `styles.rolePrefix` is used for in Hero.tsx (line 81) and add matching CSS
  - Style should include: `color: var(--text-muted)` or similar, `font-size` matching the role text context

  **Must NOT do**:
  - Don't change the Hero component JSX
  - Don't over-style the prefix — keep it subtle (it's a prefix label, not a heading)
  - Don't change other Hero styles

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13-15)
  - **Blocks**: None
  - **Blocked By**: Task 7 (i18n may change the rolePrefix text)

  **References**:
  **Pattern References**:
  - `src/components/sections/Hero.tsx:81` — `<span className={styles.rolePrefix}>Specialize in </span>` — currently unstyled because `.rolePrefix` doesn't exist in CSS
  - `src/styles/components/Hero.module.css` — Where the new `.rolePrefix` class should be added
  - Look at `.roleText` and `.roleContainer` styles for context on how to style the prefix

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Role prefix has visible styling
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to `http://localhost:3000/en/`
      2. Find the role prefix text (selector: `.rolePrefix` or similar)
      3. Assert: element has a computed style (not default/no style)
      4. Assert: text is visible with appropriate color and size
    Expected Result: "Specialize in " prefix has intentional styling
    Failure Indicators: Prefix has no styling, looks like plain inline text with wrong sizing
    Evidence: .sisyphus/evidence/task-12-role-prefix.png
  ```

  **Commit**: YES
  - Message: `fix(hero): add missing rolePrefix CSS class`
  - Files: `src/styles/components/Hero.module.css`

- [ ] 13. Remove unused copyright i18n key

  **What to do**:
  - In `src/lib/i18n.ts`, remove the `copyright` key from all 3 locale objects:
    - `en.copyright` (line ~45): `"© 2024 All Rights Reserved."`
    - `fr.copyright` (line ~72): `"© 2024 Tous Droits Réservés."`
    - `zh-cn.copyright` (line ~99): `"© 2024 版权所有。"`
  - Verify that no component uses `t(locale, "copyright")` — search for it
  - The Footer.tsx already uses `new Date().getFullYear()` directly, so this key is dead code

  **Must NOT do**:
  - Don't change Footer.tsx's year logic — it's already dynamic
  - Don't remove any other i18n keys that might be in use
  - Don't change the i18n function itself

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12, 14-15)
  - **Blocks**: None
  - **Blocked By**: Task 7 (i18n changes should be stable first)

  **References**:
  **Pattern References**:
  - `src/lib/i18n.ts:45,72,99` — The `copyright` key in each locale
  - `src/components/layout/Footer.tsx` — Uses `new Date().getFullYear()` directly, not the i18n key

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Copyright key removed, footer still works
    Tool: Bash + Playwright
    Preconditions: Changes applied
    Steps:
      1. Run: grep 'copyright' src/lib/i18n.ts
      2. Assert: no 'copyright' key in any locale object
      3. Navigate to `http://localhost:3000/en/`
      4. Scroll to footer
      5. Assert: footer text includes current year (2026)
      6. Navigate to `http://localhost:3000/fr/`
      7. Assert: footer text includes current year and French text
    Expected Result: Footer renders year dynamically, no dead i18n key
    Failure Indicators: Footer shows hardcoded "2024" or console error about missing key
    Evidence: .sisyphus/evidence/task-13-copyright.png
  ```

  **Commit**: YES
  - Message: `chore(i18n): remove unused copyright translation key`
  - Files: `src/lib/i18n.ts`

- [ ] 14. Convert blog listing images to Next Image

  **What to do**:
  - In `src/app/[locale]/blog/page.tsx`, find the `<img>` tag used for blog post thumbnails
  - Replace it with Next.js `<Image>` component:
    ```tsx
    import Image from "next/image";
    // Replace <img src={...} alt={...} /> with:
    <Image src={...} alt={...} width={...} height={...} />
    ```
  - Add appropriate `width` and `height` props (or `fill` with CSS sizing)
  - Note: Since `next.config.ts` has `images: { unoptimized: true }` for static export, this provides API consistency and `alt` enforcement, not performance optimization
  - Do NOT touch the `simpleMarkdownToHtml` function in the blog slug page — markdown-generated images are out of scope

  **Must NOT do**:
  - Don't touch `simpleMarkdownToHtml` in the blog slug page
  - Don't modify `next.config.ts` image settings
  - Don't change image optimization config
  - Don't add `loader` props — static export with `unoptimized: true` is the correct setup

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12-13, 15)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/app/[locale]/blog/page.tsx` — Blog listing page with `<img>` tag(s) to convert
  - `next.config.ts` — Has `images: { unoptimized: true }` for static export
  - `src/components/sections/Projects.tsx` — Shows how `<Image>` is used elsewhere in the project (with `width`, `height`, `alt` props)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Blog listing uses Next Image component
    Tool: Bash + Playwright
    Preconditions: Changes applied, dev server running
    Steps:
      1. Run: grep '<img' src/app/\[locale\]/blog/page.tsx
      2. Assert: no matches (all replaced with <Image>)
      3. Run: grep "from 'next/image'" src/app/\[locale\]/blog/page.tsx
      4. Assert: Image import found
      5. Navigate to `http://localhost:3000/en/blog/`
      6. Assert: blog post thumbnails render correctly
    Expected Result: Blog thumbnails render, no broken images
    Failure Indicators: Missing images, layout shift, import errors
    Evidence: .sisyphus/evidence/task-14-blog-image.png
  ```

  **Commit**: YES
  - Message: `refactor(blog): convert img to Next Image component`
  - Files: `src/app/[locale]/blog/page.tsx`

- [ ] 15. Add Twitter Card and canonical URL meta tags

  **What to do**:
  - Create or update `src/app/[locale]/layout.tsx` with a `generateMetadata()` function that produces:
    - `<link rel="canonical">` with locale-aware URL
    - `<meta name="twitter:card" content="summary_large_image">`
    - `<meta name="twitter:title" content={siteName}>`
    - `<meta name="twitter:description" content={siteDescription}>`
    - `<meta name="twitter:image" content={ogImage}>`
    - Ensure OpenGraph tags are also locale-aware
  - If `[locale]/layout.tsx` doesn't exist, it may need to be created
  - Use the existing `getSiteConfig()` from `src/lib/data.ts` for site name and description
  - Ensure canonical URLs include the locale prefix: `https://marcchen.github.io/{locale}/`

  **Must NOT do**:
  - Don't modify the root `layout.tsx` metadata export — create locale-specific metadata
  - Don't add image optimization for Twitter images
  - Don't change the existing site URL structure

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12-14)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `src/app/layout.tsx` — Root layout with existing metadata (check what's already defined)
  - `src/app/[locale]/layout.tsx` — Locale-specific layout (check if it exists and what it has)
  - `src/lib/data.ts:33-35` — `getSiteConfig()` function for site name/description
  - `src/lib/i18n.ts` — Locale types for building locale-aware URLs
  - `next.config.ts` — Check site URL configuration

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Canonical URL and Twitter Card meta tags present
    Tool: Bash
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Run: curl -s http://localhost:3000/en/ | grep -i 'canonical'
      2. Assert: <link rel="canonical"> tag found with correct URL
      3. Run: curl -s http://localhost:3000/en/ | grep -i 'twitter:card'
      4. Assert: <meta name="twitter:card"> tag found
      5. Run: curl -s http://localhost:3000/en/ | grep -i 'twitter:title'
      6. Assert: <meta name="twitter:title"> tag found
    Expected Result: All meta tags present in rendered HTML
    Failure Indicators: Missing canonical URL, missing Twitter Card tags
    Evidence: .sisyphus/evidence/task-15-meta-tags.txt

  Scenario: French locale has different canonical URL
    Tool: Bash
    Preconditions: Dev server running
    Steps:
      1. Run: curl -s http://localhost:3000/fr/ | grep -i 'canonical'
      2. Assert: canonical URL includes /fr/ prefix
      3. Run: curl -s http://localhost:3000/zh-cn/ | grep -i 'canonical'
      4. Assert: canonical URL includes /zh-cn/ prefix
    Expected Result: Each locale has its own canonical URL
    Failure Indicators: All locales point to same URL
    Evidence: .sisyphus/evidence/task-15-canonical-locales.txt
  ```

  **Commit**: YES
  - Message: `feat(seo): add Twitter Card and canonical URL meta tags`
  - Files: `src/app/[locale]/layout.tsx`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npx eslint src/`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if needed)
  Start from clean state (`npm run dev`). Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (scroll navigation + keyboard nav + i18n working together). Test edge cases: mobile viewport, rapid actions, tab backgrounding. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT Have" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `fix(hero): make Explore Projects button scroll to #projects section` — Hero.tsx
- **Wave 1**: `fix(nav): prevent language dropdown from closing on hover` — Navbar.tsx, Navbar.module.css
- **Wave 1**: `fix(ui): add null check in MagneticButton ref access` — MagneticButton.tsx
- **Wave 1**: `fix(hero): pause role cycling when tab is backgrounded` — Hero.tsx
- **Wave 1**: `refactor(nav): extract magic numbers to named constants` — Navbar.tsx
- **Wave 1**: `fix(nav): correct mobile menu z-index stacking` — Navbar.module.css
- **Wave 2**: `feat(i18n): internationalize all hardcoded UI strings` — i18n.ts, Hero.tsx, Projects.tsx, Navbar.tsx, Footer.tsx
- **Wave 2**: `a11y(style): add global focus-visible styles` — globals.css
- **Wave 2**: `a11y(nav): add keyboard navigation support` — Navbar.tsx
- **Wave 2**: `a11y(skills): make tooltip keyboard-accessible` — Skills.module.css, Skills.tsx
- **Wave 2**: `refactor(style): replace !important with proper specificity` — Footer.module.css, FeaturedPosts.module.css
- **Wave 3**: `fix(hero): add missing rolePrefix CSS class` — Hero.module.css
- **Wave 3`: `chore(i18n): remove unused copyright translation key` — i18n.ts
- **Wave 3**: `refactor(blog): convert img to Next Image component` — blog/page.tsx
- **Wave 3**: `feat(seo): add Twitter Card and canonical URL meta tags` — layout.tsx
- **Final**: `chore: final cleanup after bug fixes and improvements`

---

## Success Criteria

### Verification Commands
```bash
npm run build          # Expected: Successful build, no errors
npx tsc --noEmit       # Expected: No type errors
npx eslint src/         # Expected: No lint errors (or pre-existing count)
```

### Final Checklist
- [ ] All "Must Have" items present and working
- [ ] All "Must NOT Have" items absent from codebase
- [ ] No `ref.current!` non-null assertions remaining
- [ ] No hardcoded English strings in component JSX (all use `t()`)
- [ ] Focus-visible styles appear on tab navigation
- [ ] Language dropdown stays open during hover transition
- [ ] Explore Projects button scrolls to #projects