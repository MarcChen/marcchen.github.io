#!/usr/bin/env node

/**
 * postbuild hook: rewrite out/index.html as a static meta-refresh redirect.
 *
 * Why: `src/app/page.tsx` calls `redirect('/en/')` from `next/navigation`.
 * With `output: "export"` there is no Next.js runtime to interpret the
 * `NEXT_REDIRECT` RSC payload, so `next build` emits a broken `__next_error__`
 * placeholder at `/` → users see the 404 page on GitHub Pages.
 *
 * This script replaces that placeholder with a portable HTML redirect that
 * works on any static host and respects `basePath` (uses a relative URL).
 *
 * Detection: only overwrites when the file looks like the broken redirect
 * placeholder. Prints a warning otherwise so future changes to app/page.tsx
 * (e.g. rendering real content at `/`) are not silently clobbered.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_INDEX = path.join(process.cwd(), "out", "index.html");

const REDIRECT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0; url=./en/" />
  <link rel="canonical" href="./en/" />
  <title>Redirecting…</title>
</head>
<body>
  <p>Redirecting to <a href="./en/">the English site</a>.</p>
</body>
</html>
`;

async function fixRootRedirect() {
  let existing;
  try {
    existing = await readFile(OUT_INDEX, "utf-8");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn("  SKIP      out/index.html not found (build failed?)");
      return;
    }
    throw err;
  }

  const looksBroken =
    existing.includes("__next_error__") ||
    existing.includes("NEXT_REDIRECT");

  if (!looksBroken) {
    console.warn(
      "  SKIP      out/index.html does not look like the redirect placeholder.",
    );
    console.warn(
      "            If app/page.tsx now renders real content, this is expected.",
    );
    return;
  }

  await writeFile(OUT_INDEX, REDIRECT_HTML, "utf-8");
  console.log("  FIX       out/index.html → meta-refresh redirect to ./en/");
}

fixRootRedirect().catch((err) => {
  console.error(err);
  process.exit(1);
});