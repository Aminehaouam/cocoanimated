/**
 * Geometry helpers for authoring Coco in canvas (setup-space) pixels: origin top-left, +x right,
 * +y down, angles in degrees clockwise (Rev2D conventions).
 *
 * Outlines are written as point lists and turned into closed cubic Bezier paths ("M ... C ... Z",
 * one C per point). Paths built from the same number of points have the same command structure,
 * so Rev2D can morph between them (path keyforms must keep the setup path's commands).
 */

export type Pt = [number, number];
/** An outline point. A third element 'c' makes it a sharp corner (no smoothing through it). */
export type OPt = [number, number] | [number, number, 'c'];

/** Round to 0.1 px and normalise -0, so generated JSON stays short and diff-friendly. */
export function r1(v: number): number {
  const o = Math.round(v * 10) / 10;
  return Object.is(o, -0) ? 0 : o;
}

const fmt = (x: number, y: number): string => `${r1(x)} ${r1(y)}`;

/**
 * Closed smooth outline through `pts` (Catmull-Rom converted to cubic Beziers). `tension` 1 is the
 * classic Catmull-Rom; lower values give rounder corners, higher values tighter ones.
 */
export function smooth(pts: readonly OPt[], tension = 1): string {
  const n = pts.length;
  if (n < 3) throw new Error(`smooth: need at least 3 points, got ${n}`);
  const P = (i: number): OPt => pts[((i % n) + n) % n];
  const corner = (i: number): boolean => P(i)[2] === 'c';
  const k = tension / 6;
  const p0 = P(0);
  let d = `M ${fmt(p0[0], p0[1])}`;
  for (let i = 0; i < n; i++) {
    const a = P(i - 1), b = P(i), c = P(i + 1), e = P(i + 2);
    // Outgoing tangent at b, incoming tangent at c. Corners use the chord, so the curve leaves straight.
    const c1x = corner(i) ? b[0] + (c[0] - b[0]) * k : b[0] + (c[0] - a[0]) * k;
    const c1y = corner(i) ? b[1] + (c[1] - b[1]) * k : b[1] + (c[1] - a[1]) * k;
    const c2x = corner(i + 1) ? c[0] - (c[0] - b[0]) * k : c[0] - (e[0] - b[0]) * k;
    const c2y = corner(i + 1) ? c[1] - (c[1] - b[1]) * k : c[1] - (e[1] - b[1]) * k;
    d += ` C ${fmt(c1x, c1y)} ${fmt(c2x, c2y)} ${fmt(c[0], c[1])}`;
  }
  return `${d} Z`;
}

const KAPPA = 0.5522847498;

/** Ellipse as 4 cubic segments, starting at the right point and running clockwise (down first). */
export function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  const kx = KAPPA * rx, ky = KAPPA * ry;
  return [
    `M ${fmt(cx + rx, cy)}`,
    `C ${fmt(cx + rx, cy + ky)} ${fmt(cx + kx, cy + ry)} ${fmt(cx, cy + ry)}`,
    `C ${fmt(cx - kx, cy + ry)} ${fmt(cx - rx, cy + ky)} ${fmt(cx - rx, cy)}`,
    `C ${fmt(cx - rx, cy - ky)} ${fmt(cx - kx, cy - ry)} ${fmt(cx, cy - ry)}`,
    `C ${fmt(cx + kx, cy - ry)} ${fmt(cx + rx, cy - ky)} ${fmt(cx + rx, cy)}`,
    'Z',
  ].join(' ');
}

/** Several closed subpaths in one path (Rev2D fills each subpath on its own). */
export function compound(...paths: string[]): string {
  return paths.join(' ');
}

/** Rotate p about c by deg (clockwise on screen). */
export function rot(p: Pt, c: Pt, deg: number): Pt {
  const a = (deg * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
  const dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * cos - dy * sin, c[1] + dx * sin + dy * cos];
}

