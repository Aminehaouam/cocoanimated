/**
 * The animation library: every clip of every category, in build order. Composed clips come last
 * (they bake layers of the clips above with Rev2D's compose op).
 */
import { IDLE_CLIPS, IDLE_COMPOSED } from './idle/idle.ts';
import { COMMUNICATION_CLIPS } from './communication/communication.ts';
import { EDUCATION_CLIPS } from './education/education.ts';
import { EMOTION_CLIPS } from './emotions/emotions.ts';
import { REACTION_CLIPS } from './reactions/reactions.ts';
import { REWARD_CLIPS } from './rewards/rewards.ts';
import { TRAVEL_CLIPS } from './travel/travel.ts';
import type { Clip, ComposedClip } from './lib.ts';

export const CLIPS: Clip[] = [...IDLE_CLIPS, ...COMMUNICATION_CLIPS, ...EDUCATION_CLIPS, ...EMOTION_CLIPS, ...TRAVEL_CLIPS, ...REWARD_CLIPS, ...REACTION_CLIPS];
export const COMPOSED: ComposedClip[] = [...IDLE_COMPOSED];

const ids = new Set<string>();
for (const c of [...CLIPS, ...COMPOSED]) {
  if (ids.has(c.id)) throw new Error(`duplicate animation id "${c.id}"`);
  ids.add(c.id);
}
