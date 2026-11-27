#!/usr/bin/env node
/**
 * Link checker for the portfolio: every link we write must exist and respond.
 *
 * Scans
 *   - blog posts      src/content/posts/**\/*.md   (Markdown links/images, HTML href/src)
 *   - site data       src/data/**\/*.{yaml,json}   (every string value that is a URL or a "/" path)
 *   - site code       src/{app,components,lib}/**\/*.{ts,tsx}  (literal http(s) URLs)
 *
 * Checks
 *   - internal paths  /images/…, /files/… → file exists in public/
 *                     /blog/<slug>/, /<locale>/blog/<slug>/ → post exists
 *                     /, /blog/, /photos/ (+ locale prefixes) → known routes
 *   - post-relative   images next to a post (e.g. "devboard.jpg") → file exists
 *   - external URLs   HTTP request (HEAD, then GET); 2xx/3xx pass, 404/410/5xx fail.
 *                     401/403/405/429/999 (bot protection, the page exists) are warnings.
 *
 * Usage
 *   node scripts/check-links.mjs              # whole site
 *   node scripts/check-links.mjs --staged     # only files staged for commit (pre-commit)
 *   node scripts/check-links.mjs --offline    # skip external URLs (internal checks only)
 *
 * Exceptions
 *   .linkcheckignore  one URL prefix per line (# comments allowed), e.g. a private repo
 *
 * Env
 *   LINKCHECK_ALLOW_NETWORK_ERRORS=1  turn DNS/proxy/timeout failures into warnings
 *                                     (for machines without internet access)
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src/content/posts");
const DATA_DIR = path.join(ROOT, "src/data");
const PUBLIC_DIR = path.join(ROOT, "public");
const CODE_DIRS = ["src/app", "src/components", "src/lib"].map((d) => path.join(ROOT, d));
const LOCALES = ["en", "fr", "zh-cn"];

const args = new Set(process.argv.slice(2));
const STAGED = args.has("--staged");
const OFFLINE = args.has("--offline");
const ALLOW_NET = process.env.LINKCHECK_ALLOW_NETWORK_ERRORS === "1";
const TIMEOUT_MS = 12000;
const CONCURRENCY = 8;

/** Hosts that are references, not pages (XML namespaces, script endpoints). */
const IGNORE_URL = [
  /^https?:\/\/www\.w3\.org\//,
  /^https?:\/\/(www\.)?example\.(com|org)/,
  /\$\{/, // template literals in code
];
const WARN_STATUS = new Set([401, 403, 405, 406, 429, 999]);
const IGNORE_FILE = path.join(ROOT, ".linkcheckignore");
const IGNORE_PREFIXES = fs.existsSync(IGNORE_FILE)
  ? fs.readFileSync(IGNORE_FILE, "utf8").split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean)
  : [];

// ─── File discovery ───────────────────────────────────────────────
function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, exts, out);
    else if (exts.some((x) => e.name.toLowerCase().endsWith(x))) out.push(full);
  }
  return out;
}

function stagedFiles() {
  const out = execSync("git diff --cached --name-only --diff-filter=ACMR", { encoding: "utf8" });
  return new Set(out.split("\n").filter(Boolean).map((f) => path.join(ROOT, f)));
}

