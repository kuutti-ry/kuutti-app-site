# Decisions

What was decided for the site, and why. Newest last.

## 1. A repository of its own (2026-09-28)

The placeholder page lived in the app's repository under `site/`, served by Amplify Hosting from there (the app's ADR-001). The site now has pages, three languages and legal texts that change on their own schedule and are read by other people than the app's code. It moves to a repository of its own, public like the app's, under the same rules. The maintainer's decision.

Until Amplify Hosting is connected to this repository, the placeholder in the app's repository stays where it is and is what kuutti.app shows. The move is done in that order: this repository published, Amplify connected to it, the site seen at kuutti.app, and only then `site/` and `amplify.yml` removed from the app's repository.

On 28/09/2026, the repository was published, a new Amplify app was connected to it, `kuutti.app` was moved to it, and the site was seen there. The subsequent removal from the app repository is tracked in kuutti-ry/kuutti-app#109.

## 2. Astro, and no script (2026-09-28)

The site is documents: a few pages and three long legal texts, in three languages. It needs templates, Markdown, routes per language and checks at build time, and it needs nothing in the browser.

**Astro** gives that and ships no JavaScript unless asked to: what is deployed is HTML and one style sheet. It is MIT-licensed and widely used, its content collections check every text's front matter against a schema (zod, as in the app), and its routing knows about languages.

Considered and not taken: Eleventy (as light, but untyped templates and no schema for content); Next.js and other React frameworks (a runtime in the browser for a site that has nothing to run); a hand-written set of HTML files (three languages of everything, by hand).

## 3. No CSS framework, and the app's tokens (2026-09-28)

The look is one style sheet on the app's design tokens (TD-9): the same colours, light and dark by the system's setting, the high-contrast pair by the system's "increase contrast". Sizes are fluid (`clamp`), the text column is as wide as a line should be long, the navigation wraps, a table scrolls by itself. That is what makes the site read well on a phone and on a desk, and a CSS framework would add its weight and its look without adding to it.

Set aside in one respect by 9: the site is light only.

## 4. The system's typeface (2026-09-28)

The placeholder loaded Inter from Google Fonts, which tells Google the address of everybody who opens the page. The site names Inter first and the system's typeface after it, and loads no font file: whoever has Inter sees it, everybody else sees their system's own.

Serving Inter from the site itself is possible and needs a decision: its licence (OFL-1.1) is not in the allow-list of the app's licence policy.

Superseded by 9: Inter is served by the site.

## 5. Finnish without a prefix, English slugs (2026-09-28)

Finnish is the association's official language (bylaws, 1) and lives at the root; Swedish and English live under `/sv/` and `/en/`. The pages have the same English names in every language (`/legal/privacy/`, `/sv/legal/privacy/`): the app and the stores link to them, and one name per page is one thing to keep stable.

Set aside by 8 while the site is English only: English lives at the root.

## 6. Legal texts in the languages they were written in (2026-09-28)

The app's rule for its consent texts holds for the site: a legal text is never translated by a machine, and the Finnish text binds. The bylaws exist in Finnish and are shown in Finnish, from every language's legal page. The terms of use and the privacy policy exist as English drafts, written from what the app's code does; their Finnish texts are written by people before the app opens, and the drafts say so.

A draft carries a notice on the page and `noindex` for search engines.

Holds under 8 too: the bylaws, which exist in Finnish, are read in Finnish at `/legal/bylaws/` under the English pages, with the article marked as Finnish. A legal text may be written in a language the site does not speak (`TEXT_LANGUAGES`), and is then read as it is under every language of the site that has no version of its own.

## 7. The logo as lines on nothing (2026-09-28)

The logo file is black lines on an off-white square, which shows as a square on every background but its own. `public/logo.png` is the same drawing with the background made transparent; in the dark theme it is turned over to white. `public/kuutti.png` and `public/favicon.png` are the original, for the icon and for link previews.

On 21/10/2026 the maintainer gave the site a new logo, a seal pup's face above a wave, in place of the tail, for the header and the home page. The files are made from the drawing the same way: `public/logo.png` is the drawing cropped to its lines, in its own ink (#232323) on transparency, at 840 x 572 px; `public/kuutti.png` and `public/favicon.png` are a square around it on white, 392 px. The header shows it 40 px high and the home page at most 280 px wide, which keeps the page shorter than the tail did at every width (decisions 8 and 13).

