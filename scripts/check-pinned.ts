/**
 * `pnpm check:pinned -- --base <git ref>`: src/consent-versions.ts against the
 * base's (kuutti-ry/kuutti-app#208). A row pins the text people agreed to
 * under its version, so it is added at the end and never changed or removed;
 * the build alone cannot tell a row edited to fit a changed text from a new
 * one. CI's lint job runs it against origin/main.
 *
 * A base without the table (before the pin began) holds nothing. A base that
 * is not a commit fails: the check is then to be fixed, not passed.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { PINNED } from "../src/consent-versions.ts";
import { historyProblems, type Pinned } from "../src/lib/consent.ts";

const TABLE = "src/consent-versions.ts";
const usage = "usage: pnpm check:pinned -- --base <git ref, such as origin/main>";

let base: string | undefined;
try {
  ({ base } = parseArgs({
    args: process.argv.slice(2).filter((arg, i) => !(arg === "--" && i === 0)),
    options: { base: { type: "string" } },
  }).values);
} catch (error) {
  console.error(`${(error as Error).message}\n${usage}`);
  process.exit(2);
}
if (!base) {
  console.error(usage);
  process.exit(2);
}

const git = (...args: string[]) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const succeeds = (...args: string[]) => {
  try {
    git(...args);
    return true;
  } catch {
    return false;
  }
};

if (!succeeds("rev-parse", "--verify", "--quiet", `${base}^{commit}`)) {
  console.error(`check:pinned: ${base} is not a commit here (fetch it first)`);
  process.exit(1);
}
if (!succeeds("cat-file", "-e", `${base}:${TABLE}`)) {
  console.log(`check:pinned: ${base} has no ${TABLE}; the pin begins with this change`);
  process.exit(0);
}

// The base's table is TypeScript whose one import is a type, which Node's
// type stripping erases, so it is read where it is written to.
const dir = mkdtempSync(join(tmpdir(), "consent-versions-"));
let before: Partial<Pinned>;
try {
  const file = join(dir, "consent-versions.ts");
  writeFileSync(file, git("show", `${base}:${TABLE}`));
  ({ PINNED: before } = (await import(pathToFileURL(file).href)) as { PINNED: Partial<Pinned> });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

const problems = historyProblems(before, PINNED);
if (problems.length > 0) {
  console.error(`${TABLE} against ${base}:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(`check:pinned: every row of ${base}'s ${TABLE} is here, unchanged, in its place`);
