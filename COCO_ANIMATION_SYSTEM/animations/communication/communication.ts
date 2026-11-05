/**
 * Communication: talking, listening, thinking, explaining, nodding, greeting, pointing at the UI.
 * Talk clips are overlays (layer them with mode "add" over an idle); the others are full clips.
 * Coco waves with the FAR wing (raised up-right, toward where it faces), like the reference sheet.
 */
import { expr } from '../../character/expressions/expressions.ts';
import { clip, type Clip, type Timeline } from '../lib.ts';

/** Beak syllables between t0 and t1: alternating open/close with varied heights (intensity 0..1). */
export function syllables(tl: Timeline, t0: number, t1: number, intensity = 0.7, step = 0.14): void {
  const pattern = [0.85, 0.2, 1, 0.1, 0.65, 0.15, 0.9, 0.25, 0.7, 0.05];
  let i = 0;
  tl.at(t0, { MouthOpen: 0 });
  for (let t = t0 + step; t < t1 - step * 0.6; t += step, i++) tl.at(t, { MouthOpen: Math.min(1, pattern[i % pattern.length] * intensity) });
  tl.at(t1, { MouthOpen: 0 });
}

function talk(id: string, title: string, intensity: number, description: string, scenarios: string[]): Clip {
  return clip(
    { id, category: 'communication', kind: 'overlay', duration: 1.6, loop: true, title, description, scenarios },
    (tl) => {
      syllables(tl, 0, 1.6, 0.75 * intensity, 0.14);
      const a = intensity;
      tl.at(0, { AngleY: 0, AngleX: 0, MouthForm: 0, BrowRY: 0 }, 'smooth');
      tl.at(0.4, { AngleY: -3 * a, BrowRY: 0.25 * a }, 'smooth');
      tl.at(0.8, { AngleY: 1 * a, AngleX: 3 * a, MouthForm: 0.3, BrowRY: 0 }, 'smooth');
      tl.at(1.2, { AngleY: -2.5 * a, AngleX: -2 * a, MouthForm: 0.1 }, 'smooth');
      if (intensity > 1) {
        tl.at(0, { EyeWide: 0.3, Squash: 0 }, 'smooth').at(0.4, { Squash: 0.08 }, 'smooth').at(0.8, { Squash: -0.05 }, 'smooth').at(1.2, { Squash: 0.06 }, 'smooth');
      }
    },
  );
}

