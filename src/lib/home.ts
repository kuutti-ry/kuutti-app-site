/**
 * The home page is the whole site in one (docs/decisions.md, 22): Google's
 * reviewer reads it and no other page. It opens with what "About Us" says
 * before its first heading, the association and its purpose, and goes on with
 * every page of the navigation, in its order, as a section under the page's
 * title. The texts stay in their pages, one copy each; these two cut and fit
 * a page's rendered HTML for that.
 */

const FIRST_HEADING = /<h[1-6][\s>]/;

/** A page's HTML in two: what it says before its first heading, and the rest from there. */
export function opened(html: string): { opening: string; rest: string } {
  const first = html.search(FIRST_HEADING);
  if (first === -1) return { opening: html.trim(), rest: "" };
  return { opening: html.slice(0, first).trim(), rest: html.slice(first).trim() };
}

/** A page's headings one level lower, so that it reads as a section under a heading of the page it is in. */
export function lowered(html: string): string {
  if (/<h6[\s>]/.test(html)) throw new Error("a page with an h6 has no level left to lower it to");
  return html.replace(
    /<(\/?)h([1-5])(?=[\s>])/g,
    (_whole, close: string, level: string) => `<${close}h${Number(level) + 1}`,
  );
}
