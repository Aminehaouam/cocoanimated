/** A Rev2D part exactly as written into the model (see `rev2d_schema {name: "Part"}`). */
export type Part = { id: string; z: number; [key: string]: unknown };

/** Linear gradient fill in setup space. */
export function linear(from: [number, number], to: [number, number], stops: Array<[number, string]>) {
  return { type: 'linear', from, to, stops };
}

/** Radial gradient fill in setup space. */
export function radial(center: [number, number], radius: number, stops: Array<[number, string]>) {
  return { type: 'radial', center, radius, stops };
}

/**
 * The shared feather gradient of the head and the body. Both use exactly this function of setup
 * position, so where the head overlaps the chest the colours match and no seam shows. Crown light
 * and nape shade are separate overlay parts masked to the head.
 */
export function featherFill(c: { bodyLight: string; bodyBase: string; bodyDark: string; headDark: string }) {
  return radial([590, 560], 360, [[0, c.bodyLight], [0.45, c.bodyBase], [0.75, c.bodyDark], [1, c.headDark]]);
}