On 23/10/2026 the maintainer gave the same face with a thicker stroke. The three files are made from it the same way and keep their sizes, the lines 7 to 8 px from the edges of `public/logo.png` and the face 384 px wide in the 392 px square: the strokes are wider, and nothing else moved, so no page changes an image's size.

On 24/10/2026, a link to kuutti.app shared on Telegram still showed the tail: Telegram keeps a preview's image by its address, and `kuutti.png` had kept its name through both changes. Since then the share image and the icon are named with a fingerprint of the file (`/kuutti.png?v=…`, `src/lib/fingerprint.ts`): the files keep their names, and the address changes whenever a file does, so a messenger or a browser fetches the new one by itself. A preview already kept under the old address is refreshed by sending the link to Telegram's @WebpageBot.

## 8. English only, two tabs, and the home page as the placeholder had it (2026-09-28)

The maintainer's word, the day the site was made: one language for now, English; two pages in the navigation, "App" and "About Us"; the home page with only what the placeholder page shows (the logo, the name, "Coming soon..."), and no button; the footer one line, "Kuutti ry, Espoo, Finland." (first asked with the name in front, then without, the same evening). On 01/10/2026 the maintainer asked for the business ID in it, once the association had one: "Kuutti ry, Espoo, Finland. Business ID 3659478-7." On 03/10/2026, links to the association's LinkedIn and GitHub beside it, by their marks, as other services' sites have them; the marks are drawn in the page, so nothing is loaded from either service (rule 1). On 04/10/2026, TikTok and Instagram beside them, once the accounts existed.

So English lives at the root (`/app/`, `/about/`), and the Finnish and Swedish pages and the language switcher are out of the site for now. They are in the history (424c56f) and come back as a language in `src/i18n/locales.ts`, its words in `src/i18n/ui.ts` and its pages under `src/content`; the code stays written for any number of languages. The legal texts stay where they were, reached by links from the pages and not from the navigation, the bylaws in Finnish under the English pages as the maintainer asked the same evening (decision 6); "Help", "Support us" and "Deleting your account" likewise, by their addresses and the links that name them. Decision 5 is set aside while this holds.

Set aside in part by 15 (23/10/2026): the home page also says what Kuutti is, and the footer gives the association's postal address.

## 9. White, Inter served by the site, and the logo alone in the header (2026-09-28)

The maintainer's word, on seeing the site: white like the placeholder page at kuutti.app, not dark by the system's setting; the same typeface as the placeholder; and in the header the logo alone, without the name.

So the site is light only: `color-scheme: light`, the dark tokens are gone, and the high-contrast pair stays for the system's "increase contrast". Inter is served by the site itself from `public/fonts/`: the variable font, Latin subset, taken from the npm package `@fontsource-variable/inter` (the version is in the README), under the SIL Open Font License 1.1, whose text lies beside the file. The content security policy allows `font-src 'self'` and nothing else changes: nothing is loaded from Google, which is why the placeholder's way was not taken (decision 4). The link in the header is the logo, and the name is the image's alternative text, so the link keeps its name for a screen reader.

## 10. "Made in Finland for Finland", with the flag drawn (2026-09-28)

The maintainer's line, in the first sentence of the App page ("Kuutti is an app made in Finland 🇫🇮 for Finland 🇫🇮."; it stood on the home page for an hour first, then with the volunteers on the association's page), the flag of Finland after each "Finland". The flag is drawn as SVG in the official proportions and blue, and sizes with the text: an emoji flag is a flag on Apple and Android and two letters on Windows, which has no flag emoji. It is decorative for a screen reader; the words say Finland.

The rule that a text carries no HTML and no image stands: the author writes the emoji, and the page template draws the flag in its place in the HTML the content layer rendered (`src/lib/flag.ts`, one replacement, no dependency; a Markdown plugin would have needed a package in Astro 7). It holds for every page and every flag to come.

## 11. A sitemap, and no machine versions (2026-10-06)

