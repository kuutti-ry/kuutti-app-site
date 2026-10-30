import type { Mark } from "./lib/marks.ts";

/**
 * What the site knows about the association and its channels. A value that is
 * not decided yet is null, and the page says that it is coming: nothing here
 * is a placeholder that looks like the real thing.
 */
export const SITE = {
  /**
   * The association's business ID (Y-tunnus), given by the Finnish Patent and
   * Registration Office when the notice of founding was filed on 01/10/2026.
   */
  businessId: "3659478-7",
  /**
   * The association's postal address as the Register of Associations has it
   * (PRH's extract of 06/10/2026). In the footer since 23/10/2026, when
   * Google for Nonprofits asked for a street address (docs/decisions.md, 15).
   * No-break spaces keep the house letter and the postcode with their numbers.
   */
  postalAddress: "Tontunmäentie 22\u00a0E, 02200\u00a0Espoo",
  /**
   * The same address as forms and parsers often have it: the house letter
   * against the number, and plain spaces. The footer, About Us and Contact
   * give both, each on a line of its own, so a check that compares the text
   * finds either (the maintainer's word of 27/10/2026, docs/decisions.md, 19).
   */
  postalAddressJoined: "Tontunmäentie 22E, 02200 Espoo",
  /** Where the app's source is published (AGPL-3.0). */
  appSource: "https://github.com/kuutti-ry/kuutti-app",
  /**
   * Where anybody proposes a feature: the app repository's Proposal form, open
   * to every GitHub account (the maintainer's word of 27/10/2026).
   */
  proposals: "https://github.com/kuutti-ry/kuutti-app/issues/new?template=proposal.yml",
  /** Where this site's source is published (AGPL-3.0). */
  siteSource: "https://github.com/kuutti-ry/kuutti-app-site" as string | null,
  /**
   * The address people write to, the only one on the site: a user of the
   * association's Google Workspace since 30/10/2026, not an alias, because
   * Google for Nonprofits checks that every address on the site is a user
   * (docs/decisions.md, 19 and 22).
   */
  contactEmail: "hello@kuutti.app" as string | null,
  /** The association's channels, as full addresses; the footer links to each by its mark. */
  social: [
    { name: "LinkedIn", href: "https://www.linkedin.com/company/145260967/", mark: "linkedin" },
    { name: "GitHub", href: "https://github.com/kuutti-ry", mark: "github" },
    { name: "TikTok", href: "https://www.tiktok.com/@kuutti_ry", mark: "tiktok" },
    { name: "Instagram", href: "https://www.instagram.com/kuutti_ry/", mark: "instagram" },
  ] as { name: string; href: string; mark: Mark }[],
  /**
   * The app's listings in the stores. Null until the app is published: the
   * download page of Gaiane's structure then shows that store's badge dimmed,
   * not as a link (src/components/StoreBadges.astro). The home page shows no
   * badge until there is a listing (docs/decisions.md, 19).
   */
  stores: { apple: null as string | null, google: null as string | null },
} as const;

/**
 * The pages that run a script, by their address, each with the one file it
 * runs: the pond demo alone, on the maintainer's word of 24/10/2026
 * (docs/decisions.md, 17). The content security policy (customHttp.yml)
 * allows these files and nothing else, and scripts/check-site.ts holds that
 * no other page has a script.
 */
export const SCRIPTED: Readonly<Record<string, string>> = { "/ga/pond/": "/ga/pond/pond.js" };
