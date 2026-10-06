import type { APIRoute } from "astro";
import { llmsText } from "../lib/machine.ts";

// The index of the site for agents (llmstxt.org): what Kuutti is, and a link
// to the machine version of every page (src/lib/machine.ts).
export const GET: APIRoute = async () =>
  new Response(await llmsText(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
