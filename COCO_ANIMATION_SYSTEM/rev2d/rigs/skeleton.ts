/**
 * Coco's skeleton (bones) and deformers (warps), as Rev2D edit ops.
 *
 * Bones are placed by WORLD position and on-screen direction (`world` / `worldRotation`), so Rev2D's
 * own `add` op converts them to local coordinates: nothing here depends on hand-computed matrices.
 *
 *   root (ground, squash pivot)
 *   └─ hips (lean)
 *      ├─ chest
 *      │  ├─ neck ─ head ─ beak ─ jaw            headWarp ⊃ faceWarp ⊃ eyeWarp hang from head
 *      │  ├─ wingR_arm ─ wingR_hand              near wing (in front of the body)
 *      │  └─ wingL_arm ─ wingL_hand              far wing (behind the body)
 *      ├─ tail ─ tailF1 / tailF2 / tailF3        one bone per tail feather (fan)
 *      ├─ legR, legL                             thighs inside the body
 *      └─ bodyWarp                               torso lattice (breathing, lean, squash)
 *   footR, footL hang from root, so the feet stay planted while the body moves.
 */
import { LM } from '../../character/master/landmarks.ts';
import { aim, type Pt } from '../source/lib/geom.ts';

type Op = Record<string, unknown>;

/** A bone at `at` pointing toward `toward` (its length reaches it). */
function boneTo(id: string, parent: string, at: Pt, toward: Pt): Op {
  const { deg, len } = aim(at, toward);
  return { op: 'add', kind: 'bone', value: { id, parent, world: at, worldRotation: round(deg), length: round(len) } };
}

/** A bone at `at` with an explicit on-screen direction and length. */
function boneDir(id: string, parent: string, at: Pt, deg: number, length: number): Op {
  return { op: 'add', kind: 'bone', value: { id, parent, world: at, worldRotation: deg, length } };
}

function warp(id: string, parent: string, rect: [number, number, number, number], cols: number, rows: number, description: string): Op {
  return { op: 'add', kind: 'warp', value: { id, parent, rect, cols, rows, description } };
}

const round = (v: number): number => Math.round(v * 10) / 10;

/** Tail feather roots and tips (also used by character/parts/tail.ts). */
export const TAIL_FEATHERS = {
  tailF1: { base: [432, 778] as Pt, tip: [340, 879] as Pt, width: 40 },
  tailF2: { base: [442, 778] as Pt, tip: [392, 883] as Pt, width: 42 },
  tailF3: { base: [450, 776] as Pt, tip: [426, 862] as Pt, width: 38 },
} as const;

export function skeletonOps(): Op[] {
  return [
    { op: 'add', kind: 'bone', value: { id: 'root', x: LM.ground[0], y: LM.ground[1], description: 'Ground point between the feet: whole-body moves and the squash pivot.' } },
    boneDir('hips', 'root', LM.hips, -90, 60),
    boneDir('chest', 'hips', LM.chest, -90, 80),
    boneDir('neck', 'chest', LM.neck, -90, 30),
    boneDir('head', 'neck', LM.headPivot, -90, 120),

    // Beak: rigid, follows the face; the jaw (lower mandible) opens by rotating clockwise.
    boneTo('beak', 'head', LM.beakHinge, LM.beakTip),
    boneTo('jaw', 'beak', LM.beakHinge, [664, 436]),

    // Wings: two-bone chains along the folded wing (shoulder -> wrist -> tip).
    boneTo('wingR_arm', 'chest', LM.shoulderR, LM.wristR),
    boneTo('wingR_hand', 'wingR_arm', LM.wristR, LM.wingTipR),
    boneTo('wingL_arm', 'chest', LM.shoulderL, LM.wristL),
    boneTo('wingL_hand', 'wingL_arm', LM.wristL, LM.wingTipL),

    // Tail: a root bone and one bone per feather, so the fan can open and the tail can swing.
    boneDir('tail', 'hips', LM.tailBase, 118, 40),
    boneTo('tailF1', 'tail', TAIL_FEATHERS.tailF1.base, TAIL_FEATHERS.tailF1.tip),
    boneTo('tailF2', 'tail', TAIL_FEATHERS.tailF2.base, TAIL_FEATHERS.tailF2.tip),
    boneTo('tailF3', 'tail', TAIL_FEATHERS.tailF3.base, TAIL_FEATHERS.tailF3.tip),

    // Legs: thigh bones in the body, feet planted on the ground (children of root).
    boneTo('legR', 'hips', LM.hipR, LM.ankleR),
    boneTo('legL', 'hips', LM.hipL, LM.ankleL),
    boneDir('footR', 'root', LM.ankleR, 0, 40),
    boneDir('footL', 'root', LM.ankleL, 0, 40),

    // Deformers. Nested rects stay inside their parents (no extrapolation).
    warp('bodyWarp', 'hips', [414, 440, 262, 412], 3, 4, 'Torso lattice: breathing, body turn, squash.'),
    warp('headWarp', 'head', [376, 246, 300, 290], 4, 4, 'Whole head: gentle pseudo-3D turn of the outline.'),
    warp('faceWarp', 'headWarp', [450, 278, 222, 222], 4, 4, 'Face patch and eye ring: stronger turn than the outline.'),
    warp('eyeWarp', 'faceWarp', [492, 352, 76, 92], 2, 2, 'The eye and its highlights: gaze and surprise.'),
  ];
}
