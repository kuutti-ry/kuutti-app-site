import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { DEFAULT_LOCALE, isLocale, LOCALES, pathOf } from "../src/i18n/locales.ts";
import { formatDate, LANGUAGE_IN, t, UI } from "../src/i18n/ui.ts";
import { MARKS } from "../src/lib/marks.ts";
import { SCRIPTED, SITE } from "../src/site.ts";

test("the default language has no prefix, another has its own, and every path ends with a slash", () => {
  assert.equal(pathOf(DEFAULT_LOCALE, ""), "/");
  assert.equal(pathOf(DEFAULT_LOCALE, "legal/privacy"), "/legal/privacy/");
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    assert.equal(pathOf(locale, ""), `/${locale}/`);
    assert.equal(pathOf(locale, "about"), `/${locale}/about/`);
  }
});

test("a language is one of the site's and nothing else", () => {
  for (const locale of LOCALES) assert.equal(isLocale(locale), true);
  for (const other of ["", "EN", "en-FI", "fi", "sv", "de", "legal"]) {
    assert.equal(isLocale(other), false);
  }
});

test("every language has every one of the site's words, and no other", () => {
  const keys = Object.keys(UI.en).sort();
  for (const locale of LOCALES) {
    assert.deepEqual(Object.keys(UI[locale]).sort(), keys, locale);
    for (const [key, text] of Object.entries(UI[locale])) {
      assert.notEqual(text.trim(), "", `${locale} ${key}`);
    }
  }
});

test("a translation names the same values as the English", () => {
  const names = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const locale of LOCALES) {
    for (const [key, text] of Object.entries(UI[locale])) {
      assert.deepEqual(names(text), names(UI.en[key as keyof typeof UI.en]), `${locale} ${key}`);
    }
  }
});

test("values are put into the text, and a value that is missing is left to be seen", () => {
  assert.equal(t("en", "doc.version", { version: "2026-09" }), "Version 2026-09");
  assert.equal(t("en", "doc.version"), "Version {version}");
});

test("dates are written as Finland writes them", () => {
  const day = new Date("2026-09-25T00:00:00Z");
  assert.equal(formatDate("en", day), "25 September 2026");
});

test("each language names each language", () => {
  for (const reader of LOCALES) {
    for (const text of LOCALES) assert.notEqual(LANGUAGE_IN[reader][text], "");
  }
});

test("every channel of the association is an https address with a mark the footer draws", () => {
  for (const channel of SITE.social) {
    assert.match(channel.href, /^https:\/\//);
    assert.ok(Object.hasOwn(MARKS, channel.mark));
  }
});

test("the home page says what Kuutti is, and the footer names the association as the register does", () => {
  assert.equal(
    t("en", "home.description"),
    "A free app for meeting people in Finland, made by Kuutti ry, a non-profit association.",
  );
  assert.equal(t("en", "home.soon"), "Not in the stores yet.");
  assert.equal(
    t("en", "footer.line", { address: SITE.postalAddress, businessId: SITE.businessId }),
    "Kuutti ry, Tontunmäentie 22\u00a0E, 02200\u00a0Espoo, Finland. Business ID 3659478-7.",
  );
});

test("the content security policy lets nothing run but the files of SCRIPTED, each named in full", () => {
  const headers = readFileSync(join(import.meta.dirname, "..", "customHttp.yml"), "utf8");
  const policies = [...headers.matchAll(/key: Content-Security-Policy\s+value: "([^"]*)"/g)];
  assert.equal(policies.length, 1, "one policy for every address");
  const directives = new Map(
    (policies[0]?.[1] ?? "").split(";").map((directive) => {
      const [name = "", ...sources] = directive.trim().split(/\s+/);
      return [name, sources];
    }),
  );
  assert.deepEqual(directives.get("default-src"), ["'none'"]);
  assert.deepEqual(
    directives.get("script-src")?.toSorted(),
    Object.values(SCRIPTED)
      .map((file) => `https://kuutti.app${file}`)
      .toSorted(),
  );
  for (const [page, file] of Object.entries(SCRIPTED)) {
    assert.match(page, /^\/.*\/$/, `${page} is a page's address`);
    assert.match(file, /^\/[\w/-]+\.js$/, `${file} is a file of the site`);
  }
});
