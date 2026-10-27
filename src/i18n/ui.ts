import type { Locale, TextLanguage } from "./locales.ts";

/**
 * The words of the site's own furniture: navigation, notices, the home page,
 * the footer. English is the source and, for now, the only language
 * (docs/decisions.md, 8). A language that comes back has every key here,
 * and the test holds that none is missing.
 */
export const UI = {
  en: {
    "site.name": "Kuutti",
    skip: "Skip to the content",
    "nav.label": "Pages",
    "nav.menu": "Menu",
    "home.soon": "Not in the stores yet.",
    "home.description":
      "A free app for meeting people in Finland, made by Kuutti ry, a non-profit association.",
    "home.what":
      "No ads, nothing to pay for, and no sale of anybody's data: the association's bylaws forbid them. Every account is one real adult, identified through a Finnish bank.",
    "home.source": "The development is public:",
    "home.ideas": "Anybody can propose a feature, and help build it:",
    "home.propose": "open a proposal on GitHub",
    "store.label": "Kuutti in the app stores",
    "store.apple": "Download on the App Store",
    "store.google": "Get it on Google Play",
    "store.soon": "{store}: coming soon",
    "legal.title": "Legal and privacy",
    "legal.description":
      "The association's bylaws, the terms of use of the app, and how personal data is handled.",
    "legal.intro":
      "The texts that bind the association and the people who use Kuutti. A text is shown in the languages it was written in; a legal text is never translated by a machine.",
    "legal.language": "in {language}",
    "legal.draft": "Draft",
    "legal.filed": "Filed for registration",
    "legal.inForce": "In force",
    "notice.draft.title": "This is a draft",
    "notice.draft.body":
      "It is published so that it can be read and commented on. It binds nobody yet, and it may still change.",
    "notice.filed.title": "Adopted, not yet registered",
    "notice.filed.body":
      "The founding members have adopted this text, and it has been filed with the Register of Associations. Until the association is registered, the register may still ask for changes.",
    "notice.notBinding.title": "The Finnish text is the one that counts",
    "notice.notBinding.body":
      "This version is for reading. If it and the Finnish text disagree, the Finnish text holds.",
    "notice.machine.title": "Translated by a machine",
    "notice.machine.body":
      "This page has not yet been read by a native speaker. If something reads wrong, the English page is the source.",
    "consents.title": "The consents asked for in the app",
    "consents.intro":
      "Besides the terms of use and this text, the app asks for two consents, each with a yes and a version of its own. Their wording is given here as the app has it, in the languages it is written in.",
    "consents.wording": "The wording {language}:",
    "consents.counts": "The wording {language}, the one that counts:",
    "doc.dated": "Wording of {date}",
    "doc.version": "Version {version}",
    "doc.draftVersion": "Draft version {version}",
    "doc.registered": "Registered {date}",
    "earlier.title": "Earlier versions",
    "earlier.intro":
      "Whoever agreed to an earlier version in the app agreed to its text as it stood then. Each is kept here, as it was, under its version.",
    "doc.businessId": "Business ID {businessId}",
    "footer.address": "Kuutti ry, {address}, Finland.",
    "footer.businessId": "Business ID {businessId}.",
    "footer.channels": "Kuutti ry elsewhere",
    "footer.channel": "Kuutti ry on {name}",
    "notFound.title": "There is no such page",
    "notFound.body": "The address may be old or mistyped.",
    "notFound.home": "To the home page",
    // Gaiane's structure, at /ga/ (docs/decisions.md, 16).
    "ga.menu": "Menu",
    "ga.download": "Download",
    "ga.language": "Language",
    "ga.languageSoon": "coming later",
    "ga.crumbs": "Where you are",
    "ga.newTab": "opens in a new tab",
    "ga.footer.name": "Kuutti ry",
    "ga.footer.legal": "Legal",
    "ga.footer.register": "Kuutti ry in the business register",
    "ga.footer.contact": "Contact",
    "ga.footer.write": "Get in touch",
    "ga.footer.noEmail": "An e-mail address will be here before the app opens.",
    "ga.footer.pages": "Pages",
    "ga.footer.source": "Kuutti's source code",
    "ga.qr.title": "On a computer?",
    "ga.qr.body": "Scan the code with your phone's camera to open this page there.",
    "ga.qr.alt": "QR code of the address kuutti.app/ga/download/",
    // The pond demo, at /ga/pond/ (docs/decisions.md, 17). Its script reads them from the page.
    "pond.label": "The seal pup's pond. Tap the water or a fish to play.",
    "pond.tilt": "Tilt",
    "pond.phone": "Use the phone's tilt",
    "pond.phoneOn": "Tilt is on",
    "pond.start": "Start a 30 second round",
    "pond.restart": "Restart the round",
    "pond.again": "Play again",
    "pond.left": "Seconds left",
    "pond.caught": "Fish caught",
    "pond.free": "Free play. Tap a fish any time.",
    "pond.running": "Round running. Fish get faster with every catch.",
    "pond.over": "Round over. You caught {score} fish.",
    "pond.tiltHint": "Tilt the phone left and right.",
    "pond.noTilt": "This browser gives no tilt. The slider works.",
    "pond.tiltRefused": "Tilt was not allowed. The slider works.",
    "pond.colours": "Colours, to try on the spot:",
    "pond.colour.water": "Water",
    "pond.colour.line": "Surface line",
    "pond.colour.airHead": "Pup above, head",
    "pond.colour.airBody": "Pup above, body",
    "pond.colour.waterHead": "Pup below, head",
    "pond.colour.waterBody": "Pup below, body",
    "pond.colour.fish": "Fish",
    "pond.noScript": "The pond needs JavaScript, and this browser runs none here.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof UI)["en"];

/** How the legal page names a text's status. */
export const STATUS_KEY = {
  draft: "legal.draft",
  filed: "legal.filed",
  in_force: "legal.inForce",
} as const satisfies Record<string, UiKey>;

/** The site's words in a language; `{name}` in a text is replaced from `values`. */
export function t(locale: Locale, key: UiKey, values: Record<string, string> = {}): string {
  const text: string = UI[locale][key];
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole);
}

/** The language of a legal text, named in the reader's language: "in Finnish". */
export const LANGUAGE_IN: Record<Locale, Record<TextLanguage, string>> = {
  en: { fi: "in Finnish", sv: "in Swedish", en: "in English" },
};

/** Each language in its own words, as a language menu names it. */
export const LANGUAGE_NAME: Record<TextLanguage, string> = {
  fi: "Suomi",
  sv: "Svenska",
  en: "English",
};

/** Dates as Finland writes them, in every language (the app's rule: en-FI). */
const INTL: Record<Locale, string> = { en: "en-FI" };
export const formatDate = (locale: Locale, date: Date): string =>
  new Intl.DateTimeFormat(INTL[locale], { dateStyle: "long", timeZone: "Europe/Helsinki" }).format(
    date,
  );
