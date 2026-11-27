# Design

Marc Chen's portfolio. Tokens live in `src/styles/variables.css`; global primitives in `src/styles/globals.css`.

## Palette

Default: **Brick & Sand** (chosen by Marc, Nov 2026). Navy ink on variations of cream; brick only as a small accent.

| Token | Brick & Sand (default) | Espresso (alternative) | Role |
|---|---|---|---|
| `--cream` | `#FAF5EC` | `#FAF3E6` | Page ground |
| `--oat` | `#F1E8D8` | `#EDE3D1` | Alternate sections, hover rows, cards |
| `--sand` | `#E7DBC5` | `#E3D6BF` | Deeper surface (skill tiles, 3D terrain) |
| `--taupe` | `#E4572E` brick | `#B09A7C` taupe | Accent only: seal rings, dashed rules, menu numbers, the 3D rider. Never body text. |
| `--espresso` | `#15213B` navy | `#4A3324` espresso | Ink, headings, primary buttons; ground in dark mode |

The Espresso palette is switchable from the Index menu (`<html data-palette="espresso">`, remembered in `localStorage`). Dark mode swaps the ground to a deep ink and flips the accent to sand/cream.

## Type

- **Archivo** (variable, `wdth` axis) for everything. Display: weight 900, `font-stretch: 125%`, uppercase, tight tracking (`-0.035em` to `-0.045em`).
- **JetBrains Mono** only for data: dates, grades, codes.
- No serif display: cream + serif is the generic AI look this brand avoids.

## Shape and depth

- Cards and media: 2px espresso borders, generous radius (`--radius-2xl` / `--radius-3xl`).
- Large fills are reserved: content sits on cream variations; full ink blocks appear only in the Index menu and dark mode.
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
