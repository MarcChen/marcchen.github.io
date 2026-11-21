# Workflow recommandé pour marcchen.github.io

Front-end changes follow one loop: audit → brief → build in a worktree → independent
adversarial review → verification gate → PR. Each direction leaves a record in
`docs/design/`. Never redesign on `main`.

## 0. Ground rules

- Real content only: facts come from `src/data/<locale>/` and `src/content/posts/`. Never invent copy.
- Never edit `src/data/` or `src/content/` in a design change; content changes are a separate commit.
- Replicate UI-string changes across `en`, `fr`, `zh-cn`; UI strings live in `src/lib/i18n.ts`.
- No new npm dependencies unless justified in the PR (static export on GitHub Pages).
- One direction per PR; no drive-by refactors; no server-only features (`output: "export"`).
- Screenshots, logs and axe reports stay in `/tmp`; only curated evidence is committed.

## 1. Audit

Screenshot the current UI at 1440 / 1024 / 390, then list the AI-slop tells with file:line:

violet/purple gradients · gradient text · glassmorphism/backdrop blur · floating pill nav ·
rows of identical cards · icon-topped feature cards · tiny tracked ALL-CAPS eyebrows ·
01/02/03 numbering · emoji as icons · gradient blobs/shapes · pure-black shadows ·
centred SaaS hero · big-number/small-label stats · "A · B · C" meta strings ·
"→" on every link · cream + high-contrast serif + terracotta · near-black + neon accent ·
one accented word inside a headline.

## 2. Brief

- Palette: 4–6 named hex values, one role each (ground, raised surface, primary ink, muted ink, hairline).
- Type: 1–2 typefaces, roles and a scale (display / section head / subhead / body / meta); only the weights used.
- Layout: concept + ASCII wireframe of the hero and one other section; max width, gutters, shared left edges, section rhythm.
- Motion budget: the few motions allowed, durations/easing, and the `prefers-reduced-motion` behaviour.
- Five principles in one line each, specific to this subject.

Check the brief against the audit list; revise anything that reads like a default.

## 3. Build in a dedicated worktree/branch

```bash
git worktree add ../worktrees/<slug> -b design/<slug> design/<previous>
cp -al ../<worktree-with-node_modules>/node_modules ./node_modules   # hardlink, do not npm install
npx next build                                                       # expect 39 static routes
python3 -m http.server 4310 --bind 127.0.0.1 --directory out         # test the export
```

Screenshot at 1440 / 1024 / 768 / 390 / 360 and iterate — at least two visual rounds, one mobile.

## 4. Independent adversarial review

A separate agent that wrote none of the design reviews the branch against the brief:

- score AI-slop 1–10 (10 = clean), list every tell with file:line and screenshot evidence;
- find objective bugs: overflow, contrast, focus, reduced motion, broken links/assets, wrapping, console errors;
- it may apply objective-safe fixes only, committed separately from the design lead.

## 5. Verification gate

| Check | Evidence |
|---|---|
| Build | `npx next build` → 39/39 static routes |
| Overflow | 0 horizontal overflow at 1440 / 1024 / 768 / 390 / 360 |
| A11y | axe WCAG A/AA clean (contrast, landmarks, labels, focus) |
| Locales | `/en/`, `/fr/`, `/zh-cn/` render; language switch preserves the path |
| Keyboard | tab order, visible `:focus-visible`, menu Escape + focus return |
| Motion | `prefers-reduced-motion: reduce` → static frame, no RAF, no smooth scroll |
| Links/assets | internal links 200, images load, console clean |
| 404 | designed, locale-aware, links back to all three locales |

## 6. PR

Branch → `main`, with before/after screenshots (1440 + 390 minimum), review scores,
verification evidence and the design note (`docs/design/<DIRECTION>.md`). Never merge
without owner approval. Scratch goes to `/tmp/design-shots/`; only curated crops are committed.

## Installed skills

Project-scoped skills live in `.agents/skills/<name>/` (source of truth) and are exposed
to Claude Code through `.claude/skills/<name>` symlinks. `skills-lock.json` pins the
source repo, commit and `SKILL.md` hash; license texts are vendored next to each skill.

| Skill | Source | License | Used for |
|---|---|---|---|
| `frontend-design` | `anthropics/skills` | Apache-2.0 | Distinct, non-templated visual direction |
| `modern-web-guidance` | `GoogleChrome/modern-web-guidance` | Apache-2.0 | Current HTML/CSS/JS, accessibility, Core Web Vitals |
| `chrome-extensions` | `GoogleChrome/modern-web-guidance` | Apache-2.0 | Manifest V3 patterns (not used by this site) |
| `emil-design-eng` | `emilkowalski/skills` | MIT | Motion, interaction and UI polish |

```bash
npx -y skills add anthropics/skills --skill frontend-design -y
npx -y skills add GoogleChrome/modern-web-guidance --skill modern-web-guidance --skill chrome-extensions -y
npx -y skills add emilkowalski/skills --skill emil-design-eng -y
npx -y skills experimental_install --frozen-lockfile   # re-sync from skills-lock.json
npx -y skills ls                                       # list installed project skills
```

Commit `.agents/skills/**`, the `.claude/skills/**` symlinks and `skills-lock.json`
together. Never vendor skills from private repositories: this repository is public.
