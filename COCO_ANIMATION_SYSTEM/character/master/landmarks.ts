/**
 * Coco's master landmarks in canvas pixels (1024 x 1024 canvas, +y down).
 *
 * The master pose is the reference's neutral pose (character/master/reference/3.jpg, first figure)
 * placed at 2 canvas px per reference px with the feet on the ground line y = 893 and the body on
 * x = 512 +- 150. Parts are drawn around these points and bones are placed on them, so the art and
 * the rig always agree.
 *
 * Sides follow Rev2D / Live2D naming: L / R are Coco's own left / right. Coco faces screen-right in
 * a three-quarter view, so its RIGHT side faces the viewer: wingR, legR, footR and the visible eye
 * are the near ones; wingL, legL and footL are on the far side.
 */
import type { Pt } from '../../rev2d/source/lib/geom.ts';

export const CANVAS = { width: 1024, height: 1024 } as const;

export const LM = {
  /** Ground point under the body; the root bone and the squash pivot. */
  ground: [512, 893] as Pt,
  /** Hip pivot (body lean). */
  hips: [530, 815] as Pt,
  /** Chest centre (wings hang from the chest bone). */
  chest: [560, 640] as Pt,
  /** Neck joint (head nod / bob). */
  neck: [560, 500] as Pt,
  /** Head pivot at the base of the skull (head tilt). */
  headPivot: [545, 470] as Pt,

  /** Centre of the black eye. */
  eye: [529, 396] as Pt,
  eyeRadius: [27.5, 35] as Pt,
  /** Centre of the white eye ring. */
  eyeRing: [530, 397] as Pt,
  eyeRingRadius: [46, 52] as Pt,
  /** Main and secondary eye highlights. */
  highlight: [541, 369] as Pt,
  highlight2: [517, 414] as Pt,

  /** Beak hinge: where both mandibles meet the face. */
  beakHinge: [598, 400] as Pt,
  /** Hook tip of the upper mandible. */
  beakTip: [686, 453] as Pt,
  nostril: [622, 337] as Pt,

  /** Near (right) wing: shoulder, wrist and tip of the folded wing. */
  shoulderR: [488, 548] as Pt,
  wristR: [420, 676] as Pt,
  wingTipR: [354, 790] as Pt,
  /** Far (left) wing. */
  shoulderL: [636, 545] as Pt,
  wristL: [652, 660] as Pt,
  wingTipL: [626, 740] as Pt,

  /** Root of the tail feathers (hidden under the wing and the body). */
  tailBase: [440, 772] as Pt,

  /** Legs: hip joint (inside the body) and ankle (top of the foot). */
  hipR: [482, 818] as Pt,
  ankleR: [484, 866] as Pt,
  hipL: [551, 815] as Pt,
  ankleL: [552, 856] as Pt,
} as const;
