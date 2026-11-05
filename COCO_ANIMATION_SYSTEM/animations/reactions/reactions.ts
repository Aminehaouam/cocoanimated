/** Special reactions: startles, hiding, balance, dizziness, dozing off, dancing, being offline. */
import { expr } from '../../character/expressions/expressions.ts';
import { clip, type Clip } from '../lib.ts';
import { blink, wiggle, zeros } from '../kit.ts';

export const REACTION_CLIPS: Clip[] = [
  clip({ id: 'rx_startled', category: 'reactions', kind: 'oneshot', duration: 1.4, loop: false, next: 'idle_main', title: 'Startled', description: 'A quick flinch: squash, jolt up, eye wide, alert lines, wings flick out.', scenarios: ['sudden sound', 'notification'] }, (tl) => {
    const shock = { EyeWide: 1, BrowRY: 1, MouthOpen: 0.5, FxAlert: 1, WingRRaise: 0.5, WingLRaise: 0.5, WingRSpread: 1, WingLSpread: 1, TailFan: 1 };
    tl.at(0, { ...zeros(shock), Squash: 0 }, 'outQuad');
    tl.at(0.06, { Squash: 0.3 }, 'outQuad').at(0.16, { ...shock, Squash: -0.4 }, 'outQuad').at(0.4, { Squash: 0.1 }).at(0.6, { Squash: 0 });
    tl.at(0.9, { WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0, TailFan: 0 }).at(1.0, { FxAlert: 0, MouthOpen: 0 });
    tl.restAll(1.4);
  }),
  clip({ id: 'rx_suspicious', category: 'reactions', kind: 'base', duration: 3.2, loop: true, title: 'Suspicious', description: 'Narrowed eye, wing on the chin, a slow lean and sideways glances.', scenarios: ['too-good-to-be-true offer', 'tricky question'] }, (tl) => {
    tl.at(0, { ...expr('suspicious'), WingRRaise: -1.2, WingRCurl: 0.8, BodyAngleZ: -3 });
    tl.at(1.6, { BodyAngleZ: 1, EyeROpen: 0.35, EyeBallX: -0.4 }).at(2.4, { EyeBallX: -0.8 });
  }),
  clip({ id: 'rx_hide', category: 'reactions', kind: 'oneshot', duration: 2.6, loop: false, next: 'idle_main', accessories: ['FxSweat'], title: 'Hiding', description: 'Ducks behind the wing, crouched, peeks out once, then comes back out.', scenarios: ['scary content', 'shy moment'] }, (tl) => {
    const hidden = { WingRRaise: -1.5, WingRSpread: 0.7, Squash: 0.3, BodyY: 12, FxSweat: 1, EyeROpen: 0.3 };
    tl.at(0, zeros(hidden)).at(0.3, hidden).at(1.1, hidden).at(1.35, { WingRRaise: -1.25, EyeROpen: 1, EyeBallX: 0.6 }).at(1.7, { WingRRaise: -1.25, EyeBallX: -0.4 });
    tl.at(1.9, { WingRRaise: -1.5, EyeROpen: 0.3, EyeBallX: 0 }).at(2.1, hidden);
    tl.restAll(2.6);
  }),
  clip({ id: 'rx_peek', category: 'reactions', kind: 'oneshot', duration: 3.0, loop: false, next: 'rx_peek', from: 'behind the wall', to: 'behind the wall', accessories: ['AccWall'], title: 'Peeking', description: 'Hidden behind a wall edge, leans out to peek, looks around, ducks back.', scenarios: ['hint teaser', 'onboarding: "psst"'] }, (tl) => {
    const out = { BodyX: -150, BodyAngleZ: 8, AngleZ: 10, EyeBallX: 0.8, MouthForm: 0.5 };
    tl.at(0, { AccWall: 1, BodyX: -260, BodyAngleZ: 0, AngleZ: 0, EyeBallX: 0, AngleX: 0, MouthForm: 0 }, 'outQuad');
    tl.at(0.6, out).at(1.2, { AngleX: 12, EyeBallX: 0.9 }).at(1.7, { AngleX: -6, EyeBallX: 0.3 }).at(2.1, { AngleX: 0, ...out });
    blink(tl, 1.0);
    tl.at(2.6, { BodyX: -260, BodyAngleZ: 0, AngleZ: 0, EyeBallX: 0, MouthForm: 0 }).at(3.0, { AccWall: 1, BodyX: -260, AngleX: 0 });
  }),
  clip({ id: 'rx_lose_balance', category: 'reactions', kind: 'oneshot', duration: 2.4, loop: false, next: 'idle_main', accessories: ['FxSweat'], title: 'Losing balance', description: 'Wobbles on one foot with flailing wings, catches itself, phew.', scenarios: ['slippery moment', 'clumsy joke'] }, (tl) => {
    tl.at(0, { BodyAngleZ: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0, FootRY: 0, EyeWide: 0, MouthOpen: 0, FxSweat: 0 });
    for (const [t, v] of [[0.25, 9], [0.55, -10], [0.85, 8], [1.1, -6], [1.35, 3], [1.6, 0]] as const) tl.at(t, { BodyAngleZ: v });
    for (const [t, r, l] of [[0.25, 0.6, 0.2], [0.45, -0.3, 0.7], [0.65, 0.7, 0.1], [0.85, 0.2, 0.8], [1.1, 0, 0]] as const) tl.at(t, { WingRRaise: r, WingLRaise: l, WingRSpread: 1, WingLSpread: 1 });
    tl.at(0.3, { FootRY: -28, EyeWide: 0.8, MouthOpen: 0.5 }).at(0.6, { FootRY: 0 }).at(0.85, { FootRY: -20 }).at(1.05, { FootRY: 0 });
    tl.at(1.3, { WingRSpread: 0, WingLSpread: 0, EyeWide: 0, MouthOpen: 0 }).at(1.5, { FxSweat: 1, EyeRSmile: 0.6, MouthForm: 0.6 }).at(2.0, { FxSweat: 1 });
    tl.restAll(2.4);
  }),
  clip({ id: 'rx_dizzy', category: 'reactions', kind: 'base', duration: 2.4, loop: true, accessories: ['FxDizzy'], title: 'Dizzy', description: 'Head circling, unfocused eye, swaying body, a swirl over the head.', scenarios: ['too many mistakes in a row', 'spinning game'] }, (tl) => {
    tl.at(0, { FxDizzy: 1, FxDizzySpin: 0, EyeROpen: 0.75, MouthForm: -0.3, MouthOpen: 0.15, AngleX: 12, AngleY: 0, EyeBallX: -0.6, EyeBallY: 0, BodyAngleZ: 5 }, 'smooth');
    tl.at(0.6, { AngleX: 0, AngleY: 8, EyeBallX: 0, EyeBallY: -0.6, FxDizzySpin: 0.25, BodyAngleZ: 0 }, 'smooth');
    tl.at(1.2, { AngleX: -12, AngleY: 0, EyeBallX: 0.6, EyeBallY: 0, FxDizzySpin: 0, BodyAngleZ: -5 }, 'smooth');
    tl.at(1.8, { AngleX: 0, AngleY: -8, EyeBallX: 0, EyeBallY: 0.6, FxDizzySpin: 0.25, BodyAngleZ: 0 }, 'smooth');
  }),
  clip({ id: 'rx_fall_asleep', category: 'reactions', kind: 'oneshot', duration: 3.6, loop: false, next: 'idle_sleep', to: 'idle_sleep', title: 'Falling asleep', description: 'Eyelids droop, nods off, jerks awake, then drifts off for good.', scenarios: ['long inactivity', 'bedtime reminder'] }, (tl) => {
    tl.at(0, { EyeROpen: 1, AngleY: 0, AngleZ: 0, Squash: 0, BodyAngleZ: 0, FxZzz: 0 });
    tl.at(0.8, { EyeROpen: 0.4, AngleY: -10 }).at(1.0, { EyeROpen: 0.65, AngleY: 2 }, 'outQuad').at(1.6, { EyeROpen: 0.15 }).at(1.9, { EyeROpen: 0 });
    tl.at(2.0, { AngleY: -14 }).at(2.2, { AngleZ: 9 }).at(2.4, { Squash: 0.1, BodyAngleZ: 1 }).at(3.0, { FxZzz: 0.5 }).at(3.4, { FxZzz: 0 });
    tl.at(3.6, { ...expr('asleep'), Squash: 0.1, BodyAngleZ: 1, FxZzz: 0 });
  }),
  clip({ id: 'rx_disappointed', category: 'reactions', kind: 'oneshot', duration: 2.8, loop: false, next: 'idle_main', title: 'Looking disappointed', description: 'Deflates: a long sigh, body slumps, wings hang, head down; slowly perks back up.', scenarios: ['game over', 'streak lost'] }, (tl) => {
    const slump = { ...expr('disappointed'), Squash: 0.25, BodyY: 6, AngleY: -18 };
    tl.at(0, { ...zeros(slump), Breath: 0 }).at(0.5, { Breath: 1 }).at(1.1, { ...slump, Breath: 0 }).at(2.1, slump);
    tl.restAll(2.8);
  }),
  clip({ id: 'rx_dramatic_surprise', category: 'reactions', kind: 'oneshot', duration: 2.4, loop: false, next: 'idle_main', accessories: ['FxAlert'], title: 'Dramatic surprise', description: 'Jumps back stretched tall, both wings up, beak wide open, feathers and tail flared.', scenarios: ['big reveal', 'jackpot'] }, (tl) => {
    const shock = { ...expr('surprised'), EyeWide: 1, MouthOpen: 1, WingRRaise: 1, WingLRaise: 1, WingRSpread: 1, WingLSpread: 1, FxAlert: 1, TailFan: 1, TailLift: 0.8 };
    tl.at(0, { ...zeros(shock), Squash: 0, BodyY: 0, BodyX: 0 }, 'outQuad');
    tl.at(0.08, { Squash: 0.35 }, 'outQuad').at(0.2, { ...shock, Squash: -0.6, BodyY: -40, BodyX: -20 }, 'outQuad').at(0.5, { BodyY: 0, Squash: 0.15 }).at(0.7, { Squash: 0 });
    tl.at(1.6, { ...shock, Squash: 0 }).at(1.9, { WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0, FxAlert: 0, BodyX: 0 });
    tl.restAll(2.4);
  }),
  clip({ id: 'rx_dance', category: 'reactions', kind: 'base', duration: 2, loop: true, accessories: ['FxNotes'], title: 'Playful dancing', description: 'Bobs to the beat, leans side to side, wings and feet alternate, music notes float.', scenarios: ['music lesson', 'celebration', 'listening to a song'] }, (tl) => {
    tl.at(0, { EyeRSmile: 1, EyeROpen: 0.15, MouthForm: 1, MouthOpen: 0.3, FxNotes: 1, FxNotesRise: 0 }, 'smooth').at(1, { FxNotesRise: 1 }, 'smooth');
    for (let i = 0; i < 4; i++) {
      const t = i * 0.5, s = i % 2 ? 1 : -1;
      tl.at(t, { BodyAngleZ: 7 * s, AngleZ: -8 * s, BodyY: 0, WingRRaise: s < 0 ? 0.45 : 0, WingLRaise: s > 0 ? 0.45 : 0, WingRSpread: 0.6, WingLSpread: 0.6, FootRY: 0, FootLY: 0 }, 'smooth');
      tl.at(t + 0.25, { BodyY: -12, [s < 0 ? 'FootRY' : 'FootLY']: -18 }, 'smooth');
    }
  }),
  clip({ id: 'rx_offline', category: 'reactions', kind: 'base', duration: 3.2, loop: true, accessories: ['FxQuestion'], title: 'Offline / confused', description: 'Shrugs with both wings, "?" above, looks around searching for the connection.', scenarios: ['no internet', 'server error'] }, (tl) => {
    tl.at(0, { ...expr('confused'), FxQuestion: 1, WingRRaise: -0.3, WingRSpread: 0.5, WingLRaise: 0.25, WingLSpread: 0.5, AngleX: -12, EyeBallX: -0.6 }, 'inOutSine');
    tl.at(1.4, { AngleX: 12, EyeBallX: 0.6, AngleZ: 14 }).at(2.2, { AngleX: 12, EyeBallX: 0.6 });
    blink(tl, 2.5);
  }),
];
