# kuutti-app-site

The website of Kuutti ry at [kuutti.app](https://kuutti.app): what Kuutti is, who is behind it, and the texts that bind the association and the people who use the app. The app itself is at [kuutti-ry/kuutti-app](https://github.com/kuutti-ry/kuutti-app).

A static site. It sets no cookie and loads nothing from anybody else, and it runs no script but one demo's, the pond at `/ga/pond/`; a check holds it to that on every build. Its typeface, Inter, is its own file, under the SIL Open Font License 1.1 (`public/fonts/LICENSE-Inter.txt`). Gaiane's proposed structure of the site lives beside it at `/ga/`, in Saiga, Kuutti's typeface, whose files are never in this repository: the build fetches them (`docs/decisions.md`, 16 to 18).

## Run it

Node 22.23.4 or newer (Astro asks for it); pnpm comes from Corepack at the version `package.json` pins (`corepack enable` once).

```bash
pnpm install --frozen-lockfile
pnpm dev          # http://127.0.0.1:4321
```

| command | what it does |
|---|---|
| `pnpm dev` | the site with live reload |
| `pnpm build` | the site into `dist/` |
| `pnpm preview` | serves `dist/` as it will be served |
| `pnpm typecheck` | `astro check`, TypeScript strict |
| `pnpm lint` | Biome, then what the content must hold (`scripts/check-content.ts`) |
| `pnpm test` | the tests of the site's own code |
| `pnpm check:site` | what the built site must hold (`scripts/check-site.ts`): no script, nothing from elsewhere, no dead link |
| `pnpm check:app-versions` | the app's consent versions on `main`, read from GitHub, against the site's (`scripts/check-app-versions.ts`; `-- --app <file>` reads a local one) |
| `pnpm check:pinned -- --base origin/main` | every row of the base's `src/consent-versions.ts` is still there, unchanged, in its place (`scripts/check-pinned.ts`) |
| `pnpm format` | Biome writes |

## Where things are

```
src/content/pages/<language>/<slug>.md    the pages: the app, the association, support us, help, deleting an account
src/content/legal/<language>/<slug>.md    the legal texts: bylaws, terms of use, privacy policy
src/content/consents/<language>/<kind>.md the app's research and sensitive-answers consents, read on the privacy page
src/content/ga/<language>/<slug>.md       Gaiane's structure at /ga/, reusing the pages' texts by `@reuse /path/#heading`
src/consent-versions.ts                   every version of each text a person agrees to, with its fingerprint
src/i18n/                                 the languages, and the site's own words (navigation, notices)
src/site.ts                               what the site knows: addresses, channels, store links, the one scripted page
src/pages/[...path].astro                 the template the site's pages are made from
src/pages/ga/[...path].astro              the template of Gaiane's structure
src/lib/                                  which pages there are, how a text is listed, Saiga's files and their sums
src/styles/global.css                     the look, on the app's design tokens
public/                                   the logo, the icon, Inter (public/fonts/, SIL Open Font License 1.1), the pond's script
public/fonts/saiga/                       Saiga, put there by the build or by hand; git ignores it
scripts/                                  the checks, the tests, and the fetch of Saiga
docs/                                     decisions, open questions, what waits for a native reader
```

A page is a Markdown file. To add a page, add it in every language of the site under the same name. The navigation is the pages that carry `nav` in their front matter, in that order: for now App and About Us.

## Languages

English only for now (`docs/decisions.md`, 8), at the root (`/about/`). The code is written for any number of languages: a language that comes back is an entry in `src/i18n/locales.ts`, its words in `src/i18n/ui.ts` and its pages under `src/content`, at the language's prefix (`/sv/about/`).

- **English is the source.** Finnish and Swedish written by a machine, an agent included, carry `machine: true`, and the page says so to its reader. A native reader who has read a page replaces the flag with `reviewedBy`.
- **A legal text is never translated by a machine.** It exists in the languages it was written in by people, and the legal page links to those. The Finnish text is the one that counts.
- **A text a person agrees to in the app has a version.** Its front matter names `consent_version`, the build holds its Finnish heading and body (or a draft's), and a legal text's status and binding, to that version's row in `src/consent-versions.ts`, and publishes the versions at `/legal/versions.json` for the app's CI (`docs/decisions.md`, 14). A changed text is a new version and a new row.

## Hosting

Amplify Hosting builds and serves the site from `main` (`amplify.yml`), with the headers of `customHttp.yml`: a content security policy that lets nothing run and nothing load from elsewhere.

## Rules

The rules of the app's repository hold here: `main` only through a pull request, squash merge, every commit signed off (`git commit -s`; enable the hook once with `git config core.hooksPath .githooks`), `Refs` and never a closing keyword. `CLAUDE.md` has them, with what is this site's own.

## Licence

The code is under the GNU Affero General Public License, version 3 (`LICENSE`), like the app. The name Kuutti and the logo are the association's and are not licensed with the code. The App Store and Google Play badges in `public/badges/` are Apple's and Google's, as they publish them for marketing, and are not licensed with the code either.
