/**
 * Fetching Saiga for a build (docs/decisions.md, 18), apart from the command
 * so that a test can hand it a server of its own: each file of SAIGA_FILES
 * from the association's private repository, at the pinned commit, kept only
 * when its SHA-256 is the one Spoke's file has.
 */
import { createHash } from "node:crypto";
import { SAIGA_FILES, SAIGA_SOURCE } from "../src/lib/saiga.ts";

export type Fetched = { file: string; bytes: Uint8Array };

/**
 * Every file, verified, or an error that names the file and says what went
 * wrong. Never says the token.
 */
export async function fetchSaiga(
  token: string,
  get: typeof fetch = fetch,
  files: readonly { file: string; sha256: string }[] = SAIGA_FILES,
): Promise<Fetched[]> {
  const fetched: Fetched[] = [];
  for (const { file, sha256 } of files) {
    const { repository, folder, commit } = SAIGA_SOURCE;
    const answer = await get(
      `https://api.github.com/repos/${repository}/contents/${folder}/${file}?ref=${commit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.raw+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!answer.ok) throw new Error(`${file}: GitHub answered ${answer.status}`);
    const bytes = new Uint8Array(await answer.arrayBuffer());
    if (createHash("sha256").update(bytes).digest("hex") !== sha256) {
      throw new Error(`${file}: not the file Spoke delivered (its SHA-256 differs)`);
    }
    fetched.push({ file, bytes });
  }
  return fetched;
}
