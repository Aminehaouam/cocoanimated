/**
 * Coco's control surface: parameters, bindings and physics, as Rev2D edit ops.
 *
 * Names follow the Live2D standard where one exists (AngleX/Y/Z, EyeROpen, EyeBallX/Y, BrowRY,
 * MouthOpen, MouthForm, BodyAngleX/Z, Breath), with Rev2D's signs (SPEC §3.1): AngleX > 0 turns
 * toward the screen right (for Coco: more profile, beak further right), AngleY > 0 looks up,
 * AngleZ > 0 tilts clockwise. Every keyform at a parameter's default equals the setup value, so the
 * rest pose is the master drawing.
 *
 * Local-frame note: hips, chest, neck and head bones point up (world rotation -90), so for their
 * CHILDREN local x = up and local y = screen right. `move`, the feet and the shadow bone are
 * unrotated (local x = right, y = down).
 */
import { EYE, browShape } from '../../character/parts/face.ts';
import { JAW_OPEN_DEG, MOUTH_INSIDE, MOUTH_LINE } from '../../character/parts/beak.ts';
import { WING_SHAPES } from '../../character/parts/wings.ts';
import { LM } from '../../character/master/landmarks.ts';
import { ellipse } from '../source/lib/geom.ts';
import { SETUP_WORLD_ROTATION, skeletonOps } from './skeleton.ts';

type Op = Record<string, unknown>;

export interface ParamDef {
  id: string;
  min: number;
  max: number;
  default?: number;
  group: string;
  description: string;
}

export const PARAMETERS: ParamDef[] = [
  // Head
  { id: 'AngleX', min: -30, max: 30, group: 'Head', description: 'Head turn; + = toward the screen right (more profile), - = toward the viewer.' },
  { id: 'AngleY', min: -30, max: 30, group: 'Head', description: 'Head pitch; + = looks up.' },
  { id: 'AngleZ', min: -30, max: 30, group: 'Head', description: 'Head tilt; + = clockwise (crown toward the screen right).' },
  // Eye (Coco shows one eye: its right eye)
  { id: 'EyeROpen', min: 0, max: 1, default: 1, group: 'Eye', description: '0 = closed (lid line), 1 = open.' },
  { id: 'EyeRSmile', min: 0, max: 1, group: 'Eye', description: 'Happy eye: open -> "◠" squint, closed -> "∩" arc.' },
  { id: 'EyeWide', min: 0, max: 1, group: 'Eye', description: 'Surprise: the eye grows (and the ring a little).' },
  { id: 'EyeBallX', min: -1, max: 1, group: 'Eye', description: 'Gaze; + = toward the screen right.' },
  { id: 'EyeBallY', min: -1, max: 1, group: 'Eye', description: 'Gaze; + = up.' },
  // Brow (hidden at 0, 0)
  { id: 'BrowRY', min: -1, max: 1, group: 'Brow', description: 'Brow height; + = raised, - = lowered. The brow shows only when used.' },
  { id: 'BrowRAngle', min: -1, max: 1, group: 'Brow', description: 'Brow angle; - = angry/determined (lowered toward the beak), + = worried/sad.' },
  // Beak
  { id: 'MouthOpen', min: 0, max: 1, group: 'Beak', description: 'Beak opening (lower mandible rotates down). Rev2D lip sync drives it.' },
  { id: 'MouthForm', min: -1, max: 1, group: 'Beak', description: 'Smile line; + = bigger smile, - = frown.' },
  { id: 'Blush', min: 0, max: 1, group: 'Face', description: 'Blush on the face patch.' },
  // Body
  { id: 'Breath', min: 0, max: 1, group: 'Body', description: 'Inhale: chest swells, head and wings rise.' },
  { id: 'BodyAngleX', min: -10, max: 10, group: 'Body', description: 'Body turn; + = toward the screen right.' },
  { id: 'BodyAngleZ', min: -10, max: 10, group: 'Body', description: 'Lean about the hips (degrees, + = clockwise); the feet stay planted.' },
  { id: 'Squash', min: -1, max: 1, group: 'Body', description: 'Squash (+) and stretch (-) about the feet.' },
  { id: 'BodyX', min: -800, max: 800, group: 'Body', description: 'Whole-body position, px; + = screen right (±800 leaves the 1024 px canvas: fly in / out).' },
  { id: 'BodyY', min: -520, max: 60, group: 'Body', description: 'Whole-body height, px; - = up (jumps, flight). The shadow stays on the ground.' },
  { id: 'Shadow', min: 0, max: 1, default: 1, group: 'Body', description: 'Contact shadow opacity (0 hides it).' },
  // Wings
  { id: 'WingRRaise', min: -1.5, max: 1, group: 'Wings', description: 'Near wing: 0 folded; + raises it up-left (cheer, flap); -1 points forward (right); -1.5 covers the face.' },
  { id: 'WingRSpread', min: 0, max: 1, group: 'Wings', description: 'Near wing opens: folded -> spread feathers.' },
  { id: 'WingRCurl', min: 0, max: 1, group: 'Wings', description: 'Near wing tip curls in (holding objects).' },
  { id: 'WingLRaise', min: -0.5, max: 1, group: 'Wings', description: 'Far wing: 0 folded behind the body; + raises it up-right.' },
  { id: 'WingLSpread', min: 0, max: 1, group: 'Wings', description: 'Far wing opens.' },
  // Tail and legs
  { id: 'TailSwing', min: -30, max: 30, group: 'Tail', description: 'Tail swing (physics output: do not animate).' },
  { id: 'TailLift', min: -1, max: 1, group: 'Tail', description: 'Tail up (+) / down (-).' },
  { id: 'TailFan', min: 0, max: 1, group: 'Tail', description: 'Tail feathers fan out.' },
  { id: 'FootRX', min: -60, max: 60, group: 'Legs', description: 'Near foot, px; + = screen right.' },
  { id: 'FootRY', min: -80, max: 20, group: 'Legs', description: 'Near foot, px; - = lifted.' },
  { id: 'FootLX', min: -60, max: 60, group: 'Legs', description: 'Far foot, px; + = screen right.' },
  { id: 'FootLY', min: -80, max: 20, group: 'Legs', description: 'Far foot, px; - = lifted.' },
  { id: 'LegTuck', min: 0, max: 1, group: 'Legs', description: 'Feet tucked up and back (flight).' },
];

