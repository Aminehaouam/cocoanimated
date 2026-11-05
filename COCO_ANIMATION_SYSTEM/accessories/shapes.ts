/** Shared accessory shapes (setup / world px; all built from geom.ts so they stay morph- and map-friendly). */
import { capsule, compound, ellipse, frame, aim, smooth, type OPt, type Pt } from '../rev2d/source/lib/geom.ts';

/** A thick stroke through points (overlapping capsules, one colour). */
export const strokes = (pts: Pt[], r: number): string => compound(...pts.slice(1).map((p, i) => smooth(capsule(pts[i], p, r))));

/** A heart of width ~2s centred at (cx, cy). */
export function heart(cx: number, cy: number, s: number): string {
  const p: OPt[] = [
    [cx, cy + s * 0.95, 'c'], [cx - s * 0.62, cy + s * 0.35], [cx - s, cy - s * 0.15], [cx - s * 0.8, cy - s * 0.72], [cx - s * 0.32, cy - s * 0.8],
    [cx, cy - s * 0.42, 'c'], [cx + s * 0.32, cy - s * 0.8], [cx + s * 0.8, cy - s * 0.72], [cx + s, cy - s * 0.15], [cx + s * 0.62, cy + s * 0.35],
  ];
  return smooth(p, 0.9);
}

/** A five-point star (outer radius r, inner radius r * k), rounded a little. */
export function star(cx: number, cy: number, r: number, k = 0.48, deg = 0): string {
  const pts: OPt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((deg - 90 + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? r * k : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 'c']);
  }
  return smooth(pts, 0.25);
}

/** A spiral stroke (dizzy swirl). */
export function spiral(cx: number, cy: number, r: number, turns = 1.6, thick = 3.2): string {
  const pts: Pt[] = [];
  const n = Math.round(turns * 14);
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * turns * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r * (0.15 + 0.85 * t), cy + Math.sin(a) * r * 0.55 * (0.15 + 0.85 * t)]);
  }
  return strokes(pts, thick);
}

/** An eighth note: head + stem + flag. */
export function note(x: number, y: number, s: number): string {
  return compound(
    ellipse(x, y, s * 0.55, s * 0.42),
    smooth(capsule([x + s * 0.48, y - s * 0.1], [x + s * 0.48, y - s * 1.9], s * 0.12)),
    smooth([[x + s * 0.4, y - s * 1.95, 'c'], [x + s * 1.1, y - s * 1.5], [x + s * 1.05, y - s * 1.0], [x + s * 0.55, y - s * 1.25, 'c']]),
  );
}

/** A tapered stick from a to b (half-widths w0 at a, w1 at b), round ends. */
export function stick(a: Pt, b: Pt, w0: number, w1: number): string {
  const { deg, len } = aim(a, b);
  const uv: Array<[number, number]> = [[-w0, 0], [0, -w0], [len * 0.5, -(w0 + w1) / 2], [len, -w1], [len + w1, 0], [len, w1], [len * 0.5, (w0 + w1) / 2], [0, w0]];
  return smooth(uv.map(([u, v]) => frame(a, deg, u, v)));
}

/** A four-point sparkle star. */
export function sparkle(cx: number, cy: number, r: number): string {
  const k = r * 0.32;
  const pts: OPt[] = [[cx, cy - r, 'c'], [cx + k, cy - k], [cx + r, cy, 'c'], [cx + k, cy + k], [cx, cy + r, 'c'], [cx - k, cy + k], [cx - r, cy, 'c'], [cx - k, cy - k]];
  return smooth(pts, 0.4);
}

/** A teardrop (point up) of height h. */
export function drop(cx: number, cy: number, h: number): string {
  const w = h * 0.36;
  return smooth([[cx, cy - h * 0.55, 'c'], [cx + w * 0.55, cy - h * 0.05], [cx + w, cy + h * 0.22], [cx, cy + h * 0.45], [cx - w, cy + h * 0.22], [cx - w * 0.55, cy - h * 0.05]], 0.9);
}
