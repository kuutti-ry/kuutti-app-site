/**
 * The site's consent versions against the app's (kuutti-ry/kuutti-app#208),
 * the mirror of the app's own check of /legal/versions.json. Run by
 * `pnpm check:app-versions` and by CI.
 *
 * Reads the app's generated CONSENT_VERSIONS on main from GitHub, or from a
 * file with `--app <path>` (an app branch not merged yet, or a fixture), and
 * holds it to src/consent-versions.ts: each kind at the site's newest row, or
 * at an earlier one while the app's pull request follows a new text. Fails on
 * a version the site never published and on a kind either side lacks.
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { PINNED } from "../src/consent-versions.ts";
import { APP_VERSIONS_URL, appVersionsFrom, fetchAppVersions, mirror } from "../src/lib/consent.ts";

const usage = "usage: pnpm check:app-versions [-- --app <path to the app's consent.ts>]";
let file: string | undefined;
try {
  // Strict, so a misspelt option or `--app` with no value stops here rather
  // than reading main's file instead of the one named. pnpm passes the `--`
  // of `pnpm check:app-versions -- --app x` through, as in the app's scripts.
  ({ app: file } = parseArgs({
    args: process.argv.slice(2).filter((arg, i) => !(arg === "--" && i === 0)),
    options: { app: { type: "string" } },
  }).values);
} catch (error) {
  console.error(`${(error as Error).message}\n${usage}`);
  process.exit(2);
}
if (file === "") {
  console.error(`--app takes a value\n${usage}`);
  process.exit(2);
}

let app: Record<string, string>;
try {
  app = file ? appVersionsFrom(readFileSync(file, "utf8")) : await fetchAppVersions();
} catch (error) {
  console.error(`the app's versions could not be read: ${(error as Error).message}`);
  process.exit(1);
}

const { problems, behind } = mirror(PINNED, app);
const source = file ?? APP_VERSIONS_URL;
for (const line of behind) console.warn(`::warning::${line}`);
if (problems.length > 0) {
  console.error(`the site's versions and the app's (${source}) disagree:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(
  behind.length > 0
    ? `the app's consent versions (${source}) are the site's or earlier ones of the site's, which the app follows`
    : `the app's consent versions (${source}) are the site's`,
);
