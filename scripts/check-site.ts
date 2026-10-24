/**
 * What the built site must hold (dist/, after `pnpm build`). Run by
 * `pnpm check:site` and by CI.
 *
 * - No script, no frame, no form: the site runs nothing in the browser, but
 *   for the pond demo (docs/decisions.md, 17): the pages of SCRIPTED run
 *   their own file and nothing else, nothing written in the page.
 * - Nothing is loaded from anybody else: every stylesheet, image, font and
 *   icon is the site's own. Links to other sites are links, not loads.
 * - Every link inside the site leads to a page or a file that exists, and an
 *   anchor to an id that is there.
 * - Every page says its language, has a title, a description and one h1.
 * - The sitemap names every page search engines may index and no other, and
 *   robots.txt names the sitemap.
 * - /legal/versions.json names every kind of the app's, and each address
 *   leads to a page of the site and to the anchor of its version there.
 * - Every version of src/consent-versions.ts, not only the newest, has its
 *   anchor on its page: people agreed to it, and the app's builds in their
 *   hands link to it until they are updated.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { PINNED } from "../src/consent-versions.ts";
import { DEFAULT_LOCALE, LOCALES, pathOf } from "../src/i18n/locales.ts";
import { anchorOf, CONSENT_KINDS, isConsentKind, TEXT_OF } from "../src/lib/consent.ts";
import { SCRIPTED } from "../src/site.ts";

const dist = join(import.meta.dirname, "..", "dist");
if (!existsSync(dist)) {
  console.error("no dist/: run pnpm build first");
  process.exit(1);
}

const ORIGIN = "https://kuutti.app";
const problems: string[] = [];
const pages: string[] = [];
(function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".html")) pages.push(path);
  }
})(dist);

/** The file an address of the site is served from, or null when there is none. */
const fileOf = (address: string): string | null => {
  const file = address.endsWith("/") ? join(dist, address, "index.html") : join(dist, address);
  return existsSync(file) && !statSync(file).isDirectory() ? file : null;
};

const attribute = (tag: string, name: string) =>
  new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1];

