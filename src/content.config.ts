import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { LOCALES } from "./i18n/locales.ts";
import { CONSENT_VERSION } from "./lib/consent.ts";

// Three kinds of text, all Markdown, one folder per language:
//
//   src/content/pages/<language>/<slug>.md     what the site says about Kuutti
//   src/content/legal/<language>/<slug>.md     what binds: bylaws, terms, privacy
//   src/content/consents/<language>/<kind>.md  a consent the app asks apart, read
//                                              on the privacy page (lib/consent.ts)
//   src/content/earlier/<language>/<kind>/<version>.md
//                                              a version people agreed to, kept as
//                                              it was once a newer one replaced it
//
// A page exists in every language of the site (src/i18n/locales.ts). A legal
// text exists in the languages it was written in by people, and in no other:
// it is never translated by a machine (the app's rule for its consent texts,
// and this site's).

/**
 * A version as the app names it, and as an anchor of the page carries it:
 * `"2026-09-draft-1"`, quoted, since YAML reads `2026-11-1` as a day.
 */
const consentVersion = z
  .string({ error: 'consent_version is quoted ("2026-11-1"): unquoted, YAML may read it as a day' })
  .regex(
    CONSENT_VERSION,
    "consent_version is lower-case letters, digits, dots and hyphens, not digits alone",
  );

/** A text's name and one-line description, as a list shows it. */
const listed = z.object({ title: z.string().min(1), description: z.string().min(1).max(200) });

const pages = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string().min(1),
    /** One or two sentences: the page's description for search engines and the home page's card. */
    description: z.string().min(1).max(200),
    /**
     * Where the page stands in the navigation, which leads to it as a section
     * of the home page (docs/decisions.md, 22); a page without it is reached
     * by links only.
     */
    nav: z.number().int().positive().optional(),
    /**
     * Written or translated by a machine, an agent included, and not yet read
     * by a native speaker. Every Finnish and Swedish page carries either this
     * or `reviewedBy`; scripts/check-content.ts holds that.
     */
    machine: z.boolean().default(false),
    /** Who read the text as a native speaker, and when (their name as they want it shown in git). */
    reviewedBy: z.string().optional(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    /** The order on the legal page. */
    order: z.number().int().positive(),
    /**
     * A draft binds nobody and says so on the page; a filed text is adopted
     * and waits for the register (the bylaws, until the association is
     * registered); a text in force names its version.
     */
    status: z.enum(["draft", "filed", "in_force"]),
    /**
     * The version a person agrees to in the app, by the app's name
     * (consent_version there): every text of a kind the app records carries
     * it, and the build holds its Finnish body, or a draft's, to the row of
     * src/consent-versions.ts (kuutti-ry/kuutti-app#208).
     */
    consent_version: consentVersion.optional(),
    /** The day a text was entered in a public register: the bylaws, in the Register of Associations. */
    registered: z.coerce.date().optional(),
    /** The day of the wording, as written in the text's source. */
    dated: z.coerce.date(),
    /** Whether the page names the association's business ID under the title: the bylaws do. */
    businessId: z.boolean().default(false),
    /** Whether this language is the one that counts when two disagree. */
    binding: z.boolean(),
    /**
     * How the legal page of another language names this text while the text
     * does not exist in that language. Names of a text, not the text: they
     * are the site's own words and may be a machine's.
     */
    listing: z
      .object(Object.fromEntries(LOCALES.map((locale) => [locale, listed.optional()])))
      .strict()
      .optional(),
  }),
});

/**
 * The research opt-in and the sensitive answers: the app asks for each apart,
 * and its wording is read on the privacy page. The body is the wording as the
 * app has it (legal.<kind>.summary in the app's messages.yaml), in the
 * languages it is written in, never translated.
 */
const consents = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/consents" }),
  schema: z.object({
    /** The wording's heading, as the app has it (legal.<kind>.title there), pinned with the body. */
    title: z.string().min(1),
    consent_version: consentVersion,
    /** The day of the wording: when the app's text took this form. */
    dated: z.coerce.date(),
  }),
});

/**
 * A version of a text a person agrees to in the app, kept once a newer one
 * replaced it (docs/decisions.md, 14): the file as it was when that version
 * was the newest, copied whole, never edited. People agreed to it, and the
 * app's builds in their hands link to its anchor until they are updated, so
 * its page keeps it, and the build holds it to its row of
 * src/consent-versions.ts as it held it then. The folder is the language and
 * the kind, the file the version.
 */
const earlier = defineCollection({
  loader: glob({ pattern: "*/*/*.md", base: "./src/content/earlier" }),
  schema: z.object({
    title: z.string().min(1),
    consent_version: consentVersion,
    dated: z.coerce.date(),
    /** A legal text of its own (the terms, the privacy policy): as its standing was; absent for a consent. */
    status: z.enum(["draft", "filed", "in_force"]).optional(),
    binding: z.boolean().optional(),
  }),
});

/**
 * Gaiane's structure of the site, beside it at /ga/ (docs/decisions.md, 16).
 * `index` is its home page. A paragraph that says only `@reuse /app/#research`
 * shows that part of the site's own page (src/lib/reuse.ts), so that a text
 * has one copy.
 */
const ga = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/ga" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    /** The page's name in the navigation and the breadcrumbs, where it is shorter than the title. */
    label: z.string().min(1).optional(),
    /** Where the page stands in the navigation; a page without it is reached by links only. */
    nav: z.number().int().positive().optional(),
  }),
});

export const collections = { pages, legal, consents, earlier, ga };
