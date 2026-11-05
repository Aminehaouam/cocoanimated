/**
 * Head: the grey feathered head and the scalloped nape feathers that overlap the top of the body.
 * Base colour = the shared feather gradient (no seam with the chest); the lighter crown and the
 * darker back of the head are overlay parts masked to the head. The face patch, eye and beak are
 * drawn on top (face.ts, beak.ts).
 */
import { PALETTE as C, alpha } from '../master/palette.ts';
import { compound, ellipse, smooth, type OPt } from '../../rev2d/source/lib/geom.ts';
import { scallop } from './body.ts';
import { featherFill, radial, type Part } from './types.ts';

export const HEAD_OUTLINE: OPt[] = [
  [530, 258], [575, 259], [604, 268], [624, 282], [642, 297], [656, 318], [667, 350], [670, 400], [664, 450],
  [648, 484], [610, 501], [555, 506], [500, 510], [458, 515], [430, 506], [408, 491], [396, 470], [388, 432],
  [390, 394], [404, 360], [418, 334], [431, 316], [449, 298], [474, 281], [508, 265],
];

export function headParts(): Part[] {
  return [
    {
      id: 'napeLobes', parent: 'headWarp', z: 18, tags: ['feathers', 'head'],
      description: 'Rounded nape feathers along the back of the neck.',
      shape: {
        type: 'path', detail: 8,
        d: compound(
          ellipse(393, 418, 10, 14), ellipse(394, 449, 11, 14),
          ellipse(403, 478, 13, 15), ellipse(418, 497, 14, 14), ellipse(437, 512, 14, 13), ellipse(458, 520, 13, 11),
        ),
      },
      fill: featherFill(C),
      stroke: { color: C.napeEdge, width: 1.4, align: 'inside' },
    },
    {
      id: 'head', parent: 'headWarp', z: 20, tags: ['feathers', 'head'],
      description: 'Head feathers (the face patch and beak cover the front).',
      shape: { type: 'path', d: smooth(HEAD_OUTLINE), detail: 14 },
      fill: featherFill(C),
    },
    {
      id: 'crownLight', parent: 'headWarp', z: 20.5, tags: ['head', 'shading'],
      description: 'Light on the crown (same outline as the head, fading out with the gradient).',
      shape: { type: 'path', d: smooth(HEAD_OUTLINE), detail: 14 },
      fill: radial([548, 296], 175, [[0, alpha(C.headLight, 0.9)], [0.5, alpha(C.headLight, 0.5)], [1, alpha(C.headLight, 0)]]),
    },
    {
      id: 'headScallops', parent: 'headWarp', z: 20.6, mask: ['head'], opacity: 0.4, tags: ['feathers', 'head', 'texture'],
      description: 'Soft feather edges on the back of the head.',
      shape: {
        type: 'path', detail: 8,
        d: compound(scallop(440, 372, 26, 8), scallop(426, 412, 26, 8), scallop(447, 445, 28, 8), scallop(474, 478, 28, 8), scallop(507, 492, 26, 7)),
      },
      fill: C.chestScallop,
    },
  ];
}
