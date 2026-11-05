/**
 * The animation library: every clip of every category, in build order. Composed clips come last
 * (they bake layers of the clips above with Rev2D's compose op).
 */
import { IDLE_CLIPS, IDLE_COMPOSED } from './idle/idle.ts';
import type { Clip, ComposedClip } from './lib.ts';

export const CLIPS: Clip[] = [...IDLE_CLIPS];
export const COMPOSED: ComposedClip[] = [...IDLE_COMPOSED];

const ids = new Set<string>();
for (const c of [...CLIPS, ...COMPOSED]) {
  if (ids.has(c.id)) throw new Error(`duplicate animation id "${c.id}"`);
  ids.add(c.id);
}
