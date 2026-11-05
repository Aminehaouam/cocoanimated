/**
 * Animation authoring for Coco.
 *
 * A clip is written as poses at times on a Timeline (`tl.at(1.2, { AngleX: 12, EyeBallX: 0.6 })`),
 * which become Rev2D animation tracks on parameters (`param:AngleX`). Each clip carries metadata
 * (category, scenario, accessories, how it layers, what plays next) that feeds the catalogue
 * (documentation/animation_catalog.md) and the web presets.
 *
 * Naming: `<category prefix>_<action>` — idle_, comm_, emo_, edu_, rew_, trv_, rx_.
 * Kinds:
 *   base     a full pose loop (played alone, or as the bottom layer)
 *   overlay  a gesture authored around the parameter defaults, layered with mode "add" (talk, blink)
 *   oneshot  plays once and returns to rest (or hands over to `next`)
 */
import { PARAMETERS } from '../rev2d/rigs/controls.ts';

export type Ease =
  | 'linear' | 'step' | 'inSine' | 'outSine' | 'inOutSine' | 'inQuad' | 'outQuad' | 'inOutQuad' | 'inCubic' | 'outCubic'
  | 'inOutCubic' | 'inBack' | 'outBack' | 'inOutBack' | 'outElastic' | 'outBounce' | 'smooth' | [number, number, number, number];

export interface Key {
  t: number;
  v: number;
  ease?: Ease;
}

export type Category = 'idle' | 'communication' | 'emotions' | 'education' | 'rewards' | 'travel' | 'reactions';

export const CATEGORY_PREFIX: Record<Category, string> = {
  idle: 'idle', communication: 'comm', emotions: 'emo', education: 'edu', rewards: 'rew', travel: 'trv', reactions: 'rx',
};

export interface ClipMeta {
  id: string;
  category: Category;
  title: string;
  description: string;
  kind: 'base' | 'overlay' | 'oneshot';
  /** App scenarios this clip serves (free text, mirrored in the catalogue). */
  scenarios: string[];
  /** Accessory parameters the clip shows (Acc*), if any. */
  accessories?: string[];
  /** What the app should play after a one-shot (usually "idle_main"). */
  next?: string;
  /** The state a one-shot starts from when it is not the rest pose (e.g. "idle_sleep"). */
  from?: string;
}

export interface Clip extends ClipMeta {
  duration: number;
  loop: boolean;
  tracks: Record<string, Key[]>;
  events?: Array<{ t: number; name: string; data?: unknown }>;
}

export interface LayerSpec {
  animation: string;
  mode?: 'override' | 'add';
  start?: number;
  hold?: boolean;
  weight?: number;
}

export interface ComposedClip extends ClipMeta {
  layers: Array<string | LayerSpec>;
  duration?: number;
  loop?: boolean;
  fps?: number;
}

export const DEFAULTS: Record<string, number> = Object.fromEntries(PARAMETERS.map((p) => [p.id, p.default ?? 0]));

const r = (v: number): number => Math.round(v * 1000) / 1000;

/** Pose keys over time; `ease` shapes each parameter's segment from this key to its next key. */
export class Timeline {
  private readonly keys = new Map<string, Key[]>();

  constructor(readonly duration: number) {}

  at(t: number, values: Record<string, number>, ease: Ease = 'inOutSine'): this {
    if (t < -1e-9 || t > this.duration + 1e-9) throw new Error(`key at t=${t} outside 0..${this.duration}`);
    for (const [target, v] of Object.entries(values)) {
      const id = target.includes(':') ? target : target;
      if (!target.includes(':') && !(id in DEFAULTS)) throw new Error(`unknown parameter "${id}"`);
      const list = this.keys.get(target) ?? [];
      const key: Key = { t: r(t), v: r(v), ease };
      const i = list.findIndex((k) => Math.abs(k.t - key.t) < 1e-6);
      if (i >= 0) list[i] = key;
      else list.push(key);
      this.keys.set(target, list);
    }
    return this;
  }

