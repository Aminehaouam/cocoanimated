/**
 * Beak: the hooked upper mandible (bone `beak`) over the smaller lower mandible (bone `jaw`, which
 * rotates down to open the beak). Between them the mouth interior (a sliver hidden behind the lower
 * mandible when closed; its open keyform is computed from the jaw rotation, so the gap is always
 * filled) and the tongue. A dark mouth line along the lower mandible carries the smile (MouthForm).
 */
import { PALETTE as C } from '../master/palette.ts';
import { ellipse, rot, smooth, type OPt, type Pt } from '../../rev2d/source/lib/geom.ts';
import { LM } from '../master/landmarks.ts';
import { linear, type Part } from './types.ts';

/** How far MouthOpen = 1 rotates the jaw (degrees, clockwise = down). */
export const JAW_OPEN_DEG = 24;

export const BEAK_UPPER: OPt[] = [
  [597, 400, 'c'], [597, 378], [602, 352], [610, 330], [624, 315], [642, 309], [664, 314], [681, 330], [692, 352],
  [699, 378], [701, 404], [698, 428], [691, 444], [686, 453, 'c'], [679, 443], [672, 432], [666, 427, 'c'],
  [648, 425], [626, 418], [609, 409],
];

export const BEAK_LOWER: OPt[] = [
  [596, 398, 'c'], [612, 411], [634, 421], [654, 427], [664, 430, 'c'], [665, 442], [657, 455], [642, 462],
  [626, 462], [609, 452], [599, 432],
];

/** Mouth line keyforms over MouthForm: a thin dark crescent along the lower mandible. */
export const MOUTH_LINE = {
  frown: smooth([[604, 404, 'c'], [626, 415], [646, 424], [661, 437, 'c'], [657, 442], [645, 430], [626, 421]]),
  rest: smooth([[604, 404, 'c'], [626, 418], [646, 426], [663, 430, 'c'], [662, 437], [646, 432], [626, 424]]),
  smile: smooth([[604, 404, 'c'], [626, 419], [647, 426], [667, 424, 'c'], [665, 432], [646, 432], [626, 425]]),
} as const;

/** The upper edge of the mouth (along the upper mandible's cutting edge), hinge first. */
const MOUTH_TOP: Pt[] = [[600, 402], [626, 418], [650, 427], [665, 430]];
/** The lower mandible's top edge, front first (the interior's lower edge follows it when open). */
const JAW_TOP: Pt[] = [[662, 432], [640, 426], [618, 416], [603, 404]];

function mouthInside(open: number): string {
  const hinge = LM.beakHinge;
  const bottom = JAW_TOP.map(([x, y], i): Pt => {
    // Closed: a sliver 2.5 px under the cutting edge; open: the rotated jaw edge, 4 px inside the jaw.
    const closed: Pt = [x, y + 2.5];
    const opened = rot([x, y + 4], hinge, JAW_OPEN_DEG);
    const t = open;
    return i === 0 && open === 0 ? closed : [closed[0] + (opened[0] - closed[0]) * t, closed[1] + (opened[1] - closed[1]) * t];
  });
  return smooth([
    [MOUTH_TOP[0][0], MOUTH_TOP[0][1], 'c'], MOUTH_TOP[1], MOUTH_TOP[2], [MOUTH_TOP[3][0], MOUTH_TOP[3][1], 'c'],
    ...bottom,
  ]);
}

/** Mouth interior keyforms over MouthOpen. */
export const MOUTH_INSIDE = { closed: mouthInside(0), open: mouthInside(1) } as const;

const BEAK_SHEEN: OPt[] = [
  [606, 352, 'c'], [612, 330], [628, 316], [648, 312], [668, 318, 'c'], [650, 320], [632, 326], [617, 340],
];

export function beakParts(): Part[] {
  return [
    {
      id: 'mouthInside', parent: 'beak', z: 26, tags: ['beak', 'mouth'],
      description: 'Mouth interior: a hidden sliver when closed, follows the jaw when open.',
      shape: { type: 'path', d: MOUTH_INSIDE.closed, detail: 6 },
      fill: C.mouthInside,
    },
    {
      id: 'tongue', parent: 'jaw', z: 27, mask: ['mouthInside'], tags: ['beak', 'mouth'],
      shape: { type: 'ellipse', cx: 629, cy: 421, rx: 16, ry: 7, detail: 4 },
      fill: C.tongue,
    },
    {
      id: 'beakLower', parent: 'jaw', z: 28, tags: ['beak'],
      description: 'Lower mandible.',
      shape: { type: 'path', d: smooth(BEAK_LOWER), detail: 6 },
      fill: linear([625, 424], [632, 463], [[0, C.beakLower], [1, C.beakLowerDark]]),
    },
    {
      id: 'mouthLine', parent: 'jaw', z: 29, tags: ['beak', 'mouth'],
      shape: { type: 'path', d: MOUTH_LINE.rest, tolerance: 0.2 },
      fill: C.mouthLine,
    },
    {
      id: 'beakUpper', parent: 'beak', z: 30, tags: ['beak'],
      description: 'Hooked upper mandible.',
      shape: { type: 'path', d: smooth(BEAK_UPPER), detail: 8 },
      fill: linear([640, 308], [650, 434], [[0, C.beakTop], [0.5, C.beakBase], [1, C.beakBottom]]),
    },
    {
      id: 'beakSheen', parent: 'beak', z: 31, mask: ['beakUpper'], opacity: 0.55, tags: ['beak'],
      shape: { type: 'path', d: smooth(BEAK_SHEEN), detail: 6 },
      fill: C.beakSheen,
    },
    {
      id: 'nostril', parent: 'beak', z: 32, tags: ['beak'],
      shape: { type: 'path', d: ellipse(LM.nostril[0], LM.nostril[1], 4.5, 4) },
      fill: C.nostril,
    },
  ];
}
