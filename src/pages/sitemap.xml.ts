import type { APIRoute } from "astro";
import { sitemapPaths } from "../lib/machine.ts";

// Every page search engines may index, for robots.txt to name. A draft is
// left out, as its page tells search engines to leave it alone; so are the
// machine versions, whose pages are the ones to index.
export const GET: APIRoute = async () => {
  const urls = (await sitemapPaths()).map((loc) => `  <url><loc>${loc}</loc></url>`);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
