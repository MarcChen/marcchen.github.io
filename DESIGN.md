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

The Espresso palette is switchable from the palette button in the header (temporary, for review) (`<html data-palette="espresso">`, remembered in `localStorage`). Dark mode swaps the ground to a deep ink and flips the accent to sand/cream.

## Type

- **Archivo** (variable, `wdth` axis) for everything. Display: weight 900, `font-stretch: 125%`, uppercase, tight tracking (`-0.035em` to `-0.045em`).
- **JetBrains Mono** only for data: dates, grades, codes.
- No serif display: cream + serif is the generic AI look this brand avoids.

## Shape and depth

- Cards and media: 2px espresso borders, generous radius (`--radius-2xl` / `--radius-3xl`).
- Large fills are reserved: content sits on cream variations; full ink blocks appear only on the active header link, primary buttons and dark mode.
- Shadows are warm, offset and blurred (`--shadow-xl`); no glows, no glass, no gradients, no gradient text.
- Buttons are pills: primary = espresso fill / cream text, outline = 2px espresso.

## Motion

- Section and heading entrances use CSS scroll-driven animations (`.reveal`, `.title-rise`): visible by default, animate only where view timelines are supported and motion is allowed.
- Hero entrance is CSS only (name lines slide up inside a mask, copy rises, avatar settles).
- Easing: exponential ease-out `cubic-bezier(0.16, 1, 0.3, 1)`; no bounce.
- Every animation respects `prefers-reduced-motion`.

## 3D

`src/components/three/hobbyRoom.ts` builds an interactive room of Marc's hobbies entirely in code: three bikes on the wall (Triban GRVL 520, Scott Addict Gravel, Orbea Orca), a Golden State Curry 30 jersey, half-marathon medals, a mini hoop and ball, a bivouac tent, an A6600 on a Sirui tripod, an Instax, a Mount Fuji frame, and the desk (BenQ + second screen, Eris 4.5, MV7X, Scarlett 2i2, Stream Deck, Raspberry Pi cage, 3D prints, lamp). Materials are physically based (ACES tone mapping, a PMREM room environment, oak-plank and plaster canvas textures, a daylight window, soft shadows); bikes use true proportions with drop bars, spoked wheels, disc rotors, drivetrain and brand decals. Camera: OrbitControls with damping, limited to the open side of the room (azimuth −0.12…1.62, polar 0.2…1.53) and a target clamped inside it; drag to turn, right-drag to pan, and the wheel zooms only after the visitor has clicked into the room so page scrolling is never captured. On touch, one finger scrolls the page and two fingers turn and zoom. A "Reset view" pill returns home. Hover lifts an object and shows its name; click flies the camera to it (you can keep orbiting around it) and opens a panel (`src/lib/hobbies.ts`, EN/FR/ZH) with easter eggs (shoot the ball, spin wheels, lamp, lantern, camera flash, Instax print, Stream Deck, song switch). Dark mode is a night scene. three.js loads after first paint, the loop pauses off-screen, and reduced motion renders on demand. `HobbyRoom.tsx` is the React wrapper used in the hero.

## Page structure

Home: Hero (name, role, short bio, CV, interactive 3D hobby room + avatar) → Certifications → Skills → Experiences → Education (grades + documents) → Side projects (cards link to blog posts). Photos page: gallery + Achievements. Header in three parts: name (left), Portfolio / Blog / Photos pills (centred), small language, theme and palette buttons (right). Left social sidebar on every page: GitHub, LinkedIn, email, cal.com booking, CV download.
