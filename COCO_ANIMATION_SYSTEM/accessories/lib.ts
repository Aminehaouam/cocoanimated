/**
 * Modular accessories: props, clothing, rewards and effect marks as separate rig parts.
 *
 * - Each accessory has a visibility parameter `Acc<Name>` (0 hidden … 1 shown; marks use `Fx<Name>`)
 *   and is hidden at rest. Nothing is merged into Coco's body art.
 * - It rides on its own bone, a child of a rig bone (`attach`): held props on a wing hand, worn
 *   items on the head or chest, scenery on the root. Worn head items can instead get their own small
 *   warp that Rev2D's `follow` op keeps on the turning head (like a hat in RECIPES 16).
 * - Art is drawn in WORLD coordinates of a reference pose (`pose`, e.g. the wing raised to hold a
 *   book). The build poses the rig there, reads the attach bone's world matrix and maps the art back
 *   to setup space, so in that pose the prop lands exactly where it was drawn and otherwise follows
 *   the bone rigidly.
 * - Marks (`pop`) scale in from 60 % as their parameter rises, so turning one on is an animation.
 */
import type { Part } from '../character/parts/types.ts';
import { mapPath, type Pt } from '../rev2d/source/lib/geom.ts';

export type AccCategory = 'education' | 'travel' | 'clothing' | 'rewards' | 'marks';

/** An accessory part: a Rev2D part plus an optional own visibility curve. */
export type AccPart = Part & {
  /** Visibility: [parameter value, opacity] keys on the accessory parameter (default [[0, 0], [1, opacity]]). */
  show?: Array<[number, number]>;
  /** Visibility driven by another parameter (e.g. text on a board appearing while writing). */
  showParam?: string;
};

export interface Accessory {
  id: string;
  /** Visibility parameter, e.g. AccBook. */
  param: string;
  category: AccCategory;
  title: string;
  description: string;
  /** Rig bone it rides on. */
  attach: string;
  /** Reference pose of the world-space art (default: the rest pose). */
  pose?: Record<string, number>;
  /** World point (reference pose) of the accessory's own bone: its pivot for prop motion. */
  pivot: Pt;
  parts: AccPart[];
  /** Worn on the turning head: its own warp (setup rect) kept on `target` at `at` by Rev2D's follow op. */
  follow?: { target: 'headWarp' | 'faceWarp'; rect: [number, number, number, number]; at: Pt; rotate?: boolean };
  /** Marks: scale in from 60 % (and rise 10 px) as the parameter goes 0 → 1. */
  pop?: boolean;
  /** Extra parameters the accessory defines (e.g. AccBoardText). */
  extraParams?: Array<{ id: string; description: string }>;
}

type Mat = [number, number, number, number, number, number];
type Op = Record<string, unknown>;

interface Rev2DMath {
  multiply(m: Mat, n: Mat): Mat;
  invert(m: Mat): Mat;
  apply(m: Mat, x: number, y: number): [number, number];
  rotationOf(m: Mat): number;
}

interface RigLike {
  pose(opts: { params?: Record<string, number>; physics?: boolean }): { bones: Record<string, { world: Mat; rotation: number }> };
}

const r2 = (v: number): number => Math.round(v * 100) / 100;

function mapFill(fill: unknown, map: (p: Pt) => Pt): unknown {
  if (!fill || typeof fill !== 'object') return fill;
  const f = { ...(fill as Record<string, unknown>) };
  if (f.type === 'linear') {
    f.from = map(f.from as Pt).map(r2);
    f.to = map(f.to as Pt).map(r2);
  } else if (f.type === 'radial') {
    f.center = map(f.center as Pt).map(r2);
  }
  return f;
}

/** The ops that add one accessory (parameter, bone or warp, parts, visibility bindings). */
export function accessoryOps(acc: Accessory, rig: RigLike, math: Rev2DMath): Op[] {
  const setup = rig.pose({ physics: false });
  const ref = rig.pose({ params: acc.pose ?? {}, physics: false });
  const S = setup.bones[acc.attach]?.world;
  const P = ref.bones[acc.attach]?.world;
  if (!S || !P) throw new Error(`accessory ${acc.id}: unknown attach bone "${acc.attach}"`);
  const M = math.multiply(S, math.invert(P));
  const rot = math.rotationOf(M);
  const map = (p: Pt): Pt => math.apply(M, p[0], p[1]);

  const ops: Op[] = [
    { op: 'add', kind: 'parameter', value: { id: acc.param, min: 0, max: 1, default: 0, group: `Accessories: ${acc.category}`, description: `${acc.title}: ${acc.description}` } },
    ...(acc.extraParams ?? []).map((p) => ({ op: 'add', kind: 'parameter', value: { id: p.id, min: 0, max: 1, default: 0, group: `Accessories: ${acc.category}`, description: p.description } })),
  ];

  let parent: string;
  if (acc.follow) {
    parent = `${acc.id}Warp`;
    ops.push({ op: 'add', kind: 'warp', value: { id: parent, parent: acc.attach, rect: acc.follow.rect, cols: 2, rows: 1, description: `${acc.title}: follows ${acc.follow.target}.` } });
  } else {
    parent = `acc_${acc.id}`;
    const at = map(acc.pivot).map(r2) as Pt;
    ops.push({ op: 'add', kind: 'bone', value: { id: parent, parent: acc.attach, world: at, worldRotation: r2(setup.bones[acc.attach].rotation), length: 20, description: `${acc.title} (${acc.param})` } });
    if (acc.pop) {
      ops.push(
        { op: 'bind', target: `bone:${parent}.scaleX`, params: [acc.param], keys: [{ at: [0], value: 0.6 }, { at: [1], value: 1 }] },
        { op: 'bind', target: `bone:${parent}.scaleY`, params: [acc.param], keys: [{ at: [0], value: 0.6 }, { at: [1], value: 1 }] },
      );
    }
  }

  for (const part of acc.parts) {
    const { show, showParam, ...rest } = part;
    const p = structuredClone(rest) as Record<string, unknown> & { shape: Record<string, unknown>; opacity?: number };
    const shape = p.shape;
    if (shape.type === 'path') shape.d = mapPath(shape.d as string, map);
    else if (shape.type === 'ellipse') {
      const [cx, cy] = map([shape.cx as number, shape.cy as number]);
      shape.cx = r2(cx);
      shape.cy = r2(cy);
      shape.rotation = r2(((shape.rotation as number) ?? 0) + rot);
    } else throw new Error(`accessory ${acc.id}: part ${part.id} must be a path or an ellipse`);
    p.fill = mapFill(p.fill, map);
    const opacity = p.opacity ?? 1;
    p.opacity = 0;
    p.parent = parent;
    p.tags = [...new Set([...((p.tags as string[]) ?? []), 'accessory', acc.category, acc.id])];
    ops.push({ op: 'add', kind: 'part', value: p });
    const keys = (show ?? [[0, 0], [1, opacity]]).map(([at, value]) => ({ at: [at], value }));
    ops.push({ op: 'bind', target: `part:${part.id}.opacity`, params: [showParam ?? acc.param], keys });
  }

  if (acc.follow) ops.push({ op: 'follow', warp: parent, follow: acc.follow.target, at: acc.follow.at, ...(acc.follow.rotate ? { rotate: true } : {}) });
  return ops;
}