for (const path of pages) {
  const page = `/${relative(dist, path)}`;
  const html = readFileSync(path, "utf8");

  for (const banned of ["iframe", "form", "object", "embed"]) {
    if (new RegExp(`<${banned}[\\s>]`, "i").test(html)) problems.push(`${page}: a <${banned}>`);
  }
  // A script only on a page of SCRIPTED, only its own file, and nothing inline.
  const here = page.replace(/index\.html$/, "");
  const scripts = [...html.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== (html.match(/<script[\s>]/gi)?.length ?? 0)) {
    problems.push(`${page}: a <script> that is never closed`);
  }
  for (const [, tag = "", body = ""] of scripts) {
    const src = attribute(tag, "src");
    if (src === undefined || src !== SCRIPTED[here] || body.trim() !== "") {
      problems.push(`${page}: a <script>; only a page of SCRIPTED runs one, and only its own file`);
    } else if (!existsSync(join(dist, src))) {
      problems.push(`${page}: ${src} is not in the site`);
    }
  }
  if (/\son[a-z]+="/i.test(html.replace(/\scontent="[^"]*"/g, ""))) {
    problems.push(`${page}: an inline event handler`);
  }
  if (/@import|url\(\s*["']?(https?:)?\/\//i.test(html)) {
    problems.push(`${page}: the stylesheet loads something from elsewhere`);
  }

  // What the browser fetches by itself.
  for (const [tag] of html.matchAll(/<(img|source|video|audio|link)\b[^>]*>/gi)) {
    const rel = attribute(tag, "rel") ?? "";
    if (
      /^<link/i.test(tag) &&
      !/stylesheet|icon|preload|prefetch|preconnect|dns-prefetch|manifest/.test(rel)
    ) {
      continue; // canonical and alternate name an address, they load nothing
    }
    const address =
      attribute(tag, "src") ?? attribute(tag, "href") ?? attribute(tag, "srcset") ?? "";
    if (/^(https?:)?\/\//i.test(address)) problems.push(`${page}: loads ${address}`);
    else if (address.startsWith("/") && !existsSync(join(dist, address.split(/[?#]/)[0] ?? ""))) {
      problems.push(`${page}: ${address} is not in the site`);
    }
  }

  // Where a reader can go inside the site.
  for (const [tag] of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attribute(tag, "href");
    if (href === undefined) {
      problems.push(`${page}: a link without an address`);
      continue;
    }
    if (/^https:\/\//.test(href) || /^mailto:/.test(href)) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) {
      problems.push(`${page}: a link to ${href}; other sites are reached by https only`);
      continue;
    }
    const [target = "", anchor] = href.split("#");
    let file = path;
    if (target !== "") {
      if (!target.startsWith("/")) {
        problems.push(`${page}: a relative link, ${href}; links inside the site begin with /`);
        continue;
      }
      file = target.endsWith("/") ? join(dist, target, "index.html") : join(dist, target);
      if (!existsSync(file) || statSync(file).isDirectory()) {
        problems.push(`${page}: ${href} leads nowhere`);
        continue;
      }
    }
    if (anchor && file.endsWith(".html")) {
      const there = readFileSync(file, "utf8");
      if (!new RegExp(`\\sid="${anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(there)) {
        problems.push(`${page}: ${href} names an anchor that is not there`);
      }
    }
  }

  if (!new RegExp(`<html[^>]*\\slang="(${LOCALES.join("|")})"`).test(html)) {
    problems.push(`${page}: no language of the site`);
  }
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${page}: no title`);
  if (!/<meta name="description" content="[^"]+"/.test(html))
    problems.push(`${page}: no description`);
  const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1 !== 1) problems.push(`${page}: ${h1} h1 headings, and a page has one`);
  if (!/<meta name="viewport" content="width=device-width, initial-scale=1"/.test(html)) {
    problems.push(`${page}: no viewport for a phone`);
  }
}

// The sitemap: every page a search engine may index, and no page it is told to leave alone.
const sitemap = existsSync(join(dist, "sitemap.xml"))
  ? readFileSync(join(dist, "sitemap.xml"), "utf8")
  : "";
if (sitemap === "") problems.push("/sitemap.xml is not there");
const listed = new Set(
  [...sitemap.matchAll(/<loc>https:\/\/kuutti\.app(\/[^<]*)<\/loc>/g)].map(([, at = ""]) => at),
);
for (const address of listed) {
  if (!fileOf(address)) problems.push(`/sitemap.xml: ${ORIGIN}${address} leads nowhere`);
}
for (const path of pages) {
  const page = `/${relative(dist, path)}`;
  if (page === "/404.html") continue;
  const address = page.replace(/index\.html$/, "");
  const leftAlone = /<meta name="robots" content="noindex"/.test(readFileSync(path, "utf8"));
  if (leftAlone && listed.has(address))
    problems.push(`/sitemap.xml names ${address}, which says noindex`);
  if (!leftAlone && !listed.has(address)) problems.push(`/sitemap.xml does not name ${address}`);
}
const robots = existsSync(join(dist, "robots.txt"))
  ? readFileSync(join(dist, "robots.txt"), "utf8")
  : "";
if (!robots.split("\n").includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  problems.push("/robots.txt does not name the sitemap");
}

// What the app's CI reads (kuutti-ry/kuutti-app#208): a version per kind, at an anchor that is there.
const versionsFile = join(dist, "legal", "versions.json");
const versions: unknown = existsSync(versionsFile)
  ? JSON.parse(readFileSync(versionsFile, "utf8"))
  : null;
if (typeof versions !== "object" || versions === null) {
  problems.push("/legal/versions.json is not there");
} else {
  for (const kind of Object.keys(versions)) {
    if (!isConsentKind(kind))
      problems.push(`/legal/versions.json: ${kind} is not a kind of the app's`);
  }
  for (const kind of CONSENT_KINDS) {
    const entry: unknown = Object.hasOwn(versions, kind)
      ? (versions as Record<string, unknown>)[kind]
      : undefined;
    const url = typeof entry === "object" && entry !== null && "url" in entry ? entry.url : null;
    if (typeof url !== "string" || !url.startsWith(`${ORIGIN}/`)) {
      problems.push(`/legal/versions.json: ${kind} has no address on the site`);
      continue;
    }
    const { pathname, hash } = new URL(url);
    const file = fileOf(pathname);
    const anchor = hash.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!file) problems.push(`/legal/versions.json: ${kind} leads nowhere (${url})`);
    else if (anchor === "" || !new RegExp(`\\sid="${anchor}"`).test(readFileSync(file, "utf8"))) {
      problems.push(`/legal/versions.json: ${kind} names an anchor that is not there (${url})`);
    }
  }
}

// shortcut: a page shows one version of each text, the newest, and today
// each kind has one row. The first new version fails here until the text of
// the one before it stays on the page under its own anchor (an earlier
// versions section, or a page per version), since production records
// consents to it until the next release of the API and the stores.
for (const kind of CONSENT_KINDS) {
  const path = pathOf(DEFAULT_LOCALE, `legal/${TEXT_OF[kind]}`);
  const file = fileOf(path);
  const html = file ? readFileSync(file, "utf8") : "";
  for (const version of Object.keys(PINNED[kind])) {
    if (!html.includes(` id="${anchorOf(kind, version)}"`)) {
      problems.push(
        `${path}: no anchor for ${kind} ${version}; a version people agreed to keeps its text on the site under its anchor`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(
  `the site holds: ${pages.length} pages, no script but the pond's own file, nothing from elsewhere, no dead link, the sitemap names what may be indexed, /legal/versions.json leads to every version, and every pinned version has its anchor`,
);
