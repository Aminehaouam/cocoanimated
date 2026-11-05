# Coco integration guide

How to put Coco in the web app: what to ship, how to call `coco.play("correct")`, how to size,
load and test it, and how to regenerate or extend the animations.

Rev2D is the authoring tool, not the runtime: the browser never loads `coco.r2d.json`. The export
renders every clip with Rev2D into a WebP spritesheet, and a small dependency-free player
(`web/coco-player.js`) draws the frames on a `<canvas>`. Why spritesheets and not Spine, GIF or PNG
sequences is in [§10](#10-export-formats-evaluated).

## 1. What to ship

| File | From | What it is |
| --- | --- | --- |
| `coco-player.js` | `web/` | The player: an ES module with no dependencies (≈ 15 KB unminified). |
| `coco-player.d.ts` | `web/` | TypeScript declarations (optional). |
| `presets.json` | `web/` | App scenario → clips → what follows. Product can tune it without touching code. |
| `spritesheets/manifest.json` | `exports/spritesheets/` | Every clip: sheet file, frames, grid, fps, loop, duration, canvas offset, reduced-motion poster frame, follow-up. 35 KB. |
| `spritesheets/<clip>.webp` | `exports/spritesheets/` | 90 sheets, 17.3 MB in all (54–474 KB each, median 180 KB), loaded only when played. |

A typical layout, in a Vite, Next.js or similar app:

```
src/coco/coco-player.js          (+ coco-player.d.ts)   imported by the app code
public/coco/v1/presets.json
public/coco/v1/spritesheets/      manifest.json + *.webp
```

Put the static files under a **versioned folder** (`/coco/v1/`) and serve them with a long cache
lifetime (`Cache-Control: public, max-age=31536000, immutable`). After a re-export, copy them into
`/coco/v2/` and change the URL; this avoids mixing old sheets with a new manifest.

## 2. Quick start

```html
<div id="coco" style="width: 220px"></div>
<script type="module">
  import { CocoPlayer } from '/src/coco/coco-player.js';

  const coco = await CocoPlayer.create(document.getElementById('coco'), {
    manifestUrl: '/coco/v1/spritesheets/manifest.json',
    presetsUrl: '/coco/v1/presets.json',
  });
  coco.play('welcome');                 // waves, then goes back to its idle
</script>
```

`create()` adds a `<canvas>` to the container (it fills the container's width and keeps its aspect
ratio), loads the manifest and presets, and starts `idle_main`. It rejects if any of these fail to
load, so the app can hide Coco instead of showing an empty box.

Wire the app's events to presets:

```js
quiz.on('question', () => coco.play('question'));          // thinks (loop)
quiz.on('answer-selected', () => coco.play('answer_selected'));
quiz.on('checked', (ok) => coco.play(ok ? 'correct' : 'incorrect'));
quiz.on('finished', () => coco.play('lesson_complete'));
voice.on('listening', () => coco.play('voice_listen'));
voice.on('thinking', () => coco.play('voice_think'));
voice.on('speaking', () => coco.play('voice_talk'));
voice.on('done', () => coco.play('idle'));
addEventListener('offline', () => coco.play('offline'));
addEventListener('online', () => coco.play('idle'));
```

The demo page plays every preset and clip. Serve the `COCO_ANIMATION_SYSTEM/` folder and open
`web/demo.html` (for example: `python3 -m http.server` in that folder, then
`http://localhost:8000/web/demo.html`).

## 3. App presets

`web/presets.json` maps each app scenario to clips. One-shots play in order, then the follow-up
plays (`then`, else the clip's own `next`, else `idle_main`); a looping last clip keeps playing until
the app asks for something else. Sizes are the WebP downloads of the preset's own clips.

| Preset | When | Plays | Then | Size |
| --- | --- | --- | --- | --- |
| `welcome` | App opening: Coco welcomes the user with a wave. | `comm_greet` (2.6 s) | `idle_main` | 154 KB |
| `new_user` | New user: Coco introduces itself. | `comm_introduce` (3.6 s) | `idle_main` | 189 KB |
| `returning_user` | Returning user: Coco welcomes the learner back. | `comm_greet` (2.6 s) → `emo_happy` (2.4 s) | `idle_main` | 291 KB |
| `lesson_start` | Lesson start: Coco introduces the activity enthusiastically. | `emo_excited` (2.4 s) → `comm_explain` (loop) | keeps looping | 336 KB |
| `question` | Question displayed: Coco looks at the question and thinks. | `comm_think` (loop) | keeps looping | 204 KB |
| `answer_selected` | Answer selected: Coco waits for the check. | `comm_wait` (loop) | keeps looping | 226 KB |
| `correct` | Correct answer: Coco celebrates. | `edu_celebrate_correct` (2.2 s) | `idle_main` | 158 KB |
| `incorrect` | Incorrect answer: a supportive reaction. | `comm_encourage` (2.2 s) | `idle_main` | 116 KB |
| `show_correction` | After a mistake: Coco points to the right answer. | `edu_correct_answer` (2.6 s) | `idle_main` | 135 KB |
| `lesson_complete` | Lesson completed: celebration with stars and confetti. | `rew_celebrate` (3 s) | `idle_main` | 334 KB |
| `new_landmark` | New landmark: Coco arrives in explorer gear. | `trv_fly_in` (2.4 s) → `trv_new_landmark` (2.8 s) | `trv_explore` | 417 KB |
| `explore` | Explore mode. | `trv_explore` (loop) | keeps looping | 302 KB |
| `vocabulary` | Vocabulary: Coco presents a new word. | `edu_present_word` (2.4 s) | `edu_hold_card` | 184 KB |
| `pronunciation` | Pronunciation: listen and repeat. | `edu_pronounce` (loop) | keeps looping | 184 KB |
| `voice_listen` | Voice chat: the learner speaks. | `comm_listen` (loop) | keeps looping | 195 KB |
| `voice_think` | Voice chat: Coco prepares an answer. | `comm_thinking_dots` (loop) | keeps looping | 93 KB |
| `voice_talk` | Voice chat: Coco talks. | `comm_talk` (loop) | keeps looping | 342 KB |
| `ai_processing` | AI processing: Coco thinks while waiting. | `comm_thinking_dots` (loop) | keeps looping | 93 KB |
| `offline` | No internet: Coco is confused. | `rx_offline` (loop) | keeps looping | 195 KB |
| `empty_chat` | Empty chat: Coco waits patiently. | `comm_wait` (loop) | keeps looping | 226 KB |
| `daily_streak` | Daily streak: Coco celebrates the achievement. | `rew_streak` (2.8 s) | `idle_main` | 264 KB |
| `level_up` | Level up. | `rew_level_up` (2.8 s) | `idle_main` | 474 KB |
| `hint` | A hint is available. | `comm_idea` (1.8 s) | `idle_main` | 139 KB |
| `goodbye` | End of session. | `comm_goodbye` (2.8 s) | `idle_main` | 153 KB |
| `sleep` | App inactive for a long time. | `rx_fall_asleep` (3.6 s) → `idle_sleep` (loop) | keeps looping | 380 KB |
| `wake_up` | Back after inactivity. | `idle_wake_up` (3 s) | `idle_main` | 177 KB |
| `idle` | Default state. | `idle_main` (loop) | keeps looping | 334 KB |
| `happy` | Generic positive reaction. | `emo_happy` (2.4 s) | `idle_main` | 138 KB |
| `thinking` | Generic thinking. | `comm_think` (loop) | keeps looping | 204 KB |
| `celebrate` | Generic celebration. | `rew_celebrate` (3 s) | `idle_main` | 334 KB |
| `listening` | Generic listening. | `comm_listen` (loop) | keeps looping | 195 KB |

Every clip id works with `play()` too (`coco.play('rx_dizzy')`); the full list with categories,
durations, parameters and accessories is in `animation_catalog.md`. To add or change a scenario,
edit `presets.json`:

```json
"streak_lost": { "play": "emo_sad", "then": "comm_encourage", "scenario": "The streak ended." }
```

`play` is a clip id or a list of clip ids; `then` (optional) is a preset name or clip id.
`npm run test:scenarios` then plays every preset in a browser and checks it ([§9](#9-testing)).

## 4. Player API

### `CocoPlayer.create(container, options)` → `Promise<CocoPlayer>`

| Option | Default | |
| --- | --- | --- |
| `manifestUrl` | `"manifest.json"` | URL of the manifest; the sheet files are resolved next to it. |
| `presetsUrl` / `presets` | none | URL of `presets.json`, or the parsed object (for example imported by the bundler). |
| `stage` | `[0, 0, 1024, 1024]` | The region of Coco's canvas to show, in canvas px ([§6](#6-size-stage-and-sharpness)). |
| `idle` | `"idle_main"` | The clip that plays when nothing else does. |
| `label` | `"Coco the parrot"` | Accessible name of the canvas; `null` makes it decorative ([§7](#7-accessibility)). |
| `reducedMotion` | `"auto"` | `"auto"` follows `prefers-reduced-motion` (live), or `true` / `false`. |
| `autoplay` | `true` | Start the idle immediately. With `false`, the first `play()` call starts Coco. |
| `maxSheets` | `8` | Decoded sheets kept in memory; the least recently used ones are dropped. |
| `crossOrigin` | none | Set to `"anonymous"` when the sheets come from a CDN on another origin. |
| `renderer` | `SpritesheetRenderer` | Another renderer object ([§11](#11-replacing-the-renderer)). |

### Methods

| Method | |
| --- | --- |
| `play(name, { then, loop, restart })` → `Promise<boolean>` | Play a preset or a clip id. `then`: what follows the last one-shot (a preset or clip id; `false` holds the last frame). `loop`: override whether the last clip loops. `restart`: start a loop over even if it is already running. Resolves `true` once the clips have played (a looping last clip: once it has started), `false` if another `play()` or `stop()` took over first, or a sheet failed to load. |
| `stop()` | Freeze on the current frame and cancel the follow-up. |
| `preload(names)` | Load the sheets of presets or clips ahead of time (a name or a list of names). |
| `setFacing('left' \| 'right')` | Mirror Coco (the master art faces right). |
| `setReducedMotion('auto' \| true \| false)` | Change the reduced-motion mode. |
| `setLabel(text \| null)` | Change the accessible name. |
| `on(event, fn)` → unsubscribe | `"start"` `{id, loop}`, `"end"` `{id}` (a one-shot finished), `"event"` `{id, t, name, data}` (animation events in the manifest), `"error"` `{id, error}` (a sheet failed; without listeners it goes to `console.error`). |
| `has(name)`, `clips`, `presetNames`, `looping`, `resolve(name)` | Introspection. |
| `destroy()` | Stop, remove the canvas, release the sheets and listeners. |

### Behaviour worth knowing

- **Interrupting is always safe.** A new `play()` replaces the running sequence and its follow-up.
  The previous clip keeps animating until the new clip's sheet is ready, so Coco never blanks or
  freezes while a sheet downloads.
- **Repeated calls are cheap.** Asking for the loop that is already running (for example
  `voice_listen` on every audio chunk) leaves it running; pass `{ restart: true }` to start it over.
- **Chaining.** `await coco.play('correct', { then: false })` holds the last frame, so the app can
  decide what comes next. Without `then: false` the preset's follow-up starts automatically.
- **Timing.** Frames follow the clock (`requestAnimationFrame`), not the display rate, and are drawn
  only when the frame changes (15 or 20 times a second). When the tab is hidden, the browser
  pauses the animation; when it comes back, a one-shot that should have ended moves on to its
  follow-up.

## 5. Framework examples

### React (hook)

```jsx
import { useEffect, useRef, useState } from 'react';
import { CocoPlayer } from './coco/coco-player.js';

const COCO = { manifestUrl: '/coco/v1/spritesheets/manifest.json', presetsUrl: '/coco/v1/presets.json' };

/** Mounts Coco in the element of the returned ref; `coco` is null until it is ready. */
export function useCoco(options = COCO) {
  const ref = useRef(null);
  const [coco, setCoco] = useState(null);
  useEffect(() => {
    let player = null;
    let cancelled = false;
    CocoPlayer.create(ref.current, options).then(
      (p) => { if (cancelled) p.destroy(); else setCoco((player = p)); },
      (error) => console.error(error),
    );
    return () => { cancelled = true; player?.destroy(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, coco];
}

export function QuizCoco({ result }) {
  const [ref, coco] = useCoco();
  useEffect(() => {
    if (result) coco?.play(result.correct ? 'correct' : 'incorrect');
  }, [coco, result]);
  return <div ref={ref} style={{ width: 200 }} />;
}
```

The `cancelled` flag makes it safe under React's StrictMode, where effects run twice.

### Vue 3

```vue
<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { CocoPlayer } from '@/coco/coco-player.js';

const props = defineProps({ scenario: { type: String, default: 'idle' }, facing: { type: String, default: 'right' } });
const box = ref(null);
let coco = null;
let unmounted = false;

onMounted(async () => {
  const player = await CocoPlayer.create(box.value, {
    manifestUrl: '/coco/v1/spritesheets/manifest.json',
    presetsUrl: '/coco/v1/presets.json',
    autoplay: false,
  });
  if (unmounted) return player.destroy();
  coco = player;
  coco.setFacing(props.facing);
  coco.play(props.scenario);
});
watch(() => props.scenario, (name) => coco?.play(name));
watch(() => props.facing, (side) => coco?.setFacing(side));
onBeforeUnmount(() => { unmounted = true; coco?.destroy(); });
defineExpose({ play: (name, options) => coco?.play(name, options) });
</script>

<template><div ref="box" class="coco" /></template>
```

A prop works for states (the voice-chat phase); for one-off reactions such as two correct answers
in a row, call `play()` through the exposed method (`cocoRef.value.play('correct')`).

### TypeScript

`coco-player.d.ts` sits next to the player and types the options, events, manifest and presets
(checked with `tsc --strict`).

## 6. Size, stage and sharpness

The canvas shows a **stage**, a rectangle of Coco's 1024 × 1024 canvas, at the export scale
(0.375): a stage `w` px wide gives a canvas `0.375 × w` px wide. CSS then sets the displayed size.

| Stage | `stage` | Canvas | Use |
| --- | --- | --- | --- |
| Full (default) | `[0, 0, 1024, 1024]` | 384 × 384 | Everything, including the props, fly-ups and the peek wall. |
| Character | `[96, 0, 896, 936]` | 336 × 351 | Coco with spread wings and props; only the travel entrances and exits, the edges of the peek wall and the top 4 px of the highest jump leave the frame. |
| Bust | `[330, 200, 420, 420]` | 158 × 158 | Chat avatar: head and chest. Big gestures leave the frame. |

`previews/scenarios/stage_bust.png` and `stage_character.png` show the two crops.

**Sharpness.** A canvas stays sharp up to its own width in CSS px on standard screens, and half of
that on high-DPI (2×) screens. For example, the full stage (384 px) is sharp up to 192 CSS px wide on
a phone, and the bust (158 px) up to 79 CSS px. For larger display, export a second set at twice
the scale (about 2.2× the bytes: `idle_main` is 342 KB at 1× and 765 KB at 2×) and pick it by
device:

```bash
npm run export -- --scale 0.75 --out exports/spritesheets@2x
```

```bash
npm run webp -- exports/spritesheets@2x
```

```js
const set = devicePixelRatio > 1.5 ? 'spritesheets@2x' : 'spritesheets';
const coco = await CocoPlayer.create(el, { manifestUrl: `/coco/v1/${set}/manifest.json`, presetsUrl: '/coco/v1/presets.json' });
```

**Anchor.** Every clip is drawn at its true position on Coco's canvas (the manifest's `origin`),
so Coco's feet stay at the canvas anchor (512, 893) across clips; switching clips never makes Coco
jump.

## 7. Accessibility

- **Name.** The canvas is `role="img"` with `aria-label="Coco the parrot"` by default. Where the app
  already says what happened in text ("Correct!"), make Coco decorative with `label: null`
  (`aria-hidden="true"`). Do not put information only in Coco's animation.
- **Reduced motion.** With `prefers-reduced-motion: reduce` (or `reducedMotion: true`), each clip
  shows one still **poster frame** (the key pose in the middle of a one-shot, the landed end of an
  entrance, the first frame of a loop) for the clip's normal duration, so app flows, follow-ups and
  `play()` promises behave the same. The mode follows the system setting live.
- **Flashes.** The only flash is the single camera flash in `trv_photo`, well under the three
  flashes a second limit.
- **Focus.** The canvas is not focusable and has no keyboard behaviour; the app's buttons stay the
  controls.

## 8. Loading and performance

| What | Download |
| --- | --- |
| First paint (manifest + `idle_main`) | ≈ 370 KB |
| A lesson's presets (start, question, answer, correct, incorrect, correction, complete + idle) | 1.8 MB |
| Voice chat (listen, think, talk + idle) | 0.9 MB |
| All 29 clips used by the presets | 5.9 MB |
| The whole library (90 clips) | 17.3 MB, never needed at once |

- Sheets load when first played. Preload what the next screen needs, for example
  `coco.preload(['correct', 'incorrect', 'lesson_complete'])` when a lesson starts, so reactions
  start without delay.
- Memory: a decoded sheet takes 4 bytes per pixel, about 12 MB for a typical one-shot, 16 MB for an
  8 s loop and 38 MB for the largest (`trv_fly_out`). `maxSheets` (default 8) bounds what the player
  keeps; the idle and the clips playing are never dropped. Lower it on low-memory devices.
- CPU: one `drawImage` per frame change. If Coco sits in a long scrolling page, `coco.stop()` when it
  leaves the viewport and `coco.play('idle')` when it returns (for example with an
  `IntersectionObserver`).
- Sheets on another origin: set `crossOrigin: 'anonymous'` and serve them with
  `Access-Control-Allow-Origin`. A Content Security Policy must allow them in `img-src`; the player
  needs no `script-src` exceptions.

## 9. Testing

`npm run test:scenarios` (`web/scenario-test.mjs`) runs the real player in headless Chromium
through `web/demo.html`:

- Every preset: its clips start in order, the canvas is drawn, and the right follow-up starts. It
  saves a screenshot per preset (`previews/scenarios/<preset>.png`), an overview
  (`previews/scenarios/overview.png`) and `previews/scenarios/results.json`.
- The player: interruption, keeping a running loop, `then: false`, mirroring, reduced motion (a
  still frame, same timing and follow-up), animation events (a one-shot, and a loop on two passes),
  a missing sheet (an `error` event while the idle keeps playing), and the bust and character
  stages.
- Any page error, console error or failed request fails the run.

## 10. Export formats evaluated

| Format | Verdict | Findings |
| --- | --- | --- |
| **WebP spritesheets + manifest + CocoPlayer** | **Chosen** | The Rev2D renders of the model that passed QC, as lossy WebP (quality 86, 8-bit alpha, so soft edges and gradients survive). No runtime dependency or licence. Works in every framework and every current browser. Lazy loading per clip, sizes in §8. Limit: frames are pre-rendered, so there is no live parametric control (lip sync to arbitrary audio, look-at); the talk loops cover speech. |
| PNG spritesheets | Fallback | Same frames, 35.5 MB; `npm run export` without `npm run webp`. |
| PNG sequences | For other tools | One RGBA PNG per frame (`npm run export -- --sequence <ids>`, any `--scale`), for video editing or engines that want frames. Too many requests for a web page. |
| GIF | Previews only | `exports/gifs/` (90 clips, 18 MB): 256 colours and 1-bit transparency (a jagged halo on coloured backgrounds). Fine for docs, reviews and chat, not for the app. |
| **Spine 4.2** (`rev2d export spine`) | Optional, not adopted | A sample of 4 clips is in `exports/spine/` with its export report. 176 bones (115 of them stand in for the 10 warps), 203 slots, 16 clipping attachments; `coco.json` is 6.9 MB (2.3 MB gzipped): 3.8 MB of setup plus 0.5–1.3 MB per clip, because parameters, warps and physics are baked into keys. The full library would be larger than the spritesheets. Masks become hard-edged clipping polygons (Spine clips on the CPU, so 16 clips cost frame time), gradients on morphing wings stretch, and one mask union (the scarf stripes) is approximated. The Spine runtimes require a Spine Editor licence. The sample was not checked in a Spine runtime. |
| Live2D motions (`rev2d export live2d`) | Not applicable | These are parameter curves for a Live2D model built in Cubism Editor. Coco has no `.moc3` model (Rev2D cannot write one). |
| Rev2D model in the browser | Not used | Rev2D is an authoring tool: its renderer rasterises on the CPU and is not built as a production runtime. |

## 11. Replacing the renderer

`CocoPlayer` only needs an object with `facing`, `load(id)` (a promise of anything), and
`draw(id, sheet, frame)`, plus optional `pin(ids)` and `dispose()`. Pass it as `renderer` and the app
code (`play`, presets, events) stays the same. For example, a Spine renderer would load the skeleton
once, map clip ids to Spine animations and draw by time instead of frame number.

## 12. Regenerating and extending

From `COCO_ANIMATION_SYSTEM/`, with Rev2D next to the repository (README):

```bash
npm run build && npm run qc
```

```bash
npm run export && npm run webp
```

```bash
npm run test:scenarios
```

- `build` regenerates `rev2d/models/coco.r2d.json` from the TypeScript sources and refuses to write
  it with validation errors; `qc` renders the evidence and refreshes `animation_catalog.md` (every
  clip must pass); `export` renders the sheets and the manifest (2.5 minutes); `webp` converts
  them.
- **A new animation:** add a clip to `animations/<category>/<category>.ts` (Timeline helpers in
  `animations/lib.ts`, accessories by their `Acc*` parameters), list it in `animations/index.ts`, run
  `build` and `qc`, then export only that clip (`npm run export -- <id>`, `npm run webp`): the
  manifest keeps the other clips. Add a preset if the app should call it by scenario.
- **A new accessory:** add it in `accessories/<group>/`; it is a separate set of parts with its own
  `Acc*` parameter, never part of the body art.
- **Changing Coco's look** (colours, shapes) means a rebuild and a full re-export; deploy it under a
  new version folder (§1).

## 13. Troubleshooting

| Symptom | Cause |
| --- | --- |
| `create()` rejects with `HTTP 404` | `manifestUrl` or `presetsUrl` is wrong; relative URLs resolve against the page. |
| Coco does not appear, an `error` event names a clip | Its `.webp` is missing next to the manifest, or served with the wrong type. |
| `unknown preset or clip` | A typo in `play()`, or a preset in `presets.json` names a clip missing from the manifest (the test catches this). |
| Coco looks soft | The canvas is displayed larger than its pixels: use a smaller stage, a smaller display size or the 2× export (§6). |
| Coco is cut off | The stage is too tight for that clip; use the full or character stage. |
| Animation does not move | Reduced motion is on (system setting or `reducedMotion: true`). |