// ─── Link extraction ──────────────────────────────────────────────
function stripCode(md) {
  return md.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

function linksFromMarkdown(file) {
  const text = stripCode(fs.readFileSync(file, "utf8").replace(/^---[\s\S]*?\n---/, (fm) => fm));
  const found = [];
  const push = (url, line) => found.push({ url: url.trim(), file, line });
  const lines = text.split("\n");
  lines.forEach((ln, i) => {
    for (const m of ln.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) push(m[1], i + 1);
    for (const m of ln.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) push(m[1], i + 1);
    for (const m of ln.matchAll(/(?<![("'=])\bhttps?:\/\/[^\s<>)"'\]]+/g)) push(m[0], i + 1);
  });
  // front matter hero/image fields
  const fm = fs.readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
  if (fm) {
    try {
      const data = yaml.load(fm[1]) ?? {};
      for (const key of ["hero", "image", "cover"]) if (typeof data[key] === "string") push(data[key], 1);
    } catch {
      // ignore malformed front matter here; the build reports it
    }
  }
  return found;
}

function linksFromData(file) {
  const raw = fs.readFileSync(file, "utf8");
  let data;
  try {
    data = file.endsWith(".json") ? JSON.parse(raw) : yaml.load(raw);
  } catch (e) {
    return [{ url: "", file, line: 0, parseError: String(e.message || e) }];
  }
  const found = [];
  const lineOf = (s) => {
    const idx = raw.indexOf(s);
    return idx < 0 ? 0 : raw.slice(0, idx).split("\n").length;
  };
  const visit = (v) => {
    if (typeof v === "string") {
      const s = v.trim();
      if (/^https?:\/\//.test(s) || /^\/(?!\/)[^\s]*$/.test(s)) found.push({ url: s, file, line: lineOf(s) });
      for (const m of s.matchAll(/\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g)) found.push({ url: m[1], file, line: lineOf(m[1]) });
    } else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === "object") Object.values(v).forEach(visit);
  };
  visit(data);
  return found;
}

function linksFromCode(file) {
  const found = [];
  fs.readFileSync(file, "utf8")
    .split("\n")
    .forEach((ln, i) => {
      for (const m of ln.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)) found.push({ url: m[1], file, line: i + 1 });
    });
  return found;
}

// ─── Internal resolution ──────────────────────────────────────────
function postSlugs() {
  const slugs = new Set();
  for (const f of walk(POSTS_DIR, [".md"])) {
    if (path.basename(f).startsWith("_index")) continue;
    const rel = path.relative(POSTS_DIR, path.dirname(f));
    if (rel) slugs.add(rel.replace(/\\/g, "/").toLowerCase().replace(/\//g, "-"));
  }
  return slugs;
}
const SLUGS = postSlugs();

function checkInternal(url, fromFile) {
  const clean = decodeURI(url.split("#")[0].split("?")[0]);
  if (!clean) return null; // pure anchor
  if (clean.startsWith("/")) {
    const parts = clean.split("/").filter(Boolean);
    if (parts[0] && LOCALES.includes(parts[0])) parts.shift();
    if (parts.length === 0) return null;
    if (parts[0] === "blog") {
      if (parts.length === 1) return null;
      return SLUGS.has(parts[1].toLowerCase()) ? null : `no blog post with slug "${parts[1]}"`;
    }
    if (parts[0] === "photos" && parts.length === 1) return null;
    const file = path.join(PUBLIC_DIR, clean);
    if (fs.existsSync(file)) return null;
    // images under /images/posts/... are copied from post folders at build time
    if (clean.startsWith("/images/posts/") || clean.startsWith("/photos/")) {
      const base = path.basename(clean);
      const hit = walk(POSTS_DIR, [base.toLowerCase()]).length > 0;
      if (hit) return null;
      if (clean.startsWith("/photos/")) return null; // gallery originals are gitignored, served by CDN
    }
    return `file not found in public/: ${clean}`;
  }
  // relative to the post folder (Markdown images)
  if (fromFile.startsWith(POSTS_DIR)) {
    const p = path.join(path.dirname(fromFile), clean);
    return fs.existsSync(p) ? null : `file not found next to the post: ${clean}`;
  }
  return null;
}

// ─── External requests ────────────────────────────────────────────
async function request(url, method) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; portfolio-link-check/1.0)",
        accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    });
    if (method === "GET") res.body?.cancel().catch(() => {});
    return { status: res.status };
  } catch (e) {
    return { error: e.name === "AbortError" ? `timeout after ${TIMEOUT_MS / 1000}s` : String(e.cause?.code || e.message) };
  } finally {
    clearTimeout(timer);
  }
}

async function checkExternal(url) {
  let r = await request(url, "HEAD");
  if (r.error || r.status === 404 || r.status === 405 || r.status >= 400) {
    const g = await request(url, "GET");
    if (!g.error) r = g;
    else if (r.error) r = g;
  }
  if (r.error) return { level: ALLOW_NET ? "warn" : "fail", msg: `no response (${r.error})` };
  if (r.status < 400) return null;
  if (WARN_STATUS.has(r.status)) return { level: "warn", msg: `HTTP ${r.status} (likely bot protection; check by hand)` };
  return { level: "fail", msg: `HTTP ${r.status}` };
}

async function pool(items, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k]);
      }
    })
  );
  return out;
}

// ─── Main ─────────────────────────────────────────────────────────
const sources = [
  ...walk(POSTS_DIR, [".md"]).map((f) => [f, linksFromMarkdown]),
  ...walk(DATA_DIR, [".yaml", ".yml", ".json"]).map((f) => [f, linksFromData]),
  ...CODE_DIRS.flatMap((d) => walk(d, [".ts", ".tsx"])).map((f) => [f, linksFromCode]),
];

const staged = STAGED ? stagedFiles() : null;
const selected = staged ? sources.filter(([f]) => staged.has(f)) : sources;
if (selected.length === 0) {
  console.log("[links] no blog, data or code files to check.");
  process.exit(0);
}

const links = selected.flatMap(([f, fn]) => fn(f));
const failures = [];
const warnings = [];
const rel = (f) => path.relative(ROOT, f);

for (const l of links.filter((x) => x.parseError)) failures.push(`${rel(l.file)}: cannot parse (${l.parseError})`);

const external = new Map();
for (const l of links) {
  if (!l.url || l.parseError) continue;
  if (IGNORE_URL.some((re) => re.test(l.url))) continue;
  if (IGNORE_PREFIXES.some((p) => l.url.startsWith(p))) continue;
  if (/^(mailto:|tel:|data:|#)/.test(l.url)) continue;
  if (/^https?:\/\//.test(l.url)) {
    if (!external.has(l.url)) external.set(l.url, []);
    external.get(l.url).push(l);
    continue;
  }
  const err = checkInternal(l.url, l.file);
  if (err) failures.push(`${rel(l.file)}:${l.line}  ${l.url}\n      → ${err}`);
}

const urls = [...external.keys()];
console.log(
  `[links] ${selected.length} file(s), ${links.length} link(s), ${urls.length} unique external URL(s)${OFFLINE ? " (external skipped: --offline)" : ""}`
);

if (!OFFLINE && urls.length) {
  const results = await pool(urls, checkExternal);
  results.forEach((res, k) => {
    if (!res) return;
    const where = external.get(urls[k]).map((l) => `${rel(l.file)}:${l.line}`).join(", ");
    const line = `${urls[k]}\n      → ${res.msg}\n      in ${where}`;
    (res.level === "fail" ? failures : warnings).push(line);
  });
}

if (warnings.length) {
  console.log(`\n[links] ${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[links] ${failures.length} broken link(s):`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error("\nFix or remove these links. Offline? Re-run with LINKCHECK_ALLOW_NETWORK_ERRORS=1 or --offline.");
  process.exit(1);
}
console.log("[links] all links OK.");