`/sitemap.xml` names every page a search engine may index, which is every page but a draft (a draft tells search engines to leave it alone, rule 3 of `CLAUDE.md`), and `robots.txt` names it. A legal text carries `<lastmod>`, the date of its wording; a page has no reliable date and carries none, as a guessed one is worse than none; `changefreq` and `priority` are left out, as search engines ignore them. `src/lib/sitemap.ts` makes it from the same routes as the pages, and `pnpm check:site` holds that it names exactly the pages without `noindex` and that `robots.txt` names it.

A "human / machine" switch after niro.ai was built the same day (a Markdown version of every page at its path with `.md`, an index at `/llms.txt`, and two links in the header) and taken out before it was merged, on the maintainer's word: the switch sat out of line with the navigation, and Kuutti is not an AI product. It is in the history of pull request 11 if it is ever wanted.

## 12. No postal address on the site (2026-10-06)

The maintainer's word, the day the association was registered: the association's postal address is not published on the site, and no text promises it. The Register of Associations shows it to whoever looks there; the site does not repeat it. The privacy policy names the controller by name, business ID and registration; a contact address for questions and requests about personal data is a separate matter, still promised before the app opens.

Set aside by 15 (23/10/2026): the address is in the footer and on "About Us".

## 13. The stores' badges on the home page, dimmed until the app is there (2026-10-06)

The maintainer's word, after a site seen at Hilma's (shortsync.app): instead of "Coming soon..." alone, the home page shows the App Store and Google Play badges, dimmed and not links, with "Coming soon..." under them. The badges are the stores' own, as Apple and Google publish them (Apple's SVG from its marketing toolbox, Google's PNG from its badge page), kept in `public/badges/` so the page still loads nothing from either. When the app is published, `SITE.stores` takes the listing's address and that badge becomes a link at full strength; "Coming soon..." goes when both are there.

Apple licenses its badge artwork for apps that are on the App Store, and both stores have a badge for an app not yet out (Apple's "Pre-order on the App Store", Google's "Pre-register on Google Play"). Showing the download badges dimmed before the app is out goes beyond what their guidelines describe; the maintainer chose them over badges drawn by the site or plain buttons. The image's alternative text says that the app is coming to that store, so a screen reader does not hear a download that is not there. Decision 8's "no button" stands: a dimmed badge is not a link.

Since 15 (23/10/2026), the line under the badges says "Not in the stores yet." instead of "Coming soon...".

## 14. One version per kind, pinned by a fingerprint, and /legal/versions.json (2026-10-17)

kuutti-ry/kuutti-app#208, as the maintainer decided it there: the four texts a person agrees to in the app (the terms, the privacy policy, the research opt-in, the sensitive answers) have one version each, shown in two renderings: the app's summary, which is what the person accepts on the screen, and the site's full text, which binds. The version is a person's bump, never a hash: every bump asks everybody again in the app, so a typo fix is a new version too, or no change.

