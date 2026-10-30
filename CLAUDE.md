# Kuutti: the website

The website of Kuutti ry (kuutti.app): what Kuutti is, who is behind it, and the legal texts. A static site made with Astro. The app is another repository, `kuutti-ry/kuutti-app`, and its `CLAUDE.md` carries the project's standing rules; what is here is what this site needs of them, and what is the site's own. Where the two disagree about the project, the app's repository wins.

The site's issues live in the app's repository (`kuutti-ry/kuutti-app#53` is the site).

## Commands

`package.json` is the source of truth; keep this list in sync with it.

- `pnpm install --frozen-lockfile`. Node 22.23.4+ and pnpm come from `package.json`; `corepack enable` once.
- `pnpm dev` serves the site at http://127.0.0.1:4321. `pnpm build` writes `dist/`; `pnpm preview` serves it.
- `pnpm typecheck` (`astro check`), `pnpm lint` (Biome, then `scripts/check-content.ts`, then `scripts/check-fonts.ts`: no font file in git but Inter's), `pnpm test` (node's test runner), `pnpm format`.
- `node scripts/fetch-saiga.ts` puts Saiga's files into `public/fonts/saiga/` (git ignores it) from the association's private repository, with a read-only token in `FONTS_TOKEN`; Amplify's build runs it, and without the token the site is built in Inter (`docs/decisions.md`, 18). On a laptop, `FONTS_TOKEN="$(gh auth token)" node scripts/fetch-saiga.ts` does the same with your own login.
- `pnpm check:site` reads `dist/` after a build: no script but the pond's own file on its own page, nothing loaded from elsewhere, no dead link, a language and one `h1` on every page, a sitemap of exactly the pages that may be indexed, a `/legal/versions.json` whose every address leads to its version's anchor, and an anchor for every version of `src/consent-versions.ts`.
- `pnpm check:app-versions` reads the app's generated `CONSENT_VERSIONS` on `main` from GitHub and holds it to `src/consent-versions.ts` (`-- --app <file>` reads a local one instead); CI runs it in the `site` job.
- `pnpm check:pinned -- --base origin/main` holds every row of the base's `src/consent-versions.ts` unchanged and in its place; CI runs it in the `lint` job.

Before pushing: typecheck, lint, test, build and check:site pass locally. Do not push red.

## Non-negotiable rules

