/**
 * Emotions: one-shots that ease into an expression preset (character/expressions), act it out with
 * the body, and ease back to rest. Play them over or after `idle_main`.
 */
import { expr, type ExpressionName } from '../../character/expressions/expressions.ts';
import { clip, type Clip, type Timeline } from '../lib.ts';
import { blink, wiggle, zeros } from '../kit.ts';

function emote(
  id: string, name: ExpressionName, title: string, description: string, scenarios: string[],
  act: (tl: Timeline, face: Record<string, number>) => void, duration = 2.4, extra: Record<string, number> = {}, accessories: string[] = [],
): Clip {
  return clip(
    { id, category: 'emotions', kind: 'oneshot', duration, loop: false, next: 'idle_main', title, description, scenarios, accessories },
    (tl) => {
      const face = { ...expr(name), ...extra };
      tl.at(0, zeros(face));
      tl.at(0.35, face);
      tl.at(duration - 0.45, face);
      act(tl, face);
      tl.restAll(duration);
    },
  );
}

export const EMOTION_CLIPS: Clip[] = [
  emote('emo_happy', 'happy', 'Happy', 'A bright smile with a little hop, a wing flick and the tail fanned.', ['positive feedback', 'small win'], (tl) => {
    tl.at(0, { Squash: 0, BodyY: 0, WingRRaise: 0, WingRSpread: 0, TailFan: 0 }, 'outQuad');
    tl.at(0.12, { Squash: 0.2 }, 'outQuad').at(0.32, { BodyY: -24, Squash: -0.15, WingRRaise: 0.25, WingRSpread: 0.5, TailFan: 0.6 }, 'inQuad');
    tl.at(0.5, { BodyY: 0, Squash: 0.12 }).at(0.7, { Squash: 0 }).at(0.85, { WingRRaise: 0, WingRSpread: 0 }).at(1.9, { TailFan: 0.6 });
  }),
  emote('emo_excited', 'excited', 'Excited', 'Bounces three times flapping both wings, tail fanned wide.', ['lesson start', 'new content', 'big news'], (tl) => {
    tl.at(0, { BodyY: 0, Squash: 0, TailFan: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 });
    for (const t of [0.25, 0.7, 1.15]) tl.at(t - 0.1, { Squash: 0.18, BodyY: 0 }, 'outQuad').at(t + 0.1, { BodyY: -22, Squash: -0.12 }, 'inQuad').at(t + 0.3, { BodyY: 0, Squash: 0.08 });
    wiggle(tl, 'WingRRaise', 0.3, 1.5, 0.55, 0.15, 0.15);
    wiggle(tl, 'WingLRaise', 0.3, 1.5, 0.6, 0.15, 0.15);
    tl.at(0.3, { WingRSpread: 1, WingLSpread: 1, TailFan: 1 }).at(1.6, { WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0, Squash: 0 });
  }),
  emote('emo_proud', 'proud', 'Proud', 'Puffs up the chest with a wing on it, chin up, a satisfied nod.', ['achievement', 'learner did well'], (tl) => {
    tl.at(0, { WingRRaise: 0, WingRCurl: 0, Squash: 0 }).at(0.4, { WingRRaise: -0.62, WingRCurl: 0.95, Squash: -0.12 }).at(1.95, { WingRRaise: -0.62, WingRCurl: 0.95, Squash: -0.12 });
    tl.at(1.1, { AngleY: 8 }).at(1.35, { AngleY: 16 });
  }, 2.6),
  emote('emo_curious', 'curious', 'Curious', 'Leans in for a closer look, tilting the head twice.', ['new item', 'something to discover'], (tl) => {
    tl.at(0, { BodyAngleZ: 0, BodyX: 0 }).at(0.45, { BodyAngleZ: 6, BodyX: 14 }).at(2.0, { BodyAngleZ: 6, BodyX: 14 });
    tl.at(0.9, { AngleZ: 10 }).at(1.25, { AngleZ: 19 }).at(1.6, { EyeWide: 0.6 }).at(1.8, { EyeWide: 0.35 });
  }, 2.6),
  emote('emo_confused', 'confused', 'Confused', 'Scratches the head with the far wing, "?" above, head tilting back and forth.', ['unexpected answer', 'something unclear'], (tl) => {
    tl.at(0, { WingLRaise: 0, WingLSpread: 0, FxQuestion: 0 }).at(0.4, { WingLRaise: 1, WingLSpread: 0.2, FxQuestion: 1 });
    wiggle(tl, 'WingLRaise', 0.55, 1.8, 0.92, 1, 0.15);
    tl.at(2.0, { WingLRaise: 1, FxQuestion: 1 }).at(1.0, { AngleZ: -6 }).at(1.5, { AngleZ: -16 });
  }, 2.8),
  emote('emo_surprised', 'surprised', 'Surprised', 'A quick hop back with alert lines and wings flaring.', ['unexpected event', 'surprise reveal'], (tl) => {
    tl.at(0, { Squash: 0, BodyX: 0, BodyY: 0, FxAlert: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 }, 'outQuad');
    tl.at(0.08, { Squash: 0.25 }, 'outQuad').at(0.2, { Squash: -0.35, BodyX: -12, BodyY: -18, FxAlert: 1, WingRRaise: 0.3, WingLRaise: 0.3, WingRSpread: 0.6, WingLSpread: 0.6 }, 'inQuad');
    tl.at(0.4, { BodyY: 0, Squash: 0.1 }).at(0.6, { Squash: 0 }).at(1.0, { WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 }).at(1.3, { FxAlert: 0, BodyX: 0 });
  }, 1.8),
  emote('emo_worried', 'worried', 'Worried', 'Fidgets with the wing, glances around, a sweat drop.', ['time running out', 'hard question'], (tl) => {
    tl.at(0, { WingRRaise: 0, WingRCurl: 0, FxSweat: 0 }).at(0.4, { WingRRaise: -0.4, FxSweat: 1 });
    wiggle(tl, 'WingRCurl', 0.4, 2.0, 0.4, 0, 0.2);
    tl.at(0.8, { EyeBallX: -0.5 }).at(1.2, { EyeBallX: 0.4 }).at(1.6, { EyeBallX: -0.3 }).at(2.3, { WingRRaise: -0.4, FxSweat: 1 });
  }, 2.8),
  emote('emo_disappointed', 'disappointed', 'Disappointed', 'A deep sigh: the body sinks a little, head down, then recovers.', ['missed goal', 'lost streak'], (tl) => {
    tl.at(0, { Breath: 0, Squash: 0 }).at(0.6, { Breath: 1 }).at(1.3, { Breath: 0, Squash: 0.12, AngleY: -16 }).at(2.0, { Squash: 0.12 });
  }, 2.6),
  emote('emo_embarrassed', 'embarrassed', 'Embarrassed', 'Blushes and hides behind the wing, sweat drop, peeks out shyly.', ['compliment', 'silly mistake'], (tl) => {
    tl.at(0, { WingRRaise: 0, WingRSpread: 0, FxSweat: 0 }).at(0.45, { WingRRaise: -1.45, WingRSpread: 0.6, FxSweat: 1 });
    tl.at(1.3, { WingRRaise: -1.45 }).at(1.6, { WingRRaise: -1.25 }).at(2.2, { WingRRaise: -1.25, FxSweat: 1 }).at(2.5, { WingRRaise: 0, WingRSpread: 0 });
  }, 2.8),
  emote('emo_playful', 'playful', 'Playful', 'A wink, a bouncy head bob and a wagging tail.', ['fun fact', 'easter egg'], (tl) => {
    tl.at(0, { TailLift: 0, BodyY: 0 });
    wiggle(tl, 'TailLift', 0.4, 1.8, 0.45, -0.2, 0.2);
    wiggle(tl, 'BodyY', 0.4, 1.8, -10, 0, 0.2);
    tl.at(1.95, { TailLift: 0, BodyY: 0 });
  }),
  emote('emo_reassuring', 'reassuring', 'Reassuring', 'Soft smile, slow nod and an open wing: "it\'s alright".', ['incorrect answer', 'retry'], (tl) => {
    tl.at(0, { WingRRaise: 0, WingRSpread: 0 }).at(0.45, { WingRRaise: -0.45, WingRSpread: 0.6 }).at(1.9, { WingRRaise: -0.45, WingRSpread: 0.6 });
    tl.at(0.9, { AngleY: -7 }).at(1.3, { AngleY: 0 });
  }),
  emote('emo_mischievous', 'mischievous', 'Mischievous', 'Sly look, rubbing the wing tips, a little chuckle.', ['bonus challenge', 'surprise quiz'], (tl) => {
    tl.at(0, { WingRRaise: 0, WingRCurl: 0, BodyAngleZ: 0 }).at(0.4, { WingRRaise: -0.75, BodyAngleZ: -4 });
    wiggle(tl, 'WingRCurl', 0.45, 1.9, 0.6, 0.3, 0.16);
    wiggle(tl, 'MouthOpen', 0.9, 1.5, 0.2, 0, 0.1);
    tl.at(2.0, { WingRRaise: -0.75, BodyAngleZ: -4 });
  }, 2.6),
  emote('emo_sad', 'sad', 'Sad', 'Head and body droop, a tear runs down, then a brave recovery.', ['sad story', 'failed level'], (tl) => {
    tl.at(0, { FxTear: 0, FxTearFall: 0, Squash: 0 }).at(0.5, { FxTear: 1, Squash: 0.1 }).at(1.9, { FxTearFall: 1, FxTear: 1, Squash: 0.1 }, 'inQuad').at(2.2, { FxTear: 0 });
    blink(tl, 1.4);
  }, 2.8, {}, ['FxTear']),
  emote('emo_love', 'joyful', 'Love', 'Eyes closed in a happy arc, blushing, swaying, hearts floating up.', ['favourite lesson', 'thank you'], (tl) => {
    tl.at(0, { FxHearts: 0, FxHeartsRise: 0, BodyAngleZ: 0 }).at(0.4, { FxHearts: 1 }).at(2.2, { FxHearts: 1, FxHeartsRise: 1 }).at(2.5, { FxHearts: 0 });
    wiggle(tl, 'BodyAngleZ', 0.4, 2.2, 4, -4, 0.45);
  }, 2.8, { MouthOpen: 0.25, AngleY: 6 }, ['FxHearts']),
];
