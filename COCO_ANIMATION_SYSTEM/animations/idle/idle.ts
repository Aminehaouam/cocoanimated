/**
 * Idle animations: what Coco does when nothing is happening. All loops divide 8 s, so the composed
 * `idle_main` (look around + sway + breathing + blinks) loops seamlessly.
 */
import { expr } from '../../character/expressions/expressions.ts';
import { clip, type Clip, type ComposedClip } from '../lib.ts';

export const IDLE_CLIPS: Clip[] = [
  clip(
    {
      id: 'idle_breathe', category: 'idle', kind: 'base', duration: 4, loop: true,
      title: 'Breathing', description: 'Slow breath: the chest swells, the head bobs a little.',
      scenarios: ['under every idle (layer "add")'],
    },
    (tl) => {
      tl.at(0, { Breath: 0, AngleY: 0, TailLift: 0 });
      tl.at(1.8, { Breath: 1, AngleY: 1.5, TailLift: 0.06 });
    },
  ),
  clip(
    {
      id: 'idle_blink', category: 'idle', kind: 'overlay', duration: 8, loop: true,
      title: 'Blinking', description: 'A single blink, then a double blink: irregular, so it never looks mechanical.',
      scenarios: ['over every idle'],
    },
    (tl) => {
      tl.at(0, { EyeROpen: 1 }, 'linear');
      tl.at(2.25, { EyeROpen: 1 }, 'inQuad').at(2.33, { EyeROpen: 0 }, 'outQuad').at(2.47, { EyeROpen: 1 }, 'linear');
      tl.at(5.95, { EyeROpen: 1 }, 'inQuad').at(6.03, { EyeROpen: 0 }, 'outQuad').at(6.15, { EyeROpen: 1 }, 'inQuad');
      tl.at(6.23, { EyeROpen: 0 }, 'outQuad').at(6.37, { EyeROpen: 1 }, 'linear');
    },
  ),
  clip(
    {
      id: 'idle_look_around', category: 'idle', kind: 'base', duration: 8, loop: true,
      title: 'Looking around', description: 'The eye leads, the head follows: right, left, up, back to centre.',
      scenarios: ['app idle', 'empty chat'],
    },
    (tl) => {
      tl.at(0, { AngleX: 0, AngleY: 0, AngleZ: 0, EyeBallX: 0, EyeBallY: 0 });
      tl.at(0.8, { EyeBallX: 0.7, EyeBallY: 0.1 });
      tl.at(1.1, { AngleX: 14, AngleY: 4, AngleZ: 3 });
      tl.at(2.6, { AngleX: 14, AngleY: 4, AngleZ: 3, EyeBallX: 0.6, EyeBallY: 0.1 });
      tl.at(3.0, { EyeBallX: -0.6, EyeBallY: -0.1 });
      tl.at(3.4, { AngleX: -12, AngleY: -3, AngleZ: -2 });
      tl.at(4.8, { AngleX: -12, AngleY: -3, AngleZ: -2, EyeBallX: -0.5, EyeBallY: -0.1 });
      tl.at(5.2, { EyeBallX: 0.1, EyeBallY: 0.6 });
      tl.at(5.5, { AngleX: 4, AngleY: 10, AngleZ: 4 });
      tl.at(6.8, { AngleX: 4, AngleY: 10, AngleZ: 4, EyeBallX: 0.1, EyeBallY: 0.5 });
      tl.at(7.2, { EyeBallX: 0, EyeBallY: 0 });
      tl.at(7.5, { AngleX: 0, AngleY: 0, AngleZ: 0 });
    },
  ),
  clip(
    {
      id: 'idle_head_tilt', category: 'idle', kind: 'base', duration: 6, loop: true,
      title: 'Curious head tilt', description: 'Tilts the head with a little overshoot, brow up, then back.',
      scenarios: ['waiting for the learner', 'curiosity beat between idles'],
    },
    (tl) => {
      tl.at(0, { AngleZ: 0, BrowRY: 0, EyeWide: 0, EyeBallY: 0 }, 'outBack');
      tl.at(0.9, { AngleZ: 15, BrowRY: 0.5, EyeWide: 0.25, EyeBallY: 0.2 });
      tl.at(2.8, { AngleZ: 15, BrowRY: 0.5, EyeWide: 0.25, EyeBallY: 0.2 });
      tl.at(3.6, { AngleZ: 0, BrowRY: 0, EyeWide: 0, EyeBallY: 0 });
    },
  ),
  clip(
    {
      id: 'idle_sway', category: 'idle', kind: 'overlay', duration: 8, loop: true,
      title: 'Relaxed sway', description: 'The body leans gently side to side; the head counter-tilts; the tail follows (physics).',
      scenarios: ['under every idle (layer "add")'],
    },
    (tl) => {
      tl.at(0, { BodyAngleZ: 0, AngleZ: 0, BodyAngleX: 0 }, 'smooth');
      tl.at(2, { BodyAngleZ: 2.5, AngleZ: -1.5, BodyAngleX: 2 }, 'smooth');
      tl.at(4, { BodyAngleZ: 0, AngleZ: 0, BodyAngleX: 0 }, 'smooth');
      tl.at(6, { BodyAngleZ: -2.5, AngleZ: 1.5, BodyAngleX: -2 }, 'smooth');
    },
  ),
  clip(
    {
      id: 'idle_feather_ruffle', category: 'idle', kind: 'oneshot', duration: 1.5, loop: false, next: 'idle_main',
      title: 'Feather ruffle', description: 'A quick shake that fluffs the feathers: squash, shake, tail and wings flare, settle, blink.',
      scenarios: ['idle variation', 'after a long wait'],
    },
    (tl) => {
      tl.at(0, { Squash: 0, AngleZ: 0, BodyAngleZ: 0, TailFan: 0, WingRSpread: 0, WingLSpread: 0, EyeROpen: 1, EyeRSmile: 0 }, 'inOutQuad');
      tl.at(0.1, { Squash: 0.3, EyeROpen: 0.3, EyeRSmile: 0.6 }, 'outQuad');
      tl.at(0.18, { AngleZ: 10, BodyAngleZ: 3, TailFan: 1, WingRSpread: 0.35, WingLSpread: 0.3, Squash: -0.1, EyeROpen: 0 }, 'inOutSine');
      tl.at(0.28, { AngleZ: -10, BodyAngleZ: -3 });
      tl.at(0.38, { AngleZ: 9, BodyAngleZ: 3 });
      tl.at(0.48, { AngleZ: -7, BodyAngleZ: -2 });
      tl.at(0.58, { AngleZ: 4, BodyAngleZ: 1, Squash: 0.05 });
      tl.at(0.72, { AngleZ: 0, BodyAngleZ: 0, Squash: 0, TailFan: 0.2, WingRSpread: 0, WingLSpread: 0, EyeROpen: 0, EyeRSmile: 0.6 }, 'outQuad');
      tl.at(0.95, { EyeROpen: 1, EyeRSmile: 0, TailFan: 0 });
      tl.restAll(1.5);
    },
  ),
  clip(
    {
      id: 'idle_sleep', category: 'idle', kind: 'base', duration: 5, loop: true,
      title: 'Sleeping', description: 'Eye closed, head drooped and tilted, slow deep breaths, settled body.',
      scenarios: ['app inactive', 'night time', 'daily goal done'],
    },
    (tl) => {
      tl.at(0, { ...expr('asleep'), Breath: 0, Squash: 0.1, BodyAngleZ: 1 });
      tl.at(2.2, { AngleY: -16, Breath: 1, Squash: 0.13 });
    },
  ),
  clip(
    {
      id: 'idle_wake_up', category: 'idle', kind: 'oneshot', duration: 3, loop: false, next: 'idle_main', from: 'idle_sleep',
      title: 'Waking up', description: 'From the sleeping pose: the eye flutters open, a big stretch and yawn, then a settle.',
      scenarios: ['app reopened after inactivity', 'returning user'],
    },
    (tl) => {
      tl.at(0, { ...expr('asleep'), Squash: 0.1, BodyAngleZ: 1, MouthOpen: 0, EyeRSmile: 0 });
      tl.at(0.4, { EyeROpen: 0.35 }).at(0.6, { EyeROpen: 0 });
      tl.at(0.9, { EyeROpen: 0.7, AngleY: -4, AngleZ: 4 }).at(1.1, { EyeROpen: 0.5 });
      tl.at(1.3, {
        EyeROpen: 1, AngleY: 4, AngleZ: 0, Squash: 0, BodyAngleZ: 0, MouthOpen: 0, EyeRSmile: 0,
        WingRRaise: 0, WingRSpread: 0, WingLRaise: 0, WingLSpread: 0, TailFan: 0,
      });
      const stretch = { MouthOpen: 0.95, EyeROpen: 0, EyeRSmile: 1, Squash: -0.6, WingRRaise: 0.45, WingRSpread: 0.5, WingLRaise: 0.5, WingLSpread: 0.5, AngleY: 14, TailFan: 0.6 };
      tl.at(1.7, stretch).at(2.1, stretch);
      tl.at(2.4, { MouthOpen: 0, EyeROpen: 1, EyeRSmile: 0, Squash: 0.15, WingRRaise: 0, WingRSpread: 0, WingLRaise: 0, WingLSpread: 0, AngleY: 0, TailFan: 0 });
      tl.restAll(3);
    },
  ),
];

export const IDLE_COMPOSED: ComposedClip[] = [
  {
    id: 'idle_main', category: 'idle', kind: 'base',
    title: 'Main idle', description: 'Look around + relaxed sway + breathing + blinks, baked into one seamless 8 s loop.',
    scenarios: ['default state of every screen', 'after every one-shot'],
    layers: ['idle_look_around', { animation: 'idle_sway', mode: 'add' }, { animation: 'idle_breathe', mode: 'add' }, 'idle_blink'],
    duration: 8, loop: true, fps: 60,
  },
];
