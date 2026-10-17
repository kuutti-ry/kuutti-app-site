import type { Pinned } from "./lib/consent.ts";

/**
 * Every version of each kind the site has published, oldest first, with the
 * fingerprint of the text it was published with (`pinnedText` in
 * src/lib/consent.ts, kuutti-ry/kuutti-app#208): the Finnish heading and body,
 * and a legal text's status and binding, or a draft's own while its Finnish
 * is not written (the terms and the privacy policy are English drafts).
 *
 * The newest row of a kind is the version its page carries, and the build
 * refuses a text whose fingerprint is not that row's: a changed text is a new
 * version, and a new version asks everybody again in the app, so a typo fix is
 * a new version too, or no change. A row is added at the end and never
 * changed or removed (`pnpm check:pinned`, against main's), and every row's
 * version keeps its anchor on its page (`pnpm check:site`). The app follows: its CI holds its CONSENT_VERSIONS to the newest
 * rows through /legal/versions.json, and the site's CI lets the app be at an
 * earlier row only while it follows (scripts/check-app-versions.ts).
 *
 * The first rows are the app's versions of 17/10/2026, when the pin began.
 */
export const PINNED: Pinned = {
  terms: { "2026-09-draft-1": "65b7fa7d00ed9290" },
  privacy: { "2026-09-draft-1": "422ac16a1df3d859" },
  research: { "2026-09-draft-1": "0cd317fd8cc2d703" },
  special_category: { "2026-10-draft-2": "bb0b1aa5f3054f7e" },
};
