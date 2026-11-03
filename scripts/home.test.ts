import assert from "node:assert/strict";
import { test } from "node:test";
import { opened } from "../src/lib/home.ts";

// The home page, which says what each page is (docs/decisions.md, 23).

const about = [
  "<p>Kuutti ry is an association. Its purpose is to reduce loneliness.</p>",
  '<h2 id="what-it-does">What it does</h2>',
  "<p>It develops Kuutti.</p>",
  '<h3 id="is-it-free">Is it free?</h3>',
  "<p>Yes.</p>",
].join("\n");

test("a page is cut at its first heading: what it says before, and the rest from there", () => {
  assert.deepEqual(opened(about), {
    opening: "<p>Kuutti ry is an association. Its purpose is to reduce loneliness.</p>",
    rest: about.slice(about.indexOf("<h2")),
  });
  assert.deepEqual(opened('<h2 id="write">Write to us</h2>\n<p>hello@</p>'), {
    opening: "",
    rest: '<h2 id="write">Write to us</h2>\n<p>hello@</p>',
  });
  assert.deepEqual(opened("<p>Only words.</p>\n"), { opening: "<p>Only words.</p>", rest: "" });
});