export const COMMUNICATION_CLIPS: Clip[] = [
  talk('comm_talk', 'Talking', 1, 'Beak syllables with small nods and an occasional brow lift. Layer with mode "add" over an idle.', ['voice chat: Coco talks', 'any dialogue line']),
  talk('comm_talk_soft', 'Talking softly', 0.5, 'A calmer, smaller talk for explanations and quiet moments.', ['tips', 'explanations']),
  talk('comm_talk_excited', 'Talking excitedly', 1.3, 'Bigger beak, livelier head and a little bounce.', ['celebrations', 'new content announcements']),
  clip(
    {
      id: 'comm_listen', category: 'communication', kind: 'base', duration: 4, loop: true,
      title: 'Listening', description: 'Head tilted toward the speaker, attentive eye, small encouraging nods.',
      scenarios: ['voice chat: the learner speaks', 'microphone open'],
    },
    (tl) => {
      const base = expr('listening', { AngleX: -6 });
      tl.at(0, { ...base, EyeROpen: 1 });
      tl.at(1.3, { AngleY: 0, EyeBallX: -0.3 }).at(1.55, { AngleY: -5 }).at(1.8, { AngleY: 0 });
      tl.at(2.75, { EyeROpen: 1 }, 'inQuad').at(2.83, { EyeROpen: 0 }, 'outQuad').at(2.97, { EyeROpen: 1 });
      tl.at(3.2, { EyeBallX: -0.1 }).at(3.7, { EyeBallX: -0.3 });
    },
  ),
  clip(
    {
      id: 'comm_think', category: 'communication', kind: 'base', duration: 4, loop: true,
      title: 'Thinking', description: 'Wing to the chin, eye up, tapping the beak, head slowly tilting.',
      scenarios: ['question displayed', 'voice chat: Coco thinks', 'AI processing'],
    },
    (tl) => {
      tl.at(0, { ...expr('thinking'), WingRRaise: -1.2, WingRCurl: 0.8, WingRSpread: 0.1 });
      tl.at(0.5, { WingRCurl: 0.62 }).at(0.75, { WingRCurl: 0.8 }).at(1.0, { WingRCurl: 0.62 }).at(1.25, { WingRCurl: 0.8 });
      tl.at(2.0, { EyeBallX: 0.25, AngleZ: -11 }).at(3.4, { EyeBallX: -0.3, AngleZ: -8 });
      tl.at(2.6, { EyeROpen: 1 }, 'inQuad').at(2.68, { EyeROpen: 0 }, 'outQuad').at(2.82, { EyeROpen: 1 });
    },
  ),
  clip(
    {
      id: 'comm_wait', category: 'communication', kind: 'base', duration: 6, loop: true,
      title: 'Waiting patiently', description: 'Looks at the learner with a soft smile, gentle sway, a foot tap, blinks.',
      scenarios: ['answer selected, waiting for the check', 'empty chat', 'learner is typing'],
    },
    (tl) => {
      tl.at(0, { AngleZ: 0, MouthForm: 0.35, EyeRSmile: 0.2, FootRY: 0, EyeROpen: 1, TailLift: 0 }, 'smooth');
      tl.at(1.5, { AngleZ: 4 }, 'smooth').at(4.5, { AngleZ: -4 }, 'smooth');
      tl.at(2.0, { FootRY: 0 }, 'outQuad').at(2.15, { FootRY: -10 }, 'inQuad').at(2.3, { FootRY: 0 }, 'outQuad').at(2.6, { FootRY: -10 }, 'inQuad').at(2.75, { FootRY: 0 });
      tl.at(3.6, { EyeROpen: 1 }, 'inQuad').at(3.68, { EyeROpen: 0 }, 'outQuad').at(3.82, { EyeROpen: 1 });
      tl.at(5.0, { TailLift: 0 }, 'outQuad').at(5.15, { TailLift: 0.35 }, 'inOutSine').at(5.45, { TailLift: 0 });
    },
  ),
  clip(
    {
      id: 'comm_explain', category: 'communication', kind: 'base', duration: 3.2, loop: true,
      title: 'Explaining', description: 'Talks with an open wing gesturing in rhythm, nodding on the stresses.',
      scenarios: ['lesson explanation', 'grammar explanation', 'tips'],
    },
    (tl) => {
      syllables(tl, 0, 3.2, 0.65, 0.16);
      tl.at(0, { WingRRaise: -0.55, WingRSpread: 0.6, AngleY: 0, AngleZ: 4, MouthForm: 0.5, BrowRY: 0.2 }, 'inOutSine');
      tl.at(0.8, { WingRRaise: -0.8, WingRSpread: 0.35, AngleY: -4, AngleZ: 6 });
      tl.at(1.6, { WingRRaise: -0.5, WingRSpread: 0.75, AngleY: 2, AngleZ: 2, BrowRY: 0.45 });
      tl.at(2.4, { WingRRaise: -0.75, WingRSpread: 0.4, AngleY: -3, AngleZ: 5, BrowRY: 0.2 });
    },
  ),
  clip(
    {
      id: 'comm_nod', category: 'communication', kind: 'oneshot', duration: 1.0, loop: false, next: 'idle_main',
      title: 'Nodding', description: 'Two quick nods with a smile: "yes".',
      scenarios: ['agreeing', 'confirming the learner\'s answer'],
    },
    (tl) => {
      tl.at(0, { AngleY: 0, EyeRSmile: 0, MouthForm: 0 }, 'outQuad');
      tl.at(0.2, { AngleY: -10, EyeRSmile: 0.5, MouthForm: 0.6 }).at(0.4, { AngleY: 3 }).at(0.6, { AngleY: -8 });
      tl.at(0.9, { AngleY: 0, EyeRSmile: 0, MouthForm: 0 });
    },
  ),
  clip(
    {
      id: 'comm_shake_head', category: 'communication', kind: 'oneshot', duration: 1.2, loop: false, next: 'idle_main',
      title: 'Shaking the head', description: 'A friendly "no": head shakes, worried brow, small frown.',
      scenarios: ['not quite', 'declining'],
    },
    (tl) => {
      tl.at(0, { AngleX: 0, EyeBallX: 0, BrowRAngle: 0, MouthForm: 0 }, 'inOutSine');
      tl.at(0.15, { AngleX: 14, EyeBallX: -0.3, BrowRAngle: 0.5, MouthForm: -0.4 });
      tl.at(0.4, { AngleX: -14, EyeBallX: 0.3 }).at(0.62, { AngleX: 10, EyeBallX: -0.2 }).at(0.82, { AngleX: -6, EyeBallX: 0.1 });
      tl.at(1.0, { AngleX: 0, EyeBallX: 0 }).at(0.8, { BrowRAngle: 0.5 }).at(1.15, { BrowRAngle: 0, MouthForm: 0 });
    },
  ),
  clip(
    {
      id: 'comm_ask', category: 'communication', kind: 'oneshot', duration: 1.8, loop: false, next: 'comm_wait',
      title: 'Asking a question', description: 'Tilts the head, raises the brow, asks with an open wing.',
      scenarios: ['question to the learner', 'quiz prompt'],
    },
    (tl) => {
      tl.at(0, { AngleZ: 0, BrowRY: 0, BrowRAngle: 0, EyeWide: 0, WingRRaise: 0, WingRSpread: 0, Squash: 0 });
      tl.at(0.35, { AngleZ: 12, BrowRY: 0.8, BrowRAngle: 0.3, EyeWide: 0.3, WingRRaise: -0.45, WingRSpread: 0.8, Squash: 0.1, FxQuestion: 1 });
      syllables(tl, 0.1, 0.9, 0.7, 0.13);
      tl.at(0.8, { Squash: 0 }).at(1.25, { AngleZ: 12, BrowRY: 0.8, WingRRaise: -0.45, WingRSpread: 0.8, FxQuestion: 1 });
      tl.restAll(1.8);
    },
  ),
  clip(
    {
      id: 'comm_idea', category: 'communication', kind: 'oneshot', duration: 1.8, loop: false, next: 'idle_main', accessories: ['FxBulb'],
      title: 'Having an idea', description: 'Eyes pop, a light bulb appears, wing up like a raised finger: "aha!".',
      scenarios: ['hint available', 'learner unlocks a tip'],
    },
    (tl) => {
      tl.at(0, { EyeWide: 0, BrowRY: 0, Squash: 0, FxBulb: 0, WingRRaise: 0, WingRSpread: 0, MouthForm: 0, EyeRSmile: 0, BodyY: 0 }, 'outQuad');
      tl.at(0.12, { EyeWide: 0.8, BrowRY: 0.9, Squash: 0.2 }, 'outQuad');
      tl.at(0.3, { FxBulb: 1, WingRRaise: 0.95, MouthForm: 1, EyeRSmile: 0.3, Squash: -0.2, BodyY: -15 }, 'inQuad');
      tl.at(0.5, { BodyY: 0, Squash: 0.1 }).at(0.65, { Squash: 0 }).at(1.3, { FxBulb: 1, WingRRaise: 0.95, EyeWide: 0.8, BrowRY: 0.9 });
      syllables(tl, 0.3, 0.8, 0.7, 0.12);
      tl.restAll(1.8);
    },
  ),
  clip(
    {
      id: 'comm_thinking_dots', category: 'communication', kind: 'base', duration: 1.8, loop: true, accessories: ['FxDots'],
      title: 'Thinking (dots)', description: 'Thinking pose with three dots lighting up one after another: Coco is working on it.',
      scenarios: ['AI processing', 'loading', 'voice chat: Coco prepares an answer'],
    },
    (tl) => {
      tl.at(0, { ...expr('thinking'), WingRRaise: -1.2, WingRCurl: 0.8, WingRSpread: 0.1, FxDots: 1, FxDot1: 0, FxDot2: 0, FxDot3: 0 });
      tl.at(0.15, { FxDot1: 1 }).at(0.3, { FxDot2: 0 }).at(0.45, { FxDot2: 1 }).at(0.6, { FxDot3: 0 }).at(0.75, { FxDot3: 1 });
      tl.at(1.3, { FxDot1: 1, FxDot2: 1, FxDot3: 1 }).at(1.45, { FxDot1: 0, FxDot2: 0, FxDot3: 0 });
      tl.at(0.9, { WingRCurl: 0.66 }).at(1.15, { WingRCurl: 0.8 });
    },
  ),
  clip(
    {
      id: 'comm_greet', category: 'communication', kind: 'oneshot', duration: 2.6, loop: false, next: 'idle_main',
      title: 'Greeting', description: 'A little hop, then waves with the far wing and says hello with happy eyes.',
      scenarios: ['app opening', 'new user', 'returning user'],
    },
    (tl) => {
      tl.at(0, { Squash: 0, BodyY: 0, WingLRaise: 0, WingLSpread: 0, EyeRSmile: 0, MouthForm: 0, AngleZ: 0, AngleY: 0 }, 'outQuad');
      tl.at(0.15, { Squash: 0.25 }, 'outQuad');
      tl.at(0.35, { Squash: -0.25, BodyY: -28, WingLRaise: 0.8, WingLSpread: 1, EyeRSmile: 1, MouthForm: 1, AngleZ: 8, AngleY: 8 }, 'inQuad');
      tl.at(0.55, { BodyY: 0, Squash: 0.15 }, 'outQuad').at(0.72, { Squash: 0 });
      tl.at(0.8, { WingLRaise: 0.95 }).at(1.05, { WingLRaise: 0.7 }).at(1.3, { WingLRaise: 0.95 }).at(1.55, { WingLRaise: 0.7 }).at(1.8, { WingLRaise: 0.9 });
      syllables(tl, 0.4, 1.5, 0.8, 0.15);
      tl.at(2.1, { WingLRaise: 0, WingLSpread: 0, EyeRSmile: 0.4, AngleZ: 4, AngleY: 2 });
      tl.restAll(2.6);
    },
  ),
  clip(
    {
      id: 'comm_goodbye', category: 'communication', kind: 'oneshot', duration: 2.8, loop: false, next: 'idle_main',
      title: 'Saying goodbye', description: 'Waves with the near wing raised high, smiles, then a small bow.',
      scenarios: ['lesson exit', 'logout', 'end of session'],
    },
    (tl) => {
      tl.at(0, { WingRRaise: 0, WingRSpread: 0, EyeRSmile: 0, MouthForm: 0, AngleY: 0, AngleZ: 0 });
      tl.at(0.4, { WingRRaise: 0.9, WingRSpread: 1, EyeRSmile: 0.8, MouthForm: 1, AngleZ: -6 });
      tl.at(0.65, { WingRRaise: 0.72 }).at(0.9, { WingRRaise: 0.92 }).at(1.15, { WingRRaise: 0.72 }).at(1.4, { WingRRaise: 0.92 }).at(1.65, { WingRRaise: 0.75 });
      syllables(tl, 0.4, 1.2, 0.6, 0.18);
      tl.at(1.9, { WingRRaise: 0, WingRSpread: 0, AngleY: 0, AngleZ: 0 }).at(2.25, { AngleY: -9, EyeRSmile: 1 });
      tl.restAll(2.8);
    },
  ),
  ...(['right', 'left', 'up'] as const).map((dir) =>
    clip(
      {
        id: `comm_point_${dir}`, category: 'communication', kind: 'oneshot', duration: 2.2, loop: false, next: 'idle_main',
        title: `Pointing ${dir}`, description: `Points ${dir === 'up' ? 'up' : `to the ${dir}`} with the near wing and looks there: directs attention to a UI element.`,
        scenarios: [`highlight a UI element on the ${dir}`, 'onboarding tour'],
      },
      (tl) => {
        const pose = {
          right: { WingRRaise: -1, AngleX: 14, EyeBallX: 0.9, EyeBallY: 0, BodyAngleZ: 3, AngleY: 0 },
          left: { WingRRaise: 0.5, AngleX: -16, EyeBallX: -0.9, EyeBallY: 0, BodyAngleZ: -3, AngleY: 0 },
          up: { WingRRaise: 0.95, AngleX: 0, EyeBallX: 0, EyeBallY: 0.9, BodyAngleZ: 0, AngleY: 14 },
        }[dir];
        tl.at(0, { WingRRaise: 0, WingRSpread: 0, AngleX: 0, AngleY: 0, EyeBallX: 0, EyeBallY: 0, BodyAngleZ: 0, MouthForm: 0, EyeRSmile: 0 }, 'outBack');
        tl.at(0.35, { ...pose, WingRSpread: 0.1, MouthForm: 0.6, EyeRSmile: 0.3 }, 'inOutSine');
        tl.at(1.6, { ...pose, WingRSpread: 0.1 });
        tl.restAll(2.1);
        tl.at(2.2, { WingRRaise: 0 });
      },
    ),
  ),
  clip(
    {
      id: 'comm_encourage', category: 'communication', kind: 'oneshot', duration: 2.2, loop: false, next: 'idle_main',
      title: 'Encouraging', description: 'A kind, supportive reaction: reassuring smile, soft nod, open wing ("it\'s okay, try again").',
      scenarios: ['incorrect answer', 'learner hesitates'],
    },
    (tl) => {
      const calm = expr('reassuring');
      tl.at(0, { ...Object.fromEntries(Object.keys(calm).map((k) => [k, 0])), WingRRaise: 0, WingRSpread: 0, AngleY: 0 });
      tl.at(0.35, { ...calm, WingRRaise: -0.45, WingRSpread: 0.6 });
      tl.at(0.7, { AngleY: -6 }).at(0.95, { AngleY: 2 });
      syllables(tl, 0.5, 1.5, 0.55, 0.16);
      tl.at(1.6, { ...calm, WingRRaise: -0.45, WingRSpread: 0.6, AngleY: 0 });
      tl.restAll(2.2);
    },
  ),
  clip(
    {
      id: 'comm_introduce', category: 'communication', kind: 'oneshot', duration: 3.6, loop: false, next: 'idle_main',
      title: 'Introducing itself', description: 'Waves hello with the far wing, then lays the near wing on its chest ("I\'m Coco!") while talking.',
      scenarios: ['new user onboarding'],
    },
    (tl) => {
      tl.at(0, { WingLRaise: 0, WingLSpread: 0, WingRRaise: 0, WingRCurl: 0, EyeRSmile: 0, MouthForm: 0, AngleZ: 0 });
      tl.at(0.35, { WingLRaise: 0.85, WingLSpread: 1, EyeRSmile: 1, MouthForm: 1, AngleZ: 8 });
      tl.at(0.6, { WingLRaise: 0.95 }).at(0.85, { WingLRaise: 0.72 }).at(1.1, { WingLRaise: 0.9 });
      syllables(tl, 0.3, 1.1, 0.7, 0.15);
      tl.at(1.4, { WingLRaise: 0, WingLSpread: 0, WingRRaise: 0, WingRCurl: 0, EyeRSmile: 0.3, AngleZ: 2 });
      tl.at(1.8, { WingRRaise: -0.62, WingRCurl: 0.95, AngleY: 6, EyeRSmile: 0.6 });
      syllables(tl, 1.8, 3.0, 0.75, 0.15);
      tl.at(3.0, { WingRRaise: -0.62, WingRCurl: 0.95 });
      tl.restAll(3.6);
    },
  ),
];
