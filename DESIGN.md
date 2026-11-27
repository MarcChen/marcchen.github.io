# Design

Marc Chen's portfolio. Tokens live in `src/styles/variables.css`; global primitives in `src/styles/globals.css`.

## Palette (pinned by Marc, Nov 2026)

| Token | Hex | Role |
|---|---|---|
| `--cream` | `#FAF3E6` | Page ground (light), text on espresso |
| `--oat` | `#EDE3D1` | Alternate sections, cards, contact card |
| `--taupe` | `#B09A7C` | Lines, selection, scrollbar, 3D terrain tint. Never body text (fails contrast on cream) |
| `--espresso` | `#4A3324` | Ink, headings, primary buttons; ground in dark mode |

No other hues. Mixes of these four (`color-mix`) are allowed for muted text and borders. Dark mode swaps the ground to a deeper espresso and the accent to cream (`--accent` / `--on-accent` flip under the dark scheme).

## Type

- **Archivo** (variable, `wdth` axis) for everything. Display: weight 900, `font-stretch: 125%`, uppercase, tight tracking (`-0.035em` to `-0.045em`).
- **JetBrains Mono** only for data: dates, grades, codes.
- No serif display: cream + serif is the generic AI look this brand avoids.

## Shape and depth

- Cards and media: 2px espresso borders, generous radius (`--radius-2xl` / `--radius-3xl`).
- Shadows are warm, offset and blurred (`--shadow-xl`); no glows, no glass, no gradients, no gradient text.
- Buttons are pills: primary = espresso fill / cream text, outline = 2px espresso.

## Motion

- Section and heading entrances use CSS scroll-driven animations (`.reveal`, `.title-rise`): visible by default, animate only where view timelines are supported and motion is allowed.
- Hero entrance is CSS only (name lines slide up inside a mask, copy rises, avatar settles).
- Easing: exponential ease-out `cubic-bezier(0.16, 1, 0.3, 1)`; no bounce.
- Every animation respects `prefers-reduced-motion`.

## 3D

`src/components/three/RideScene.tsx`: a procedural low-poly landscape with the Paris → Saint-Malo ride as a line, an elevation readout and a slowly drifting camera. three.js is imported lazily after first paint, colours come from the tokens and follow the scheme, the loop pauses off-screen, and reduced motion renders one still frame.

## Page structure

Home: Hero (name, role, short bio, CV, 3D ride + avatar) → Certifications → Skills → Experiences → Education (grades + documents) → Side projects (cards link to blog posts). Photos page: gallery + Achievements. Left social sidebar and the cal.com floating "Book a call" button (branded espresso) on every page.
