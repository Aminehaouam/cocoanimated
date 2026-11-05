/**
 * Travel props. Reference poses (see accessories/education/education.ts): HOLD (near wing forward,
 * hand under the object), UP (far wing raised beside the head), EYE (near wing up, hand at the face:
 * camera, binoculars). Worn / scenery items use the rest pose.
 */
import { compound, ellipse, roundRect, smooth } from '../../rev2d/source/lib/geom.ts';
import { linear, radial } from '../../character/parts/types.ts';
import { HOLD, UP } from '../education/education.ts';
import { drop, stick, strokes } from '../shapes.ts';
import type { Accessory } from '../lib.ts';

/** Near wing raised to the face (camera, binoculars). */
export const EYE = { WingRRaise: -1.3, WingRCurl: 0.9 };

const DARK = '#2b2d38';
const LENS = radial([620, 393], 20, [[0, '#8fb1d6'], [1, '#2d3f57']]);

export const TRAVEL_ACCESSORIES: Accessory[] = [
  {
    id: 'backpack', param: 'AccBackpack', category: 'travel', title: 'Backpack',
    description: 'A green backpack on the back (shows left of the wing) with a strap across the chest.', attach: 'chest', pivot: [380, 585],
    parts: [
      { id: 'backpackBody', z: 9.5, shape: { type: 'path', d: roundRect(380, 585, 170, 220, 40), detail: 16 }, fill: linear([300, 480], [460, 690], [[0, '#6cc46e'], [1, '#3f8f41']]) },
      { id: 'backpackFlap', z: 9.6, shape: { type: 'path', d: roundRect(372, 514, 152, 70, 30) }, fill: '#4aa04d' },
      { id: 'backpackPocket', z: 9.6, shape: { type: 'path', d: roundRect(346, 632, 80, 80, 20) }, fill: '#4aa04d' },
      { id: 'backpackBuckle', z: 9.7, shape: { type: 'path', d: compound(roundRect(340, 544, 22, 16, 4), roundRect(330, 640, 20, 12, 3)) }, fill: '#e2c28a' },
      { id: 'backpackStrap', z: 12.5, shape: { type: 'path', d: strokes([[612, 508], [640, 590], [648, 690]], 7), detail: 8 }, fill: '#3f8f41' },
    ],
  },
  {
    id: 'suitcase', param: 'AccSuitcase', category: 'travel', title: 'Suitcase',
    description: 'A brown suitcase with travel stickers standing on the ground, the near wing resting on it.', attach: 'move', pivot: [292, 893],
    parts: [
      { id: 'suitcaseHandle', z: 13.4, shape: { type: 'path', d: strokes([[268, 770], [270, 748], [314, 748], [316, 770]], 5) }, fill: '#6b3f1f' },
      { id: 'suitcaseBody', z: 13.5, shape: { type: 'path', d: roundRect(292, 828, 150, 120, 14), detail: 14 }, fill: linear([217, 768], [367, 888], [[0, '#c98552'], [1, '#94582c']]) },
      { id: 'suitcaseStraps', z: 13.6, shape: { type: 'path', d: compound(roundRect(255, 828, 10, 120, 3), roundRect(329, 828, 10, 120, 3)) }, fill: '#e8c690' },
      { id: 'suitcaseSticker1', z: 13.7, shape: { type: 'ellipse', cx: 296, cy: 806, rx: 14, ry: 14 }, fill: '#f2c14e' },
      { id: 'suitcaseSticker2', z: 13.7, shape: { type: 'path', d: roundRect(292, 856, 30, 20, 4, -8) }, fill: '#6aaef0' },
    ],
  },
  {
    id: 'passport', param: 'AccPassport', category: 'travel', title: 'Passport',
    description: 'A maroon passport with a gold globe, held up on the near wing.', attach: 'wingR_hand', pose: HOLD, pivot: [684, 606],
    parts: [
      { id: 'passportCover', z: 16, shape: { type: 'path', d: roundRect(684, 556, 78, 104, 8), detail: 10 }, fill: linear([645, 504], [723, 608], [[0, '#a83a4f'], [1, '#7a2235']]) },
      { id: 'passportGlobe', z: 16.1, shape: { type: 'ellipse', cx: 684, cy: 544, rx: 17, ry: 17 }, fill: '#e8c25a' },
      { id: 'passportGlobeIn', z: 16.2, shape: { type: 'path', d: compound(ellipse(684, 544, 12, 12)) }, fill: '#8e2b3d' },
      { id: 'passportLines', z: 16.3, shape: { type: 'path', d: compound(roundRect(684, 544, 3, 22, 1), roundRect(684, 544, 22, 3, 1), roundRect(684, 584, 46, 6, 3)) }, fill: '#e8c25a' },
    ],
  },
  {
    id: 'map', param: 'AccMap', category: 'travel', title: 'Map',
    description: 'An unfolded travel map with a dashed route and a red pin, held on the near wing.', attach: 'wingR_hand', pose: HOLD, pivot: [684, 606],
    parts: [
      { id: 'mapPaper', z: 16, shape: { type: 'path', d: roundRect(690, 546, 184, 118, 6), detail: 14 }, fill: '#f3e6c4' },
      { id: 'mapFolds', z: 16.05, mask: ['mapPaper'], shape: { type: 'path', d: compound(roundRect(629, 546, 61, 120, 0), roundRect(752, 546, 61, 120, 0)) }, fill: '#e6d5aa' },
      { id: 'mapSea', z: 16.1, mask: ['mapPaper'], shape: { type: 'path', d: smooth([[598, 488], [660, 486], [690, 508], [668, 540], [620, 552], [596, 530]]) }, fill: '#9cc9ee' },
      { id: 'mapLand', z: 16.15, mask: ['mapPaper'], shape: { type: 'path', d: compound(smooth([[700, 500], [752, 494], [776, 520], [760, 556], [716, 560], [698, 532]]), smooth([[612, 566], [650, 560], [664, 590], [628, 600]])) }, fill: '#8cc884' },
      { id: 'mapRoute', z: 16.2, shape: { type: 'path', d: compound(...[[620, 590], [642, 576], [664, 566], [686, 558], [706, 546], [724, 532]].map(([x, y]) => roundRect(x, y, 12, 5, 2.5, -30))) }, fill: '#e05555' },
      { id: 'mapPin', z: 16.3, shape: { type: 'path', d: drop(738, 514, 30) }, fill: '#e05555' },
      { id: 'mapPinDot', z: 16.4, shape: { type: 'ellipse', cx: 738, cy: 516, rx: 4, ry: 4 }, fill: '#ffffff' },
    ],
  },
  {
    id: 'camera', param: 'AccCamera', category: 'travel', title: 'Camera',
    description: 'A camera held to the eye with the near wing, lens toward the screen right.', attach: 'wingR_hand', pose: EYE, pivot: [620, 432],
    parts: [
      { id: 'cameraBody', z: 35, shape: { type: 'path', d: roundRect(585, 398, 116, 66, 12), detail: 12 }, fill: linear([585, 365], [585, 431], [[0, '#454857'], [1, DARK]]) },
      { id: 'cameraTop', z: 34.9, shape: { type: 'path', d: compound(roundRect(556, 362, 34, 16, 4)) }, fill: DARK },
      { id: 'cameraButton', z: 34.95, shape: { type: 'path', d: roundRect(622, 363, 18, 9, 3) }, fill: '#e05555' },
      { id: 'cameraLensRing', z: 35.1, shape: { type: 'ellipse', cx: 626, cy: 400, rx: 27, ry: 27 }, fill: '#23252e' },
      { id: 'cameraLens', z: 35.2, shape: { type: 'ellipse', cx: 626, cy: 400, rx: 18, ry: 18, detail: 6 }, fill: LENS },
      { id: 'cameraGlint', z: 35.3, opacity: 0.7, shape: { type: 'ellipse', cx: 619, cy: 393, rx: 5, ry: 5 }, fill: '#ffffff' },
    ],
  },
  {
    id: 'binoculars', param: 'AccBinoculars', category: 'travel', title: 'Binoculars',
    description: 'Binoculars held to the eye with the near wing.', attach: 'wingR_hand', pose: EYE, pivot: [620, 432],
    parts: [
      { id: 'binocularsBack', z: 34.9, shape: { type: 'path', d: roundRect(592, 416, 112, 30, 14) }, fill: '#23252e' },
      { id: 'binocularsFront', z: 35, shape: { type: 'path', d: roundRect(586, 384, 112, 32, 15) }, fill: DARK },
      { id: 'binocularsBridge', z: 35.1, shape: { type: 'path', d: roundRect(566, 400, 26, 20, 6) }, fill: '#3b3e4c' },
      { id: 'binocularsLenses', z: 35.2, shape: { type: 'path', d: compound(ellipse(642, 384, 7, 13), ellipse(648, 416, 6, 12)) }, fill: '#6f8fb3' },
    ],
  },
  {
    id: 'boarding_pass', param: 'AccBoardingPass', category: 'travel', title: 'Boarding pass',
    description: 'A boarding pass held up beside the head by the far wing.', attach: 'wingL_hand', pose: UP, pivot: [826, 466],
    parts: [
      { id: 'ticketBase', z: 33, shape: { type: 'path', d: roundRect(846, 396, 156, 74, 10, 8), detail: 12 }, fill: '#ffffff', stroke: { color: '#d4d7e1', width: 2 } },
      { id: 'ticketStub', z: 33.1, mask: ['ticketBase'], shape: { type: 'path', d: roundRect(786, 388, 44, 100, 0, 8) }, fill: '#3d8ef0' },
      { id: 'ticketPlane', z: 33.2, shape: { type: 'path', d: smooth([[774, 384, 'c'], [800, 390], [788, 380, 'c'], [794, 374, 'c'], [804, 389], [812, 392, 'c'], [804, 395], [796, 410, 'c'], [790, 404, 'c'], [796, 394], [774, 392, 'c']], 0.3) }, fill: '#ffffff' },
      { id: 'ticketBars', z: 33.2, shape: { type: 'path', d: compound(...[0, 1, 2, 3, 4, 5, 6].map((i) => roundRect(880 + i * 6, 404 + i * 0.85, i % 3 ? 2.5 : 4, 34, 0.5, 8))) }, fill: DARK },
      { id: 'ticketLines', z: 33.2, shape: { type: 'path', d: compound(roundRect(838, 382, 48, 7, 3.5, 8), roundRect(834, 400, 36, 6, 3, 8)) }, fill: '#c8cbd6' },
    ],
  },
  {
    id: 'compass', param: 'AccCompass', category: 'travel', title: 'Compass',
    description: 'A brass compass held on the near wing.', attach: 'wingR_hand', pose: HOLD, pivot: [684, 606],
    parts: [
      { id: 'compassCase', z: 16, shape: { type: 'ellipse', cx: 684, cy: 556, rx: 42, ry: 42, detail: 8 }, fill: radial([674, 542], 50, [[0, '#f6d77a'], [1, '#c3912a']]) },
      { id: 'compassFace', z: 16.1, shape: { type: 'ellipse', cx: 684, cy: 556, rx: 32, ry: 32 }, fill: '#fffaf0' },
      { id: 'compassNorth', z: 16.2, shape: { type: 'path', d: smooth([[684, 528, 'c'], [692, 556, 'c'], [676, 556, 'c']], 0.2) }, fill: '#e05555' },
      { id: 'compassSouth', z: 16.2, shape: { type: 'path', d: smooth([[684, 584, 'c'], [676, 556, 'c'], [692, 556, 'c']], 0.2) }, fill: '#8a8d9e' },
      { id: 'compassPin', z: 16.3, shape: { type: 'ellipse', cx: 684, cy: 556, rx: 4, ry: 4 }, fill: DARK },
    ],
  },
  {
    id: 'umbrella', param: 'AccUmbrella', category: 'travel', title: 'Umbrella',
    description: 'A blue umbrella held up by the far wing.', attach: 'wingL_hand', pose: UP, pivot: [826, 466],
    parts: [
      { id: 'umbrellaShaft', z: 32.9, shape: { type: 'path', d: compound(stick([826, 474], [836, 236], 3.5, 3)) }, fill: '#5b5e6c' },
      { id: 'umbrellaHook', z: 32.9, shape: { type: 'path', d: strokes([[826, 470], [822, 492], [808, 498], [798, 488]], 4) }, fill: '#8f6334' },
      { id: 'umbrellaCanopy', z: 33, shape: { type: 'path', d: smooth([[722, 250, 'c'], [748, 190], [800, 156], [836, 150], [872, 156], [924, 190], [950, 250, 'c'], [912, 236], [874, 252, 'c'], [836, 236], [798, 252, 'c'], [760, 236]], 0.9), detail: 14 }, fill: linear([836, 150], [836, 252], [[0, '#5a97e6'], [1, '#2e66be']]) },
      { id: 'umbrellaTip', z: 33.1, shape: { type: 'ellipse', cx: 836, cy: 146, rx: 5, ry: 7 }, fill: '#5b5e6c' },
    ],
  },
];
