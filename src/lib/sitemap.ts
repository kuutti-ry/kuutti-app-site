import { pathOf } from "../i18n/locales.ts";
import { routes } from "./routes.ts";

const ORIGIN = new URL(import.meta.env.SITE ?? "https://kuutti.app");

/**
 * The pages search engines are told about: every page but a draft (which they
 * are told to leave alone). A legal text says when its wording last changed
 * (`dated`); a page has no such date, and a guessed one is worse than none.
 */
export async function sitemapEntries(): Promise<{ loc: string; lastmod?: string }[]> {
  return (await routes()).flatMap((route) => {
    const { locale, slug, view } = route.props;
    if (view.kind === "text" && view.text.data.status === "draft") return [];
    const loc = new URL(pathOf(locale, slug), ORIGIN).href;
    return view.kind === "text"
      ? [{ loc, lastmod: view.text.data.dated.toISOString().slice(0, 10) }]
      : [{ loc }];
  });
}
