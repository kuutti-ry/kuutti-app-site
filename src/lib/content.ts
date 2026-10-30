import { type CollectionEntry, getCollection } from "astro:content";
import {
  isLocale,
  isTextLanguage,
  type Locale,
  pathOf,
  TEXT_LANGUAGES,
  type TextLanguage,
} from "../i18n/locales.ts";
import {
  byLanguage,
  CONSENT_KINDS,
  type ConsentKind,
  isConsentKind,
  TEXT_OF,
  type Wording,
} from "./consent.ts";

export type Page = CollectionEntry<"pages">;
export type LegalText = CollectionEntry<"legal">;

/** "fi/about" is the page "about" in Finnish: the folder is the language, the file the slug. */
export function placeOf(id: string): { locale: Locale; slug: string } {
  const [locale, slug, ...rest] = id.split("/");
  if (!locale || !slug || rest.length > 0 || !isLocale(locale)) {
    throw new Error(`content "${id}" is not at <language>/<slug>.md`);
  }
  return { locale, slug };
}

export const LEGAL = "legal";

/** "fi/bylaws" is the text "bylaws" as written in Finnish, whether or not the site speaks Finnish. */
export function writtenIn(id: string): { language: TextLanguage; slug: string } {
  const [language, slug, ...rest] = id.split("/");
  if (!language || !slug || rest.length > 0 || !isTextLanguage(language)) {
    throw new Error(`legal text "${id}" is not at <language>/<slug>.md`);
  }
  return { language, slug };
}

/**
 * Where a reader of one language of the site reads a legal text: at the
 * text's own language when the site speaks it; else under the reader's
 * language, as it is, unless a version in the reader's language exists.
 * Null when it is read nowhere for that reader.
 */
export function textPath(
  language: TextLanguage,
  locale: Locale,
  slug: string,
  versions: readonly TextLanguage[],
): string | null {
  const full = `${LEGAL}/${slug}`;
  if (isLocale(language)) return pathOf(language, full);
  return versions.includes(locale) ? null : pathOf(locale, full);
}

export async function allPages(): Promise<Page[]> {
  return getCollection("pages");
}

export async function allLegal(): Promise<LegalText[]> {
  const texts = await getCollection("legal");
  return texts.sort((a, b) => a.data.order - b.data.order);
}

/**
 * The pages of the navigation in a language, in their order: each is also a
 * section of the home page, and the navigation leads there (docs/decisions.md, 22).
 */
export async function navigation(
  locale: Locale,
): Promise<{ slug: string; title: string; page: Page }[]> {
  return (await allPages())
    .filter((page) => placeOf(page.id).locale === locale && page.data.nav !== undefined)
    .sort((a, b) => (a.data.nav ?? 0) - (b.data.nav ?? 0))
    .map((page) => ({ slug: placeOf(page.id).slug, title: page.data.title, page }));
}

export type GaPage = {
  /** "" is the home page of the structure. */
  slug: string;
  path: string;
  /** Its name in the navigation and the breadcrumbs. */
  label: string;
  entry: CollectionEntry<"ga">;
};

/**
 * The pages of Gaiane's structure in a language (/ga/, docs/decisions.md 16),
 * those in the navigation first and in its order. `index` is /ga/ itself.
 */
export async function gaPages(locale: Locale): Promise<GaPage[]> {
  // The loader names a folder's index by the folder: "en" is en/index.md.
  const place = (id: string) => (isLocale(id) ? { locale: id, slug: "" } : placeOf(id));
  return (await getCollection("ga"))
    .filter((entry) => place(entry.id).locale === locale)
    .sort((a, b) => (a.data.nav ?? Infinity) - (b.data.nav ?? Infinity))
    .map((entry) => {
      const { slug } = place(entry.id);
      return {
        slug,
        path: pathOf(locale, slug === "" ? "ga" : `ga/${slug}`),
        label: entry.data.label ?? entry.data.title,
        entry,
      };
    });
}

/**
 * The legal texts as the legal page lists them: one item per text, with the
 * languages it exists in. The title and the description are those of the
 * reader's language where the text has it, of the binding one otherwise.
 */
export async function legalShelf(locale: Locale): Promise<
  {
    slug: string;
    title: string;
    description: string;
    status: LegalText["data"]["status"];
    versions: { language: TextLanguage; href: string; binding: boolean }[];
  }[]
