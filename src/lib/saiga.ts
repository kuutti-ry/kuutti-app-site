/**
 * Saiga, Kuutti's typeface, by Spoke Type, licensed to Kuutti ry by e-mail on
 * 20-21/10/2026 for Kuutti's own media, the website among them
 * (docs/decisions.md, 18). Its files are never in this repository, which is
 * public, nor in any of its builds on GitHub: the maintainer promised Spoke
 * to keep them out. Amplify's build fetches them from the association's
 * private repository (scripts/fetch-saiga.ts), a laptop copies them in by
 * hand, and git ignores where they land. Without them, the pages are in Inter.
 */

/** Where the build and a laptop put the files, under the site's root. */
export const SAIGA_DIR = "public/fonts/saiga";

/** Where the files come from: the association's private repository, at a commit. */
export const SAIGA_SOURCE = {
  repository: "kuutti-ry/kuutti-app-fonts",
  commit: "8d672e73e430a182fa19bbdbabe26eb93c8638db",
  folder: "Saiga/WOFF2",
} as const;

/**
 * The weights Gaiane's structure uses (/ga/, decision 16), each with the
 * SHA-256 of the file Spoke delivered (Saiga 1.002). Saiga has no 600: the
 * headings' 650 is drawn in Bold.
 */
export const SAIGA_FILES = [
  {
    file: "Saiga-Regular.woff2",
    weight: 400,
    style: "normal",
    sha256: "9714e36dbf9c5f4475d07d1756750b19fb79e286d1b6667a06ae9a084a5aa803",
  },
  {
    file: "Saiga-Italic.woff2",
    weight: 400,
    style: "italic",
    sha256: "e11f4e5425fb2f78ef64f6e55a36c1a5703d51c62b717da51890a4031dae1571",
  },
  {
    file: "Saiga-Medium.woff2",
    weight: 500,
    style: "normal",
    sha256: "88c51c465b236eaf9102fda8753196181392297abe67342c134c538b3ede719b",
  },
  {
    file: "Saiga-Bold.woff2",
    weight: 700,
    style: "normal",
    sha256: "c072666c13379a24c24b1350d921626f92334d6d04c2e572a125e8f908ea4951",
  },
] as const;
