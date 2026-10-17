import type { APIRoute } from "astro";
import { PINNED } from "../../consent-versions.ts";
import { versionsDocument } from "../../lib/consent.ts";
import { wordings } from "../../lib/content.ts";

const ORIGIN = new URL(import.meta.env.SITE ?? "https://kuutti.app");

// The version of each text a person agrees to in the app, with the
// fingerprint of the text, where it is read and the day of its wording
// (kuutti-ry/kuutti-app#208). The app's CI reads this file and fails when its
// CONSENT_VERSIONS differs. The build fails here when a text changed without
// its version (src/consent-versions.ts), so a moved text is never published
// under the version people agreed to.
export const GET: APIRoute = async () => {
  const document = versionsDocument(await wordings(), PINNED, ORIGIN);
  return new Response(`${JSON.stringify(document, null, 2)}\n`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