- **The site pins its text to the version.** A legal text of a kind the app records carries `consent_version` in its front matter, by the app's name for it (`"2026-09-draft-1"`, quoted, since YAML reads `2026-11-1` as a day). The build fingerprints the Finnish text, its heading and body, and for the terms and the privacy policy their status and whether the language binds, so that neither a heading nor a draft coming into force changes under a version people agreed to (`pinnedText` in `src/lib/consent.ts`: the first 16 hex digits of the SHA-256, the app's digest format over another input, so the two values are not comparable). It refuses a text whose fingerprint is not its version's row in `src/consent-versions.ts`, and says so when a new version's text is the previous one's unchanged. That file is the history: a row per version, added at the end, never changed or removed, which `pnpm check:pinned` holds against `main`'s table in CI's `lint` job. Every row's version keeps its anchor on its page (`pnpm check:site`): production records consents to a version until the next release of the API and the stores, and their builds link to it, so the text of a version stays on the site when a new one comes. Today each kind has one row; the first new version fails the check until the page keeps the earlier text under its anchor. While the terms and the privacy policy exist only as English drafts, the fingerprint is of the draft, and `versions.json` says `"language": "en"`; the Finnish text, when people have written it, moves the fingerprint and takes a new version, as it should.
- **The research opt-in and the sensitive answers are on the privacy page.** The app asks for them apart and had them alone; their wording is now `src/content/consents/<language>/<kind>.md`, copied from the app's `messages.yaml` as it is, in Finnish and English, the languages it is written in, and shown after the privacy policy's text with its version and the day of its wording. The Finnish is marked as the one that counts, and carries `lang="fi"` on the page; nothing is translated. Their pinned text is the app's Finnish `legal.<kind>.title` and summary as they are, so the app's check computes the same fingerprint from its own wording and fails when the hash `versions.json` publishes is another: the two copies cannot part under one version.
- **The two repositories agree through one file.** The build writes `https://kuutti.app/legal/versions.json`: per kind, the version, the fingerprint, the language of the fingerprinted text, the address of the text at the anchor of its version (`/legal/privacy/#research-2026-09-draft-1`), and the day of the wording. The app's CI reads it and fails when its `CONSENT_VERSIONS` differs; this site's CI reads the app's generated `packages/i18n/src/generated/consent.ts` on `main` from GitHub (`pnpm check:app-versions`, in the `site` job) and fails on a version the site never published or on a kind either side lacks. It reads `CONSENT_VERSIONS` out of that TypeScript module, which exists on `main` today, so the site's pull request can go first; the app's `src/consent.test.ts` reads its module the same way, so a change of the app's generator fails there before it fails here. Each check tries three times when the network fails or the server answers 5xx, then fails: nothing passes unread. No build pulls the other repository's text.
- **The site leads.** Its Finnish text is the one that binds, so a new version lands here first: the site's check lets the app be at an earlier row of the history while the app's pull request follows, and once the site is deployed the app's own check fails until the app has the new version: on every app pull request, and on the app's `main` too if anything merges there before the bump, so an app pull request that went green before the deploy runs its checks again before it merges. The first time, the site's pull request is merged and deployed before the app's, whose check would otherwise find no `versions.json`.