> {
  const texts = await allLegal();
  const slugs = [...new Set(texts.map((text) => writtenIn(text.id).slug))];
  return slugs.map((slug) => {
    const versions = texts.filter((text) => writtenIn(text.id).slug === slug);
    const languages = versions.map((text) => writtenIn(text.id).language);
    const own = versions.find((text) => writtenIn(text.id).language === locale);
    const other = versions.find((text) => text.data.binding) ?? versions[0];
    const shown = own ?? other;
    if (!shown) throw new Error(`no version of ${slug}`);
    // In a language the text does not exist in, the page names it in the
    // reader's language where the text says how, and in its own otherwise.
    const named = own?.data ?? shown.data.listing?.[locale] ?? shown.data;
    return {
      slug,
      title: named.title,
      description: named.description,
      status: shown.data.status,
      versions: TEXT_LANGUAGES.flatMap((language) => {
        const version = versions.find((text) => writtenIn(text.id).language === language);
        const href = version ? textPath(language, locale, slug, languages) : null;
        return version && href ? [{ language, href, binding: version.data.binding }] : [];
      }),
    };
  });
}

const bodyOf = (entry: { id: string; body?: string }): string => {
  if (entry.body === undefined) throw new Error(`${entry.id} has no body`);
  return entry.body;
};

/**
 * Every text a person agrees to in the app, in each language it is written
 * in, with its version: the terms and the privacy policy, and the consents
 * the privacy page carries (src/lib/consent.ts).
 */
export async function wordings(): Promise<Wording[]> {
  const texts = (await allLegal()).flatMap((text): Wording[] => {
    const { language, slug } = writtenIn(text.id);
    if (!isConsentKind(slug)) return [];
    const { consent_version: version, dated, title, status, binding } = text.data;
    const standing = { status, binding };
    return [{ kind: slug, language, version, dated, title, standing, body: bodyOf(text) }];
  });
  const consents = (await getCollection("consents")).flatMap((entry): Wording[] => {
    const { language, slug } = writtenIn(entry.id);
    if (!isConsentKind(slug)) throw new Error(`consent "${entry.id}" is not a kind of the app's`);
    const { consent_version: version, dated, title } = entry.data;
    return [{ kind: slug, language, version, dated, title, body: bodyOf(entry) }];
  });
  return [...texts, ...consents];
}

/** One kept earlier version (src/content/earlier), as the page shows it and the build checks it. */
export type EarlierText = Wording & { version: string; html: string };

/** "en/privacy/2026-09-draft-1": the language, the kind and the version of a kept text. */
function keptAt(id: string): { language: TextLanguage; kind: ConsentKind; version: string } {
  const [language, kind, version, ...rest] = id.split("/");
  if (!language || !kind || !version || rest.length > 0 || !isTextLanguage(language)) {
    throw new Error(`kept text "${id}" is not at <language>/<kind>/<version>.md`);
  }
  if (!isConsentKind(kind)) throw new Error(`kept text "${id}" is not of a kind of the app's`);
  return { language, kind, version };
}

/**
 * Every kept earlier version of the texts a person agrees to (docs/decisions.md,
 * 14), newest first, each with its rendered text. The file's name is its
 * version, and its own consent_version says the same.
 */
export async function earlierTexts(): Promise<EarlierText[]> {
  const entries = await getCollection("earlier");
  return entries
    .map((entry): EarlierText => {
      const { language, kind, version } = keptAt(entry.id);
      const { consent_version, dated, title, status, binding } = entry.data;
      if (consent_version !== version) {
        throw new Error(`kept text "${entry.id}" says it is ${consent_version}`);
      }
      if (entry.rendered === undefined) throw new Error(`${entry.id} was not rendered`);
      return {
        kind,
        language,
        version,
        dated,
        title,
        ...(status !== undefined && binding !== undefined ? { standing: { status, binding } } : {}),
        body: bodyOf(entry),
        html: entry.rendered.html,
      };
    })
    .sort((a, b) => b.dated.getTime() - a.dated.getTime());
}

/**
 * The consents a legal text carries besides its own (the research opt-in and
 * the sensitive answers, on the privacy page), each in every language it is
 * written in, Finnish first, with its version and the day of its wording.
 * The title is the reader's language's where the wording has it.
 */
export async function consentsOn(
  locale: Locale,
  slug: string,
): Promise<
  {
    kind: ConsentKind;
    title: string;
    version: string;
    dated: Date;
    wordings: { language: TextLanguage; title: string; html: string }[];
  }[]
> {
  const entries = await getCollection("consents");
  return CONSENT_KINDS.filter((kind) => TEXT_OF[kind] === slug && kind !== slug).flatMap((kind) => {
    const own = byLanguage(
      entries
        .filter((entry) => writtenIn(entry.id).slug === kind)
        .map((entry) => ({ ...entry, language: writtenIn(entry.id).language })),
    );
    const first = own[0];
    if (!first) return [];
    const named = own.find((entry) => entry.language === locale) ?? first;
    return [
      {
        kind,
        title: named.data.title,
        version: first.data.consent_version,
        dated: first.data.dated,
        wordings: own.map((entry) => {
          if (entry.rendered === undefined) throw new Error(`${entry.id} was not rendered`);
          return { language: entry.language, title: entry.data.title, html: entry.rendered.html };
        }),
      },
    ];
  });
}