1. **The site runs nothing and loads nothing from anybody else.** No script, no analytics, no cookie, no font or image from another host (Inter is the site's own file under `public/fonts/`), no embedded frame, no form. One exception, on the maintainer's word of 24/10/2026: the pond demo at `/ga/pond/` runs its own file, `/ga/pond/pond.js`, and nothing else does (`SCRIPTED` in `src/site.ts`, `docs/decisions.md` 17). `scripts/check-site.ts` and the content security policy in `customHttp.yml`, which names that one file in full, both hold this; a change that needs another exception is wrong.
2. **No product surface** (the app's rule 8). No profile pages, no share links, no sign-in, no browser client of the app. The site says what Kuutti is; it is not Kuutti.
3. **A legal text is never written or translated by a machine into a language it did not exist in.** The Finnish text binds. A text is read in the language it was written in, whether or not the site speaks it (`TEXT_LANGUAGES` in `src/i18n/locales.ts`). A draft says that it is a draft, on the page, and search engines are told to leave it alone.
4. **Finnish and Swedish written by a machine say so.** Text an agent writes or edits in Finnish or Swedish carries `machine: true`. `reviewedBy` is written only for a native reader who has read the page, never by an agent on its own.
5. **Nobody is named who has not asked to be.** No team member, donor, partner or researcher appears on the site without their word, and no name is taken from a planning document.
6. **Nothing is claimed that is not so.** No partner that has not agreed, no date that is not decided, no address that does not answer. What is not decided is `null` in `src/site.ts`, and the page says that it is coming.
7. **No asking for money before the association may.** A donate button counts as a collection of money under Finnish law; there is none until the association is registered and has made its notification or has its permit.
8. `.env` files are never read, written or committed. The site needs none.
9. **Saiga's files are never in this repository.** Kuutti's typeface is Spoke Type's, licensed to Kuutti ry for Kuutti's own media, and the maintainer promised Spoke to keep the files out of the public repository: not in a commit, a branch, a pull request, a GitHub workflow's cache, artifact or log. The build fetches them (`scripts/fetch-saiga.ts`); git ignores `public/fonts/saiga/`, and `scripts/check-fonts.ts` refuses any font file but Inter's in `pnpm lint` and before every commit. An agent never opens a font file: it would send it elsewhere (`docs/decisions.md`, 18).

## Git

As in the app's repository:

- `main` only, and only through a pull request: squash merge, the checks green, one approving review.
- Every commit is signed off (`git commit -s`). Enable the hooks once per clone: `git config core.hooksPath .githooks` (the sign-off, and no font file but Inter's).
- Linear history: no merge commits, no force-push, never touch the ruleset or the repository's settings.
- Subject line imperative and under 72 characters; the body says what and why.
- Every pull request body carries `Refs kuutti-ry/kuutti-app#n`. Never a closing keyword: an issue closes when the maintainer has looked at the result.
- Commit only what was asked. No `dist/`, no `.astro/`, no unrelated lockfile churn.

## Code and content

- TypeScript strict. Biome is the formatter and the linter.
- A page is Markdown in `src/content/pages/<language>/`, in every language of the site under one name (`src/i18n/locales.ts`: English only for now, `docs/decisions.md` 8). Markdown only: no HTML and no images in a text.
- Gaiane's structure lives beside the site at `/ga/` (`docs/decisions.md`, 16): its pages are Markdown in `src/content/ga/<language>/`, made by `src/pages/ga/[...path].astro`, and search engines leave them alone. A paragraph that says only `@reuse /app/#research` shows that part of the site's own page (`src/lib/reuse.ts`): a text has one copy, so write it on the site's page and reuse it here, never copy it.
- The home page is the whole site in one, since Google's reviewer reads no other page (`docs/decisions.md`, 22): the association's purpose at the top (what "About Us" says before its first heading), then every page that carries `nav` as a section at `/#<slug>`, which is where the navigation leads; the site links to its section (`/#contact`), not to the page.
- The site names one e-mail address, `hello@kuutti.app`, a user and not an alias: Google for Nonprofits checks that every address on the site is a user.
- `/sitemap.xml` names the pages that may be indexed; `src/lib/sitemap.ts` makes it from the content, and it is never written by hand (`docs/decisions.md` 11).
- The site's own words (navigation, notices, the footer) are in `src/i18n/ui.ts`, in every language of the site, and a test holds that none is missing.
- A legal text a person agrees to in the app carries `consent_version` (quoted), the app's version of it. The build refuses a Finnish heading or body, or a draft's, or a status or binding, that changed without a new version and its row at the end of `src/consent-versions.ts`; a row is never changed or removed, and its version keeps its anchor on the page, the earlier text copied whole to `src/content/earlier/<language>/<kind>/<version>.md`: a new version asks everybody again, so it is the maintainer's bump, never an agent's own. The site's version lands first, the app's follows (`docs/decisions.md`, 14).
- Links inside the site are written in full, with the language's prefix where it has one and a trailing slash (`/legal/privacy/`); the build checks that each leads somewhere.
- Dates and numbers are written as Finland writes them, in every language.
- Do not add a framework, a component library or a build step for something a style sheet can do.

## Accessibility

- Meaning never by colour alone: where you are in the navigation is a line and a weight.
- WCAG AA contrast in the light theme, the only one, and in its high-contrast pair, which answers the system's setting.
- Every target is at least 44 px high. The page holds at 200 % text size and on a 320 px wide screen, without scrolling sideways.
- One `h1` per page, headings in order, a skip link, the language on `html`.

## Decisions

`docs/decisions.md` has what was decided for the site and why. `docs/open-questions.md` has what is the maintainer's to decide and what the site says meanwhile.