The anchor of a version is on the line that names it (the text's own) or on the consent's heading, and `pnpm check:site` holds that every address in `versions.json` leads to it.

**The earlier versions stay on the page** (2026-10-25, the first second version: the privacy policy's `2026-10-draft-2`, for the push of kuutti-ry/kuutti-app#102, the maintainer's bump). When a newer version replaces one, the file as it was is copied whole to `src/content/earlier/<language>/<kind>/<version>.md` and never edited. The text's page shows each kept version, newest first, under "Earlier versions", closed until opened, with the version's anchor on it, so the link in an app that still records the old version lands there. The build holds each kept text to its own row as it held it when it was the newest (`earlierProblems` in `src/lib/consent.ts`, thrown by `/legal/versions.json`): every row but a kind's newest has its text kept, a kept text's fingerprint is its row's, and a kept text names a row that is not the newest. `pnpm check:site` still wants every row's anchor on its page.

## 15. The association as the register has it, and a home page that says what Kuutti is (2026-10-23)

Google for Nonprofits could not confirm that kuutti.app is Kuutti ry's (23/10/2026). What it asks of a nonprofit's site: that it is not mainly placeholder content ("Coming Soon", "Under Construction"), and that it shows the details the organisation registered with, such as its charity ID, a physical street address and a clear statement of its mission. The maintainer's word the same day: add what Google wants; the address is in the register for whoever looks, so it is no secret. That sets 12 aside, and 8 in part.

- The footer names the association as the register does: "Kuutti ry, Tontunmäentie 22 E, 02200 Espoo, Finland. Business ID 3659478-7." The address is `postalAddress` in `src/site.ts`, as PRH's extract of 06/10/2026 gives it.
- The home page says under the name, in one sentence, what Kuutti is and who makes it, and the same sentence is the page's description for search engines. It is one line on a laptop, so the footer still fits a window 825 px high; on a phone the footer's marks now fall just below the first screen. The badges stay under it, dimmed (13), and the line under them says "Not in the stores yet." in place of "Coming soon...", the words Google's check reads as a placeholder.
- "About Us" says that kuutti.app is the association's official website, and gives the association as the register has it: name, business ID, form, domicile and postal address, with a link to its entry in YTJ, the Finnish Business Information System.

The privacy policy and the terms are unchanged. They are drafts pinned to their versions (14), so the controller's address in them would be a new version, and a new version is the maintainer's to make.

## 16. Gaiane's structure, at /ga/ beside the site (2026-10-24)

Gaiane, the designer, proposed a structure for the site: a fixed navigation bar (the logo and the name, the language, the app's page, About us, Contact, perhaps Q&A), a footer of legal texts, contact details and links, and pages for the app, the association, contact, questions and download. The maintainer's word the same day: build it at `kuutti.app/ga/`, beside the site, with the site's texts where it has them and the rest inferred, as a proposal to look at. The site itself is unchanged.

- **What is there.** The home page ("Dating app"): the slogan of her sketch ("Meet your love on Kuutti"), a download button, the pup above the water, then what Kuutti is, how it works, why choose it, what it keeps, research, and how it is built (on About us, as she suggested). About us, Questions and answers, Get in touch, Download. The header stays at the top as the page scrolls, where the window is tall enough; on a narrow screen its pages fold into a menu, a `<details>`, so that nothing needs a script. Breadcrumbs lead back to `/ga/`. The footer has the legal texts, with the association as the register has it under them (her question was whether it may live there: it may, the footer is on every page; the site's own About Us keeps it too, for Google's check, decision 15), how to reach the association, and every page. A link that leaves the site opens in a new tab and says so, by an arrow and in words for a screen reader. Her texts say "Kuutti" where they could say "it".
- **One copy of every text.** A paragraph of a `/ga/` page that says only `@reuse /app/#research` is replaced, at build time, by that section of the site's page as rendered, without its heading (`src/lib/reuse.ts`); a marker that names nothing fails the build. What is new is new: how Kuutti works (from the app's own words on its welcome screen and in its rules), the contact page, the questions the site had not asked yet, the download page's state. The legal texts are not copied: the footer links to them where they are.
- **Search engines leave it alone** (`noindex`, outside the sitemap): it shows the site's texts a second time, and it is a proposal, not the site. Nothing on the site links to it.
- **What she asked that the site does not do, and what it does instead.** A contact form and a form for questions: none, by rule 1; the pages say where to write. A switch between a dark and a light theme: none, the site is light only (decision 9). The language: English only (decision 8); the language menu names Finnish and Swedish as coming. A download overlay with a QR code on a computer: a page instead, since an overlay needs a script to hold the focus and to close; the code is shown where the pointer is a mouse, and opens the same page on a phone. The credits: Inter, and Saiga's foundry once it has said how it wants to be named (rule 5); nobody else is named yet.
- **"Any time" or "anytime"** (her question about the research text): "at any time", two words, is right where the text has it, after a preposition.

## 17. The pond demo, the one page that runs a script (2026-10-24)

The maintainer asked for the pond demo of 14/10/2026 (a seal pup that swims where the water is tapped and catches the fish it is sent after, water that tilts with the phone, a 30 second round) on a page of its own, over a page of filler. Asked whether to keep rule 1 and draw it in CSS alone, or let that page run the demo's script, he chose the script, and the water over the content, along the bottom of the window.

- **One page, one file, named everywhere.** `SCRIPTED` in `src/site.ts` names the page, `/ga/pond/`, and its file, `/ga/pond/pond.js`. `pnpm check:site` refuses a script on any other page, a script written into the page, and any other file. The content security policy allows that file and no other: `script-src https://kuutti.app/ga/pond/pond.js`. It is one policy for every address, since Amplify Hosting does not say which of two matching patterns wins; a test holds the policy to `SCRIPTED`.
- **What the script does.** It draws the pond, answers taps on the water and the controls, and asks for the phone's tilt only when the button is pressed (Safari asks the person first). It loads nothing, sends nothing and keeps nothing. Its words are the site's (`pond.*` in `src/i18n/ui.ts`), handed to it by the page. Time is counted as it passes, so that a round lasts 30 seconds on any screen. With reduced motion asked for, the water lies still and the fish wait. The art is the demo's placeholder.
- **Over the page.** The water lies fixed along the bottom of the window, a third of it at most, and the page scrolls behind it; the page leaves room at its end so that its last lines can be read above the water. Only the water takes a tap: above it, a tap is the page's. Without the script, the page says that the pond needs it and is the filler alone.

## 18. Saiga, Kuutti's typeface, on the site and never in its repository (2026-10-24)

Spoke Type licensed Saiga to Kuutti ry by e-mail on 20 and 21/10/2026, for the app and the media of the Kuutti brand, the website among them. The maintainer had promised Spoke to keep the font files out of the public repositories and to ship them only inside the app's builds and the website. This repository is public, and a file once pushed stays in its history for good. The maintainer asked for Gaiane's structure (16) in Saiga, without making the files public.

- **Where the files come from.** The association's private repository `kuutti-ry/kuutti-app-fonts`, at a pinned commit, four weights (`SAIGA_FILES` in `src/lib/saiga.ts`: Regular, Italic, Medium, Bold), each held to the SHA-256 of the file Spoke delivered. Amplify's build fetches them before it builds (`scripts/fetch-saiga.ts`, in `amplify.yml`), with a read-only token the maintainer keeps in the Amplify app as `FONTS_TOKEN`, and nowhere else. No GitHub workflow fetches them, so no cache, artifact or log of this repository holds them. Without the token, or when a file cannot be had or is not the one pinned, the build says so and goes on in Inter: a typeface is not worth an undeployed legal text.
- **Where they land.** `public/fonts/saiga/`, which git ignores. A page of `/ga/` links `/fonts/saiga.css` only when the build has the files; otherwise it stays in Inter, which stays behind Saiga in the stack. On kuutti.app the files reach the browser of whoever opens a page, as every web font does; that is what the licence allows.
- **Guards.** `scripts/check-fonts.ts` reads what git tracks and refuses a file that is a font by its first bytes, that is one of Saiga's by its SHA-256, or that has a font written into it, Inter's own file excepted. It runs in `pnpm lint`, so in CI, and before every commit (`.githooks/pre-commit`).
- **What is the maintainer's.** A read-only token for `kuutti-app-fonts` (a fine-grained token with Contents read on that repository alone, or a GitHub App), set as `FONTS_TOKEN` in the Amplify app; until then, `/ga/` is in Inter on kuutti.app. Previews of pull requests stay off for this Amplify app: a pull request's build would have the token. Whether the rest of the site moves to Saiga, and how Spoke is credited, are his too.

## 19. A site about an association at work, and the address in both its forms (2026-10-27)

Google for Nonprofits refused kuutti.app a second time (26/10/2026): its reviewer found the site still under construction. What read so: the store badges and "Not in the stores yet." on the home page, "There is no date yet" on "About Us", people to be listed "once they have chosen", a privacy policy that was "a draft until the app opens" in the app's page, and an address that "will be here before the app opens". The maintainer's word of 27/10/2026: the site says what the association does now, in the present tense.

- **No store badge on the home page.** Under the sentence of 15, the home page says what the bylaws hold Kuutti to, where its development is public, and that anybody can propose a feature through the app repository's Proposal form (`SITE.proposals`), which "Support us" names too; the header leads to every page. A badge comes back with a listing to link to (`SITE.stores`). The dimmed badges stay on the download page of Gaiane's structure (13, 16), which search engines leave alone.
- **"About Us" says what the association does now**, that the founding meeting of 1 October 2026 elected a board of three, and that its chair is Nikolai Denissov, the maintainer, on his word. The other two members are not named: the maintainer's word of 27/10/2026, and rule 5. "Beyond the app" names the association's other public work, the MIT-licensed tunnistus-oidc kit, which other Finnish services may use. "When does it open?" is gone: no date is decided (rule 6). The app's page says that Kuutti is in development, in public, and comes to the stores first as a beta (the app repository's milestone M6).
- **Addresses to write to**, the two that exist and no other (the maintainer's word): `hello@kuutti.app` (`contactEmail`), at the association's Google Workspace, in the footer, on the new "Contact" page, "Help", "Deleting your account" and "Membership"; and `security@kuutti.app`, beside the private form of the app's repository (`SECURITY.md`), on "Contact" and "Help".
- **"Membership"**, a page of its own, from the bylaws (3, 4, 8 and 12): the two kinds of member, what each may do at a meeting, that the board admits members, that the annual meeting sets the fees, and that membership changes nothing in the app. It names no fee and no account: neither is decided here, and rule 7 stands.
- **The address, twice.** The register writes "Tontunmäentie 22 E"; forms and parsers often write "22E". The maintainer's word: write the address twice, each form a line of its own, so that a check comparing the text finds either. The footer and "Contact" say "Kuutti ry, Tontunmäentie 22 E, 02200 Espoo, Finland." and "Kuutti ry, Tontunmäentie 22E, 02200 Espoo, Finland."; "About Us" has a line of the register for each. The first is `postalAddress`, with its no-break spaces; the second is `postalAddressJoined`, with plain spaces, as a form has them. The footer of Gaiane's structure says the same.
- **The navigation** is "About Us", "App", "Membership" and "Contact", in that order: the association first. Under 40rem the pages fold into a menu behind a button with three lines, a `<details>` as in Gaiane's structure (16), so nothing needs a script; the width is in rem, so larger text folds them sooner.
- **What did not change.** The terms and the privacy policy are drafts and say so on their own pages (rule 3); a draft coming into force is a new version, the maintainer's (14). Only the app's page stopped calling the policy a draft in passing.

## 20. Two partial washes, from Gaiane's concept (2026-10-27)

Gaiane's concept (`Kuutti_concept.pdf`, in the association's Drive) asks for a style that is spacious, light, calm and soft, with strokes, flat colours and much negative space, and asks "(gradient?)". Her pictures have the Antarctic dawn, pink over a lavender sea; the seals' world under the ice, "colored in blue and green"; and screens with soft pastel washes. The maintainer's word of 27/10/2026: partial gradients on the site, as in her idea, so that it reads as finished.

