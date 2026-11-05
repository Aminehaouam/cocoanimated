/** Small helpers shared by the clip files. */
import { DEFAULTS, type Timeline } from './lib.ts';

/** The rest values of the given parameters. */
export function zeros(params: Record<string, number> | string[]): Record<string, number> {
  const ids = Array.isArray(params) ? params : Object.keys(params);
  return Object.fromEntries(ids.map((k) => [k, DEFAULTS[k] ?? 0]));
}

/** Blink once at t (0.2 s). */
export function blink(tl: Timeline, t: number): void {
  tl.at(t, { EyeROpen: 1 }, 'inQuad').at(t + 0.08, { EyeROpen: 0 }, 'outQuad').at(t + 0.2, { EyeROpen: 1 });
}

/** Alternating values of one parameter between t0 and t1 (a wag, flap or tap). */
export function wiggle(tl: Timeline, param: string, t0: number, t1: number, a: number, b: number, step: number): void {
  let i = 0;
  for (let t = t0; t <= t1 + 1e-9; t += step, i++) tl.at(t, { [param]: i % 2 ? b : a });
}

/** Both wings flapping between `up` and `down` (spread open) from t0 to t1. */
export function flap(tl: Timeline, t0: number, t1: number, up = 1, down = 0.25, step = 0.2): void {
  let i = 0;
  for (let t = t0; t <= t1 + 1e-9; t += step, i++) {
    const v = i % 2 ? down : up;
    tl.at(t, { WingRRaise: v, WingLRaise: v, WingRSpread: 1, WingLSpread: 1 });
  }
}
