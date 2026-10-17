import { createHash } from "node:crypto";
import { DEFAULT_LOCALE, pathOf, TEXT_LANGUAGES, type TextLanguage } from "../i18n/locales.ts";

/**
 * One version per kind, two renderings (kuutti-ry/kuutti-app#208): the app
 * shows a summary of each text a person agrees to and records its version;
 * the site holds the full text under the same version. Each repository pins
 * its own text to the version by a fingerprint, and the two agree through
 * /legal/versions.json, which the build writes from this module.
 *
 * Nothing here reads the content layer, so that the scripts and the tests
 * run it under plain Node.
 */

/** The kinds of consent the app records, by the app's names (CONSENT_VERSIONS there). */
export const CONSENT_KINDS = ["terms", "privacy", "research", "special_category"] as const;
export type ConsentKind = (typeof CONSENT_KINDS)[number];

export const isConsentKind = (value: string): value is ConsentKind =>
  (CONSENT_KINDS as readonly string[]).includes(value);

/**
 * The legal text each kind is read in. The terms and the privacy policy are
 * texts of their own; the research opt-in and the sensitive answers, which
 * the app asks apart, are read on the privacy page (src/content/consents).
 */
export const TEXT_OF: Readonly<Record<ConsentKind, string>> = {
  terms: "terms",
  privacy: "privacy",
  research: "privacy",
  special_category: "privacy",
};

/**
 * A version as the app names it and as an anchor carries it: lower-case
 * letters, digits, dots and hyphens, not digits alone. JavaScript lists an
 * all-digit key before every other, whatever its place, so a row named
 * `20261101` would not be the newest of src/consent-versions.ts even at its end.
 */
export const CONSENT_VERSION = /^(?=[0-9a-z.-]*[a-z.-])[0-9a-z][0-9a-z.-]*$/;

/** The anchor of a kind's version on its page, which the app links to: `research-2026-09-draft-1`. */
export const anchorOf = (kind: ConsentKind, version: string): string => `${kind}-${version}`;

const normal = (text: string): string => text.replace(/\r\n?/g, "\n").trim();

/**
 * The first 16 hex digits of the SHA-256 of a text, with LF line ends and
 * without blank lines at either end: the app's digest format
 * (CONSENT_TEXT_HASHES there), over another input, so the two values are not
 * comparable.
 */
export function fingerprint(text: string): string {
  return createHash("sha256").update(normal(text), "utf8").digest("hex").slice(0, 16);
}

/** One language of one kind's text, as the content holds it. */
export type Wording = {
  kind: ConsentKind;
  language: TextLanguage;
  version: string | undefined;
  dated: Date;
  /** The heading: the text's title, or the consent's as the page shows it in its wording. */
  title: string;
  body: string;
  /** A legal text of its own (the terms, the privacy policy): its status, and whether this language binds. */
  standing?: { status: string; binding: boolean };
};

/**
 * What a version is pinned to: the heading, a legal text's status and whether
 * it binds, and the body, so that none of them changes under a version people
 * agreed to (a draft that comes into force is a new version too). A consent's
 * is `# <title>`, a blank line and the body: for the research opt-in and the
 * sensitive answers, the app's legal.<kind>.title and summary, whose Finnish
 * the app's `pnpm check:legal-versions` fingerprints the same way and holds
 * to the hash /legal/versions.json publishes.
 */
export function pinnedText(wording: Pick<Wording, "title" | "body" | "standing">): string {
  const standing = wording.standing
    ? [`status: ${wording.standing.status}, binding: ${wording.standing.binding}`]
    : [];
  return [`# ${normal(wording.title)}`, ...standing, "", normal(wording.body)].join("\n");
}

/** The fingerprint a kind's row pins: of `pinnedText`. */
export const fingerprintOf = (wording: Pick<Wording, "title" | "body" | "standing">): string =>
  fingerprint(pinnedText(wording));

/**
 * Every version of each kind the site has published, oldest first, with the
 * fingerprint of the text it was published with (src/consent-versions.ts).
 */
export type Pinned = Readonly<Record<ConsentKind, Readonly<Record<string, string>>>>;

/**
 * The text a kind's version is pinned to: the Finnish one, which binds; until
 * it is written, a draft's one language (the English drafts of the terms and
 * the privacy policy). Null when there is no telling which.
 */
export function countedWording(wordings: readonly Wording[]): Wording | null {
  const finnish = wordings.find((wording) => wording.language === "fi");
  if (finnish) return finnish;
  return wordings.length === 1 ? (wordings[0] ?? null) : null;
}

/**
 * What keeps the content from being published under its versions: a kind
 * without a text, a text without a version or with two, a version without
 * its row, and a text whose fingerprint moved without its version.
 */