const round = (v: number): number => Math.round(v * 1000) / 1000;

/** Absolute local rotation keyforms from on-screen (world) rotations of a bone at its setup parent pose. */
function worldRotKeys(parent: string, keys: Array<[number, number]>): Array<{ at: [number]; value: number }> {
  return keys.map(([at, world]) => ({ at: [at], value: round(world - SETUP_WORLD_ROTATION[parent]) }));
}

/** A 3 × 3 bind_warp grid over two parameters. */
function warpGrid(warp: string, params: [string, string], f: (a: number, b: number) => Record<string, unknown>, values: [number[], number[]]): Op {
  const keys = [];
  for (const b of values[1]) for (const a of values[0]) keys.push({ at: [a, b], ...(a === 0 && b === 0 ? {} : f(a, b)) });
  return { op: 'bind_warp', warp, params, keys };
}

export function controlOps(): Op[] {
  skeletonOps(); // fills SETUP_WORLD_ROTATION
  const ops: Op[] = PARAMETERS.map((p) => ({ op: 'add', kind: 'parameter', value: { default: 0, ...p } }));
  const add = (...o: Op[]): void => {
    ops.push(...o);
  };

  // ---------------------------------------------------------------- head turn, pitch, tilt
  // Outline turns gently, the face (patch, ring, eye, brow) turns more: features slide across the head.
  // 5 x 5 grids: the in-between keys keep the turn (and the beak riding on it) exact between extremes.
  const turnGrid: [number[], number[]] = [[-30, -15, 0, 15, 30], [-30, -15, 0, 15, 30]];
  add(
    warpGrid('headWarp', ['AngleX', 'AngleY'], (x, y) => ({ yaw: (x / 30) * 10, pitch: (-y / 30) * 8 }), turnGrid),
    warpGrid('faceWarp', ['AngleX', 'AngleY'], (x, y) => ({ yaw: (x / 30) * 18, pitch: (-y / 30) * 12 }), turnGrid),
    { op: 'bind_linear', target: 'bone:head.rotation', param: 'AngleZ', scale: 0.6, description: 'Tilt: 0.6 deg per AngleZ unit.' },
    { op: 'bind', target: 'bone:head.rotation', params: ['AngleY'], relative: true, keys: [{ at: [-30], value: 4 }, { at: [0], value: 0 }, { at: [30], value: -5 }], description: 'Looking up tips the beak up.' },
    { op: 'bind', target: 'bone:neck.y', params: ['AngleX'], relative: true, keys: [{ at: [-30], value: -6 }, { at: [0], value: 0 }, { at: [30], value: 6 }], description: 'The head shifts a little toward the turn.' },
    // The beak is rigid: it rides on the face at the hinge, and lengthens / foreshortens with the turn.
    { op: 'bind', target: 'bone:beak.scaleX', params: ['AngleX'], keys: [{ at: [-30], value: 0.86 }, { at: [0], value: 1 }, { at: [30], value: 1.08 }] },
    { op: 'follow', bone: 'beak', follow: 'faceWarp', at: LM.beakHinge, description: 'Beak hinge stays on the turning face.' },
  );

  // ---------------------------------------------------------------- eye
  add(
    {
      op: 'bind', target: 'part:eye.shape.d', params: ['EyeROpen', 'EyeRSmile'],
      keys: [
        { at: [0, 0], value: EYE.closed }, { at: [1, 0], value: EYE.open },
        { at: [0, 1], value: EYE.happyClosed }, { at: [1, 1], value: EYE.happyOpen },
      ],
    },
    { op: 'bind', target: 'part:eyeHighlight.shape.cy', params: ['EyeROpen'], keys: [{ at: [0], value: 400 }, { at: [0.5], value: 388 }, { at: [1], value: LM.highlight[1] }] },
    { op: 'bind', target: 'part:eyeHighlight.opacity', params: ['EyeROpen'], keys: [{ at: [0], value: 0 }, { at: [0.25], value: 0 }, { at: [0.4], value: 1 }, { at: [1], value: 1 }] },
    { op: 'bind', target: 'part:eyeHighlight2.opacity', params: ['EyeROpen'], keys: [{ at: [0], value: 0 }, { at: [0.5], value: 0 }, { at: [1], value: 0.6 }] },
    warpGrid('eyeWarp', ['EyeBallX', 'EyeBallY'], (x, y) => ({ translate: [x * 6, -y * 5] }), [[-1, 0, 1], [-1, 0, 1]]),
    { op: 'bind_warp', warp: 'eyeWarp', params: ['EyeWide'], keys: [{ at: [0] }, { at: [1], scale: 1.16, pivot: LM.eye }] },
    {
      op: 'bind', target: 'part:eyeRing.shape.d', params: ['EyeWide'],
      keys: [
        { at: [0], value: ellipse(LM.eyeRing[0], LM.eyeRing[1], LM.eyeRingRadius[0], LM.eyeRingRadius[1]) },
        { at: [1], value: ellipse(LM.eyeRing[0], LM.eyeRing[1], LM.eyeRingRadius[0] * 1.08, LM.eyeRingRadius[1] * 1.08) },
      ],
    },
  );

  // ---------------------------------------------------------------- brow (fades in only when used)
  const browKeys = [];
  const browOpacity = [];
  for (const a of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      browKeys.push({ at: [y, a], value: browShape(y, a) });
      browOpacity.push({ at: [y, a], value: y === 0 && a === 0 ? 0 : 1 });
    }
  }
  add(
    { op: 'bind', target: 'part:brow.shape.d', params: ['BrowRY', 'BrowRAngle'], keys: browKeys },
    { op: 'bind', target: 'part:brow.opacity', params: ['BrowRY', 'BrowRAngle'], keys: browOpacity },
  );

  // ---------------------------------------------------------------- beak
  add(
    { op: 'bind_linear', target: 'bone:jaw.rotation', param: 'MouthOpen', scale: JAW_OPEN_DEG, description: 'The lower mandible swings down.' },
    { op: 'bind', target: 'bone:beak.rotation', params: ['MouthOpen'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -3 }], description: 'The upper mandible lifts a little.' },
    { op: 'bind', target: 'part:mouthInside.shape.d', params: ['MouthOpen'], keys: [{ at: [0], value: MOUTH_INSIDE.closed }, { at: [1], value: MOUTH_INSIDE.open }] },
    { op: 'bind', target: 'part:mouthLine.shape.d', params: ['MouthForm'], keys: [{ at: [-1], value: MOUTH_LINE.frown }, { at: [0], value: MOUTH_LINE.rest }, { at: [1], value: MOUTH_LINE.smile }] },
    { op: 'bind', target: 'part:mouthLine.opacity', params: ['MouthOpen'], keys: [{ at: [0], value: 1 }, { at: [0.5], value: 0.45 }, { at: [1], value: 0.25 }], description: 'Open, the interior is the dark gap; the line fades.' },
    { op: 'bind', target: 'part:blush.opacity', params: ['Blush'], keys: [{ at: [0], value: 0 }, { at: [1], value: 1 }] },
  );

  // ---------------------------------------------------------------- body
  add(
    { op: 'bind_warp', warp: 'bodyWarp', params: ['Breath'], keys: [{ at: [0] }, { at: [1], scale: [1.012, 1.028], pivot: [540, 842] }] },
    { op: 'bind', target: 'bone:chest.x', params: ['Breath'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 5 }], description: 'chest.x is "up" (hips point up).' },
    { op: 'bind_warp', warp: 'bodyWarp', params: ['BodyAngleX'], keys: [{ at: [-10], yaw: -10 }, { at: [0] }, { at: [10], yaw: 10 }] },
    { op: 'bind', target: 'bone:chest.y', params: ['BodyAngleX'], relative: true, keys: [{ at: [-10], value: -8 }, { at: [0], value: 0 }, { at: [10], value: 8 }], description: 'chest.y is "screen right".' },
    { op: 'bind_linear', target: 'bone:hips.rotation', param: 'BodyAngleZ', scale: 1 },
    { op: 'bind', target: 'bone:move.scaleX', params: ['Squash'], keys: [{ at: [-1], value: 0.9 }, { at: [0], value: 1 }, { at: [1], value: 1.12 }] },
    { op: 'bind', target: 'bone:move.scaleY', params: ['Squash'], keys: [{ at: [-1], value: 1.12 }, { at: [0], value: 1 }, { at: [1], value: 0.86 }] },
    { op: 'bind_linear', target: 'bone:move.x', param: 'BodyX', scale: 1 },
    { op: 'bind_linear', target: 'bone:move.y', param: 'BodyY', scale: 1 },
    { op: 'bind_linear', target: 'bone:shadowBone.x', param: 'BodyX', scale: 1 },
    { op: 'bind', target: 'bone:shadowBone.scaleX', params: ['BodyY'], keys: [{ at: [-520], value: 0.45 }, { at: [0], value: 1 }, { at: [60], value: 1 }] },
    { op: 'bind', target: 'bone:shadowBone.scaleY', params: ['BodyY'], keys: [{ at: [-520], value: 0.45 }, { at: [0], value: 1 }, { at: [60], value: 1 }] },
    { op: 'bind', target: 'part:shadow.opacity', params: ['BodyY'], keys: [{ at: [-520], value: 0.3 }, { at: [0], value: 1 }, { at: [60], value: 1 }] },
    { op: 'bind', target: 'part:shadow.opacity', params: ['Shadow'], keys: [{ at: [0], value: 0 }, { at: [1], value: 1 }] },
  );

  // ---------------------------------------------------------------- wings
  const shoulderParent = 'chest';
  const rSetup = SETUP_WORLD_ROTATION.wingR_arm;
  const lSetup = SETUP_WORLD_ROTATION.wingL_arm;
  add(
    {
      op: 'bind', target: 'bone:wingR_arm.rotation', params: ['WingRRaise'],
      keys: worldRotKeys(shoulderParent, [[-1.5, -40], [-1, 15], [-0.5, 68], [0, rSetup], [0.5, 172], [1, 222]]),
    },
    { op: 'bind', target: 'bone:wingR_hand.rotation', params: ['WingRSpread'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 6 }] },
    { op: 'bind', target: 'bone:wingR_hand.rotation', params: ['WingRCurl'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -55 }] },
    { op: 'bind', target: 'part:wingR.shape.d', params: ['WingRSpread'], keys: [{ at: [0], value: WING_SHAPES.R.folded }, { at: [1], value: WING_SHAPES.R.spread }] },
    { op: 'bind', target: 'part:wingRCovert.shape.d', params: ['WingRSpread'], keys: [{ at: [0], value: WING_SHAPES.RCovert.folded }, { at: [1], value: WING_SHAPES.RCovert.spread }] },
    // Covering the face: the near wing moves in front of the head.
    { op: 'bind', target: 'part:wingR.z', params: ['WingRRaise'], interpolation: 'step', keys: [{ at: [-1.5], value: 34 }, { at: [-1.2], value: 14 }, { at: [1], value: 14 }] },
    { op: 'bind', target: 'part:wingRCovert.z', params: ['WingRRaise'], interpolation: 'step', keys: [{ at: [-1.5], value: 34.5 }, { at: [-1.2], value: 15 }, { at: [1], value: 15 }] },
    {
      op: 'bind', target: 'bone:wingL_arm.rotation', params: ['WingLRaise'],
      keys: worldRotKeys(shoulderParent, [[-0.5, 118], [0, lSetup], [0.5, 25], [1, -50]]),
    },
    { op: 'bind', target: 'bone:wingL_hand.rotation', params: ['WingLSpread'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -6 }] },
    { op: 'bind', target: 'part:wingL.shape.d', params: ['WingLSpread'], keys: [{ at: [0], value: WING_SHAPES.L.folded }, { at: [1], value: WING_SHAPES.L.spread }] },
    { op: 'bind', target: 'part:wingLCovert.shape.d', params: ['WingLSpread'], keys: [{ at: [0], value: WING_SHAPES.LCovert.folded }, { at: [1], value: WING_SHAPES.LCovert.spread }] },
  );

  // ---------------------------------------------------------------- tail
  add(
    { op: 'bind', target: 'bone:tail.rotation', params: ['TailSwing'], relative: true, keys: [{ at: [-30], value: -16 }, { at: [0], value: 0 }, { at: [30], value: 16 }] },
    { op: 'bind', target: 'bone:tail.rotation', params: ['TailLift'], relative: true, keys: [{ at: [-1], value: -14 }, { at: [0], value: 0 }, { at: [1], value: 22 }] },
    { op: 'bind', target: 'bone:tailF1.rotation', params: ['TailFan'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 14 }] },
    { op: 'bind', target: 'bone:tailF2.rotation', params: ['TailFan'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 2 }] },
    { op: 'bind', target: 'bone:tailF3.rotation', params: ['TailFan'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -12 }] },
    {
      op: 'add', kind: 'physics',
      value: {
        id: 'tailPhysics',
        // Whole-body moves are scaled down so long flights (BodyX ±800) do not pin the swing at its limit.
        inputs: [
          { param: 'BodyX', type: 'x', weight: 0.15 },
          { param: 'BodyY', type: 'y', weight: 0.3 },
          { param: 'BodyAngleZ', type: 'angle', weight: 1.5 },
          { param: 'BodyAngleX', type: 'x', weight: 2 },
        ],
        // 0.72: the largest scale that keeps the fastest clip (trv_fly_in, peak raw 32.6 at 0.8) inside ±30 (analyze, RECIPES 20).
        outputs: [{ param: 'TailSwing', type: 'angle', scale: 0.72 }],
        segments: [{ length: 110, mass: 1 }],
        damping: 0.14,
      },
    },
  );

  // ---------------------------------------------------------------- legs and feet (unrotated: x right, y down)
  add(
    { op: 'bind_linear', target: 'bone:footR.x', param: 'FootRX', scale: 1 },
    { op: 'bind_linear', target: 'bone:footR.y', param: 'FootRY', scale: 1 },
    { op: 'bind_linear', target: 'bone:footL.x', param: 'FootLX', scale: 1 },
    { op: 'bind_linear', target: 'bone:footL.y', param: 'FootLY', scale: 1 },
    { op: 'bind', target: 'bone:footR.x', params: ['LegTuck'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -22 }] },
    { op: 'bind', target: 'bone:footR.y', params: ['LegTuck'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -50 }] },
    { op: 'bind', target: 'bone:footR.rotation', params: ['LegTuck'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 22 }] },
    { op: 'bind', target: 'bone:footL.x', params: ['LegTuck'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -18 }] },
    { op: 'bind', target: 'bone:footL.y', params: ['LegTuck'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: -44 }] },
    { op: 'bind', target: 'bone:footL.rotation', params: ['LegTuck'], relative: true, keys: [{ at: [0], value: 0 }, { at: [1], value: 18 }] },
  );

  return ops;
}
