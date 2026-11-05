/**
 * Torso, chest feathers, thigh shading and the ground contact shadow.
 * The torso is drawn complete (also where the wing and head cover it), so moving parts never
 * reveal holes.
 */
import { PALETTE as C, alpha } from '../master/palette.ts';
import { compound, ellipse, smooth, type OPt } from '../../rev2d/source/lib/geom.ts';
import { featherFill, radial, type Part } from './types.ts';

/** One feather edge: a soft downward "U" lune centred at (cx, cy). */
export function scallop(cx: number, cy: number, w = 34, depth = 10, thick = 6.5): string {
  const h = w / 2;
  const pts: OPt[] = [
    [cx - h, cy - 2, 'c'], [cx - h * 0.5, cy + depth * 0.8], [cx, cy + depth], [cx + h * 0.5, cy + depth * 0.8], [cx + h, cy - 2, 'c'],
    [cx + h * 0.48, cy + depth * 0.8 - thick], [cx, cy + depth - thick], [cx - h * 0.48, cy + depth * 0.8 - thick],
  ];
  return smooth(pts);
}

export function bodyParts(): Part[] {
  const torso: OPt[] = [
    [430, 468], [492, 452], [560, 448], [622, 462], [645, 492], [654, 530], [659, 572], [661, 612], [656, 650],
    [647, 682], [635, 707], [620, 736], [603, 764], [584, 792], [569, 814], [561, 828], [546, 834], [531, 828],
    [521, 811, 'c'], [509, 831], [494, 841], [476, 843], [461, 838], [451, 826], [445, 806], [438, 772], [431, 712],
    [425, 640], [423, 570], [424, 510],
  ];

  return [
    {
      id: 'shadow', parent: 'root', z: 0, tags: ['ground'],
      description: 'Soft contact shadow: stacked translucent ellipses (each subpath is filled on its own, so they build up toward the centre).',
      shape: { type: 'path', d: compound(ellipse(522, 893, 132, 15), ellipse(522, 893, 110, 12.5), ellipse(522, 893, 88, 10), ellipse(522, 893, 64, 7.5)) },
      fill: alpha(C.shadow, 0.055),
    },
    {
      id: 'body', parent: 'bodyWarp', z: 10, tags: ['feathers', 'body'],
      description: 'Torso, chest and thighs (one shape).',
      shape: { type: 'path', d: smooth(torso), detail: 14 },
      fill: featherFill(C),
    },
    {
      id: 'thighShade', parent: 'bodyWarp', z: 11, mask: ['body'], tags: ['body', 'shading'],
      description: 'Shade on the far thigh.',
      shape: { type: 'ellipse', cx: 548, cy: 806, rx: 30, ry: 40, detail: 8 },
      fill: radial([548, 812], 42, [[0, alpha(C.bodyShadow, 0.6)], [0.6, alpha(C.bodyShadow, 0.35)], [1, alpha(C.bodyShadow, 0)]]),
    },
    {
      id: 'chestScallops', parent: 'bodyWarp', z: 12, mask: ['body'], opacity: 0.55, tags: ['feathers', 'body', 'texture'],
      description: 'Lighter feather edges on the chest.',
      shape: {
        type: 'path', detail: 8,
        d: compound(
          scallop(592, 568), scallop(628, 574, 30),
          scallop(572, 616), scallop(608, 622), scallop(642, 618, 26),
          scallop(588, 668), scallop(624, 672, 32),
          scallop(574, 718, 30), scallop(608, 722, 30),
        ),
      },
      fill: C.chestScallop,
    },
  ];
}
