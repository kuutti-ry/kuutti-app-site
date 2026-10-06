import type { APIRoute } from "astro";
import { sitemapEntries } from "../lib/sitemap.ts";

// Every page search engines may index, for robots.txt to name. A draft is
// left out, as its page tells search engines to leave it alone. A legal text
// carries the date of its wording as <lastmod>; changefreq and priority are
// left out, as search engines ignore them.
export const GET: APIRoute = async () => {
  const urls = (await sitemapEntries()).map(({ loc, lastmod }) =>
    lastmod
      ? `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
      : `  <url><loc>${loc}</loc></url>`,
  );
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
