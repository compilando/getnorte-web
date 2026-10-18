/**
 * The size every capture of a kind is taken at, so an <img> can hold its
 * place before the picture arrives. Without it a lazy capture is 0 px tall
 * until it loads, and the page below jumps — every 5 s in the agent steps,
 * whose hidden screens only load when their turn comes.
 *
 * Plain data, safe in client components. lib/shots.ts checks each file
 * against it at build time, so captures retaken at another size fail the
 * build instead of bringing the jump back.
 */
export const SHOT_SIZE = {
  kitty: [2377, 1483],
  gui: [2400, 1600],
} as const satisfies Record<string, readonly [number, number]>;

export type ShotKind = keyof typeof SHOT_SIZE;

/** The kind of a capture from its public path: /shots/<kind>/<lang>/<name>.webp. */
export function shotKind(src: string): ShotKind | undefined {
  const kind = src.split("/")[2];
  return kind && kind in SHOT_SIZE ? (kind as ShotKind) : undefined;
}

/** width and height for an <img> of this capture, or nothing for a file of no known kind. */
export function shotSize(src: string): { width?: number; height?: number } {
  const kind = shotKind(src);
  return kind ? { width: SHOT_SIZE[kind][0], height: SHOT_SIZE[kind][1] } : {};
}
