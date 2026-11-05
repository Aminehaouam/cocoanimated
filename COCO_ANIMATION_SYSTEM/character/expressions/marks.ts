/**
 * Expression marks: the small graphic symbols of the reference sheet ("?", alert lines, light bulb,
 * thinking dots, sparkles, "Zzz"). They are accessories on the head bone (they follow its tilt and
 * nods) with visibility parameters Fx<Name>, and they pop in (scale 60 % → 100 %) as the parameter
 * rises. Thinking dots have one parameter per dot (FxDot1..3) so they can pulse in sequence.
 */
import { capsule, compound, ellipse, roundRect, smooth, type OPt, type Pt } from '../../rev2d/source/lib/geom.ts';
import { radial } from '../parts/types.ts';
import type { Accessory } from '../../accessories/lib.ts';
import { drop, note, spiral, sparkle as sparkleShape } from '../../accessories/shapes.ts';
import { EYE } from '../../accessories/travel/travel.ts';

const BLUE = '#3d8ef0';
const YELLOW = '#f7b93e';
const GLOW = '#ffd75e';
const DOT = '#8a8d9e';
const ZZZ = '#7aa7e0';

/** A thick stroke through points (overlapping capsules, one colour). */
const strokes = (pts: Pt[], r: number): string => compound(...pts.slice(1).map((p, i) => smooth(capsule(pts[i], p, r))));

/** A four-point sparkle star. */
function sparkle(cx: number, cy: number, r: number): string {
  const k = r * 0.32;
  const pts: OPt[] = [[cx, cy - r, 'c'], [cx + k, cy - k], [cx + r, cy, 'c'], [cx + k, cy + k], [cx, cy + r, 'c'], [cx - k, cy + k], [cx - r, cy, 'c'], [cx - k, cy - k]];
  return smooth(pts, 0.4);
}

/** A "Z" glyph of height h centred at (cx, cy). */
function zed(cx: number, cy: number, h: number): string {
  const w = h * 0.8, t = h * 0.13;
  return strokes([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx - w / 2, cy + h / 2], [cx + w / 2, cy + h / 2]], t);
}

