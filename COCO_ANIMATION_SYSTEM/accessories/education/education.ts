/**
 * Education props. Held props are drawn in world coordinates of their holding pose:
 *   HOLD  = near wing forward, hand curled (book, dictionary): hand from (619, 611) to (750, 611)
 *   POINT = near wing pointing forward (pointer, chalk, pencil): hand from (628, 585) to (754, 624)
 *   UP    = far wing raised up-right (card, notepad): hand from (719, 503) to (829, 463)
 * The blackboard stands on the ground to the right of Coco (attached to the root).
 */
import { capsule, compound, ellipse, frame, roundRect, smooth, aim, type OPt, type Pt } from '../../rev2d/source/lib/geom.ts';
import { linear, radial } from '../../character/parts/types.ts';
import type { Accessory } from '../lib.ts';

export const HOLD = { WingRRaise: -0.9, WingRCurl: 0.5 };
export const POINT = { WingRRaise: -1 };
export const UP = { WingLRaise: 0.8 };

const BOARD = '#2f5f50';
const WOOD = ['#b98a52', '#8f6334'] as const;
const CHALK = '#f3f3ea';

/** A tapered stick from a to b (half-widths w0 at a, w1 at b), round ends. */
function stick(a: Pt, b: Pt, w0: number, w1: number): string {
  const { deg, len } = aim(a, b);
  const uv: Array<[number, number]> = [[-w0, 0], [0, -w0], [len * 0.5, -(w0 + w1) / 2], [len, -w1], [len + w1, 0], [len, w1], [len * 0.5, (w0 + w1) / 2], [0, w0]];
  return smooth(uv.map(([u, v]) => frame(a, deg, u, v)));
}

/** A polygon along an axis: points as (u, v) in the frame at `o` facing `deg`. */
function along(o: Pt, deg: number, uv: Array<[number, number] | [number, number, 'c']>): string {
  return smooth(uv.map((p) => {
    const q = frame(o, deg, p[0], p[1]);
    return p[2] === 'c' ? [q[0], q[1], 'c'] : q;
  }) as OPt[], 0.6);
}

const strokes = (pts: Pt[], r: number): string => compound(...pts.slice(1).map((p, i) => smooth(capsule(pts[i], p, r))));

function book(id: string, param: string, title: string, cover: [string, string], thick: number, emblem: 'globe' | 'abc'): Accessory {
  const cx = 684, cy = 548;
  return {
    id, param, category: 'education', title,
    description: `${title} held upright on the near wing (reference pose: wing forward, hand curled).`,
    attach: 'wingR_hand', pose: HOLD, pivot: [684, 606],
    parts: [
      { id: `${id}Pages`, z: 15.8, shape: { type: 'path', d: roundRect(cx + thick, cy - thick, 112, 118, 8) }, fill: '#f6f1e3', stroke: { color: '#d9d0b8', width: 1.5 } },
      { id: `${id}Cover`, z: 16, shape: { type: 'path', d: roundRect(cx, cy, 116, 120, 10), detail: 12 }, fill: linear([cx - 58, cy - 60], [cx + 58, cy + 60], [[0, cover[0]], [1, cover[1]]]) },
      { id: `${id}Spine`, z: 16.1, shape: { type: 'path', d: roundRect(cx - 52, cy, 13, 118, 5) }, fill: cover[1] },
      ...(emblem === 'globe'
        ? [
            { id: `${id}Emblem`, z: 16.2, shape: { type: 'ellipse', cx: cx + 6, cy: cy - 4, rx: 23, ry: 23 }, fill: '#ffffffe6' },
            { id: `${id}EmblemLand`, z: 16.3, mask: [`${id}Emblem`], shape: { type: 'path', d: compound(smooth([[cx - 6, cy - 22], [cx + 10, cy - 18], [cx + 6, cy - 6], [cx - 8, cy + 2], [cx - 14, cy - 10]]), smooth([[cx + 14, cy + 2], [cx + 26, cy + 4], [cx + 22, cy + 16], [cx + 10, cy + 14]])) }, fill: cover[0] },
          ]
        : [
            { id: `${id}Label`, z: 16.2, shape: { type: 'path', d: roundRect(cx + 6, cy - 14, 70, 30, 6) }, fill: '#f2c14e' },
            { id: `${id}LabelText`, z: 16.3, shape: { type: 'path', d: compound(roundRect(cx - 10, cy - 14, 10, 12, 2), roundRect(cx + 6, cy - 14, 10, 12, 2), roundRect(cx + 22, cy - 14, 10, 12, 2)) }, fill: cover[1] },
          ]),
    ],
  };
}

