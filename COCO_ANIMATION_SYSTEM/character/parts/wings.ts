/**
 * Wings.
 *
 * The near wing (wingR, in front of the body) is the traced folded teardrop: dark flight feathers
 * with lighter coverts on top whose rounded tips form the scalloped edge. Both wings share ONE
 * design in a local wing frame (u along the wing from the shoulder, v across it; v < 0 = the
 * leading edge, toward the chest), so they always look like the same bird:
 *
 *   folded  — the traced near wing, expressed in its frame (FOLDED_LOCAL)
 *   spread  — the same 31 outline points opened into a broad wing with five feather "fingers"
 *             at the tip (SPREAD_LOCAL); the rig morphs between them with WingRSpread / WingLSpread
 *
 * The far wing (wingL) is the same design at 88 % size, placed behind the body: at rest only its
 * leading edge shows as the dark crescent along the chest, raised it reads as a full wing.
 */
import { PALETTE as C } from '../master/palette.ts';
import { aim, fromFrame, smooth, toFrame, type OPt, type Pt } from '../../rev2d/source/lib/geom.ts';
import { LM } from '../master/landmarks.ts';
import { linear, type Part } from './types.ts';

/** The traced folded near wing (setup space). */
export const WING_R_OUTLINE: OPt[] = [
  [462, 532], [486, 534], [502, 543], [515, 556], [524, 574], [529, 598], [529, 622], [526, 640], [521, 657],
  [513, 674], [504, 692], [493, 710], [479, 727], [461, 745], [440, 762], [414, 776], [389, 786], [367, 792],
  [353, 790, 'c'], [347, 774], [348, 755], [352, 736], [357, 718], [364, 699], [372, 680], [381, 660], [390, 638],
  [400, 615], [411, 593], [425, 571], [442, 551],
];

/** The traced coverts of the near wing (setup space; masked by the wing, so they may overhang it). */
const COVERT_R: OPt[] = [
  [420, 515], [500, 515], [545, 560], [548, 690], [505, 702], [488, 714], [470, 718], [455, 712], [446, 700, 'c'],
  [432, 709], [412, 711], [399, 705], [391, 690, 'c'], [380, 698], [366, 697], [350, 688], [338, 640], [352, 560],
];

/** Wing frames: shoulder position and the direction of the folded wing (shoulder -> tip). */
export const WING_FRAME = {
  R: { shoulder: LM.shoulderR, deg: aim(LM.shoulderR, LM.wingTipR).deg, scale: 1 },
  L: { shoulder: [600, 546] as Pt, deg: 96, scale: 0.88 },
} as const;

const FOLDED_LOCAL = toFrame(WING_FRAME.R.shoulder, WING_FRAME.R.deg, WING_R_OUTLINE);
const COVERT_LOCAL = toFrame(WING_FRAME.R.shoulder, WING_FRAME.R.deg, COVERT_R);

/**
 * The open wing in the wing frame (31 points, same order as the folded outline: root, leading
 * edge, a fan of five rounded feathers at the tip, trailing edge back to the root).
 */
const SPREAD_LOCAL: OPt[] = [
  [-2, 30], [-12, 10], [-12, -12], [-2, -32], [16, -50], [40, -62], [70, -72], [104, -80], [140, -86], [176, -92],
  [212, -98], [246, -104], [272, -110],
  [300, -104], [290, -80, 'c'], [320, -70], [310, -44, 'c'], [334, -30], [320, -6, 'c'], [336, 14], [314, 30, 'c'], [324, 56],
  [296, 70], [262, 76], [226, 76], [190, 72], [152, 66], [114, 60], [78, 54], [44, 48], [16, 42],
];

/** Coverts of the open wing: the folded coverts stretched across the open wing. */
const COVERT_SPREAD_LOCAL: OPt[] = COVERT_LOCAL.map((p) => {
  const q: [number, number] = [p[0] * 1.12 + 12, p[1] * 1.45];
  return p[2] === 'c' ? [q[0], q[1], 'c'] : q;
});

function inFrame(side: 'R' | 'L', local: readonly OPt[]): OPt[] {
  const f = WING_FRAME[side];
  return fromFrame(f.shoulder, f.deg, local, f.scale);
}

/** Setup-space wing outlines (paths) for the rig's spread morphs. */
export const WING_SHAPES = {
  R: { folded: smooth(WING_R_OUTLINE), spread: smooth(inFrame('R', SPREAD_LOCAL)) },
  RCovert: { folded: smooth(COVERT_R), spread: smooth(inFrame('R', COVERT_SPREAD_LOCAL)) },
  L: { folded: smooth(inFrame('L', FOLDED_LOCAL)), spread: smooth(inFrame('L', SPREAD_LOCAL)) },
  LCovert: { folded: smooth(inFrame('L', COVERT_LOCAL)), spread: smooth(inFrame('L', COVERT_SPREAD_LOCAL)) },
} as const;

/** Bone placement for a wing: shoulder, wrist (55 % along the folded wing) and tip. */
export function wingJoints(side: 'R' | 'L'): { shoulder: Pt; wrist: Pt; tip: Pt } {
  if (side === 'R') return { shoulder: LM.shoulderR, wrist: LM.wristR, tip: LM.wingTipR };
  const f = WING_FRAME.L;
  const tipU = 277 * f.scale;
  const at = (u: number): Pt => [f.shoulder[0] + Math.cos((f.deg * Math.PI) / 180) * u, f.shoulder[1] + Math.sin((f.deg * Math.PI) / 180) * u];
  return { shoulder: f.shoulder, wrist: at(tipU * 0.52), tip: at(tipU) };
}

export function wingParts(): Part[] {
  const skinL = { bones: ['wingL_arm', 'wingL_hand'] };
  const skinR = { bones: ['wingR_arm', 'wingR_hand'] };
  return [
    {
      id: 'wingL', z: 4, skin: skinL, tags: ['wings', 'wingL'],
      description: 'Far (left) wing: behind the body, its leading edge shows along the chest.',
      shape: { type: 'path', d: WING_SHAPES.L.folded, detail: 12 },
      fill: linear([606, 600], [676, 640], [[0, C.farWingDark], [0.55, C.farWing], [0.85, C.farWing], [1, C.farWingDark]]),
    },
    {
      id: 'wingLCovert', z: 4.5, skin: skinL, mask: ['wingL'], opacity: 0.8, tags: ['wings', 'wingL'],
      description: 'Far wing coverts (visible when the wing is raised).',
      shape: { type: 'path', d: WING_SHAPES.LCovert.folded, detail: 12 },
      fill: C.covertEdge,
    },
    {
      id: 'wingR', z: 14, skin: skinR, tags: ['wings', 'wingR'],
      description: 'Near (right) wing: flight feathers (the coverts are drawn on top).',
      shape: { type: 'path', d: WING_SHAPES.R.folded, detail: 12 },
      fill: linear([470, 560], [370, 785], [[0, C.primary], [1, C.primaryDark]]),
    },
    {
      id: 'wingRCovert', z: 15, skin: skinR, mask: ['wingR'], tags: ['wings', 'wingR'],
      description: 'Near wing coverts: lighter, with a scalloped lower edge.',
      shape: { type: 'path', d: WING_SHAPES.RCovert.folded, detail: 12 },
      fill: linear([400, 560], [530, 640], [[0, C.covertLight], [0.7, C.covert], [1, C.covertEdge]]),
    },
  ];
}
