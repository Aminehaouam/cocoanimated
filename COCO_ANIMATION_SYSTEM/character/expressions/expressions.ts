/**
 * Coco's expression presets: named parameter sets on the master rig (no new drawings).
 * Clips reuse them, so "happy" always means the same face everywhere in the app.
 * Unlisted parameters stay at their defaults. Rendered by `npm run qc -- expressions` into
 * character/expressions/coco_expressions.png.
 */
export interface Expression {
  description: string;
  params: Record<string, number>;
}

export const EXPRESSIONS = {
  neutral: { description: 'Rest face: open eye, gentle smile.', params: {} },
  happy: { description: 'Smiling eye, open smiling beak, slight tilt.', params: { EyeRSmile: 1, MouthForm: 1, MouthOpen: 0.3, AngleZ: 5, AngleY: 6 } },
  joyful: { description: 'Eyes closed in a happy arc, beak wide open, blush.', params: { EyeROpen: 0, EyeRSmile: 1, MouthOpen: 0.8, MouthForm: 1, AngleY: 12, Blush: 0.6 } },
  excited: { description: 'Wide eye, raised brow, open beak.', params: { EyeWide: 0.6, BrowRY: 0.7, MouthOpen: 0.75, MouthForm: 1, AngleY: 10 } },
  proud: { description: 'Chin up, content squint, chest out.', params: { EyeRSmile: 0.8, EyeROpen: 0.7, MouthForm: 0.9, AngleY: 16, AngleX: 8, Breath: 1 } },
  curious: { description: 'Head tilted, brow up, looking at something.', params: { AngleZ: 16, EyeWide: 0.35, BrowRY: 0.6, BrowRAngle: 0.2, EyeBallX: 0.5, EyeBallY: 0.2, MouthForm: 0.2 } },
  confused: { description: 'Tilted the other way, worried brow, small frown.', params: { AngleZ: -14, BrowRAngle: 0.9, BrowRY: 0.4, MouthForm: -0.5, EyeBallY: 0.5, EyeBallX: -0.3 } },
  surprised: { description: 'Big eye, brow up, beak open.', params: { EyeWide: 1, BrowRY: 1, MouthOpen: 0.65, MouthForm: 0, AngleY: 6 } },
  worried: { description: 'Brow up in the middle, frown, looking down.', params: { BrowRAngle: 1, BrowRY: 0.3, MouthForm: -0.6, EyeROpen: 0.85, AngleY: -8, EyeBallY: -0.3 } },
  sad: { description: 'Drooping head, heavy lid, frown.', params: { BrowRAngle: 1, BrowRY: -0.2, EyeROpen: 0.6, MouthForm: -1, AngleY: -16, AngleZ: -6, EyeBallY: -0.6 } },
  disappointed: { description: 'Half-closed eye, frown, slumped.', params: { EyeROpen: 0.5, BrowRAngle: 0.6, MouthForm: -0.8, AngleY: -12, BodyAngleZ: -3 } },
  embarrassed: { description: 'Blushing, eye squeezed, looking away.', params: { Blush: 1, EyeRSmile: 0.7, EyeROpen: 0.45, AngleY: -12, AngleZ: -10, MouthForm: 0.4, EyeBallX: -0.5 } },
  playful: { description: 'A wink with a big smile.', params: { EyeROpen: 0, EyeRSmile: 1, MouthForm: 1, MouthOpen: 0.2, AngleZ: 12 } },
  reassuring: { description: 'Soft smiling eye, kind brow, gentle tilt.', params: { EyeRSmile: 0.7, MouthForm: 0.8, AngleZ: 9, BrowRAngle: 0.35, BrowRY: 0.2 } },
  mischievous: { description: 'Narrowed eye, sly brow, sideways look, grin.', params: { EyeROpen: 0.55, EyeRSmile: 0.25, BrowRAngle: -0.7, BrowRY: -0.2, MouthForm: 1, AngleZ: -8, EyeBallX: 0.7, AngleX: 10 } },
  determined: { description: 'Lowered brow, steady look.', params: { BrowRAngle: -1, BrowRY: -0.4, MouthForm: -0.1, EyeROpen: 0.85, AngleY: -4 } },
  thinking: { description: 'Looking up, brow raised, beak pursed.', params: { EyeBallY: 0.9, EyeBallX: -0.3, AngleY: 12, AngleZ: -8, BrowRY: 0.5, BrowRAngle: 0.4, MouthForm: -0.2 } },
  suspicious: { description: 'Narrowed eye, side glance.', params: { EyeROpen: 0.45, BrowRAngle: -0.8, BrowRY: -0.6, EyeBallX: -0.8, AngleX: -10, MouthForm: -0.3 } },
  listening: { description: 'Head tilted toward the speaker, attentive.', params: { AngleZ: 12, EyeBallX: -0.3, MouthForm: 0.4, BrowRY: 0.3 } },
  sleepy: { description: 'Heavy lid, head dropping.', params: { EyeROpen: 0.25, AngleY: -10, AngleZ: 6 } },
  asleep: { description: 'Eye closed, head down and tilted.', params: { EyeROpen: 0, AngleY: -14, AngleZ: 9 } },
} satisfies Record<string, Expression>;

export type ExpressionName = keyof typeof EXPRESSIONS;

/** The parameters of an expression, optionally merged with extra values. */
export function expr(name: ExpressionName, extra: Record<string, number> = {}): Record<string, number> {
  return { ...EXPRESSIONS[name].params, ...extra };
}
