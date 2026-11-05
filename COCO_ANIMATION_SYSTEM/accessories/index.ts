/** Every accessory, effect and scene prop, in build order. */
import { MARKS } from '../character/expressions/marks.ts';
import { CLOTHING_ACCESSORIES } from './clothing/clothing.ts';
import { EDUCATION_ACCESSORIES } from './education/education.ts';
import { REWARD_ACCESSORIES } from './rewards/rewards.ts';
import { TRAVEL_ACCESSORIES } from './travel/travel.ts';
import type { Accessory } from './lib.ts';

export const ACCESSORIES: Accessory[] = [...EDUCATION_ACCESSORIES, ...TRAVEL_ACCESSORIES, ...CLOTHING_ACCESSORIES, ...REWARD_ACCESSORIES, ...MARKS];

const ids = new Set<string>();
for (const a of ACCESSORIES) {
  for (const id of [a.id, a.param, ...a.parts.map((p) => p.id)]) {
    if (ids.has(id)) throw new Error(`duplicate accessory id "${id}"`);
    ids.add(id);
  }
}
