/**
 * The water's edge of Gaiane's sketches (docs/decisions.md, 21): scallops, each
 * an arc that dips between two crests, as the wave under the logo's pup does.
 * The drawings that use it are in the logo's own units (public/logo.png, 840 x
 * 572), so that the water and the logo meet in one line.
 */
export type Swell = {
  /** From crest to crest. */
  width: number;
  /** How far the arc dips below its crests. */
  sag: number;
};

/** One of the logo's outer scallops, as its file has it. */
export const SWELL: Swell = { width: 258, sag: 62 };

/** The radius of the arc through two crests `width` apart that dips `sag` between them. */
export function radius({ width, sag }: Swell): number {
  return (width * width) / (8 * sag) + sag / 2;
}

/** `count` scallops rightwards from where the path stands, as relative arcs. */
export function scallops(count: number, swell: Swell = SWELL): string {
  const r = radius(swell);
  return ` a${r} ${r} 0 0 0 ${swell.width} 0`.repeat(count);
}
