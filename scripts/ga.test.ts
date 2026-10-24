import assert from "node:assert/strict";
import { test } from "node:test";
import { markExternal } from "../src/lib/external.ts";
import { reuse } from "../src/lib/reuse.ts";

// Gaiane's structure, at /ga/ (docs/decisions.md, 16).

const app = [
  "<p>Kuutti is an app.</p>",
  '<h2 id="what-it-is">What it is</h2>',
  "<p><strong>Free.</strong> Nothing to buy.</p>",
  '<h3 id="free">Free</h3>',
  "<p>Really free.</p>",
  '<h3 id="open">Open</h3>',
  "<p>Open source.</p>",
  '<h2 id="research">Research</h2>',
  "<p>Only with your yes.</p>",
].join("\n");
const pages = new Map([
  ["/app/", app],
  ["/empty/", '<h2 id="nothing">Nothing</h2>\n<h2 id="next">Next</h2>\n<p>After.</p>'],
]);

test("a marker becomes the section under its heading, without the heading, up to the next of its level", () => {
  assert.equal(
    reuse("<h2>Why</h2>\n<p>@reuse /app/#what-it-is</p>", pages),
    '<h2>Why</h2>\n<p><strong>Free.</strong> Nothing to buy.</p>\n<h3 id="free">Free</h3>\n<p>Really free.</p>\n<h3 id="open">Open</h3>\n<p>Open source.</p>',
  );
  assert.equal(reuse("<p>@reuse /app/#research</p>", pages), "<p>Only with your yes.</p>");
});

test("a lower heading's section ends at the next heading of its level or above", () => {
  assert.equal(reuse("<p>@reuse /app/#free</p>", pages), "<p>Really free.</p>");
  assert.equal(reuse("<p>@reuse /app/#open</p>", pages), "<p>Open source.</p>");
});

test("a marker without an anchor is what the page says before its first heading", () => {
  assert.equal(reuse("<p>@reuse /app/</p>", pages), "<p>Kuutti is an app.</p>");
});

test("every marker is replaced, and the text around them stays", () => {
  assert.equal(
    reuse(
      "<p>Before.</p>\n<p>@reuse /app/</p>\n<p>Between.</p>\n<p>@reuse /app/#research</p>",
      pages,
    ),
    "<p>Before.</p>\n<p>Kuutti is an app.</p>\n<p>Between.</p>\n<p>Only with your yes.</p>",
  );
  assert.equal(reuse("<p>No marker here.</p>", pages), "<p>No marker here.</p>");
});

test("a marker that names nothing fails the build", () => {
  assert.throws(() => reuse("<p>@reuse /nowhere/</p>", pages), /there is no page at \/nowhere\//);
  assert.throws(() => reuse("<p>@reuse /app/#missing</p>", pages), /\/app\/ has no #missing/);
  assert.throws(() => reuse("<p>@reuse /empty/</p>", pages), /\/empty\/ has no opening/);
  assert.throws(() => reuse("<p>@reuse /empty/#nothing</p>", pages), /\/empty\/ has no #nothing/);
});

test("a marker inside a sentence is refused, never shown", () => {
  assert.throws(() => reuse("<p>See @reuse /app/ here.</p>", pages), /a paragraph of its own/);
  assert.throws(() => reuse("<p>@reuse app</p>", pages), /a paragraph of its own/);
});

test("a link that leaves the site opens in a new tab and says so, by an arrow and in words", () => {
  const marked = markExternal(
    '<p><a href="https://github.com/kuutti-ry">GitHub</a> and <a href="https://ytj.fi/">YTJ</a></p>',
    "opens in a new tab",
  );
  const links = [...marked.matchAll(/<a [^>]*>[\s\S]*?<\/a>/g)].map(([link]) => link);
  assert.equal(links.length, 2);
  for (const link of links) {
    assert.match(link, /target="_blank" rel="noopener"/);
    assert.match(link, /<svg class="external"[^>]*aria-hidden="true"/);
    assert.match(link, /<span class="visually-hidden"> \(opens in a new tab\)<\/span><\/a>$/);
  }
  assert.match(marked, /^<p><a href="https:\/\/github\.com\/kuutti-ry" target="_blank"/);
});

test("a link inside the site, an anchor or an e-mail address stays as it is", () => {
  const html =
    '<p><a href="/ga/about/">About</a> <a href="#top">Top</a> <a href="mailto:a@b.fi">Mail</a></p>';
  assert.equal(markExternal(html, "opens in a new tab"), html);
});
