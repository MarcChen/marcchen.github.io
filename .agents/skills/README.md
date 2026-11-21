# Project-scoped skills

Installed with the [skills](https://github.com/vercel-labs/skills) CLI from public,
permissively licensed sources. `.agents/skills/<name>/` is the source of truth;
agent-specific entry points such as `.claude/skills/<name>` are symlinks to it; and
`skills-lock.json` pins the source repository, commit and skill-folder hash.

| Skill | Source repo | Commit | License | Purpose |
|---|---|---|---|---|
| `frontend-design` | `anthropics/skills` | `e4bb5d9` | Apache-2.0 (`LICENSE.txt`) | Distinctive, intentional visual design instead of templated defaults |
| `modern-web-guidance` | `GoogleChrome/modern-web-guidance` | `64a6d70` | Apache-2.0 (`LICENSE`) | Current HTML/CSS/JS, accessibility and Core Web Vitals guidance |
| `emil-design-eng` | `emilkowalski/skills` | `64eb3de` | MIT (`LICENSE`) | Motion, interaction and UI-polish details |

License texts are vendored in `.agents/skills/_licenses/` so this public repository
carries the attribution and license notice required for redistribution (`frontend-design`
also ships its own `LICENSE.txt` from upstream). They live outside the skill folders so
`npx skills ls` keeps reporting every skill as matching the lock; a re-sync from the
lockfile recreates skill folders only, so re-check the copies after
`experimental_install --frozen-lockfile`.

## Install / update

```bash
npx -y skills add anthropics/skills --skill frontend-design -y
npx -y skills add GoogleChrome/modern-web-guidance --skill modern-web-guidance -y
npx -y skills add emilkowalski/skills --skill emil-design-eng -y

npx -y skills experimental_install --frozen-lockfile   # re-sync from skills-lock.json
npx -y skills ls                                       # list installed project skills
```

Commit `.agents/skills/**`, the `.claude/skills/**` symlinks and `skills-lock.json`
together. Never vendor skills from private repositories: this repository is public.
