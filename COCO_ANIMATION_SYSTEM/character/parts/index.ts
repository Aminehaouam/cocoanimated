/**
 * Coco's master parts, back to front. Every module draws complete shapes in setup space (canvas px)
 * and names the bone or warp it hangs from; the rig (rev2d/rigs/) adds the controls on top.
 */
import { beakParts } from './beak.ts';
import { bodyParts } from './body.ts';
import { faceParts } from './face.ts';
import { headParts } from './head.ts';
import { legParts } from './legs.ts';
import { tailParts } from './tail.ts';
import type { Part } from './types.ts';
import { wingParts } from './wings.ts';

export type { Part } from './types.ts';

export function characterParts(): Part[] {
  const parts = [...bodyParts(), ...tailParts(), ...wingParts(), ...legParts(), ...headParts(), ...faceParts(), ...beakParts()];
  const seen = new Set<string>();
  for (const p of parts) {
    if (seen.has(p.id)) throw new Error(`duplicate part id "${p.id}"`);
    seen.add(p.id);
  }
  // Array order breaks z ties; sort by z so the file reads back to front.
  return parts.sort((a, b) => a.z - b.z);
}
