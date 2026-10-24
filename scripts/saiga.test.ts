import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { SAIGA_FILES, SAIGA_SOURCE } from "../src/lib/saiga.ts";
import { fontProblem } from "./check-fonts.ts";
import { fetchSaiga } from "./saiga.ts";

// Saiga, Kuutti's typeface, and how it stays out of this repository (docs/decisions.md, 18).
// The tests never hold a byte of it: their files are made up, and so are their sums.

const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const made = (text: string) => new TextEncoder().encode(text);
const files = [
  { file: "A.woff2", bytes: made("first") },
  { file: "B.woff2", bytes: made("second") },
];
const pinned = files.map(({ file, bytes }) => ({ file, sha256: sha256(bytes) }));

/** A GitHub of the test's own: each file at its address, and what it was asked. */
function server(answers: Record<string, Response | Uint8Array<ArrayBuffer>>) {
  const asked: { url: string; headers: Record<string, string> }[] = [];
  const get = (async (url: string | URL | Request, init?: RequestInit) => {
    asked.push({ url: String(url), headers: (init?.headers ?? {}) as Record<string, string> });
    const name = String(url).split("?")[0]?.split("/").at(-1) ?? "";
    const answer = answers[name];
    if (answer === undefined) return new Response(null, { status: 404 });
    return answer instanceof Response ? answer : new Response(answer);
  }) as typeof fetch;
  return { asked, get };
}

test("each file is fetched from the private repository at the pinned commit, with the token", async () => {
  const { asked, get } = server(Object.fromEntries(files.map(({ file, bytes }) => [file, bytes])));
  const fetched = await fetchSaiga("the-token", get, pinned);
  assert.deepEqual(
    fetched.map(({ file, bytes }) => [file, new TextDecoder().decode(bytes)]),
    [
      ["A.woff2", "first"],
      ["B.woff2", "second"],
    ],
  );
  assert.deepEqual(
    asked.map(({ url }) => url),
    files.map(
      ({ file }) =>
        `https://api.github.com/repos/${SAIGA_SOURCE.repository}/contents/${SAIGA_SOURCE.folder}/${file}?ref=${SAIGA_SOURCE.commit}`,
    ),
  );
  for (const { headers } of asked) {
    assert.equal(headers.Authorization, "Bearer the-token");
    assert.equal(headers.Accept, "application/vnd.github.raw+json");
  }
});

test("a file that is not the one pinned is refused, by name", async () => {
  const { get } = server({ "A.woff2": made("first"), "B.woff2": made("something else") });
  await assert.rejects(fetchSaiga("the-token", get, pinned), /^Error: B\.woff2: not the file/);
});

test("an answer that is not a file is refused, by name and status, and the token is never said", async () => {
  const { get } = server({ "A.woff2": new Response("Bad credentials", { status: 401 }) });
  await assert.rejects(fetchSaiga("the-token", get, pinned), (error: Error) => {
    assert.equal(error.message, "A.woff2: GitHub answered 401");
    assert.doesNotMatch(error.message, /the-token/);
    return true;
  });
  const missing = server({ "A.woff2": made("first") });
  await assert.rejects(
    fetchSaiga("the-token", missing.get, pinned),
    /B\.woff2: GitHub answered 404/,
  );
});

test("the pinned commit is a full commit, and every file has a SHA-256", () => {
  assert.match(SAIGA_SOURCE.commit, /^[0-9a-f]{40}$/);
  for (const { file, sha256: sum } of SAIGA_FILES) {
    assert.match(file, /^Saiga-[A-Za-z]+\.woff2$/);
    assert.match(sum, /^[0-9a-f]{64}$/);
  }
});

test("the style sheet names every file of SAIGA_FILES, with its weight and style, and no other", () => {
  const css = readFileSync(join(import.meta.dirname, "..", "public", "fonts", "saiga.css"), "utf8");
  const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body = ""]) => ({
    file: /url\("\/fonts\/saiga\/([^"]+)"\)/.exec(body)?.[1],
    weight: Number(/font-weight:\s*(\d+)/.exec(body)?.[1]),
    style: /font-style:\s*(\w+)/.exec(body)?.[1],
  }));
  assert.deepEqual(
    faces,
    SAIGA_FILES.map(({ file, weight, style }) => ({ file, weight, style })),
  );
});

test("no font but Inter's may be committed, whatever its name", () => {
  const signatures = ["wOF2", "wOFF", "OTTO", "\u0000\u0001\u0000\u0000", "true", "ttcf"];
  for (const signature of signatures) {
    assert.equal(
      fontProblem("public/fonts/x.png", made(`${signature}rest of the file`)),
      "public/fonts/x.png: a font file",
      JSON.stringify(signature),
    );
  }
  assert.equal(fontProblem("public/fonts/inter-latin-wght-normal.woff2", made("wOF2...")), null);
  // Put together, so that the check does not find this file.
  const inlined = `@font-face { src: url(${["data:", "font/"].join("")}woff2;base64,AAAA) }`;
  assert.equal(
    fontProblem("src/styles/x.css", made(inlined)),
    "src/styles/x.css: a font written into the file",
  );
  assert.equal(fontProblem("README.md", made("# kuutti-app-site")), null);
  assert.equal(fontProblem("empty", new Uint8Array()), null);
});
