/**
 * Puts Saiga into the build: Amplify runs this before `pnpm build`
 * (amplify.yml, docs/decisions.md 18), with a read-only token for the
 * association's private repository in FONTS_TOKEN. Nothing else has the
 * token, and no GitHub workflow runs this. It writes nothing but
 * public/fonts/saiga/, which git ignores, and prints names and sizes.
 *
 * Without the token, or when a file cannot be had, the site is built in
 * Inter and the build goes on: a typeface is not worth an undeployed legal
 * text. The log says why.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SAIGA_DIR } from "../src/lib/saiga.ts";
import { fetchSaiga } from "./saiga.ts";

const dir = join(import.meta.dirname, "..", SAIGA_DIR);
const token = process.env.FONTS_TOKEN ?? "";

if (token === "") {
  console.log("Saiga: no FONTS_TOKEN, so the pages are built in Inter");
} else {
  // Every file is fetched and verified before the first is written: all of them, or none.
  try {
    const files = await fetchSaiga(token);
    mkdirSync(dir, { recursive: true });
    for (const { file, bytes } of files) {
      writeFileSync(join(dir, file), bytes);
      console.log(`Saiga: ${file}, ${bytes.length} bytes, verified`);
    }
  } catch (error) {
    console.warn(
      `Saiga: ${error instanceof Error ? error.message : error}; the pages are built in Inter`,
    );
  }
}
