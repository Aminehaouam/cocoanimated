/**
 * Rewards: trophy, medal, crown, heart, gift and streak badge, plus the celebration effects (big
 * stars, floating hearts, confetti, glow). Effects pop in with their Fx* parameter; hearts rise
 * with FxHeartsRise and confetti falls with FxConfettiFall.
 */
import { compound, ellipse, roundRect, smooth } from '../../rev2d/source/lib/geom.ts';
import { linear, radial } from '../../character/parts/types.ts';
import { HOLD, UP } from '../education/education.ts';
import { heart, star, strokes } from '../shapes.ts';
import type { Accessory } from '../lib.ts';

const GOLD = linear([800, 300], [900, 460], [[0, '#f9dc79'], [1, '#d39b1e']]);
const CROWN = { target: 'headWarp' as const, rect: [396, 136, 296, 156] as [number, number, number, number], at: [540, 262] as [number, number] };

/** Confetti pieces of one colour, spread over the upper canvas (deterministic). */
function confetti(seed: number, n: number): string {
  const pieces: string[] = [];
  let s = seed;
  const rnd = (): number => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    const x = 240 + rnd() * 600, y = 110 + rnd() * 300, deg = rnd() * 180;
    pieces.push(rnd() > 0.35 ? roundRect(x, y, 16, 8, 2, deg) : ellipse(x, y, 5, 5));
  }
  return compound(...pieces);
}