export const EDUCATION_ACCESSORIES: Accessory[] = [
  book('book', 'AccBook', 'Book', ['#5cb860', '#3f9346'], 6, 'globe'),
  book('dictionary', 'AccDictionary', 'Dictionary', ['#cf5145', '#a5352c'], 11, 'abc'),
  {
    id: 'pointer', param: 'AccPointer', category: 'education', title: 'Pointer stick',
    description: 'A wooden teacher\'s pointer held in the near wing tip.',
    attach: 'wingR_hand', pose: POINT, pivot: [730, 614],
    parts: [
      { id: 'pointerStick', z: 13.9, shape: { type: 'path', d: stick([720, 620], [884, 466], 5.5, 3), detail: 8 }, fill: linear([720, 620], [884, 466], [[0, WOOD[1]], [1, WOOD[0]]]) },
      { id: 'pointerTip', z: 13.95, shape: { type: 'ellipse', cx: 884, cy: 466, rx: 5, ry: 5 }, fill: '#5b3a1e' },
    ],
  },
  {
    id: 'chalk', param: 'AccChalk', category: 'education', title: 'Chalk',
    description: 'A stick of chalk in the near wing tip (writing on the blackboard).',
    attach: 'wingR_hand', pose: POINT, pivot: [752, 618],
    parts: [{ id: 'chalkStick', z: 13.9, shape: { type: 'path', d: smooth(capsule([742, 624], [774, 604], 5)) }, fill: CHALK, stroke: { color: '#d6d6cc', width: 1 } }],
  },
  {
    id: 'pencil', param: 'AccPencil', category: 'education', title: 'Pencil',
    description: 'A big yellow pencil held in the near wing tip, point up-right.',
    attach: 'wingR_hand', pose: POINT, pivot: [735, 620],
    parts: (() => {
      const o: Pt = [706, 646];
      const deg = -41;
      return [
        { id: 'pencilEraser', z: 13.86, shape: { type: 'path', d: along(o, deg, [[-4, 0], [0, -8, 'c'], [14, -8, 'c'], [14, 8, 'c'], [0, 8, 'c']]) }, fill: '#f29aa5' },
        { id: 'pencilFerrule', z: 13.87, shape: { type: 'path', d: along(o, deg, [[13, -8.5, 'c'], [25, -8.5, 'c'], [25, 8.5, 'c'], [13, 8.5, 'c']]) }, fill: '#c9ccd6' },
        { id: 'pencilBody', z: 13.88, shape: { type: 'path', d: along(o, deg, [[24, -8, 'c'], [100, -8, 'c'], [100, 8, 'c'], [24, 8, 'c']]), detail: 10 }, fill: linear(frame(o, deg, 50, -8), frame(o, deg, 50, 8), [[0, '#f8d36a'], [0.5, '#f2c14e'], [1, '#d9a42a']]) },
        { id: 'pencilWood', z: 13.89, shape: { type: 'path', d: along(o, deg, [[99, -8, 'c'], [120, -2.5, 'c'], [120, 2.5, 'c'], [99, 8, 'c']]) }, fill: '#efcf9d' },
        { id: 'pencilLead', z: 13.9, shape: { type: 'path', d: along(o, deg, [[118, -3, 'c'], [129, 0, 'c'], [118, 3, 'c']]) }, fill: '#3b3d4d' },
      ];
    })(),
  },
  {
    id: 'card', param: 'AccCard', category: 'education', title: 'Vocabulary card',
    description: 'A flash card held up beside the head by the far wing.',
    attach: 'wingL_hand', pose: UP, pivot: [826, 466],
    parts: [
      { id: 'cardBase', z: 33, shape: { type: 'path', d: roundRect(842, 392, 118, 150, 12, 8), detail: 12 }, fill: '#ffffff', stroke: { color: '#d4d7e1', width: 2 } },
      { id: 'cardHeader', z: 33.1, mask: ['cardBase'], shape: { type: 'path', d: roundRect(842, 338, 140, 52, 0, 8) }, fill: '#6aaef0' },
      { id: 'cardPicture', z: 33.2, shape: { type: 'ellipse', cx: 846, cy: 338, rx: 15, ry: 15 }, fill: '#ffffffd9' },
      { id: 'cardLines', z: 33.2, shape: { type: 'path', d: compound(roundRect(838, 396, 78, 10, 5, 8), roundRect(834, 420, 64, 9, 4.5, 8), roundRect(830, 442, 74, 9, 4.5, 8)) }, fill: '#c8cbd6' },
    ],
  },
  {
    id: 'notepad', param: 'AccNotepad', category: 'education', title: 'Notepad',
    description: 'A spiral notepad held up by the far wing (Coco writes on it with the pencil).',
    attach: 'wingL_hand', pose: UP, pivot: [826, 466],
    parts: [
      { id: 'notepadPaper', z: 33, shape: { type: 'path', d: roundRect(850, 404, 104, 128, 8, 6), detail: 12 }, fill: '#fffdf6', stroke: { color: '#d8d4c5', width: 2 } },
      { id: 'notepadLines', z: 33.1, mask: ['notepadPaper'], shape: { type: 'path', d: compound(...[0, 1, 2, 3, 4].map((i) => roundRect(850 - i * 2.2, 380 + i * 20, 120, 2.5, 1, 6))) }, fill: '#a9c7ec' },
      { id: 'notepadSpiral', z: 33.2, shape: { type: 'path', d: compound(...[0, 1, 2, 3, 4].map((i) => roundRect(812 + i * 20, 340 + i * 2.1, 7, 18, 3.5, 6))) }, fill: '#d6524a' },
    ],
  },
  {
    id: 'blackboard', param: 'AccBlackboard', category: 'education', title: 'Blackboard',
    description: 'A blackboard on an easel standing to the right of Coco; AccBoardText writes "Aa" stroke by stroke.',
    attach: 'root', pivot: [842, 893],
    extraParams: [{ id: 'AccBoardText', description: 'Chalk text on the blackboard: 0 empty … 1 "Aa" fully written (stroke by stroke).' }],
    parts: [
      { id: 'boardLegs', z: -3, shape: { type: 'path', d: compound(smooth(capsule([776, 640], [752, 893], 7)), smooth(capsule([908, 640], [932, 893], 7)), smooth(capsule([842, 648], [842, 880], 6))) }, fill: WOOD[1] },
      { id: 'boardFrame', z: -2, shape: { type: 'path', d: roundRect(842, 552, 250, 190, 12), detail: 16 }, fill: linear([717, 457], [967, 647], [[0, WOOD[0]], [1, WOOD[1]]]) },
      { id: 'boardSurface', z: -1.9, shape: { type: 'path', d: roundRect(842, 548, 224, 160, 6), detail: 16 }, fill: radial([820, 520], 180, [[0, '#3b7362'], [1, BOARD]]) },
      { id: 'boardTray', z: -1.8, shape: { type: 'path', d: roundRect(842, 638, 232, 10, 4) }, fill: WOOD[0] },
      // "Aa", written stroke by stroke as AccBoardText goes 0 -> 1.
      { id: 'chalkA1', z: -1.7, showParam: 'AccBoardText', show: [[0, 0], [0.15, 1], [1, 1]], shape: { type: 'path', d: strokes([[760, 604], [783, 520]], 4.5) }, fill: CHALK },
      { id: 'chalkA2', z: -1.7, showParam: 'AccBoardText', show: [[0, 0], [0.15, 0], [0.3, 1], [1, 1]], shape: { type: 'path', d: strokes([[783, 520], [806, 604]], 4.5) }, fill: CHALK },
      { id: 'chalkA3', z: -1.7, showParam: 'AccBoardText', show: [[0, 0], [0.3, 0], [0.42, 1], [1, 1]], shape: { type: 'path', d: strokes([[769, 574], [797, 574]], 4) }, fill: CHALK },
      { id: 'chalka1', z: -1.7, showParam: 'AccBoardText', show: [[0, 0], [0.42, 0], [0.6, 1], [1, 1]], shape: { type: 'path', d: compound(ellipse(836, 584, 15, 18)) }, fill: CHALK },
      { id: 'chalka2', z: -1.65, showParam: 'AccBoardText', show: [[0, 0], [0.42, 0], [0.6, 1], [1, 1]], shape: { type: 'path', d: ellipse(836, 584, 8, 11) }, fill: BOARD },
      { id: 'chalka3', z: -1.6, showParam: 'AccBoardText', show: [[0, 0], [0.6, 0], [0.75, 1], [1, 1]], shape: { type: 'path', d: strokes([[851, 562], [851, 604]], 4.5) }, fill: CHALK },
      { id: 'chalkLine', z: -1.6, showParam: 'AccBoardText', show: [[0, 0], [0.75, 0], [0.9, 0.8], [1, 0.8]], shape: { type: 'path', d: strokes([[756, 622], [864, 622]], 3) }, fill: CHALK },
    ],
  },
];