- **The dawn.** The top of each of the site's pages washes from pink (`--dawn`) through lavender (`--sea`) into white by 26rem, behind the header, which no longer paints a white of its own.
- **The water.** The footer deepens from near white (`--water-surface`) to a pale blue (`--water-deep`) under its line, as water under a surface.
- **Contrast holds.** On `--water-deep`, the darkest point under text, the footer's muted text has 5.6:1 and a link 5.0:1; on `--dawn`, 6.4:1 and 5.7:1: AA for small text. In high contrast the four tokens are white, so the washes go.
- **Only the site's pages.** The dawn is on a page with the site's header, and the water is the site's footer; Gaiane's structure (16) keeps its own.
- The four colours are the site's, not the app's tokens (3). If the app takes them up, they move into its tokens and come back from there.

## 21. Gaiane's sketches of 28/10/2026: pills, a smile, the sea and the dive (2026-10-28)

The maintainer brought six pencil and ink sketches of Gaiane's for `/ga/` (16) and asked for them on the structure the same day, with one thing of his own: when the page is scrolled down to its foot, the seal dives.

- **The header is pills on the page**, not a bar: the logo and the name; one pill with the languages and the pages; the download button with an arrow into the water. The languages are her row of codes, "FI EN SV", with a smile under the one the page is in and dotted ones under the others; Finnish and Swedish say that they are coming and are not links (8). Where you are among the pages is the same smile and a weight, a line and never colour alone. The pages are her names, "App", "About us" and "Contact"; Q&A, which her sketch leaves out, keeps its place between them until she says otherwise. On a phone the logo is a round button, the download button stays in the middle, and the round menu button opens a card with the languages, a globe and the pages in large type, still a `<details>`.
- **The home page** is her slogan, "Find your love on Kuutti" (it was "Meet your love on Kuutti"), over the water: a line of scallops across the window, with the logo's pup rising out of it. The logo's own wave is three scallops of that line, so the line continues it from both its ends (`src/lib/sea.ts`, the logo's measured arcs in `GaSea.astro`); a fish swims below. Her sketch has no button there: the header's download button is on every page.
- **The footer is the water under the ice** (20, now on the structure too): the same line at its top, a pup floating at it, the deep under it. The pup is a side view after her loading-screen sketch, the site's own placeholder until she draws one; it wears a gold crown, a heart on its front (the maintainer's word: a king seal).
- **The dive needs no script** (rule 1): it is a scroll-driven animation in the style sheet, on the view timeline of the footer's top part, at most three quarters of the window high. It ends when the page reaches its foot, or, where the footer is taller than the window, while the pup is still on the screen. It follows the scroll both ways, and on the way up the pup turns round and swims up head first (the maintainer's word, the same day): it is mirrored while the page was last scrolled up, which the browser tells the style sheet through a scroll-state query; a browser that cannot brings it up tail first. A browser without scroll-driven animations, or a visitor who asked for reduced motion, sees the pup float.
- **Nothing is wider than the window** but the water, which the window clips (`overflow-x: clip` on a page that has it).
