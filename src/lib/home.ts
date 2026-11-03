/**
 * The home page shows what each page of the navigation says before its first
 * heading, and leads to the page for the rest (docs/decisions.md, 23). The
 * texts stay in their pages, one copy each; this cuts a page's rendered HTML
 * for that.
 */

const FIRST_HEADING = /<h[1-6][\s>]/;

/** A page's HTML in two: what it says before its first heading, and the rest from there. */
export function opened(html: string): { opening: string; rest: string } {
  const first = html.search(FIRST_HEADING);
  if (first === -1) return { opening: html.trim(), rest: "" };
  return { opening: html.slice(0, first).trim(), rest: html.slice(first).trim() };
}