/** The point `len` px from `o` in direction `deg` (0 = +x, 90 = down). */
export function polar(o: Pt, deg: number, len: number): Pt {
  const a = (deg * Math.PI) / 180;
  return [o[0] + Math.cos(a) * len, o[1] + Math.sin(a) * len];
}

/** A point in a local frame at `o` facing `deg`: u along the direction, v to its right (clockwise side). */
export function frame(o: Pt, deg: number, u: number, v: number): Pt {
  const a = (deg * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
  return [o[0] + u * cos - v * sin, o[1] + u * sin + v * cos];
}

/** Direction from a to b in degrees, and the distance. */
export function aim(a: Pt, b: Pt): { deg: number; len: number } {
  return { deg: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
}

/**
 * A long rounded feather from `base` toward `deg`: widest (`width`) around 60% of its length,
 * `baseWidth` at the root, round tip. 12 outline points (morph-compatible between feathers).
 */
export function feather(base: Pt, deg: number, length: number, width: number, baseWidth = width * 0.55): OPt[] {
  const L = length, W = width / 2, B = baseWidth / 2;
  const uv: Array<[number, number]> = [
    [-0.04 * L, 0], [0, -B], [0.3 * L, -0.9 * W], [0.6 * L, -W], [0.82 * L, -0.86 * W], [0.95 * L, -0.5 * W], [L, 0],
    [0.95 * L, 0.5 * W], [0.82 * L, 0.86 * W], [0.6 * L, W], [0.3 * L, 0.9 * W], [0, B],
  ];
  return uv.map(([u, v]) => frame(base, deg, u, v));
}

/** A capsule (rounded stick) from a to b with radius r: 10 outline points. */
export function capsule(a: Pt, b: Pt, r: number): OPt[] {
  const { deg } = aim(a, b);
  const pts: OPt[] = [];
  for (const t of [-90, -45, 0, 45, 90]) pts.push(polar(b, deg + t, r));
  for (const t of [90, 135, 180, 225, 270]) pts.push(polar(a, deg + t, r));
  return pts;
}

/** Map every coordinate pair of a path made by this module (M / L / C / Z, absolute). */
export function mapPath(d: string, fn: (p: Pt) => Pt): string {
  const tokens = d.trim().split(/\s+/);
  const out: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'Z') {
      out.push('Z');
      continue;
    }
    const pairs = { M: 1, L: 1, C: 3 }[cmd as 'M' | 'L' | 'C'];
    if (!pairs) throw new Error(`mapPath: unsupported command "${cmd}" in "${d.slice(0, 60)}..."`);
    const nums: string[] = [];
    for (let k = 0; k < pairs; k++) {
      const p = fn([Number(tokens[i]), Number(tokens[i + 1])]);
      nums.push(fmt(p[0], p[1]));
      i += 2;
    }
    out.push(`${cmd} ${nums.join(' ')}`);
  }
  return out.join(' ');
}

/** Translate a path. */
export function movePath(d: string, dx: number, dy: number): string {
  return mapPath(d, ([x, y]) => [x + dx, y + dy]);
}

/** Rotate a path about c (clockwise degrees). */
export function rotatePath(d: string, c: Pt, deg: number): string {
  return mapPath(d, (p) => rot(p, c, deg));
}

/** Scale a path about c. */
export function scalePath(d: string, c: Pt, sx: number, sy = sx): string {
  return mapPath(d, ([x, y]) => [c[0] + (x - c[0]) * sx, c[1] + (y - c[1]) * sy]);
}

/** Linear blend of two paths with the same structure (t = 0 → a, 1 → b). */
export function lerpPath(a: string, b: string, t: number): string {
  const ta = a.trim().split(/\s+/), tb = b.trim().split(/\s+/);
  if (ta.length !== tb.length) throw new Error('lerpPath: paths have different structures');
  return ta
    .map((tok, i) => {
      const x = Number(tok), y = Number(tb[i]);
      return Number.isNaN(x) ? tok : String(r1(x + (y - x) * t));
    })
    .join(' ');
}
