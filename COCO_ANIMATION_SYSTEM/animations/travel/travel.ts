/**
 * Travel: props and outfits for exploring, plus flight (take off → fly → land, fly in / out of the
 * screen). Flight pose: body tilted forward, legs tucked, tail lifted, wings flapping.
 */
import { expr } from '../../character/expressions/expressions.ts';
import { HOLD, UP } from '../../accessories/education/education.ts';
import { EYE } from '../../accessories/travel/travel.ts';
import { clip, type Clip, type Timeline } from '../lib.ts';
import { blink, flap, zeros } from '../kit.ts';
import { syllables } from '../communication/communication.ts';

/** Body in flight (the wings flap on top of it). */
export const FLIGHT = { BodyY: -160, LegTuck: 1, BodyAngleZ: 10, TailLift: 0.5, EyeRSmile: 0.5, MouthForm: 1 };

/** Look at a held prop, then at the learner, smiling. */
function admire(tl: Timeline, t0: number, t1: number): void {
  tl.at(t0, { AngleY: -8, EyeBallY: -0.6, EyeBallX: 0.4 }).at(t0 + 0.6, { AngleY: -8, EyeBallY: -0.6 });
  tl.at(t0 + 0.9, { AngleY: 0, EyeBallY: 0, EyeBallX: -0.1 }).at(t1, { AngleY: 0, EyeBallY: 0, EyeBallX: -0.1 });
}

const loopProp = (id: string, title: string, description: string, scenarios: string[], accessories: string[], duration: number, build: (tl: Timeline) => void): Clip =>
  clip({ id, category: 'travel', kind: 'base', duration, loop: true, title, description, scenarios, accessories }, build);

