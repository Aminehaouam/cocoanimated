/**
 * Expression marks: the small graphic symbols of the reference sheet ("?", alert lines, light bulb,
 * thinking dots, sparkles, "Zzz"). They are accessories on the head bone (they follow its tilt and
 * nods) with visibility parameters Fx<Name>, and they pop in (scale 60 % → 100 %) as the parameter
 * rises. Thinking dots have one parameter per dot (FxDot1..3) so they can pulse in sequence.
 */
import { capsule, compound, ellipse, smooth, type OPt, type Pt } from '../../rev2d/source/lib/geom.ts';
import { radial } from '../parts/types.ts';
import type { Accessory } from '../../accessories/lib.ts';

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
];
