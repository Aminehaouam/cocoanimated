/**
 * Face: the bare white face patch of an African grey (scalloped where the crown feathers overlap
 * it), the brighter ring around the eye, the large black eye and its two highlights.
 *
 * The eye is a 4-segment path (ellipse.ts structure) so expressions can morph it: blink, happy
 * closed eyes, squint, surprise. The highlights are masked by the eye, so they disappear with it.
 */
import { PALETTE as C } from '../master/palette.ts';
import { ellipse, smooth, type OPt } from '../../rev2d/source/lib/geom.ts';
import { LM } from '../master/landmarks.ts';
import type { Part } from './types.ts';

export const FACE_PATCH: OPt[] = [
  [458, 402], [461, 372], [470, 350], [484, 333], [500, 321], [518, 313],
  [533, 309], [546, 313, 'c'], [555, 302], [568, 299, 'c'], [580, 292], [594, 293, 'c'], [606, 286],
  [628, 284], [645, 298], [656, 320], [664, 360], [666, 420], [662, 456], [655, 480], [644, 484],
  [638, 466, 'c'], [628, 455], [600, 449], [580, 448], [568, 460], [552, 469], [530, 477], [508, 474],
  [490, 466], [477, 455], [466, 438], [460, 420],
];

/** The open eye (setup shape). Other eye shapes must keep this 4-cubic structure. */
export const EYE_OPEN = ellipse(LM.eye[0], LM.eye[1], LM.eyeRadius[0], LM.eyeRadius[1]);

export function faceParts(): Part[] {
  const [hx, hy] = LM.highlight;
  const [h2x, h2y] = LM.highlight2;
  return [
    {
      id: 'facePatch', parent: 'faceWarp', z: 22, tags: ['face'],
      description: 'Bare white face patch.',
      shape: { type: 'path', d: smooth(FACE_PATCH), detail: 12 },
      fill: C.facePatch,
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
      shape: { type: 'path', d: EYE_OPEN, detail: 5, tolerance: 0.2 },
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
  ];
}
