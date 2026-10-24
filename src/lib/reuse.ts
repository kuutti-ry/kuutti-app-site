/**
 * Gaiane's structure (/ga/, docs/decisions.md 16) shows the site's own texts
 * where it has them, so that every text has one copy and the two structures
 * cannot part. A paragraph of a /ga/ page that says only
 * `@reuse /app/#research` becomes that part of the page at /app/, as the
 * content layer rendered it: what stands under the heading with that id, up
 * to the next heading of its level or above, without the heading itself (the
 * /ga/ page names it in its own words). `@reuse /about/` is what a page says
 * before its first heading. A marker that names nothing fails the build.
 */
const MARKER = /<p>@reuse (\/[^\s#<]*)(?:#([^\s<]+))?<\/p>/g;

const HEADING = /<h([1-6])[\s>]/g;

const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** What a page says before its first heading, or null when it says nothing there. */
function opening(page: string): string | null {
  const first = page.search(/<h[1-6][\s>]/);
  const part = (first === -1 ? page : page.slice(0, first)).trim();
  return part === "" ? null : part;
}

/** What stands under the heading with this id, up to the next heading of its level or above. */
function section(page: string, id: string): string | null {
  const heading = new RegExp(`<h([1-6]) id="${escaped(id)}"[^>]*>[\\s\\S]*?</h\\1>`).exec(page);
  if (!heading) return null;
  const level = Number(heading[1]);
  const rest = page.slice(heading.index + heading[0].length);
  const next = [...rest.matchAll(HEADING)].find((match) => Number(match[1]) <= level);
  const part = (next === undefined ? rest : rest.slice(0, next.index)).trim();
  return part === "" ? null : part;
}

/**
 * The HTML of a /ga/ page with every marker replaced by the part it names.
 * `pages` is the rendered HTML of the site's pages by their path ("/app/").
 */
export function reuse(html: string, pages: ReadonlyMap<string, string>): string {
  const done = html.replace(MARKER, (marker: string, path: string, id: string | undefined) => {
    const page = pages.get(path);
    if (page === undefined) throw new Error(`${marker}: there is no page at ${path}`);
    const part = id === undefined ? opening(page) : section(page, id);
    if (part === null) {
      throw new Error(`${marker}: ${path} has ${id === undefined ? "no opening" : `no #${id}`}`);
    }
    return part;
  });
  if (done.includes("@reuse")) {
    throw new Error("@reuse is a paragraph of its own: `@reuse /path/` or `@reuse /path/#heading`");
  }
  return done;
}