export function pinProblems(wordings: readonly Wording[], pinned: Pinned): string[] {
  const problems: string[] = [];
  for (const kind of CONSENT_KINDS) {
    const own = wordings.filter((wording) => wording.kind === kind);
    if (own.length === 0) {
      problems.push(`${kind}: no text on the site`);
      continue;
    }
    const versions = new Set(own.map((wording) => wording.version));
    const [version] = versions;
    if (versions.size > 1) {
      problems.push(`${kind}: one consent_version in one language and another in another`);
      continue;
    }
    if (version === undefined) {
      problems.push(`${kind}: no consent_version`);
      continue;
    }
    const counted = countedWording(own);
    if (counted === null) {
      problems.push(`${kind}: no Finnish text, and more than one other; which one binds?`);
      continue;
    }
    const hash = fingerprintOf(counted);
    const rows = pinned[kind];
    const newest = Object.keys(rows).at(-1);
    const row = `"${version}": "${hash}"`;
    if (!Object.hasOwn(rows, version)) {
      // A new version of the same text is right when only the app's summary
      // changed; when the text was meant to change too, the unchanged
      // fingerprint is the sign that it did not.
      const unchanged =
        newest !== undefined && rows[newest] === hash
          ? `. Its text is ${newest}'s, unchanged: if the text was to change, change it first`
          : "";
      problems.push(
        `${kind}: version ${version} has no row; add ${row} at the end of ${kind} in src/consent-versions.ts${unchanged}`,
      );
    } else if (version !== newest) {
      problems.push(
        `${kind}: version ${version} is not the newest row (${newest}); a new version is added at the end`,
      );
    } else if (rows[version] !== hash) {
      problems.push(
        `${kind}: the ${counted.language} text of version ${version} changed (${rows[version]}, now ${hash}). ` +
          `A changed text is a new version, and the app asks everybody again: give it a new consent_version ` +
          `and add its row at the end of ${kind} in src/consent-versions.ts, or put the text back`,
      );
    }
  }
  return problems;
}

/**
 * src/consent-versions.ts against the base branch's: a row is added at the
 * end and never changed or removed, so every row of the base is in the head,
 * in its place, with its fingerprint. A kind the base has no table for, or no
 * base table at all (before the pin began), holds nothing.
 */
export function historyProblems(base: Partial<Pinned>, head: Pinned): string[] {
  const problems: string[] = [];
  for (const kind of CONSENT_KINDS) {
    const after = Object.keys(head[kind]);
    Object.entries(base[kind] ?? {}).forEach(([version, hash], place) => {
      if (!Object.hasOwn(head[kind], version)) {
        problems.push(`${kind}: the row of ${version} is gone; a row is never removed`);
      } else if (head[kind][version] !== hash) {
        problems.push(
          `${kind}: the row of ${version} changed (${hash}, now ${head[kind][version]}); a row is ` +
            "never changed: people agreed to the text it pins. A changed text is a new version, " +
            "with a row of its own at the end",
        );
      } else if (after[place] !== version) {
        problems.push(`${kind}: the row of ${version} moved; a new row is added at the end`);
      }
    });
  }
  return problems;
}

/** What /legal/versions.json says about one kind. */
export type PublishedVersion = {
  /** The version a consent in the app must name, as the app's CONSENT_VERSIONS names it. */
  version: string;
  /** The fingerprint of the text the version is pinned to (`fingerprintOf`). */
  hash: string;
  /** The language of that text: Finnish, or a draft's own while its Finnish is not written. */
  language: TextLanguage;
  /** Where the text is read, at the anchor of its version. */
  url: string;
  /** The day of the wording, as the text gives it. */
  dated: string;
};
export type VersionsDocument = Record<ConsentKind, PublishedVersion>;

/**
 * /legal/versions.json: per kind, the version, its fingerprint, the page and
 * the day. Throws what `pinProblems` finds, so the build fails rather than
 * publish a text under a version it was not pinned to.
 */
export function versionsDocument(
  wordings: readonly Wording[],
  pinned: Pinned,
  origin: URL,
): VersionsDocument {
  const problems = pinProblems(wordings, pinned);
  if (problems.length > 0)
    throw new Error(`the legal texts and their versions:\n${problems.join("\n")}`);
  const entry = (kind: ConsentKind): PublishedVersion => {
    const counted = countedWording(wordings.filter((wording) => wording.kind === kind));
    if (counted?.version === undefined) throw new Error(`${kind}: no text`);
    const path = pathOf(DEFAULT_LOCALE, `legal/${TEXT_OF[kind]}`);
    return {
      version: counted.version,
      hash: fingerprintOf(counted),
      language: counted.language,
      url: new URL(`${path}#${anchorOf(kind, counted.version)}`, origin).href,
      dated: counted.dated.toISOString().slice(0, 10),
    };
  };
  return Object.fromEntries(CONSENT_KINDS.map((kind) => [kind, entry(kind)])) as VersionsDocument;
}

