/** Every accessory and mark, in build order. */
import { MARKS } from '../character/expressions/marks.ts';
import { EDUCATION_ACCESSORIES } from './education/education.ts';
import type { Accessory } from './lib.ts';

export const ACCESSORIES: Accessory[] = [...EDUCATION_ACCESSORIES, ...MARKS];

const ids = new Set<string>();
for (const a of ACCESSORIES) {
  for (const id of [a.id, a.param, ...a.parts.map((p) => p.id)]) {
    if (ids.has(id)) throw new Error(`duplicate accessory id "${id}"`);
    ids.add(id);
  }
}
