/**
 * Legs and feet. Each leg is skinned between its thigh bone (in the body) and its foot bone (on the
 * ground), so it stretches a little when the body bobs while the foot stays planted.
 * footR / legR are the near (screen-left) pair, footL / legL the far pair (drawn behind, darker).
 */
import { PALETTE as C } from '../master/palette.ts';
import { capsule, compound, ellipse, smooth } from '../../rev2d/source/lib/geom.ts';
import { linear, type Part } from './types.ts';

export function legParts(): Part[] {
  return [
    {
      id: 'legL', z: 5, skin: { bones: ['legL', 'footL'] }, tags: ['legs'],
      shape: { type: 'path', d: smooth(capsule([551, 818], [552, 857], 10.5)), detail: 6 },
      fill: C.leg,
    },
    {
      id: 'footL', parent: 'footL', z: 6, tags: ['legs', 'feet'],
      description: 'Far foot: pad + back toe + two front toes.',
      shape: {
        type: 'path',
        d: compound(
          ellipse(560, 862, 18, 9),
          smooth(capsule([553, 866], [533, 873], 6.5)),
          smooth(capsule([565, 867], [594, 881], 7)),
          smooth(capsule([572, 863], [619, 877], 7)),
        ),
      },
      fill: linear([575, 852], [575, 890], [[0, C.foot], [1, C.leg]]),
    },
    {
      id: 'legR', z: 7, skin: { bones: ['legR', 'footR'] }, tags: ['legs'],
      shape: { type: 'path', d: smooth(capsule([483, 822], [484, 866], 11.5)), detail: 6 },
      fill: C.leg,
    },
    {
      id: 'footR', parent: 'footR', z: 8, tags: ['legs', 'feet'],
      description: 'Near foot: pad + back toe + two front toes.',
      shape: {
        type: 'path',
        d: compound(
          ellipse(486, 873, 19, 10),
          smooth(capsule([478, 876], [452, 884], 6.5)),
          smooth(capsule([488, 877], [510, 888], 7)),
          smooth(capsule([493, 874], [530, 886], 7)),
        ),
      },
      fill: linear([490, 860], [490, 896], [[0, C.footLight], [1, C.foot]]),
    },
  ];
}
