/**
 * Coco's skeleton (bones) and deformers (warps), as Rev2D edit ops.
 *
 * Bones are placed by WORLD position and on-screen direction (`world` / `worldRotation`), so Rev2D's
 * own `add` op converts them to local coordinates: nothing here depends on hand-computed matrices.
 *
 *   root (fixed world anchor on the ground)
 *   ├─ shadowBone                                 the contact shadow stays on the ground
 *   └─ move (whole-body translation, squash & stretch pivot at the feet)
 *      ├─ hips (lean)
 *      │  ├─ chest
 *      │  │  ├─ neck ─ head ─ beak ─ jaw          headWarp ⊃ faceWarp ⊃ eyeWarp hang from head
 *      │  │  ├─ wingR_arm ─ wingR_hand            near wing (in front of the body)
 *      │  │  └─ wingL_arm ─ wingL_hand            far wing (behind the body)
 *      │  ├─ tail ─ tailF1 / tailF2 / tailF3      one bone per tail feather (fan)
 *      │  ├─ legR, legL                           thighs inside the body
 *      │  └─ bodyWarp                             torso lattice (breathing, turn)
 *      └─ footR, footL                            planted feet (they do not follow the lean)
 */
import { LM } from '../../character/master/landmarks.ts';
import { wingJoints } from '../../character/parts/wings.ts';
import { aim, type Pt } from '../source/lib/geom.ts';

type Op = Record<string, unknown>;

const round = (v: number): number => Math.round(v * 10) / 10;

/** A bone at `at` pointing toward `toward` (its length reaches it). */
function boneTo(id: string, parent: string, at: Pt, toward: Pt, description?: string): Op {
  const { deg, len } = aim(at, toward);
  return { op: 'add', kind: 'bone', value: { id, parent, world: at, worldRotation: round(deg), length: round(len), ...(description ? { description } : {}) } };
}

/** A bone at `at` with an explicit on-screen direction and length. */
function boneDir(id: string, parent: string, at: Pt, deg: number, length: number, description?: string): Op {
  return { op: 'add', kind: 'bone', value: { id, parent, world: at, worldRotation: deg, length, ...(description ? { description } : {}) } };
}

function warp(id: string, parent: string, rect: [number, number, number, number], cols: number, rows: number, description: string): Op {
  return { op: 'add', kind: 'warp', value: { id, parent, rect, cols, rows, description } };
}

/** Tail feather roots and tips (also used by character/parts/tail.ts). */
export const TAIL_FEATHERS = {
  tailF1: { base: [432, 778] as Pt, tip: [340, 879] as Pt, width: 40 },
  tailF2: { base: [442, 778] as Pt, tip: [392, 883] as Pt, width: 42 },
  tailF3: { base: [450, 776] as Pt, tip: [426, 862] as Pt, width: 38 },
} as const;

/** World rotations of the setup pose, needed to write absolute local keyforms (local = world - parent world). */
export const SETUP_WORLD_ROTATION: Record<string, number> = {};

export function skeletonOps(): Op[] {
  const wR = wingJoints('R');
  const wL = wingJoints('L');
  const ops: Op[] = [
    { op: 'add', kind: 'bone', value: { id: 'root', x: LM.ground[0], y: LM.ground[1], description: 'Fixed world anchor on the ground line (never animated).' } },
    boneDir('shadowBone', 'root', [522, 893], 0, 60, 'Carries the contact shadow: follows BodyX, shrinks with height.'),
    // Rotation 0 keeps move's local axes on the screen axes: scaleX = width, scaleY = height.
    boneDir('move', 'root', LM.ground, 0, 40, 'Whole-body translation (BodyX, BodyY) and squash & stretch about the feet.'),
    boneDir('hips', 'move', LM.hips, -90, 60, 'Body lean (BodyAngleZ) about the hips.'),
    boneDir('chest', 'hips', LM.chest, -90, 80, 'Carries the wings and the neck; lifts with each breath.'),
    boneDir('neck', 'chest', LM.neck, -90, 30),
    boneDir('head', 'neck', LM.headPivot, -90, 120, 'Head tilt (AngleZ) and nods.'),

    // Beak: rigid, follows the face; the jaw (lower mandible) opens by rotating clockwise.
    boneTo('beak', 'head', LM.beakHinge, LM.beakTip, 'Upper mandible; follows the face warp at the hinge.'),
    boneTo('jaw', 'beak', LM.beakHinge, [664, 436], 'Lower mandible; MouthOpen rotates it down.'),

    // Wings: two-bone chains along the folded wing (shoulder -> wrist -> tip).
    boneTo('wingR_arm', 'chest', wR.shoulder, wR.wrist),
    boneTo('wingR_hand', 'wingR_arm', wR.wrist, wR.tip),
    boneTo('wingL_arm', 'chest', wL.shoulder, wL.wrist),
    boneTo('wingL_hand', 'wingL_arm', wL.wrist, wL.tip),

    // Tail: a root bone and one bone per feather, so the fan can open and the tail can swing.
    boneDir('tail', 'hips', LM.tailBase, 118, 40),
    boneTo('tailF1', 'tail', TAIL_FEATHERS.tailF1.base, TAIL_FEATHERS.tailF1.tip),
    boneTo('tailF2', 'tail', TAIL_FEATHERS.tailF2.base, TAIL_FEATHERS.tailF2.tip),
    boneTo('tailF3', 'tail', TAIL_FEATHERS.tailF3.base, TAIL_FEATHERS.tailF3.tip),

    // Legs: thigh bones in the body; feet planted on the ground (children of move, not of the hips).
    boneTo('legR', 'hips', LM.hipR, LM.ankleR),
    boneTo('legL', 'hips', LM.hipL, LM.ankleL),
    boneDir('footR', 'move', LM.ankleR, 0, 40),
    boneDir('footL', 'move', LM.ankleL, 0, 40),

    // Deformers. Nested rects stay inside their parents (no extrapolation).
    warp('bodyWarp', 'hips', [414, 440, 262, 412], 3, 4, 'Torso lattice: breathing, body turn.'),
    warp('headWarp', 'head', [376, 246, 300, 290], 4, 4, 'Whole head: gentle pseudo-3D turn of the outline.'),
    warp('faceWarp', 'headWarp', [450, 278, 222, 222], 4, 4, 'Face patch, eye ring and brow: stronger turn than the outline.'),
    warp('eyeWarp', 'faceWarp', [492, 352, 76, 92], 2, 2, 'The eye and its highlights: gaze and surprise.'),
  ];
  // Record setup world rotations (for local keyforms in the controls).
  for (const op of ops) {
    const v = op.value as { id: string; parent?: string; worldRotation?: number };
    if (op.kind === 'bone') SETUP_WORLD_ROTATION[v.id] = v.worldRotation ?? 0;
  }
  return ops;
}

/** Local rotation of a bone for a desired on-screen (world) rotation, at the setup pose of its parent. */
export function localRotation(id: string, parent: string, world: number): number {
  if (!(parent in SETUP_WORLD_ROTATION)) skeletonOps();
  return round(world - SETUP_WORLD_ROTATION[parent]);
}
