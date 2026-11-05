/**
 * Wings. The near wing (wingR, in front of the body) is the large folded teardrop: dark flight
 * feathers with lighter coverts on top whose rounded tips form the scalloped edge. The far wing
 * (wingL) mostly hides behind the body and shows as a darker crescent along the chest.
 * Both are skinned to their arm/hand bones so they can lift, spread and fold.
 */
import { PALETTE as C } from '../master/palette.ts';
import { smooth, type OPt } from '../../rev2d/source/lib/geom.ts';
import { linear, type Part } from './types.ts';

export const WING_R_OUTLINE: OPt[] = [
  [462, 532], [486, 534], [502, 543], [515, 556], [524, 574], [529, 598], [529, 622], [526, 640], [521, 657],
  [513, 674], [504, 692], [493, 710], [479, 727], [461, 745], [440, 762], [414, 776], [389, 786], [367, 792],
  [353, 790, 'c'], [347, 774], [348, 755], [352, 736], [357, 718], [364, 699], [372, 680], [381, 660], [390, 638],
  [400, 615], [411, 593], [425, 571], [442, 551],
];

const COVERT_R: OPt[] = [
  [420, 515], [500, 515], [545, 560], [548, 690], [505, 702], [488, 714], [470, 718], [455, 712], [446, 700, 'c'],
  [432, 709], [412, 711], [399, 705], [391, 690, 'c'], [380, 698], [366, 697], [350, 688], [338, 640], [352, 560],
];

const WING_L_OUTLINE: OPt[] = [
  [640, 540], [656, 552], [666, 572], [673, 598], [677, 625], [676, 652], [670, 680], [660, 704], [647, 723],
  [632, 737], [619, 742, 'c'], [616, 720], [628, 690], [638, 650], [642, 600], [636, 560],
];

export function wingParts(): Part[] {
  return [
    {
      id: 'wingL', z: 4, skin: { bones: ['wingL_arm', 'wingL_hand'] }, tags: ['wings', 'wingL'],
      description: 'Far (left) wing, mostly behind the body.',
      shape: { type: 'path', d: smooth(WING_L_OUTLINE), detail: 12 },
      fill: linear([652, 640], [679, 640], [[0, C.farWingDark], [0.35, C.farWing], [0.82, C.farWing], [1, C.farWingDark]]),
    },
    {
      id: 'wingR', z: 14, skin: { bones: ['wingR_arm', 'wingR_hand'] }, tags: ['wings', 'wingR'],
      description: 'Near (right) wing: flight feathers (the coverts are drawn on top).',
      shape: { type: 'path', d: smooth(WING_R_OUTLINE), detail: 12 },
      fill: linear([470, 560], [370, 785], [[0, C.primary], [1, C.primaryDark]]),
    },
    {
      id: 'wingRCovert', z: 15, skin: { bones: ['wingR_arm', 'wingR_hand'] }, mask: ['wingR'], tags: ['wings', 'wingR'],
      description: 'Near wing coverts: lighter, with a scalloped lower edge.',
      shape: { type: 'path', d: smooth(COVERT_R), detail: 12 },
      fill: linear([400, 560], [530, 640], [[0, C.covertLight], [0.7, C.covert], [1, C.covertEdge]]),
    },
  ];
}