// --- The mirror: the app's versions against the site's -------------------

/**
 * The app's generated consent module on main: CONSENT_VERSIONS there is what
 * the app's build holds its wordings to (`pnpm i18n:build`, ADR-010 §4).
 */
export const APP_VERSIONS_URL =
  "https://raw.githubusercontent.com/kuutti-ry/kuutti-app/main/packages/i18n/src/generated/consent.ts";

/**
 * CONSENT_VERSIONS out of the app's generated consent.ts. Its keys and values
 * are written with JSON.stringify, so the object is JSON but for its last
 * comma. Throws when the file has another shape: the check is then to be
 * fixed, not passed. The app's src/consent.test.ts runs this same reading
 * over its generated module, so a change of the app's generator fails the
 * app's CI first, and this reader changes with it.
 */
export function appVersionsFrom(source: string): Record<string, string> {
  const block = /export const CONSENT_VERSIONS\b[^=]*=\s*\{([^}]*)\};/.exec(source);
  if (!block) throw new Error("the app's consent.ts has no CONSENT_VERSIONS object");
  let parsed: unknown;
  try {
    parsed = JSON.parse(`{${(block[1] ?? "").trim().replace(/,$/, "")}}`);
  } catch {
    throw new Error("the app's CONSENT_VERSIONS is not what its generator writes");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("the app's CONSENT_VERSIONS is not an object");
  }
  const versions: Record<string, string> = {};
  for (const [kind, version] of Object.entries(parsed)) {
    if (typeof version !== "string" || version === "") {
      throw new Error(`the app's CONSENT_VERSIONS gives ${kind} no version`);
    }
    versions[kind] = version;
  }
  return versions;
}

const TRIES = 3;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The app's CONSENT_VERSIONS as it is on main, fetched from GitHub: three
 * tries, five and then ten seconds apart, when the network fails or GitHub
 * answers 5xx, so a blip does not fail the check. Any other answer but a 2xx
 * fails at once, and so does the third failure: nothing passes unread.
 */
export async function fetchAppVersions(
  fetchImpl: typeof fetch = fetch,
  url: string = APP_VERSIONS_URL,
  pause: (ms: number) => Promise<void> = wait,
): Promise<Record<string, string>> {
  for (let attempt = 1; ; attempt++) {
    let response: Response;
    try {
      response = await fetchImpl(url, { signal: AbortSignal.timeout(20_000) });
    } catch (error) {
      if (attempt >= TRIES) throw error;
      await pause(attempt * 5_000);
      continue;
    }
    if (response.status >= 500 && attempt < TRIES) {
      await pause(attempt * 5_000);
      continue;
    }
    if (!response.ok) throw new Error(`${url} answered ${response.status}`);
    return appVersionsFrom(await response.text());
  }
}

/**
 * The site's versions against the app's. The site leads, since its Finnish
 * text is the one that binds: the app may still be at an earlier version of
 * the site's while its pull request follows a new text (`behind`), and the
 * app's own CI fails until it does. A version the site never published, a
 * kind one side lacks, are problems.
 */
export function mirror(
  pinned: Pinned,
  app: Readonly<Record<string, string>>,
): { problems: string[]; behind: string[] } {
  const problems: string[] = [];
  const behind: string[] = [];
  for (const kind of CONSENT_KINDS) {
    const rows = Object.keys(pinned[kind]);
    const site = rows.at(-1);
    const theirs = app[kind];
    if (theirs === undefined) {
      problems.push(`${kind}: the app has no version (the site is at ${site})`);
    } else if (theirs !== site && rows.includes(theirs)) {
      behind.push(
        `${kind}: the app is at ${theirs}, an earlier version of the site's; it follows with ${site}`,
      );
    } else if (theirs !== site) {
      problems.push(
        `${kind}: the app is at ${theirs}, a version the site never published (the site is at ${site}). ` +
          "The site's text and its version come first; the app follows",
      );
    }
  }
  for (const kind of Object.keys(app)) {
    if (!isConsentKind(kind))
      problems.push(`${kind}: a kind of the app's that the site does not know`);
  }
  return { problems, behind };
}

/** Texts in the order of TEXT_LANGUAGES, the order a page shows them in: Finnish first. */
export const byLanguage = <T extends { language: TextLanguage }>(items: readonly T[]): T[] =>
  [...items].sort(
    (a, b) => TEXT_LANGUAGES.indexOf(a.language) - TEXT_LANGUAGES.indexOf(b.language),
  );
