/**
 * Education: reading, teaching at the blackboard, vocabulary cards, writing, pronunciation, and the
 * reactions to answers. Props are accessories (accessories/education): the clip turns them on with
 * their Acc* parameter and poses the wing in the prop's holding pose.
 */
import { expr } from '../../character/expressions/expressions.ts';
import { HOLD, POINT, UP } from '../../accessories/education/education.ts';
import { clip, type Clip } from '../lib.ts';
import { syllables } from '../communication/communication.ts';

const BOARD = { AccBlackboard: 1, AccBoardText: 1 };

export const EDUCATION_CLIPS: Clip[] = [
  clip(
    {
      id: 'edu_read_book', category: 'education', kind: 'base', duration: 4, loop: true, accessories: ['AccBook'],
      title: 'Reading a book', description: 'Holds the green book and reads: the eye scans each line, small nods at line breaks.',
      scenarios: ['reading exercise', 'story time', 'lesson intro'],
    },
    (tl) => {
      tl.at(0, { AccBook: 1, ...HOLD, AngleX: 6, AngleY: -10, EyeBallX: 0.1, EyeBallY: -0.7, MouthForm: 0.4, EyeROpen: 1 });
      for (const [t, line] of [[0, 0], [1.0, 1], [2.0, 2], [3.0, 3]] as const) {
        tl.at(t + 0.05, { EyeBallX: 0.1, AngleY: -10 - (line % 2) }).at(t + 0.85, { EyeBallX: 0.75, AngleY: -10 });
      }
      tl.at(3.3, { EyeROpen: 1 }, 'inQuad').at(3.38, { EyeROpen: 0 }, 'outQuad').at(3.52, { EyeROpen: 1 });
    },
  ),
  clip(
    {
      id: 'edu_teach', category: 'education', kind: 'base', duration: 3.2, loop: true, accessories: ['AccPointer', 'AccBlackboard', 'AccBoardText'],
      title: 'Teaching', description: 'Taps the blackboard with the pointer, then turns to the learner and explains.',
      scenarios: ['lesson explanation', 'grammar point'],
    },
    (tl) => {
      tl.at(0, { ...BOARD, AccPointer: 1, ...POINT, AngleX: 12, EyeBallX: 0.8, MouthForm: 0.5, BrowRY: 0.2 });
      tl.at(0.4, { WingRRaise: -1.08 }).at(0.8, { WingRRaise: -1 }).at(1.2, { WingRRaise: -1.08 }).at(1.6, { WingRRaise: -1, AngleX: 12, EyeBallX: 0.8 });
      tl.at(2.0, { AngleX: -4, EyeBallX: -0.2 }).at(2.9, { AngleX: -4, EyeBallX: -0.2 });
      syllables(tl, 1.9, 3.1, 0.65, 0.15);
    },
  ),
  clip(
    {
      id: 'edu_hold_card', category: 'education', kind: 'base', duration: 3, loop: true, accessories: ['AccCard'],
      title: 'Holding a vocabulary card', description: 'Holds the word card up with the far wing, smiles at the learner, glances at the card.',
      scenarios: ['vocabulary', 'flash card review'],
    },
    (tl) => {
      tl.at(0, { AccCard: 1, ...UP, MouthForm: 0.7, EyeRSmile: 0.3, AngleX: 0, EyeBallX: 0 });
      tl.at(0.75, { WingLRaise: 0.84 }).at(1.5, { WingLRaise: 0.8 }).at(2.25, { WingLRaise: 0.84 });
      tl.at(1.1, { AngleX: 0, EyeBallX: 0 }).at(1.35, { AngleX: 8, EyeBallX: 0.9 }).at(1.95, { AngleX: 8, EyeBallX: 0.9 }).at(2.25, { AngleX: 0, EyeBallX: 0 });
    },
  ),
  clip(
    {
      id: 'edu_write', category: 'education', kind: 'oneshot', duration: 3.4, loop: false, next: 'edu_teach', from: 'blackboard', to: 'blackboard with text',
      accessories: ['AccBlackboard', 'AccBoardText', 'AccChalk'],
      title: 'Writing', description: 'Writes "Aa" on the blackboard with chalk (the letters appear stroke by stroke), then turns round proudly.',
      scenarios: ['new letter or word', 'spelling'],
    },
    (tl) => {
      tl.at(0, { AccBlackboard: 1, AccBoardText: 0, AccChalk: 0, WingRRaise: 0, WingRCurl: 0, AngleX: 0, EyeBallX: 0, MouthForm: 0, EyeRSmile: 0 });
      tl.at(0.25, { AccChalk: 1 }).at(0.5, { WingRRaise: -1.15, AngleX: 10, EyeBallX: 0.8 }).at(0.6, { AccBoardText: 0, WingRCurl: 0.15 }, 'linear');
      for (let t = 0.75, i = 0; t < 2.4; t += 0.15, i++) tl.at(t, { WingRCurl: i % 2 ? 0.15 : 0.35 });
      tl.at(2.4, { AccBoardText: 1, WingRCurl: 0.2, WingRRaise: -1.15, AngleX: 10, EyeBallX: 0.8 });
      tl.at(2.75, { AngleX: -4, EyeBallX: -0.2, MouthForm: 0.8, EyeRSmile: 0.6, WingRRaise: -0.6, WingRCurl: 0 });
      tl.at(3.1, { WingRRaise: 0 }).at(3.2, { AccChalk: 0 }).at(3.4, { AngleX: 0, EyeBallX: 0, MouthForm: 0, EyeRSmile: 0, AccBlackboard: 1, AccBoardText: 1, AccChalk: 0, WingRRaise: 0 });
    },
  ),
  clip(
    {
      id: 'edu_point_board', category: 'education', kind: 'oneshot', duration: 2.4, loop: false, next: 'edu_teach', from: 'blackboard with text', to: 'blackboard with text',
      accessories: ['AccBlackboard', 'AccBoardText'],
      title: 'Pointing at the board', description: 'Points at the blackboard with the wing, looks at it, then back at the learner: "look here!".',
      scenarios: ['highlight the lesson content'],
    },
    (tl) => {
      tl.at(0, { ...BOARD, WingRRaise: 0, WingRSpread: 0, AngleX: 0, EyeBallX: 0, MouthForm: 0, BrowRY: 0 }, 'outBack');
      tl.at(0.35, { WingRRaise: -1, WingRSpread: 0.1, AngleX: 12, EyeBallX: 0.8, BrowRY: 0.4 }, 'inOutSine');
      tl.at(1.0, { AngleX: 12, EyeBallX: 0.8 }).at(1.25, { AngleX: -2, EyeBallX: -0.2, MouthForm: 0.7 });
      syllables(tl, 1.1, 1.8, 0.7, 0.14);
      tl.at(1.85, { WingRRaise: -1, WingRSpread: 0.1 }).at(2.3, { WingRRaise: 0, WingRSpread: 0, AngleX: 0, EyeBallX: 0, MouthForm: 0, BrowRY: 0 });
      tl.at(2.4, BOARD);
    },
  ),
  clip(
    {
      id: 'edu_explain_grammar', category: 'education', kind: 'base', duration: 4, loop: true, accessories: ['AccBlackboard', 'AccBoardText', 'AccPointer'],
      title: 'Explaining grammar', description: 'At the blackboard with the pointer: explains to the learner, taps the example, explains again.',
      scenarios: ['grammar lesson', 'rule explanation'],
    },
    (tl) => {
      tl.at(0, { ...BOARD, AccPointer: 1, WingRRaise: -0.55, WingRSpread: 0.4, AngleX: -4, EyeBallX: -0.2, MouthForm: 0.5, BrowRY: 0.3, AngleZ: 4 });
      syllables(tl, 0, 1.3, 0.6, 0.15);
      tl.at(1.3, { WingRRaise: -0.55, AngleX: -4, EyeBallX: -0.2 }).at(1.6, { WingRRaise: -1, WingRSpread: 0, AngleX: 12, EyeBallX: 0.8, AngleZ: 0 });
      tl.at(1.9, { WingRRaise: -1.08 }).at(2.15, { WingRRaise: -1 }).at(2.4, { WingRRaise: -1.08 }).at(2.65, { WingRRaise: -1, AngleX: 12, EyeBallX: 0.8 });
      tl.at(3.0, { WingRRaise: -0.55, WingRSpread: 0.4, AngleX: -4, EyeBallX: -0.2, AngleZ: 4 });
      syllables(tl, 2.9, 4, 0.6, 0.15);
    },
  ),
  clip(
    {
      id: 'edu_pronounce', category: 'education', kind: 'base', duration: 2.8, loop: true, accessories: ['AccCard'],
      title: 'Demonstrating pronunciation', description: 'Shows the word card and says it slowly with exaggerated beak shapes ("ee", "oo", "ah").',
      scenarios: ['pronunciation exercise', 'listen and repeat'],
    },
    (tl) => {
      tl.at(0, { AccCard: 1, ...UP, MouthOpen: 0, MouthForm: 0, AngleX: 6, BrowRY: 0.5, EyeWide: 0.2, AngleY: 0 });
      tl.at(0.3, { MouthOpen: 0.75, MouthForm: 1, AngleY: 4 }).at(0.6, { MouthOpen: 0.1 });
      tl.at(0.9, { MouthOpen: 0.85, MouthForm: -0.6, AngleY: -3 }).at(1.2, { MouthOpen: 0.15 });
      tl.at(1.5, { MouthOpen: 1, MouthForm: 0.4, AngleY: 5 }).at(1.9, { MouthOpen: 0, MouthForm: 0, AngleY: 0 });
      tl.at(2.3, { BrowRY: 0.5, EyeWide: 0.2 });
    },
  ),
  clip(
    {
      id: 'edu_present_word', category: 'education', kind: 'oneshot', duration: 2.4, loop: false, next: 'edu_hold_card', to: 'holding the card',
      accessories: ['AccCard', 'FxSparkle'],
      title: 'Presenting a new word', description: 'Whips the word card up with a flourish and sparkles, excited "ta-da!", then holds it.',
      scenarios: ['vocabulary: new word', 'word of the day'],
    },
    (tl) => {
      tl.at(0, { AccCard: 0, WingLRaise: 0, FxSparkle: 0, EyeWide: 0, BrowRY: 0, EyeRSmile: 0, Squash: 0, MouthForm: 0 }, 'outQuad');
      tl.at(0.12, { Squash: 0.2 }).at(0.3, { AccCard: 1 }).at(0.38, { WingLRaise: 0.95, Squash: -0.15, EyeWide: 0.5, BrowRY: 0.7, MouthForm: 1 }, 'inOutSine');
      tl.at(0.6, { WingLRaise: 0.8, Squash: 0 }).at(0.5, { FxSparkle: 1 });
      syllables(tl, 0.35, 1.2, 0.85, 0.16);
      tl.at(1.6, { FxSparkle: 1, EyeWide: 0.5 }).at(2.1, { FxSparkle: 0, EyeWide: 0, BrowRY: 0, EyeRSmile: 0.3, MouthForm: 0.7 });
      tl.at(2.4, { AccCard: 1, WingLRaise: 0.8, MouthForm: 0.7, EyeRSmile: 0.3 });
    },
  ),
  clip(
    {
      id: 'edu_correct_answer', category: 'education', kind: 'oneshot', duration: 2.6, loop: false, next: 'idle_main',
      title: 'Correcting an answer', description: 'A gentle "not quite": small head shake, points to the right answer, then a reassuring nod.',
      scenarios: ['show the correct answer after a mistake'],
    },
    (tl) => {
      tl.at(0, { AngleX: 0, BrowRAngle: 0, MouthForm: 0, WingRRaise: 0, EyeBallX: 0, EyeRSmile: 0, AngleY: 0 });
      tl.at(0.15, { AngleX: 8, BrowRAngle: 0.4, MouthForm: -0.2 }).at(0.35, { AngleX: -8 }).at(0.55, { AngleX: 5 }).at(0.75, { AngleX: 0 });
      tl.at(1.05, { WingRRaise: -1, AngleX: 12, EyeBallX: 0.8, BrowRAngle: 0, MouthForm: 0.4 }).at(1.9, { WingRRaise: -1, AngleX: 12, EyeBallX: 0.8 });
      tl.at(2.15, { WingRRaise: 0, AngleX: 0, EyeBallX: 0, EyeRSmile: 0.7, MouthForm: 0.8, AngleY: -6 }).at(2.35, { AngleY: 2 });
      tl.restAll(2.6);
    },
  ),
  clip(
    {
      id: 'edu_celebrate_correct', category: 'education', kind: 'oneshot', duration: 2.2, loop: false, next: 'idle_main', accessories: ['FxSparkle'],
      title: 'Celebrating a correct answer', description: 'Jumps with both wings up, joyful face, tail fanned and sparkles, two happy flaps, lands.',
      scenarios: ['correct answer'],
    },
    (tl) => {
      const joy = expr('joyful');
      tl.at(0, { BodyY: 0, Squash: 0, WingRRaise: 0, WingRSpread: 0, WingLRaise: 0, WingLSpread: 0, FxSparkle: 0, TailFan: 0, ...Object.fromEntries(Object.keys(joy).map((k) => [k, k === 'EyeROpen' ? 1 : 0])) }, 'outQuad');
      tl.at(0.15, { Squash: 0.35 }, 'outQuad');
      tl.at(0.35, { BodyY: -60, Squash: -0.45, WingRRaise: 1, WingRSpread: 1, WingLRaise: 1, WingLSpread: 1, FxSparkle: 1, TailFan: 1, ...joy }, 'outQuad');
      tl.at(0.6, { BodyY: -80, Squash: -0.1 }, 'inQuad').at(0.85, { BodyY: 0, Squash: 0.3 }, 'outQuad').at(1.0, { Squash: 0 });
      tl.at(1.15, { WingRRaise: 0.75, WingLRaise: 0.75 }).at(1.35, { WingRRaise: 1, WingLRaise: 1 }).at(1.55, { WingRRaise: 0.75, WingLRaise: 0.75 });
      tl.at(1.8, { WingRRaise: 0, WingRSpread: 0, WingLRaise: 0, WingLSpread: 0, FxSparkle: 0, TailFan: 0 });
      tl.restAll(2.2);
    },
  ),
];
