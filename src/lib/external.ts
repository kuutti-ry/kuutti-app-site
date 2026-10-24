/**
 * A link that leaves the site, in Gaiane's structure (/ga/, docs/decisions.md
 * 16): it opens in a new tab, and says so twice, by an arrow drawn after its
 * words and in words for a screen reader. The arrow is drawn in the page, so
 * nothing is loaded for it (rule 1).
 */
export const externalMark = (label: string): string =>
  '<svg class="external" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M7 17 17 7M8 7h9v9"></path></svg>' +
  `<span class="visually-hidden"> (${label})</span>`;

/**
 * Every https link of rendered HTML, marked as leaving the site. `label` is
 * the words for a screen reader, in the page's language ("opens in a new tab").
 */
export function markExternal(html: string, label: string): string {
  return html.replace(
    /<a href="(https:\/\/[^"]*)">([\s\S]*?)<\/a>/g,
    (_, href: string, text: string) =>
      `<a href="${href}" target="_blank" rel="noopener">${text}${externalMark(label)}</a>`,
  );
}