export const TRAVEL_CLIPS: Clip[] = [
  loopProp('trv_backpack', 'Wearing a backpack', 'Backpack on, wing on the chest, bouncing on its toes, ready to go.', ['trip start', 'new destination unlocked'], ['AccBackpack'], 3, (tl) => {
    tl.at(0, { AccBackpack: 1, WingRRaise: -0.62, WingRCurl: 0.95, EyeRSmile: 0.6, MouthForm: 1, AngleX: 10, BodyY: 0 }, 'smooth');
    tl.at(0.75, { BodyY: -8 }, 'smooth').at(1.5, { BodyY: 0 }, 'smooth').at(2.25, { BodyY: -8 }, 'smooth');
  }),
  loopProp('trv_passport', 'Holding a passport', 'Shows the passport proudly, glances at it, smiles at the learner.', ['travel documents', 'country unlocked'], ['AccPassport'], 3, (tl) => {
    tl.at(0, { AccPassport: 1, ...HOLD, MouthForm: 0.8, EyeRSmile: 0.4, AngleY: 0, EyeBallY: 0, EyeBallX: -0.1 });
    admire(tl, 0.6, 2.6);
  }),
  loopProp('trv_map', 'Looking at a map', 'Studies the map, looks up and around to get its bearings, back to the map.', ['route planning', 'choose the next lesson'], ['AccMap'], 4, (tl) => {
    tl.at(0, { AccMap: 1, ...HOLD, AngleY: -10, EyeBallY: -0.7, EyeBallX: 0.2, AngleX: 4, BrowRY: 0.3 });
    tl.at(0.8, { EyeBallX: 0.7 }).at(1.4, { AngleY: -10, EyeBallY: -0.7 }).at(1.8, { AngleY: 4, EyeBallY: 0.2, AngleX: 14, EyeBallX: 0.8 });
    tl.at(2.5, { AngleX: -8, EyeBallX: -0.6 }).at(3.2, { AngleX: 4, AngleY: -10, EyeBallY: -0.7, EyeBallX: 0.2 });
  }),
  loopProp('trv_suitcase', 'With a suitcase', 'Stands by its suitcase, wing resting on it, tapping a foot, looking around expectantly.', ['packing', 'departure'], ['AccSuitcase'], 3, (tl) => {
    tl.at(0, { AccSuitcase: 1, MouthForm: 0.6, AngleX: 0, FootLY: 0 });
    tl.at(0.4, { FootLY: -12 }).at(0.55, { FootLY: 0 }).at(0.8, { FootLY: -12 }).at(0.95, { FootLY: 0 });
    tl.at(1.4, { AngleX: 12 }).at(2.2, { AngleX: 12 }).at(2.7, { AngleX: 0 });
    blink(tl, 1.9);
  }),
  clip({ id: 'trv_photo', category: 'travel', kind: 'oneshot', duration: 2.6, loop: false, next: 'idle_main', accessories: ['AccCamera', 'FxFlash'], title: 'Taking a photograph', description: 'Raises the camera to the eye, click (flash), lowers it with a big smile.', scenarios: ['landmark visit', 'photo memory'] }, (tl) => {
    tl.at(0, { AccCamera: 0, WingRRaise: 0, WingRCurl: 0, FxFlash: 0, Squash: 0, EyeRSmile: 0, MouthForm: 0 });
    tl.at(0.2, { AccCamera: 1 }).at(0.5, EYE).at(1.1, { ...EYE, FxFlash: 0, Squash: 0 }, 'outQuad');
    tl.at(1.15, { FxFlash: 1, Squash: 0.06 }).at(1.4, { FxFlash: 0, Squash: 0 }).at(1.7, EYE);
    tl.at(2.0, { WingRRaise: 0, WingRCurl: 0, EyeRSmile: 0.8, MouthForm: 1 }).at(2.3, { AccCamera: 0 });
    tl.restAll(2.6);
  }),
  loopProp('trv_binoculars', 'Using binoculars', 'Scans the horizon through binoculars, turning slowly left and right.', ['explore the map', 'spot the next destination'], ['AccBinoculars'], 4, (tl) => {
    tl.at(0, { AccBinoculars: 1, ...EYE, AngleX: -10, BodyAngleX: -4, MouthForm: 0.2 }, 'inOutSine');
    tl.at(1.6, { AngleX: 12, BodyAngleX: 4 }).at(2.2, { AngleX: 12, BodyAngleX: 4 });
  }),
  loopProp('trv_boarding_pass', 'Holding a boarding pass', 'Waves the boarding pass beside the head, excited, glancing at it.', ['flight booked', 'next level ticket'], ['AccBoardingPass'], 3, (tl) => {
    tl.at(0, { AccBoardingPass: 1, ...UP, EyeRSmile: 0.6, MouthForm: 1, BodyY: 0, AngleX: 0, EyeBallX: 0 }, 'smooth');
    tl.at(0.75, { BodyY: -8, WingLRaise: 0.86 }, 'smooth').at(1.5, { BodyY: 0, WingLRaise: 0.8, AngleX: 8, EyeBallX: 0.9 }, 'smooth').at(2.25, { BodyY: -8, WingLRaise: 0.86, AngleX: 0, EyeBallX: 0 }, 'smooth');
  }),
  loopProp('trv_explore', 'Exploring', 'Explorer hat and backpack on: leans forward, looks far left and right, points ahead.', ['new landmark', 'explore mode'], ['AccExplorerHat', 'AccBackpack'], 4, (tl) => {
    tl.at(0, { AccExplorerHat: 1, AccBackpack: 1, ...expr('curious'), BodyAngleZ: 5, AngleX: 14, EyeBallX: 0.8, WingRRaise: 0 });
    tl.at(1.2, { AngleX: -10, EyeBallX: -0.7 }).at(1.9, { AngleX: -10, EyeBallX: -0.7 }).at(2.4, { AngleX: 14, EyeBallX: 0.8, WingRRaise: -1, WingRSpread: 0.1 });
    tl.at(3.4, { WingRRaise: -1, WingRSpread: 0.1 }).at(3.8, { WingRRaise: 0, WingRSpread: 0 });
  }),
  loopProp('trv_raincoat', 'Wearing a raincoat', 'Yellow raincoat and hood, umbrella up: content in the rain, gentle sway, looking up.', ['rainy destination', 'weather vocabulary'], ['AccRaincoat', 'AccRaincoatHood', 'AccUmbrella'], 3, (tl) => {
    tl.at(0, { AccRaincoat: 1, AccRaincoatHood: 1, AccUmbrella: 1, ...UP, AngleY: 10, EyeRSmile: 0.6, MouthForm: 0.8, BodyAngleZ: -2 }, 'smooth');
    tl.at(1.5, { BodyAngleZ: 2, AngleY: 6 }, 'smooth');
  }),
  loopProp('trv_compass', 'Looking at a compass', 'Studies the compass, turning to find north, then a satisfied nod.', ['directions', 'orientation'], ['AccCompass'], 3, (tl) => {
    tl.at(0, { AccCompass: 1, ...HOLD, AngleY: -10, EyeBallY: -0.7, BodyAngleX: 0, BrowRY: 0.3 });
    tl.at(0.8, { BodyAngleX: -6 }).at(1.6, { BodyAngleX: 6 }).at(2.2, { BodyAngleX: 0, AngleY: 0, EyeBallY: 0, EyeRSmile: 0.5 }).at(2.45, { AngleY: -6 }).at(2.7, { AngleY: -10, EyeBallY: -0.7, EyeRSmile: 0 });
  }),
  clip({ id: 'trv_take_off', category: 'travel', kind: 'oneshot', duration: 1.6, loop: false, next: 'trv_fly', to: 'trv_fly', title: 'Taking off', description: 'Crouches, springs up with big flaps, tucks the legs: ends in the flight pose.', scenarios: ['start a journey', 'leave the screen'] }, (tl) => {
    tl.at(0, { ...zeros(FLIGHT), Squash: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 }, 'outQuad');
    tl.at(0.25, { Squash: 0.4, WingRRaise: 0.3, WingLRaise: 0.3, WingRSpread: 0.6, WingLSpread: 0.6 }, 'inQuad');
    tl.at(0.45, { Squash: -0.3, BodyY: -60 }).at(0.6, { Squash: 0 }).at(1.6, { ...FLIGHT });
    flap(tl, 0.45, 1.45, 1, 0.25, 0.25);
    tl.at(1.6, { WingRRaise: 1, WingLRaise: 1, WingRSpread: 1, WingLSpread: 1 });
  }),
  clip({ id: 'trv_fly', category: 'travel', kind: 'base', duration: 0.8, loop: true, from: 'flight', title: 'Flying', description: 'Flight loop: wings flap, the body lifts on each downstroke, legs tucked, tail up.', scenarios: ['travelling between destinations', 'map transitions'] }, (tl) => {
    tl.at(0, { ...FLIGHT, WingRRaise: 1, WingLRaise: 1, WingRSpread: 1, WingLSpread: 1, Squash: 0 }, 'inOutSine');
    tl.at(0.4, { WingRRaise: 0.25, WingLRaise: 0.3, BodyY: -172, Squash: -0.05 }, 'inOutSine');
  }),
  clip({ id: 'trv_land', category: 'travel', kind: 'oneshot', duration: 1.6, loop: false, next: 'idle_main', from: 'trv_fly', title: 'Landing', description: 'Glides down with wings braking, legs reach for the ground, squashes on touchdown, folds the wings.', scenarios: ['arrive at a destination'] }, (tl) => {
    tl.at(0, { ...FLIGHT, WingRRaise: 1, WingLRaise: 1, WingRSpread: 1, WingLSpread: 1, Squash: 0 }, 'inQuad');
    tl.at(0.5, { WingRRaise: 0.8, WingLRaise: 0.8 }).at(0.8, { LegTuck: 0, BodyAngleZ: -4 }).at(1.0, { BodyY: 0, TailLift: 0 }, 'outQuad');
    tl.at(1.05, { Squash: 0.35 }).at(1.35, { Squash: 0, BodyAngleZ: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 });
    tl.restAll(1.6);
  }),
  clip({ id: 'trv_fly_in', category: 'travel', kind: 'oneshot', duration: 2.4, loop: false, next: 'idle_main', from: 'off-screen left', title: 'Flying in', description: 'Flies in from the left edge, glides down and lands in place.', scenarios: ['screen entrance', 'app opening'] }, (tl) => {
    tl.at(0, { ...FLIGHT, BodyX: -800, BodyY: -170, Squash: 0 }, 'outSine');
    flap(tl, 0, 1.4, 1, 0.25, 0.2);
    tl.at(1.4, { BodyX: 0, BodyY: -60, WingRRaise: 0.85, WingLRaise: 0.85 }, 'inQuad').at(1.75, { BodyY: 0, LegTuck: 0, BodyAngleZ: -3, TailLift: 0 }, 'outQuad');
    tl.at(1.8, { Squash: 0.3 }).at(2.1, { Squash: 0, BodyAngleZ: 0, WingRRaise: 0, WingLRaise: 0, WingRSpread: 0, WingLSpread: 0 });
    tl.restAll(2.4);
  }),
  clip({ id: 'trv_fly_out', category: 'travel', kind: 'oneshot', duration: 2.4, loop: false, next: 'trv_fly_in', to: 'off-screen right', title: 'Flying out', description: 'Takes off and flies away to the right, out of the screen.', scenarios: ['screen exit', 'goodbye'] }, (tl) => {
    tl.at(0, { ...zeros(FLIGHT), BodyX: 0, Squash: 0 }, 'outQuad').at(0.2, { Squash: 0.35 }, 'inQuad').at(0.4, { Squash: 0, BodyY: -60 });
    flap(tl, 0.35, 2.35, 1, 0.25, 0.2);
    tl.at(0.9, { ...FLIGHT, BodyX: 60 }, 'inQuad').at(2.4, { ...FLIGHT, BodyX: 800, BodyY: -240 });
  }),
  clip({ id: 'trv_new_landmark', category: 'travel', kind: 'oneshot', duration: 2.8, loop: false, next: 'trv_explore', from: 'explorer outfit', to: 'explorer outfit', accessories: ['AccExplorerHat', 'AccBackpack', 'FxSparkle'], title: 'New landmark', description: 'In explorer gear: a delighted hop with sparkles, looks around amazed, then points at the landmark.', scenarios: ['new landmark unlocked'] }, (tl) => {
    const gear = { AccExplorerHat: 1, AccBackpack: 1 };
    tl.at(0, { ...gear, Squash: 0, BodyY: 0, FxSparkle: 0, EyeWide: 0, MouthForm: 0, WingRRaise: 0, AngleX: 0, EyeBallX: 0 }, 'outQuad');
    tl.at(0.15, { Squash: 0.25 }, 'outQuad').at(0.35, { BodyY: -30, Squash: -0.2, FxSparkle: 1, EyeWide: 0.7, MouthForm: 1 }, 'inQuad').at(0.55, { BodyY: 0, Squash: 0.1 }).at(0.7, { Squash: 0 });
    syllables(tl, 0.35, 1.0, 0.8, 0.14);
    tl.at(1.1, { AngleX: -10, EyeBallX: -0.6 }).at(1.5, { AngleX: 14, EyeBallX: 0.8, WingRRaise: -1, WingRSpread: 0.1 }).at(2.3, { WingRRaise: -1, FxSparkle: 1, EyeWide: 0.7 });
    tl.at(2.8, { ...gear, WingRRaise: 0, WingRSpread: 0, FxSparkle: 0, EyeWide: 0, AngleX: 0, EyeBallX: 0, MouthForm: 0 });
  }),
];
