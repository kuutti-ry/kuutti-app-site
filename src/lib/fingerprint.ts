import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The address of a file of `public/` with a fingerprint of what is in it
 * (`/kuutti.png?v=1a2b3c4d`), for the files that other services keep by
 * their address: a messenger's link preview, a browser's icon. The address
 * changes when the file does, so nobody goes on showing the old one: Telegram
 * still showed the tail on 24/10/2026, three days after the seal pup's face
 * took its place under the same name (docs/decisions.md, 7).
 */
export function fingerprinted(path: string, root: string = process.cwd()): string {
  const sum = createHash("sha256")
    .update(readFileSync(join(root, "public", path)))
    .digest("hex");
  return `${path}?v=${sum.slice(0, 8)}`;
}
