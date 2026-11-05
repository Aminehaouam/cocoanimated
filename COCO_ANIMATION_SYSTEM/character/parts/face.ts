/**
 * Face: the bare white face patch of an African grey (scalloped where the crown feathers overlap
 * it), the brighter ring around the eye, the large black eye and its two highlights, plus the
 * expression extras that are hidden at rest (brow, blush).
 *
 * The eye is a 4-segment path, so expressions morph it (EYE shapes below keep that structure):
 * open ellipse, blink "◡", happy-open "◠", happy-closed "∩". The highlights are masked by the eye.
 */
import { PALETTE as C, alpha } from '../master/palette.ts';
import { ellipse, smooth, type OPt, type Pt } from '../../rev2d/source/lib/geom.ts';
import { LM } from '../master/landmarks.ts';
import { radial, type Part } from './types.ts';

export const FACE_PATCH: OPt[] = [
  [458, 402], [461, 372], [470, 350], [484, 333], [500, 321], [518, 313],
  [533, 309], [546, 313, 'c'], [555, 302], [568, 299, 'c'], [580, 292], [594, 293, 'c'], [606, 286],
  [628, 284], [645, 298], [656, 320], [664, 360], [666, 420], [662, 456], [655, 480], [644, 484],
  [638, 466, 'c'], [628, 455], [600, 449], [580, 448], [568, 460], [552, 469], [530, 477], [508, 474],
  [490, 466], [477, 455], [466, 438], [460, 420],
];

const K = 0.5522847498;
const n = (v: number): number => Math.round(v * 10) / 10;

/** A closed eye-like shape through its right, bottom, left and top points (the ellipse structure). */
export function eyePath(R: Pt, B: Pt, L: Pt, T: Pt): string {
  const p = (x: number, y: number): string => `${n(x)} ${n(y)}`;
  return [
    `M ${p(R[0], R[1])}`,
    `C ${p(R[0], R[1] + (B[1] - R[1]) * K)} ${p(B[0] + (R[0] - B[0]) * K, B[1])} ${p(B[0], B[1])}`,
    `C ${p(B[0] - (B[0] - L[0]) * K, B[1])} ${p(L[0], L[1] + (B[1] - L[1]) * K)} ${p(L[0], L[1])}`,
    `C ${p(L[0], L[1] - (L[1] - T[1]) * K)} ${p(T[0] - (T[0] - L[0]) * K, T[1])} ${p(T[0], T[1])}`,
    `C ${p(T[0] + (R[0] - T[0]) * K, T[1])} ${p(R[0], R[1] - (R[1] - T[1]) * K)} ${p(R[0], R[1])}`,
    'Z',
  ].join(' ');
}

const [EX, EY] = LM.eye;
const [ERX, ERY] = LM.eyeRadius;

/** Eye keyforms over EyeROpen (0 closed … 1 open) × EyeRSmile (0 … 1 happy). */
export const EYE = {
  open: eyePath([EX + ERX, EY], [EX, EY + ERY], [EX - ERX, EY], [EX, EY - ERY]),
  closed: eyePath([EX + 26, EY + 9], [EX, EY + 21], [EX - 26, EY + 9], [EX, EY + 15]),
  happyOpen: eyePath([EX + ERX, EY + 8], [EX, EY - 4], [EX - ERX, EY + 8], [EX, EY - ERY]),
  happyClosed: eyePath([EX + 25, EY + 12], [EX, EY - 3], [EX - 25, EY + 12], [EX, EY - 9]),
} as const;

/** Brow: a tapered dark stroke above the eye. */
export function browPath(l: Pt, r: Pt, arch: number, thick = 8): string {
  const at = (t: number, dy: number): Pt => [l[0] + (r[0] - l[0]) * t, l[1] + (r[1] - l[1]) * t - arch + dy];
  return smooth([
    [l[0], l[1], 'c'], at(0.3, -thick / 2), at(0.7, -thick * 0.42), [r[0], r[1], 'c'], at(0.7, thick * 0.42), at(0.3, thick / 2),
  ]);
}

/** Brow keyforms over BrowRY (−1 low … +1 raised) × BrowRAngle (−1 angry … +1 worried). */
export function browShape(y: number, angle: number): string {
  const dy = y < 0 ? 7 * -y : -10 * y;
  const [ldy, rdy, arch] = angle < 0 ? [-5 * -angle, 9 * -angle, 5 - 3 * -angle] : [5 * angle, -9 * angle, 5 + 2 * angle];
  return browPath([500, 345 + dy + ldy], [558, 341 + dy + rdy], arch);
}

export function faceParts(): Part[] {
  const [hx, hy] = LM.highlight;
  const [h2x, h2y] = LM.highlight2;
  return [
    {
      id: 'facePatch', parent: 'faceWarp', z: 22, mask: ['head'], tags: ['face'],
      description: 'Bare white face patch (clipped to the head, so it never pokes out when the face turns).',
      shape: { type: 'path', d: smooth(FACE_PATCH), detail: 12 },
      fill: C.facePatch,
    },
    {
      id: 'blush', parent: 'faceWarp', z: 22.5, opacity: 0, tags: ['face', 'expression'],
      description: 'Blush on the face patch (Blush parameter).',
      shape: { type: 'ellipse', cx: 573, cy: 456, rx: 17, ry: 10, detail: 4 },
      fill: radial([573, 456], 18, [[0, alpha(C.blush, 0.95)], [0.6, alpha(C.blush, 0.6)], [1, alpha(C.blush, 0)]]),
    },
    {
      id: 'eyeRing', parent: 'faceWarp', z: 23, tags: ['face', 'eye'],
      description: 'Bright ring around the eye.',
      shape: { type: 'path', d: ellipse(LM.eyeRing[0], LM.eyeRing[1], LM.eyeRingRadius[0], LM.eyeRingRadius[1]), detail: 8 },
      fill: C.eyeRing,
    },
    {
      id: 'eye', parent: 'eyeWarp', z: 24, tags: ['face', 'eye'],
      description: 'The black eye (morphs for blinks and expressions).',
      shape: { type: 'path', d: EYE.open, detail: 5, tolerance: 0.2 },
      fill: C.eye,
    },
    {
      id: 'eyeHighlight', parent: 'eyeWarp', z: 25, mask: ['eye'], tags: ['face', 'eye'],
      shape: { type: 'ellipse', cx: hx, cy: hy, rx: 10.5, ry: 10.5, detail: 4 },
      fill: C.eyeHighlight,
    },
    {
      id: 'eyeHighlight2', parent: 'eyeWarp', z: 25, mask: ['eye'], opacity: 0.6, tags: ['face', 'eye'],
      shape: { type: 'ellipse', cx: h2x, cy: h2y, rx: 3.5, ry: 3.5, detail: 3 },
      fill: C.eyeHighlight,
    },
    {
      id: 'brow', parent: 'faceWarp', z: 26, opacity: 0, tags: ['face', 'expression'],
      description: 'Brow stroke, only visible when BrowRY / BrowRAngle are used.',
      shape: { type: 'path', d: browShape(0, 0), detail: 4, tolerance: 0.2 },
      fill: C.brow,
    },
  ];
}