  /** Keys that return the listed parameters to their defaults at t. */
  rest(t: number, params: string[], ease: Ease = 'inOutSine'): this {
    return this.at(t, Object.fromEntries(params.map((p) => [p, DEFAULTS[p]])), ease);
  }

  /** Every animated parameter back at its default at t (one-shots end here). */
  restAll(t: number, ease: Ease = 'inOutSine'): this {
    return this.rest(t, [...this.keys.keys()].filter((k) => !k.includes(':')), ease);
  }

  /**
   * One-shots: a track whose first key comes after t = 0 starts from the parameter's default at 0
   * (Rev2D holds the FIRST key's value before it, which would show the later pose from the start).
   */
  startAtRest(): this {
    for (const [target, list] of this.keys) {
      list.sort((a, b) => a.t - b.t);
      if (!target.includes(':') && list[0].t > 1e-6) list.unshift({ t: 0, v: DEFAULTS[target], ease: 'linear' });
    }
    return this;
  }

  /** Loops: every track gets keys at 0 and at `duration` with the same value (seamless). */
  closeLoop(): this {
    for (const [target, list] of this.keys) {
      list.sort((a, b) => a.t - b.t);
      if (list[0].t > 1e-6) list.unshift({ t: 0, v: list[0].v, ease: list[0].ease });
      const first = list[0];
      const last = list[list.length - 1];
      if (Math.abs(last.t - this.duration) > 1e-6) list.push({ t: this.duration, v: first.v, ease: first.ease });
      else if (Math.abs(last.v - first.v) > 1e-9) throw new Error(`loop track ${target}: value at the end (${last.v}) differs from the start (${first.v})`);
    }
    return this;
  }

  tracks(): Record<string, Key[]> {
    const out: Record<string, Key[]> = {};
    for (const [target, list] of this.keys) out[target] = [...list].sort((a, b) => a.t - b.t);
    return out;
  }
}

/** A clip from metadata and a timeline builder. */
export function clip(meta: ClipMeta & { duration: number; loop: boolean; events?: Clip['events'] }, build: (tl: Timeline) => void): Clip {
  const tl = new Timeline(meta.duration);
  build(tl);
  if (meta.loop) tl.closeLoop();
  else tl.startAtRest();
  const prefix = CATEGORY_PREFIX[meta.category];
  if (!meta.id.startsWith(`${prefix}_`)) throw new Error(`clip "${meta.id}" must start with "${prefix}_"`);
  return { ...meta, tracks: tl.tracks() };
}

/** Rev2D `add animation` op for a clip. */
export function animationOp(c: Clip): Record<string, unknown> {
  const tracks = Object.entries(c.tracks).map(([target, keys]) => ({
    target: target.includes(':') ? target : `param:${target}`,
    keys: keys.map((k) => (k.ease && k.ease !== 'linear' ? { t: k.t, v: k.v, ease: k.ease } : { t: k.t, v: k.v })),
  }));
  return {
    op: 'add', kind: 'animation',
    value: { id: c.id, duration: c.duration, loop: c.loop, tracks, ...(c.events?.length ? { events: c.events } : {}), description: `${c.title}: ${c.description}` },
  };
}

/** Rev2D `compose` op for a composed clip. */
export function composeOp(c: ComposedClip): Record<string, unknown> {
  return {
    op: 'compose', id: c.id, layers: c.layers,
    ...(c.duration ? { duration: c.duration } : {}),
    ...(c.loop !== undefined ? { loop: c.loop } : {}),
    fps: c.fps ?? 60,
    description: `${c.title}: ${c.description}`,
  };
}

/** Parameters a clip animates (for the catalogue). */
export function clipParams(c: Clip): string[] {
  return Object.keys(c.tracks).map((t) => t.replace(/^param:/, ''));
}
