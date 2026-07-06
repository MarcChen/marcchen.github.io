# Photo Gallery — Complete Guide

Pipeline: `photos/` (raw) → local compression → `public/photos/` → Cloudinary CDN → PhotoSwipe

---

## Table of Contents

1. [File Structure](#1-file-structure)
2. [Adding Photos with Metadata](#2-adding-photos-with-metadata)
3. [Compression Before Upload](#3-compression-before-upload)
4. [Generating the Manifest](#4-generating-the-manifest)
5. [Pushing to Cloudinary](#5-pushing-to-cloudinary)
6. [Captions & Copyright in PhotoSwipe](#6-captions--copyright-in-photoswipe)
7. [Local vs Cloudinary Logic](#7-local-vs-cloudinary-logic)
8. [Makefile Reference](#8-makefile-reference)
9. [Environment Variables](#9-environment-variables)

---

## 1. File Structure

```
photos/                         ← raw photos (gitignored, can be > 10 MB each)
  ├── hk-architecture.jpg
  ├── taxi-hk.jpg
  └── meta.json                 ← metadata: global copyright + per-photo title/caption

public/photos/                  ← compressed output (gitignored)
src/data/photos.json            ← committed manifest — single source of truth for the build
src/lib/types.ts                ← PhotoItem interface (id, src, alt, caption, copyright…)
src/lib/photos.ts               ← data layer (local vs Cloudinary)
src/components/photos/
  └── PhotoSwipeGallery.tsx     ← gallery with caption support
scripts/
  ├── copy-photos.mjs           ← compress + copy + read meta.json + write manifest
  ├── optimize-images.mjs       ← optimizes public/images/ (portfolio assets)
  └── upload-to-cloudinary.mjs  ← upload to Cloudinary CDN
Makefile                        ← orchestration
```

---

## 2. Adding Photos with Metadata

### 2a. Drop Your Photos

Place photos in `photos/` at the project root (gitignored — originals are never committed).
Subdirectories are supported:

```
photos/
  hong-kong/
    architecture-01.jpg
    taxi-street.jpg
  italy/
    vespa-yellow.jpg
  meta.json
```

### 2b. `meta.json` — Global Copyright + Per-Photo Details

Create `photos/meta.json` to enrich the manifest. The `copy-photos.mjs` script reads it
automatically during generation.

The `_copyright` key at the root applies to **all photos** — no need to repeat it per entry.
Per-photo entries provide `title`, `caption`, and optional `tags`.

```json
{
  "_copyright": "© Marc Chen – All rights reserved",

  "hk-architecture-ville2": {
    "title": "HK Architecture",
    "caption": "Wan Chai skyscrapers seen from the Star Ferry, Hong Kong 2024.",
    "tags": ["architecture", "hongkong", "urban"]
  },
  "taxi-hk-ss": {
    "title": "Red Taxi",
    "caption": "Iconic red taxi in the streets of Kowloon.",
    "tags": ["street", "hongkong"]
  },
  "vespa-jaune": {
    "title": "Yellow Vespa",
    "caption": "A yellow Vespa parked in a Roman alley.",
    "tags": ["italy", "street"]
  }
}
```

> **Key format**: relative path without extension (`subfolder/filename`), matching the `id` field in the manifest.

> **Global copyright**: the `_copyright` key is written into every photo entry in the manifest.
> You can still override it per-photo by adding a `copyright` field to an individual entry.

### 2c. Automatic EXIF Fallback

If `meta.json` is absent or a photo is not listed, the script attempts to extract IPTC
metadata via sharp:

| IPTC Field | Manifest Field |
|---|---|
| `ObjectName` / `Headline` | `title` |
| `Caption-Abstract` | `caption` |
| `CopyrightNotice` | `copyright` |

> **Note**: sharp strips EXIF data during compression.
> `meta.json` is therefore the **permanent source of truth** — not the EXIF embedded in the JPEG.

---

## 3. Compression Before Upload

> ⚠️ **Your raw photos are ~12–17 MB each.** Without compression they slow down the
> dev-server, exceed Cloudinary's 10 MB limit, and bloat deployment.

### What `copy-photos.mjs` Does

The script compresses **on-the-fly** while copying `photos/` → `public/photos/`:

| Setting | Value |
|---|---|
| Max dimension | `2560 px` (downscale if larger, no upscaling) |
| JPEG quality | `85` with mozjpeg (best compression-to-quality ratio) |
| PNG compression | level `8` |
| Skip threshold | files already `< 50 KB` |

```bash
make copy-photos
# → compresses + copies photos/ → public/photos/
# → reads meta.json (global copyright + per-photo fields)
# → writes src/data/photos.json
```

**Dry-run** (preview without writing):

```bash
DRY_RUN=1 node scripts/copy-photos.mjs
```

### Checking Compression Results

```bash
du -sh photos/*          # originals
du -sh public/photos/*   # after compression
```

Expected with the current 3 photos:

```
photos/hk-architecture-ville2.jpg   17 MB  →  public/photos/  ~1.5 MB
photos/taxi-hk-ss.jpg               14 MB  →  public/photos/  ~1.2 MB
photos/vespa-jaune.jpg              12 MB  →  public/photos/  ~1.0 MB
```

That's roughly a **~90% reduction** on these high-resolution JPEGs.

### Forcing Recompression

```bash
rm -rf public/photos && make copy-photos
```

---

## 4. Generating the Manifest

```bash
make copy-photos
```

Produces `src/data/photos.json` — **committed to git**, single source of truth for the build:

```json
[
  {
    "id": "hk-architecture-ville2",
    "path": "/photos/hk-architecture-ville2.jpg",
    "width": 2560,
    "height": 1920,
    "alt": "HK Architecture",
    "title": "HK Architecture",
    "caption": "Wan Chai skyscrapers seen from the Star Ferry, Hong Kong 2024.",
    "copyright": "© Marc Chen – All rights reserved",
    "tags": ["architecture", "hongkong", "urban"]
  }
]
```

> **Commit `src/data/photos.json` after every change** — this is what drives the gallery
> in production. Cloudinary doesn't need `public/photos/` at build time.

---

## 5. Pushing to Cloudinary

```bash
make upload-photos    # photos/ only
make upload-images    # public/images/ only (portfolio assets)
make upload           # both
```

Advanced flags:

```bash
node scripts/upload-to-cloudinary.mjs --photos --dry-run      # preview without upload
node scripts/upload-to-cloudinary.mjs --photos --overwrite    # force overwrite
```

> If a photo still exceeds 10 MB after local compression, `upload-to-cloudinary.mjs`
> recompresses it **in memory** (max 2560 px, quality 80) before upload.
> The local file is **not** modified.

### Recommended Full Workflow

```bash
# 1. Add photos in photos/ and fill in meta.json
# 2. Compress + generate manifest
make copy-photos

# 3. Verify visually (dev server already running)
#    → http://localhost:3000/en/photos

# 4. Commit the manifest (not the images themselves)
git add src/data/photos.json photos/meta.json
git commit -m "feat(photos): add hong-kong series"

# 5. Upload to Cloudinary (production)
make upload-photos

# 6. Deploy
git push
```

---

## 6. Captions & Copyright in PhotoSwipe

PhotoSwipe v5 natively supports HTML captions per slide.

### 6a. Enriched `PhotoItem` Interface

`src/lib/types.ts` — available fields in `PhotoItem`:

```typescript
export interface PhotoItem {
  id: string;
  src: string;           // full-res URL (local or Cloudinary)
  width: number;
  height: number;
  msrc?: string;         // thumbnail URL (low-res preview)
  alt: string;           // alt text (accessibility)
  title?: string;        // title shown in lightbox
  caption?: string;      // description shown below the image
  copyright?: string;    // "© Marc Chen – All rights reserved"
  tags?: string[];       // for future filtering
}
```

### 6b. Lightbox with Caption + Copyright

In `PhotoSwipeGallery.tsx`, caption HTML is passed to PhotoSwipe:

```tsx
const lightbox = new PhotoSwipe({
  dataSource: photos.map((p) => ({
    src: p.src,
    width: p.width,
    height: p.height,
    msrc: p.msrc,
    alt: p.alt,
    // caption HTML — description + copyright on two lines
    caption: [
      p.caption ?? p.alt,
      p.copyright
        ? `<small class="pswp-copyright">${p.copyright}</small>`
        : '',
    ].filter(Boolean).join('<br>'),
  })),
  showHideAnimationType: 'fade',
  bgOpacity: 0.9,
  index,
});
lightbox.init();
```

### 6c. Recommended Styles

In `Gallery.module.css` or your global CSS:

```css
/* Caption banner at the bottom of the lightbox */
.pswp__dynamic-caption {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, transparent 100%);
  padding: 1.25rem 1.5rem;
  color: #fff;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Subtle copyright notice */
.pswp-copyright {
  display: block;
  margin-top: 0.25rem;
  opacity: 0.6;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  font-style: italic;
}
```

---

## 7. Local vs Cloudinary Logic

`src/lib/photos.ts` → `getPhotos()`:

```
public/photos/ has images?
  ├── YES → local mode  (URLs: /photos/…, served from public/)
  └── NO  → CDN mode    (URLs: res.cloudinary.com/… with f_auto,q_auto)
```

| Context | Mode | Condition |
|---|---|---|
| `make dev` after `make copy-photos` | Local | `public/photos/` is non-empty |
| CI build / Vercel without `public/photos/` | Cloudinary | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set |
| CI build without Cloudinary | Local fallback | No env var set |

---

## 8. Makefile Reference

| Target | Action |
|---|---|
| `make dev` | Start development server |
| `make build` | Production build (runs `copy-photos` + `optimize` via prebuild) |
| `make copy-photos` | Compress + copy `photos/` → `public/photos/` + manifest |
| `make optimize` | Optimize images in `public/images/` (portfolio assets) |
| `make upload` | Upload everything (photos + images) to Cloudinary |
| `make upload-photos` | Upload `photos/` only |
| `make upload-images` | Upload `public/images/` only |
| `make clean` | Remove `.next/` and `out/` |

---

## 9. Environment Variables

`.env` file (copy from `.env-exemple`, never committed):

```env
# Cloudinary upload (Node scripts — server-side only)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=yyyyy

# Cloudinary CDN URLs (exposed to Next.js client)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud
```

---

## FAQ

**Q: Are my photos compressed before going to Cloudinary?**
Yes — two levels: `copy-photos` compresses locally (JPEG q85, max 2560 px), and
`upload-to-cloudinary` recompresses in memory if the photo remains > 10 MB.
Cloudinary then applies `f_auto,q_auto` at delivery time.

**Q: Is the copyright preserved after compression?**
Sharp strips EXIF metadata during compression. The source of truth is
`meta.json` → `photos.json` (committed), not the EXIF embedded in the compressed file.

**Q: Can I add photos without uploading to Cloudinary?**
Yes. `make copy-photos` + `git commit src/data/photos.json`. In production without Cloudinary
configured, images must be served statically.

**Q: How do I filter by tag?**
The `tags` field is in the manifest and `PhotoItem`. Add filter buttons in
`/[locale]/photos/` and filter with `photos.filter(p => p.tags?.includes(tag))`.

**Q: Where is the gallery accessible?**
`/{locale}/photos/` — link in the navbar (en, fr, zh-cn).
