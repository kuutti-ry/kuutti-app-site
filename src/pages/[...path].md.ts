import type { APIRoute, GetStaticPaths } from "astro";
import { machinePages } from "../lib/machine.ts";

// The machine version of every page (src/lib/machine.ts): "/about.md" for
// "/about/", "/index.md" for the home page.
export const getStaticPaths = (async () =>
  (await machinePages()).map(({ path, text }) => ({
    params: { path: path.replace(/^\//, "").replace(/\.md$/, "") },
    props: { text },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.text as string, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
