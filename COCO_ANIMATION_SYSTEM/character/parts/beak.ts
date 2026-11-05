/**
 * Beak: the hooked upper mandible (bone `beak`) over the smaller lower mandible (bone `jaw`, which
 * rotates down to open the beak). Behind the lower mandible: the mouth interior and tongue, only
 * visible when the beak opens. A dark mouth line along the lower mandible carries the smile.
 */
import { PALETTE as C } from '../master/palette.ts';
import { ellipse, smooth, type OPt } from '../../rev2d/source/lib/geom.ts';
import { LM } from '../master/landmarks.ts';
import { linear, type Part } from './types.ts';

export const BEAK_UPPER: OPt[] = [
  [597, 400, 'c'], [597, 378], [602, 352], [610, 330], [624, 315], [642, 309], [664, 314], [681, 330], [692, 352],
  [699, 378], [701, 404], [698, 428], [691, 444], [686, 453, 'c'], [679, 443], [672, 432], [666, 427, 'c'],
  [648, 425], [626, 418], [609, 409],
];

export const BEAK_LOWER: OPt[] = [
  [596, 398, 'c'], [612, 411], [634, 421], [654, 427], [664, 430, 'c'], [665, 442], [657, 455], [642, 462],
  [626, 462], [609, 452], [599, 432],
];

/** Mouth line: a thin dark crescent along the top of the lower mandible (MouthForm bends it). */
export const MOUTH_LINE: OPt[] = [
  [604, 404, 'c'], [626, 418], [646, 426], [663, 430, 'c'], [662, 437], [646, 432], [626, 424],
];

const MOUTH_INSIDE: OPt[] = [
  [600, 402, 'c'], [626, 418], [650, 427], [664, 431, 'c'], [662, 447], [640, 453], [618, 447], [604, 428],
];

const BEAK_SHEEN: OPt[] = [
  [606, 352, 'c'], [612, 330], [628, 316], [648, 312], [668, 318, 'c'], [650, 320], [632, 326], [617, 340],
];

export function beakParts(): Part[] {
  return [
    {
      id: 'mouthInside', parent: 'beak', z: 26, tags: ['beak', 'mouth'],
      description: 'Mouth interior, hidden behind the lower mandible until the beak opens.',
      shape: { type: 'path', d: smooth(MOUTH_INSIDE), detail: 6 },
      fill: C.mouthInside,
    },
    {
      id: 'tongue', parent: 'jaw', z: 27, mask: ['mouthInside'], tags: ['beak', 'mouth'],
      shape: { type: 'ellipse', cx: 634, cy: 443, rx: 18, ry: 8, detail: 4 },
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
      shape: { type: 'path', d: smooth(MOUTH_LINE), tolerance: 0.2 },
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
