/**
 * The red tail: three feathers fanning down-left from under the wing. Each sits on its own bone
 * (tailF1..3), so the fan can open, close and swing. Their roots reach far under the body and wing,
 * so no gap opens when they move.
 */
import { PALETTE as C, alpha } from '../master/palette.ts';
import { aim, feather, smooth } from '../../rev2d/source/lib/geom.ts';
import { TAIL_FEATHERS } from '../../rev2d/rigs/skeleton.ts';
import { linear, type Part } from './types.ts';

export function tailParts(): Part[] {
  const make = (id: 'tailF1' | 'tailF2' | 'tailF3', z: number, tipColor: string): Part => {
    const f = TAIL_FEATHERS[id];
    const { deg, len } = aim(f.base, f.tip);
    // Extend the root 34 px back under the body so swinging never shows the end.
    const back: [number, number] = [f.base[0] - Math.cos((deg * Math.PI) / 180) * 34, f.base[1] - Math.sin((deg * Math.PI) / 180) * 34];
    return {
      id, parent: id, z, tags: ['tail'],
      shape: { type: 'path', d: smooth(feather(back, deg, len + 34, f.width, f.width * 0.7)), detail: 10 },
      fill: linear(back, f.tip, [[0, C.tailDark], [0.5, C.tail], [1, tipColor]]),
      stroke: { color: alpha(C.tailDark, 0.55), width: 1.2 },
    };
  };
  return [make('tailF3', 1, C.tailBack), make('tailF2', 2, C.tail), make('tailF1', 3, C.tailLight)];
}
