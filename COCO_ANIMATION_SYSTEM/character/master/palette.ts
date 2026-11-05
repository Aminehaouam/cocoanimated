/**
 * Coco's master palette: the ONLY place character colours are defined. Every part, accessory and
 * export reads these tokens, so a colour change here changes Coco everywhere.
 *
 * Values were sampled from the reference sheet (character/master/reference/3.jpg, neutral pose) at
 * known canvas coordinates; see documentation/character_specification.md for the sample points.
 */
export const PALETTE = {
  // Head feathers: lighter crown, darker toward the back of the head and the nape.
  headLight: '#a8aab6',
  headBase: '#9a9caa',
  headDark: '#8c8e9d',
  napeEdge: '#878999',

  // Body feathers: light chest, slightly darker flanks and belly.
  bodyLight: '#9ea0ad',
  bodyBase: '#9496a5',
  bodyDark: '#878a9b',
  bodyShadow: '#7e8193',
  chestScallop: '#a7a9b6',

  // Face: the bare white patch of an African grey, a brighter ring around the eye, a black eye.
  facePatch: '#e6e6eb',
  eyeRing: '#fafafb',
  eye: '#1c1c26',
  eyeHighlight: '#ffffff',
  brow: '#3b3d4d',
  blush: '#f29aa5',
  tear: '#6db6f2',

  // Beak: charcoal, lighter at the top of the upper mandible, darker lower mandible.
  beakTop: '#5f6273',
  beakBase: '#525565',
  beakBottom: '#464959',
  beakLower: '#3b3d4d',
  beakLowerDark: '#30323f',
  beakSheen: '#6c6e80',
  mouthLine: '#1f202b',
  nostril: '#272a39',
  mouthInside: '#5c2531',
  tongue: '#d8737e',

  // Wings: lighter coverts over darker flight feathers; the far wing sits in shade.
  covertLight: '#7f8191',
  covert: '#767889',
  covertEdge: '#6a6c7d',
  primary: '#5c6072',
  primaryDark: '#515466',
  farWing: '#6e7081',
  farWingDark: '#5f6274',

  // Tail: the signature red, brighter at the tips.
  tailLight: '#ec3b32',
  tail: '#e03434',
  tailDark: '#c32a2b',
  tailBack: '#cc2d2d',

  // Legs and feet.
  leg: '#3e4050',
  foot: '#474a5a',
  footLight: '#55586b',

  // Contact shadow on the ground.
  shadow: '#1c1c26',
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** "#rrggbb" + alpha 0..1 -> "#rrggbbaa". */
export function alpha(hex: string, a: number): string {
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255);
  return `${hex.slice(0, 7)}${v.toString(16).padStart(2, '0')}`;
}
