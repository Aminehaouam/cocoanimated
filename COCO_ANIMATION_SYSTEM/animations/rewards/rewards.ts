/** Rewards: jumps, celebrations, trophies, medals, crowns, hearts, gifts, streaks and level ups. */
import { expr } from '../../character/expressions/expressions.ts';
import { HOLD, UP } from '../../accessories/education/education.ts';
import { clip, type Clip } from '../lib.ts';
import { flap, wiggle, zeros } from '../kit.ts';
import { FLIGHT } from '../travel/travel.ts';

const JOY = expr('joyful');

export const REWARD_CLIPS: Clip[] = [
  clip({ id: 'rew_jump', category: 'rewards', kind: 'oneshot', duration: 1.4, loop: false, next: 'idle_main', title: 'Jumping', description: 'Crouch, a big stretched jump, squash on landing, a happy face.', scenarios: ['quick win', 'combo'] }, (tl) => {
    tl.at(0, { Squash: 0, BodyY: 0, ...zeros(JOY), TailFan: 0 }, 'outQuad');
    tl.at(0.2, { Squash: 0.4 }, 'outQuad').at(0.45, { BodyY: -110, Squash: -0.45, ...JOY, TailFan: 1 }, 'outQuad').at(0.7, { BodyY: -110, Squash: -0.1 }, 'inQuad');
    tl.at(0.95, { BodyY: 0, Squash: 0.35 }, 'outQuad').at(1.15, { Squash: 0, TailFan: 0 });
    tl.restAll(1.4);
  }),
  clip({ id: 'rew_fly_excited', category: 'rewards', kind: 'base', duration: 1.6, loop: true, accessories: ['FxSparkle'], title: 'Flying with excitement', description: 'Joyful flight loop: big flaps, swooping up and down, sparkles.', scenarios: ['level complete', 'big reward'] }, (tl) => {
    tl.at(0, { ...FLIGHT, ...JOY, FxSparkle: 1, BodyX: 0, BodyY: -170 }, 'smooth').at(0.4, { BodyX: 40, BodyY: -205 }, 'smooth').at(0.8, { BodyX: 0, BodyY: -170 }, 'smooth').at(1.2, { BodyX: -40, BodyY: -135 }, 'smooth');
    flap(tl, 0, 1.4, 1, 0.2, 0.2);
  }),
  clip({ id: 'rew_celebrate', category: 'rewards', kind: 'oneshot', duration: 3.0, loop: false, next: 'idle_main', accessories: ['FxConfetti', 'FxStars'], title: 'Celebrating', description: 'Jumps with both wings up, confetti rains and stars pop, joyful flaps, lands.', scenarios: ['lesson completed', 'goal reached'] }, (tl) => {
    tl.at(0, { BodyY: 0, Squash: 0, FxConfetti: 0, FxConfettiFall: 0, FxStars: 0, TailFan: 0, ...zeros(JOY), WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 }, 'outQuad');
    tl.at(0.15, { Squash: 0.35 }, 'outQuad').at(0.35, { BodyY: -70, Squash: -0.4, FxConfetti: 1, FxStars: 1, TailFan: 1, ...JOY, FxConfettiFall: 0 }, 'linear');
    tl.at(0.65, { BodyY: 0, Squash: 0.25 }, 'outQuad').at(0.85, { Squash: 0 });
    flap(tl, 0.35, 1.95, 1, 0.55, 0.2);
    tl.at(2.2, { WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0, TailFan: 0, FxStars: 1 }).at(2.6, { FxStars: 0 });
    tl.at(2.75, { FxConfettiFall: 1, FxConfetti: 1 }).at(2.95, { FxConfetti: 0 });
    tl.restAll(3.0);
  }),
  clip({ id: 'rew_trophy', category: 'rewards', kind: 'base', duration: 3, loop: true, accessories: ['AccTrophy', 'FxSparkle'], title: 'Holding a trophy', description: 'Holds the gold trophy up beside the head, proud face, sparkles.', scenarios: ['tournament win', 'top of the leaderboard'] }, (tl) => {
    tl.at(0, { AccTrophy: 1, ...UP, ...expr('proud'), FxSparkle: 1 }, 'smooth').at(1.5, { WingLRaise: 0.9, AngleY: 12 }, 'smooth');
  }),
  clip({ id: 'rew_medal', category: 'rewards', kind: 'base', duration: 3, loop: true, accessories: ['AccMedal', 'FxSparkle'], title: 'Wearing a medal', description: 'Medal on the chest, wing pointing to it, chest puffed, sparkles.', scenarios: ['badge earned', 'course certificate'] }, (tl) => {
    tl.at(0, { AccMedal: 1, ...expr('proud'), WingRRaise: -0.62, WingRCurl: 0.95, FxSparkle: 1, Breath: 0.3 }, 'smooth').at(1.5, { Breath: 1, AngleY: 18 }, 'smooth');
  }),
  clip({ id: 'rew_crown', category: 'rewards', kind: 'base', duration: 3, loop: true, accessories: ['AccCrown', 'FxSparkle'], title: 'Wearing a crown', description: 'Crown on, chin up, a slow regal nod, sparkles.', scenarios: ['champion', 'perfect week'] }, (tl) => {
    tl.at(0, { AccCrown: 1, ...expr('proud'), AngleY: 14, FxSparkle: 1 }).at(1.2, { AngleY: 14 }).at(1.6, { AngleY: 4 }).at(2.1, { AngleY: 14 });
  }),
  clip({ id: 'rew_heart', category: 'rewards', kind: 'base', duration: 3, loop: true, accessories: ['AccHeart', 'FxHearts'], title: 'Showing a heart', description: 'Hugs a big heart with happy closed eyes and blush; little hearts float up.', scenarios: ['favourite', 'thank you', 'support'] }, (tl) => {
    tl.at(0, { AccHeart: 1, ...HOLD, EyeROpen: 0, EyeRSmile: 1, Blush: 1, MouthForm: 1, FxHearts: 1, FxHeartsRise: 0, BodyAngleZ: -3 }, 'smooth');
    tl.at(1.5, { FxHeartsRise: 1, BodyAngleZ: 3 }, 'smooth');
  }),
  clip({ id: 'rew_confetti', category: 'rewards', kind: 'oneshot', duration: 2.6, loop: false, next: 'idle_main', accessories: ['FxConfetti'], title: 'Throwing confetti', description: 'Flings both wings up: confetti bursts and rains down, joyful face.', scenarios: ['party', 'milestone'] }, (tl) => {
    tl.at(0, { FxConfetti: 0, FxConfettiFall: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0, ...zeros(JOY), Squash: 0 }, 'outQuad');
    tl.at(0.15, { Squash: 0.2, WingRRaise: -0.3, WingLRaise: -0.3 }, 'inQuad').at(0.3, { WingRRaise: 1, WingLRaise: 1, WingRSpread: 1, WingLSpread: 1, FxConfetti: 1, Squash: -0.2, ...JOY, FxConfettiFall: 0 }, 'linear');
    tl.at(0.55, { Squash: 0 }).at(1.6, { WingRRaise: 0.8, WingLRaise: 0.8 }).at(2.0, { WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 });
    tl.at(2.35, { FxConfettiFall: 1, FxConfetti: 1 }).at(2.55, { FxConfetti: 0 });
    tl.restAll(2.6);
  }),
  clip({ id: 'rew_gift', category: 'rewards', kind: 'oneshot', duration: 3.0, loop: false, next: 'idle_main', to: 'holding the gift', accessories: ['AccGift', 'FxSparkle'], title: 'Receiving a gift', description: 'A gift appears with sparkles; surprised, then delighted, gives it a little shake.', scenarios: ['daily reward', 'surprise gift'] }, (tl) => {
    tl.at(0, { AccGift: 0, ...zeros(HOLD), FxSparkle: 0, EyeWide: 0, MouthOpen: 0, ...zeros(JOY) });
    tl.at(0.3, { ...HOLD }).at(0.4, { AccGift: 1, FxSparkle: 1, EyeWide: 0.9, MouthOpen: 0.6 }).at(1.0, { EyeWide: 0.9, MouthOpen: 0.6 });
    tl.at(1.3, { ...JOY, EyeWide: 0, FxSparkle: 1 });
    wiggle(tl, 'WingRCurl', 1.5, 2.3, 0.65, 0.35, 0.16);
    tl.at(2.6, { FxSparkle: 0, WingRCurl: 0.5 }).at(3.0, { AccGift: 1, ...HOLD, ...zeros(JOY), EyeRSmile: 0.6, MouthForm: 1 });
  }),
  clip({ id: 'rew_streak', category: 'rewards', kind: 'oneshot', duration: 2.8, loop: false, next: 'idle_main', accessories: ['AccStreakBadge', 'FxStars'], title: 'Celebrating a streak', description: 'Raises the flame streak badge with a hop, stars burst around, joyful face.', scenarios: ['daily streak'] }, (tl) => {
    tl.at(0, { AccStreakBadge: 0, WingLRaise: 0, FxStars: 0, Squash: 0, BodyY: 0, ...zeros(JOY) }, 'outQuad');
    tl.at(0.2, { AccStreakBadge: 1, Squash: 0.25 }, 'outQuad').at(0.4, { WingLRaise: 0.95, BodyY: -40, Squash: -0.3, FxStars: 1, ...JOY }, 'inQuad');
    tl.at(0.65, { BodyY: 0, Squash: 0.15, WingLRaise: 0.8 }).at(0.85, { Squash: 0 }).at(2.0, { WingLRaise: 0.85, FxStars: 1 }).at(2.4, { WingLRaise: 0, FxStars: 0 }).at(2.6, { AccStreakBadge: 0 });
    tl.restAll(2.8);
  }),
  clip({ id: 'rew_level_up', category: 'rewards', kind: 'oneshot', duration: 2.8, loop: false, next: 'idle_main', accessories: ['FxGlow', 'FxSparkle'], title: 'Level up', description: 'A warm glow rises around Coco as it floats up with wings spread wide, sparkles, then lands.', scenarios: ['level up', 'new rank'] }, (tl) => {
    tl.at(0, { FxGlow: 0, FxSparkle: 0, BodyY: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0, ...zeros(JOY), LegTuck: 0 });
    tl.at(0.5, { FxGlow: 1 }).at(1.1, { BodyY: -70, WingRRaise: 0.75, WingLRaise: 0.75, WingRSpread: 1, WingLSpread: 1, FxSparkle: 1, LegTuck: 0.5, ...JOY });
    tl.at(1.9, { BodyY: -70, FxGlow: 1, FxSparkle: 1 }).at(2.4, { BodyY: 0, LegTuck: 0, FxGlow: 0, FxSparkle: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 });
    tl.restAll(2.8);
  }),
];
