/**
 * Clothing. Hats sit on the crown in their own small warp that Rev2D's `follow` keeps on the
 * turning head; sunglasses follow the face; the raincoat and its hood go straight into the body and
 * head warps so they deform exactly like the feathers under them.
 */
import { compound, ellipse, mapPath, roundRect, smooth, type OPt } from '../../rev2d/source/lib/geom.ts';
import { linear } from '../../character/parts/types.ts';
import { HEAD_OUTLINE } from '../../character/parts/head.ts';
import { TORSO_OUTLINE } from '../../character/parts/body.ts';
import { strokes } from '../shapes.ts';
import type { Accessory } from '../lib.ts';

/** Hats: their own 2 × 1 warp on the head bone, kept on the crown by `follow`. */
const HAT = { target: 'headWarp' as const, rect: [396, 136, 312, 166] as [number, number, number, number], at: [540, 262] as [number, number] };

const scaled = (pts: OPt[], cx: number, cy: number, sx: number, sy: number): string =>
  mapPath(smooth(pts), ([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy]);

export const CLOTHING_ACCESSORIES: Accessory[] = [
  {
    id: 'explorer_hat', param: 'AccExplorerHat', category: 'clothing', title: 'Explorer hat',
    description: 'A tan explorer (pith) helmet on the crown.', attach: 'head', pivot: [540, 262], follow: HAT,
    parts: [
      { id: 'explorerBrim', z: 27, shape: { type: 'ellipse', cx: 540, cy: 262, rx: 120, ry: 25, rotation: -5, detail: 10 }, fill: '#d9b77e', stroke: { color: '#b89155', width: 2 } },
      { id: 'explorerDome', z: 27.1, shape: { type: 'path', d: smooth([[452, 258, 'c'], [462, 210], [500, 178], [548, 168], [596, 180], [628, 210], [634, 252, 'c']]), detail: 10 }, fill: linear([540, 168], [540, 258], [[0, '#ecd09a'], [1, '#c9a06a']]) },
      { id: 'explorerBand', z: 27.2, shape: { type: 'path', d: smooth([[455, 246, 'c'], [545, 234], [633, 242, 'c'], [634, 258, 'c'], [545, 251], [454, 262, 'c']]) }, fill: '#8f6a3e' },
    ],
  },
  {
    id: 'pilot_hat', param: 'AccPilotHat', category: 'clothing', title: 'Pilot cap',
    description: 'A navy pilot cap with a black visor and gold wings badge.', attach: 'head', pivot: [540, 262], follow: HAT,
    parts: [
      { id: 'pilotCrown', z: 27, shape: { type: 'path', d: smooth([[448, 262, 'c'], [452, 214], [496, 186], [556, 182], [612, 198], [640, 232], [636, 262, 'c']]), detail: 10 }, fill: linear([540, 182], [540, 262], [[0, '#3a4a6c'], [1, '#26324a']]) },
      { id: 'pilotBand', z: 27.1, shape: { type: 'path', d: roundRect(542, 252, 190, 18, 6, -3) }, fill: '#1c2335' },
      { id: 'pilotVisor', z: 27.2, shape: { type: 'path', d: smooth([[600, 258, 'c'], [664, 250], [704, 264], [672, 278], [612, 274, 'c']]) }, fill: '#15171f' },
      { id: 'pilotBadge', z: 27.3, shape: { type: 'path', d: compound(ellipse(552, 222, 9, 9), smooth([[540, 222, 'c'], [512, 214], [516, 224], [540, 228, 'c']], 0.6), smooth([[564, 222, 'c'], [592, 214], [588, 224], [564, 228, 'c']], 0.6)) }, fill: '#f2c14e' },
    ],
  },
  {
    id: 'grad_cap', param: 'AccGradCap', category: 'clothing', title: 'Graduation cap',
    description: 'A teacher\'s mortarboard with a gold tassel.', attach: 'head', pivot: [540, 262], follow: HAT,
    parts: [
      { id: 'gradCapBody', z: 27, shape: { type: 'path', d: smooth([[470, 262, 'c'], [474, 226], [540, 214], [606, 226], [610, 262, 'c']]) }, fill: '#2b2d38' },
      { id: 'gradCapBoard', z: 27.1, shape: { type: 'path', d: smooth([[440, 222, 'c'], [545, 190, 'c'], [650, 222, 'c'], [545, 254, 'c']], 0.1) }, fill: linear([440, 190], [650, 254], [[0, '#3b3e4c'], [1, '#1f2029']]) },
      { id: 'gradCapTassel', z: 27.2, shape: { type: 'path', d: compound(strokes([[545, 222], [606, 236], [612, 270]], 2.5), smooth([[606, 266, 'c'], [618, 266, 'c'], [620, 296], [604, 296]], 0.6)) }, fill: '#f2c14e' },
    ],
  },
  {
    id: 'sunglasses', param: 'AccSunglasses', category: 'clothing', title: 'Sunglasses',
    description: 'Cool round sunglasses over the eye.', attach: 'head', pivot: [529, 396],
    follow: { target: 'faceWarp', rect: [470, 340, 190, 110], at: [529, 396] },
    parts: [
      { id: 'sunglassesLens', z: 26.5, opacity: 0.94, shape: { type: 'path', d: roundRect(531, 396, 88, 72, 32), detail: 8 }, fill: '#1c1d26' },
      { id: 'sunglassesFrame', z: 26.6, shape: { type: 'path', d: strokes([[486, 364], [576, 360], [606, 372]], 4) }, fill: '#111218' },
      { id: 'sunglassesShine', z: 26.7, opacity: 0.4, shape: { type: 'path', d: strokes([[506, 382], [522, 368]], 4) }, fill: '#ffffff' },
    ],
  },
  {
    id: 'headphones', param: 'AccHeadphones', category: 'clothing', title: 'Headphones',
    description: 'Blue headphones: the band over the crown, the cup over the ear behind the eye.', attach: 'head', pivot: [450, 398],
    follow: { target: 'headWarp', rect: [392, 222, 252, 236], at: [450, 398] },
    parts: [
      { id: 'headphonesBand', z: 27, shape: { type: 'path', d: strokes([[440, 384], [450, 304], [498, 254], [560, 240], [612, 262]], 9), detail: 8 }, fill: '#2e5fb0' },
      { id: 'headphonesCup', z: 27.1, shape: { type: 'ellipse', cx: 446, cy: 402, rx: 31, ry: 41, detail: 6 }, fill: linear([420, 362], [472, 442], [[0, '#4c8be0'], [1, '#2e5fb0']]) },
      { id: 'headphonesPad', z: 27.2, shape: { type: 'ellipse', cx: 458, cy: 402, rx: 15, ry: 28 }, fill: '#24467f' },
    ],
  },
  {
    id: 'scarf', param: 'AccScarf', category: 'clothing', title: 'Winter scarf',
    description: 'A red and white striped scarf around the neck, one end hanging down the chest.', attach: 'chest', pivot: [560, 500],
    parts: [
      { id: 'scarfTail', z: 17, shape: { type: 'path', d: smooth([[606, 500], [642, 504], [650, 562], [654, 624], [628, 630], [616, 568]]), detail: 8 }, fill: '#d93d3d' },
      { id: 'scarfBand', z: 17.1, shape: { type: 'path', d: smooth([[424, 494], [470, 480], [540, 488], [600, 490], [650, 480], [666, 502], [642, 522], [570, 522], [500, 522], [438, 520]]), detail: 10 }, fill: '#e04646' },
      { id: 'scarfStripes', z: 17.2, mask: ['scarfBand', 'scarfTail'], shape: { type: 'path', d: compound(roundRect(470, 504, 12, 60, 2), roundRect(532, 506, 12, 60, 2), roundRect(594, 506, 12, 60, 2), roundRect(640, 580, 60, 10, 2, 10)) }, fill: '#f6f6f6' },
    ],
  },
  {
    id: 'raincoat', param: 'AccRaincoat', category: 'clothing', title: 'Raincoat',
    description: 'A yellow raincoat over the body (deforms with it); pair with AccRaincoatHood.', attach: 'hips', pivot: [545, 645], warp: 'bodyWarp',
    parts: [
      { id: 'raincoatBody', z: 12.8, shape: { type: 'path', d: scaled(TORSO_OUTLINE, 545, 645, 1.04, 1.03), detail: 14 }, fill: linear([470, 460], [640, 840], [[0, '#f9d35b'], [1, '#e0a92a']]) },
      { id: 'raincoatButtons', z: 12.9, shape: { type: 'path', d: compound(ellipse(632, 560, 7, 7), ellipse(636, 612, 7, 7), ellipse(630, 664, 7, 7)) }, fill: '#c98f1c' },
    ],
  },
  {
    id: 'raincoat_hood', param: 'AccRaincoatHood', category: 'clothing', title: 'Raincoat hood',
    description: 'The yellow hood around the head (the face patch, eye and beak stay visible).', attach: 'head', pivot: [530, 300], warp: 'headWarp',
    parts: [{ id: 'raincoatHood', z: 21, shape: { type: 'path', d: scaled(HEAD_OUTLINE, 530, 385, 1.04, 1.08), detail: 14 }, fill: linear([450, 250], [620, 520], [[0, '#f9d35b'], [1, '#e3ad2e']]) }],
  },
];