export const REWARD_ACCESSORIES: Accessory[] = [
  {
    id: 'trophy', param: 'AccTrophy', category: 'rewards', title: 'Trophy',
    description: 'A gold trophy held up beside the head by the far wing.', attach: 'wingL_hand', pose: UP, pivot: [826, 466],
    parts: [
      { id: 'trophyHandles', z: 32.9, shape: { type: 'path', d: compound(strokes([[812, 330], [786, 330], [784, 356], [812, 372]], 5), strokes([[888, 330], [914, 330], [916, 356], [888, 372]], 5)) }, fill: '#d9a62c' },
      { id: 'trophyCup', z: 33, shape: { type: 'path', d: smooth([[804, 312, 'c'], [896, 312, 'c'], [892, 356], [872, 390], [850, 398], [828, 390], [808, 356]]), detail: 10 }, fill: GOLD },
      { id: 'trophyStem', z: 33, shape: { type: 'path', d: compound(roundRect(850, 414, 16, 34, 4), roundRect(850, 444, 74, 18, 6)) }, fill: '#c98f1c' },
      { id: 'trophyStar', z: 33.1, opacity: 0.85, shape: { type: 'path', d: star(850, 350, 15) }, fill: '#fff3c4' },
    ],
  },
  {
    id: 'medal', param: 'AccMedal', category: 'rewards', title: 'Medal',
    description: 'A gold medal on a blue and red ribbon around the neck.', attach: 'chest', pivot: [600, 616],
    parts: [
      { id: 'medalRibbonL', z: 17, shape: { type: 'path', d: strokes([[528, 500], [596, 598]], 9) }, fill: '#3d8ef0' },
      { id: 'medalRibbonR', z: 17, shape: { type: 'path', d: strokes([[646, 494], [606, 598]], 9) }, fill: '#e05555' },
      { id: 'medalDisc', z: 17.2, shape: { type: 'ellipse', cx: 601, cy: 618, rx: 27, ry: 27, detail: 6 }, fill: radial([594, 610], 30, [[0, '#fbe08a'], [1, '#d39b1e']]) },
      { id: 'medalStar', z: 17.3, shape: { type: 'path', d: star(601, 618, 14) }, fill: '#fff3c4' },
    ],
  },
  {
    id: 'crown', param: 'AccCrown', category: 'rewards', title: 'Crown',
    description: 'A gold crown with gems on the crown of the head.', attach: 'head', pivot: [540, 262], follow: CROWN,
    parts: [
      { id: 'crownBody', z: 27, shape: { type: 'path', d: smooth([[465, 262, 'c'], [468, 246, 'c'], [478, 200, 'c'], [504, 236, 'c'], [540, 186, 'c'], [576, 236, 'c'], [602, 200, 'c'], [612, 246, 'c'], [615, 262, 'c']], 0.2), detail: 8 }, fill: linear([540, 186], [540, 262], [[0, '#fbe08a'], [1, '#d39b1e']]) },
      { id: 'crownBalls', z: 27.1, shape: { type: 'path', d: compound(ellipse(478, 196, 7, 7), ellipse(540, 182, 8, 8), ellipse(602, 196, 7, 7)) }, fill: '#f9dc79' },
      { id: 'crownGemR', z: 27.2, shape: { type: 'ellipse', cx: 504, cy: 252, rx: 7, ry: 6 }, fill: '#e05555' },
      { id: 'crownGemB', z: 27.2, shape: { type: 'ellipse', cx: 540, cy: 250, rx: 8, ry: 7 }, fill: '#3d8ef0' },
      { id: 'crownGemG', z: 27.2, shape: { type: 'ellipse', cx: 576, cy: 252, rx: 7, ry: 6 }, fill: '#4cbf6b' },
    ],
  },
  {
    id: 'heart', param: 'AccHeart', category: 'rewards', title: 'Big heart',
    description: 'A big red heart hugged at the chest with the near wing.', attach: 'wingR_hand', pose: HOLD, pivot: [684, 606],
    parts: [
      { id: 'heartBig', z: 16, shape: { type: 'path', d: heart(682, 550, 62), detail: 10 }, fill: linear([630, 500], [730, 610], [[0, '#ff7b89'], [1, '#e03a4e']]) },
      { id: 'heartShine', z: 16.1, opacity: 0.45, shape: { type: 'ellipse', cx: 654, cy: 520, rx: 14, ry: 9, rotation: -35 }, fill: '#ffffff' },
    ],
  },
  {
    id: 'gift', param: 'AccGift', category: 'rewards', title: 'Gift box',
    description: 'A red gift box with a gold ribbon and bow, held on the near wing.', attach: 'wingR_hand', pose: HOLD, pivot: [684, 606],
    parts: [
      { id: 'giftBox', z: 16, shape: { type: 'path', d: roundRect(684, 566, 104, 82, 8), detail: 10 }, fill: linear([632, 525], [736, 607], [[0, '#ee6170'], [1, '#c63a4b']]) },
      { id: 'giftLid', z: 16.1, shape: { type: 'path', d: roundRect(684, 520, 118, 26, 6) }, fill: '#d64555' },
      { id: 'giftRibbon', z: 16.2, shape: { type: 'path', d: compound(roundRect(684, 552, 18, 110, 2), smooth([[684, 506, 'c'], [656, 482], [646, 500], [680, 510, 'c']], 0.7), smooth([[688, 506, 'c'], [716, 482], [726, 500], [690, 510, 'c']], 0.7)) }, fill: '#f2c14e' },
    ],
  },
  {
    id: 'streak_badge', param: 'AccStreakBadge', category: 'rewards', title: 'Streak badge',
    description: 'A round orange badge with a flame, held up by the far wing (daily streak).', attach: 'wingL_hand', pose: UP, pivot: [826, 466],
    parts: [
      { id: 'streakBadge', z: 33, shape: { type: 'ellipse', cx: 846, cy: 388, rx: 52, ry: 52, detail: 8 }, fill: radial([832, 372], 60, [[0, '#ffc266'], [1, '#f07b1a']]), stroke: { color: '#ffffff', width: 5, align: 'inside' } },
      { id: 'streakFlame', z: 33.1, shape: { type: 'path', d: smooth([[846, 352, 'c'], [868, 382], [870, 404], [858, 420], [846, 424], [832, 418], [822, 404], [826, 386], [838, 396], [840, 374]], 0.8) }, fill: '#ffffff' },
      { id: 'streakFlameIn', z: 33.2, shape: { type: 'path', d: smooth([[848, 386, 'c'], [858, 402], [854, 416], [846, 420], [838, 414], [838, 402]], 0.8) }, fill: '#ffc266' },
    ],
  },
  {
    id: 'fx_stars', param: 'FxStars', category: 'rewards', title: 'Celebration stars',
    description: 'Big yellow stars around Coco.', attach: 'move', pivot: [520, 520], pop: true,
    parts: [{ id: 'fxStars', z: 41, shape: { type: 'path', d: compound(star(300, 330, 32, 0.48, -10), star(770, 300, 26, 0.48, 12), star(830, 560, 20), star(240, 600, 18, 0.48, 20), star(540, 170, 28, 0.48, 6)) }, fill: '#ffd23f', stroke: { color: '#f5b51f', width: 2, align: 'inside' } }],
  },
  {
    id: 'fx_hearts', param: 'FxHearts', category: 'rewards', title: 'Floating hearts',
    description: 'Small red hearts near the head; FxHeartsRise floats them up.', attach: 'head', pivot: [600, 280], pop: true,
    extraParams: [{ id: 'FxHeartsRise', description: 'Floating hearts rise (0 … 1 = 60 px up).' }],
    // The head bone points up, so a child's local x is "up" on screen.
    extraOps: (bone) => [{ op: 'bind', target: `bone:${bone}.x`, params: ['FxHeartsRise'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 60 }] }],
    parts: [{ id: 'fxHearts', z: 40, shape: { type: 'path', d: compound(heart(470, 282, 17), heart(706, 300, 13), heart(652, 228, 11)) }, fill: '#ff5a6e' }],
  },
  {
    id: 'fx_confetti', param: 'FxConfetti', category: 'rewards', title: 'Confetti',
    description: 'Colourful confetti above Coco; FxConfettiFall drops it.', attach: 'move', pivot: [540, 260], pop: true,
    extraParams: [{ id: 'FxConfettiFall', description: 'Confetti falls (0 … 1 = 330 px down, turning).' }],
    extraOps: (bone) => [
      { op: 'bind', target: `bone:${bone}.y`, params: ['FxConfettiFall'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 330 }] },
      { op: 'bind', target: `bone:${bone}.rotation`, params: ['FxConfettiFall'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 8 }] },
    ],
    parts: [
      { id: 'fxConfettiR', z: 41, shape: { type: 'path', d: confetti(11, 9) }, fill: '#e05555' },
      { id: 'fxConfettiY', z: 41, shape: { type: 'path', d: confetti(23, 9) }, fill: '#ffd23f' },
      { id: 'fxConfettiB', z: 41, shape: { type: 'path', d: confetti(37, 9) }, fill: '#3d8ef0' },
      { id: 'fxConfettiG', z: 41, shape: { type: 'path', d: confetti(51, 9) }, fill: '#4cbf6b' },
    ],
  },
  {
    id: 'fx_glow', param: 'FxGlow', category: 'rewards', title: 'Glow',
    description: 'A warm glow behind Coco (level up, big achievements).', attach: 'move', pivot: [530, 600], pop: true,
    parts: [{ id: 'fxGlow', z: -5, blend: 'add', shape: { type: 'ellipse', cx: 530, cy: 590, rx: 330, ry: 330, detail: 24 }, fill: radial([530, 590], 330, [[0, '#fff3b0cc'], [0.55, '#ffe08a55'], [1, '#ffe08a00']]) }],
  },
];
