/**
 * No font file but Inter's in the repository (docs/decisions.md, 18): Saiga,
 * Kuutti's typeface, is licensed for Kuutti's own media and must never be
 * public as a file, and a file once pushed stays in the history for good.
 * Reads what git tracks or has staged, by content and not by name: a font's
 * signature, an inlined font, or the SHA-256 of a file Spoke delivered.
 * Run by `pnpm lint` and before every commit (.githooks/pre-commit).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SAIGA_FILES } from "../src/lib/saiga.ts";

/** The one font the repository carries: Inter, under the SIL Open Font License (decision 9). */
const ALLOWED = new Set(["public/fonts/inter-latin-wght-normal.woff2"]);

/** The first four bytes of a font: WOFF2, WOFF, OpenType with CFF, TrueType (two ways), a collection. */
const SIGNATURES = ["774f4632", "774f4646", "4f54544f", "00010000", "74727565", "74746366"];

/** A font written into a style sheet; put together here so that this file does not find itself. */
const INLINED = ["data:", "font/"].join("");

/** What is wrong with a file that git tracks, or null. */
export function fontProblem(path: string, bytes: Uint8Array): string | null {
  if (ALLOWED.has(path)) return null;
  const head = Buffer.from(bytes.subarray(0, 4)).toString("hex");
  if (SIGNATURES.includes(head)) return `${path}: a font file`;
  const sum = createHash("sha256").update(bytes).digest("hex");
  if (SAIGA_FILES.some(({ sha256 }) => sha256 === sum)) return `${path}: a file of Saiga`;
  if (Buffer.from(bytes).includes(INLINED)) return `${path}: a font written into the file`;
  return null;
}

if (import.meta.main) {
  const root = join(import.meta.dirname, "..");
  const tracked = execFileSync("git", ["ls-files", "-z", "--cached"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter((path) => path !== "");
  const problems = tracked.flatMap((path) => {
    const problem = fontProblem(path, readFileSync(join(root, path)));
    return problem === null ? [] : [problem];
  });
  if (problems.length > 0) {
    console.error(
      `${problems.join("\n")}\nSaiga is never in this repository: unstage it (git rm --cached <file>). Only Inter's file may be here.`,
    );
    process.exit(1);
  }
  console.log(`fonts hold: ${tracked.length} files, no font but Inter's`);
}