export const MARKS: Accessory[] = [
  {
    id: 'fx_question', param: 'FxQuestion', category: 'marks', title: 'Question mark',
    description: 'A blue "?" above the head (asking, confused, curious).', attach: 'head', pivot: [706, 300], pop: true,
    parts: [{ id: 'fxQuestion', z: 40, shape: { type: 'path', d: compound(strokes([[680, 250], [688, 232], [706, 225], [724, 234], [726, 252], [712, 266], [707, 282]], 7.5), ellipse(707, 303, 8, 8)) }, fill: BLUE }],
  },
  {
    id: 'fx_alert', param: 'FxAlert', category: 'marks', title: 'Alert lines',
    description: 'Three short lines bursting from the head (surprise, startle, "aha").', attach: 'head', pivot: [690, 280], pop: true,
    parts: [{ id: 'fxAlert', z: 40, shape: { type: 'path', d: compound(strokes([[676, 258], [690, 230]], 5.5), strokes([[700, 270], [728, 252]], 5.5), strokes([[708, 292], [740, 290]], 5.5)) }, fill: YELLOW }],
  },
  {
    id: 'fx_bulb', param: 'FxBulb', category: 'marks', title: 'Light bulb',
    description: 'A glowing light bulb above the head (idea, hint available).', attach: 'head', pivot: [560, 236], pop: true,
    parts: [
      { id: 'fxBulbGlow', z: 39.9, blend: 'add', shape: { type: 'ellipse', cx: 560, cy: 192, rx: 54, ry: 54, detail: 10 }, fill: radial([560, 192], 54, [[0, '#ffe59a99'], [1, '#ffe59a00']]) },
      { id: 'fxBulbRays', z: 40, shape: { type: 'path', d: compound(strokes([[518, 168], [503, 158]], 4), strokes([[560, 148], [560, 130]], 4), strokes([[602, 168], [617, 158]], 4), strokes([[512, 200], [495, 202]], 4), strokes([[608, 200], [625, 202]], 4)) }, fill: YELLOW },
      { id: 'fxBulbGlass', z: 40.1, shape: { type: 'path', d: smooth([[560, 166], [580, 174], [588, 194], [578, 212], [570, 222], [550, 222], [542, 212], [532, 194], [540, 174]]) }, fill: radial([553, 186], 30, [[0, '#fff6c8'], [1, GLOW]]) },
      { id: 'fxBulbBase', z: 40.2, shape: { type: 'path', d: compound(smooth(capsule([550, 228], [570, 228], 6)), smooth(capsule([552, 240], [568, 240], 5))) }, fill: '#9aa0b0' },
    ],
  },
  {
    id: 'fx_dots', param: 'FxDots', category: 'marks', title: 'Thinking dots',
    description: 'Three dots by the head; FxDot1..3 light them one by one (thinking, AI processing).', attach: 'head', pivot: [704, 250], pop: true,
    extraParams: [
      { id: 'FxDot1', description: 'Thinking dot 1.' }, { id: 'FxDot2', description: 'Thinking dot 2.' }, { id: 'FxDot3', description: 'Thinking dot 3.' },
    ],
    parts: [
      { id: 'fxDot1', z: 40, showParam: 'FxDot1', shape: { type: 'ellipse', cx: 680, cy: 262, rx: 9, ry: 9 }, fill: DOT },
      { id: 'fxDot2', z: 40, showParam: 'FxDot2', shape: { type: 'ellipse', cx: 708, cy: 246, rx: 10, ry: 10 }, fill: DOT },
      { id: 'fxDot3', z: 40, showParam: 'FxDot3', shape: { type: 'ellipse', cx: 738, cy: 228, rx: 11, ry: 11 }, fill: DOT },
    ],
  },
  {
    id: 'fx_sparkle', param: 'FxSparkle', category: 'marks', title: 'Sparkles',
    description: 'Yellow sparkles around the head (delight, new word, success).', attach: 'head', pivot: [560, 300], pop: true,
    parts: [{ id: 'fxSparkle', z: 40, shape: { type: 'path', d: compound(sparkle(425, 270, 22), sparkle(692, 236, 17), sparkle(728, 330, 12), sparkle(470, 220, 10)) }, fill: '#ffd23f' }],
  },
  {
    id: 'fx_zzz', param: 'FxZzz', category: 'marks', title: 'Zzz',
    description: 'Three soft blue "Z"s rising from the head (sleeping).', attach: 'head', pivot: [660, 300], pop: true,
    parts: [
      { id: 'fxZ1', z: 40, shape: { type: 'path', d: zed(644, 296, 18) }, fill: ZZZ },
      { id: 'fxZ2', z: 40, show: [[0, 0], [0.4, 0], [1, 1]], shape: { type: 'path', d: zed(674, 266, 26) }, fill: ZZZ },
      { id: 'fxZ3', z: 40, show: [[0, 0], [0.7, 0], [1, 1]], shape: { type: 'path', d: zed(712, 228, 34) }, fill: ZZZ },
    ],
  },
  {
    id: 'fx_sweat', param: 'FxSweat', category: 'marks', title: 'Sweat drop',
    description: 'A light blue sweat drop by the back of the head (nervous, embarrassed).', attach: 'head', pivot: [436, 300], pop: true,
    parts: [
      { id: 'fxSweat', z: 40, shape: { type: 'path', d: drop(436, 300, 34) }, fill: '#8cc9f5' },
      { id: 'fxSweatShine', z: 40.1, opacity: 0.8, shape: { type: 'ellipse', cx: 431, cy: 306, rx: 3.5, ry: 5 }, fill: '#ffffff' },
    ],
  },
  {
    id: 'fx_tear', param: 'FxTear', category: 'marks', title: 'Tear',
    description: 'A tear under the eye; FxTearFall lets it run down.', attach: 'head', pivot: [548, 448], pop: true,
    extraParams: [{ id: 'FxTearFall', description: 'The tear runs down (0 … 1 = 40 px).' }],
    extraOps: (bone) => [{ op: 'bind', target: `bone:${bone}.x`, params: ['FxTearFall'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -40 }] }],
    parts: [{ id: 'fxTear', z: 40, shape: { type: 'path', d: drop(548, 448, 26) }, fill: '#6db6f2' }],
  },
  {
    id: 'fx_dizzy', param: 'FxDizzy', category: 'marks', title: 'Dizzy swirl',
    description: 'A swirl above the head; FxDizzySpin turns it.', attach: 'head', pivot: [545, 215], pop: true,
    extraParams: [{ id: 'FxDizzySpin', description: 'Dizzy swirl turn (0 … 1 = one full turn).' }],
    extraOps: (bone) => [{ op: 'bind', target: `bone:${bone}.rotation`, params: ['FxDizzySpin'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 360 }] }],
    parts: [
      { id: 'fxDizzy', z: 40, shape: { type: 'path', d: spiral(545, 215, 48) }, fill: DOT },
      { id: 'fxDizzyStars', z: 40.1, shape: { type: 'path', d: compound(sparkleShape(494, 206, 10), sparkleShape(600, 222, 9)) }, fill: '#ffd23f' },
    ],
  },
  {
    id: 'fx_notes', param: 'FxNotes', category: 'marks', title: 'Music notes',
    description: 'Music notes by the head (singing, dancing, headphones); FxNotesRise floats them up.', attach: 'head', pivot: [720, 280], pop: true,
    extraParams: [{ id: 'FxNotesRise', description: 'Music notes rise (0 … 1 = 50 px).' }],
    extraOps: (bone) => [{ op: 'bind', target: `bone:${bone}.x`, params: ['FxNotesRise'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 50 }] }],
    parts: [{ id: 'fxNotes', z: 40, shape: { type: 'path', d: compound(note(700, 304, 18), note(748, 250, 14)) }, fill: '#3a4a7a' }],
  },
  {
    id: 'fx_flash', param: 'FxFlash', category: 'marks', title: 'Camera flash',
    description: 'A white flash burst at the camera lens.', attach: 'wingR_hand', pose: EYE, pivot: [660, 400], pop: true,
    parts: [
      { id: 'fxFlashGlow', z: 41, blend: 'add', shape: { type: 'ellipse', cx: 664, cy: 400, rx: 70, ry: 70, detail: 10 }, fill: radial([664, 400], 70, [[0, '#ffffffdd'], [1, '#ffffff00']]) },
      { id: 'fxFlashStar', z: 41.1, shape: { type: 'path', d: sparkleShape(668, 400, 38) }, fill: '#ffffff' },
    ],
  },
  {
    id: 'scene_wall', param: 'AccWall', category: 'scene', title: 'Wall edge',
    description: 'A light wall panel on the left of the canvas for peeking and hiding (scene prop; the app may use its own UI edge instead).', attach: 'root', pivot: [205, 893],
    parts: [
      { id: 'wallPanel', z: 50, shape: { type: 'path', d: roundRect(205, 512, 410, 1030, 0) }, fill: '#ece6d9' },
      { id: 'wallEdge', z: 50.1, shape: { type: 'path', d: roundRect(404, 512, 14, 1030, 0) }, fill: '#d2c8b4' },
    ],
  },
];
