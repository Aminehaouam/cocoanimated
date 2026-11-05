# Coco animation system — technical implementation plan

Status legend: ✅ done · 🔄 in progress · ⏳ planned. The progress report lives in `../README.md`.

## 1. What the inspection found

| Area | Finding | Consequence |
| --- | --- | --- |
| Application code | The `cocoanimated` repository was empty (no commits). Code search over the account's GitHub repositories found no Coco app (no "coco", "parrot", "mascot", "vocabulary" hits). | The animation system is built here as a self-contained package. **Frontend integration (Phase 7) needs the app's repository**; until then the web player is framework-agnostic with a demo page. |
| Existing mascot / animation libraries | None available to inspect (no app code). | The player has no dependencies, so it fits any stack (React, Vue, Svelte, plain DOM). |
| Rev2D | Official repo `RevStudio/Rev2D` (v0.1.0, MIT) cloned next to this repository and installed (`npm ci --ignore-scripts`). MCP server registered (`claude mcp add rev2d …`) and available; the CLI and library API are used by the build scripts. | Validation, renders, sheets, `inspect` and `analyze` come from Rev2D itself; nothing is guessed. |
| Source artwork | Three reference images; no clean, isolated, high-resolution or layered Coco can be extracted (details: `character_specification.md` §10). | Coco was redrawn as a **layered vector master** (Phase 1). |

Docs read before implementing: `rev2d_guide`, `AGENTS.md`, `docs/SPEC.md`, `docs/OPS.md`,
`docs/RECIPES.md`, `docs/AVATAR.md` (scope and limits), `rev2d_schema` (Part, Fill), `llms.txt`;
`docs/MCP.md`, `docs/CLI.md` and `docs/INTEROP.md` were consulted per phase (INTEROP for the
Spine / Live2D evaluation in Phase 7).

## 2. Architecture

```
character/      art: palette, landmarks, part outlines (TS)  ─┐
rev2d/rigs/     skeleton, parameters, bindings, physics (TS)  ├─► rev2d/source/build.ts ──► rev2d/models/coco.r2d.json
accessories/    props as parts + attachment ops (TS)          │     (Rev2D applyOps:            (one model: rig, accessories,
animations/     clips per category + metadata (TS)           ─┘      schema-checked, validated)    all animations)
                                                                                                     │
                       rev2d/source/qc.ts ◄──────────────────────────────────────────────────────────┤
                       renders, sweep sheets, contact sheets, analyze reports → previews/, character/  │
                                                                                                     ▼
                       rev2d/source/export.ts ──► exports/spritesheets (WebP + manifest), png_sequences
                       rev2d/source/qc.ts     ──► exports/gifs (previews)
                       rev2d export spine     ──► exports/spine (evaluation sample)
                                                                                                     ▼
                       web/ (CocoPlayer + presets.json) ──► coco.play("happy")
```

- **One master model** (`coco.r2d.json`) holds the rig, every accessory (hidden by default) and
  every animation, so all clips share one skeleton, canvas and anchor point.
- **Sources are code, the model is generated.** Never hand-edit the model; change the TS and
  rebuild. (Same approach as Rev2D's own example builders.)
- **Rev2D's ops do the rig maths**: bones by world position (`world`/`worldRotation`), pseudo-3D
  head turns (`bind_warp`), rigid accessories on a deforming head (`follow`), baking layered clips
  into single clips for export (`compose`).
- Run everything from `COCO_ANIMATION_SYSTEM/`: `npm run build`, `npm run qc`, `npm run export`,
  `npm run webp`, `npm run test:scenarios` (Rev2D's `tsx` runs the TS; `REV2D_HOME` points at the
  checkout, default `../Rev2D` next to the repo).

## 3. Master rig

### 3.1 Skeleton ✅ (Phase 1, `rev2d/rigs/skeleton.ts`)

`root` (ground, squash pivot) → `hips` → `chest` → `neck` → `head` → `beak` → `jaw`; wings
`wingR_arm → wingR_hand` (near), `wingL_arm → wingL_hand` (far); `tail → tailF1..3`; `legR`, `legL`
(thighs) and `footR`, `footL` on `root` (planted feet). Warps: `bodyWarp` (hips), `headWarp` (head)
⊃ `faceWarp` ⊃ `eyeWarp`.

### 3.2 Parameters ✅ (Phase 2 — the built set is in `rig_reference.md`; `Sit`, `CrestRuffle`, `Tear`, `Sweat` and the accessory/effect parameters come in later phases)

Live2D-standard names where one exists (so Rev2D's lip sync and Live2D/Spine interop work), signs as
in Rev2D SPEC §3.1.

| Group | Parameters | Drives |
| --- | --- | --- |
| Head | `AngleX` (turn; + = toward screen right = more profile), `AngleY` (+ = look up), `AngleZ` (tilt, + = clockwise) | `bind_warp` yaw/pitch on headWarp (gentle) and faceWarp (strong); beak follows the face (`follow`) and lengthens/shortens with the turn; head bone tilt |
| Eye | `EyeROpen` (0 closed … 1), `EyeRSmile` (happy ∩ eyes), `EyeWide` (surprise), `EyeBallX`, `EyeBallY` (gaze) | eye path morph (2-D grid open × smile), eyeWarp translate/scale, highlight fade |
| Brow | `BrowRY`, `BrowRAngle` (worried ↔ angry) | a brow stroke that fades in only when used |
| Beak | `MouthOpen` (0 … 1), `MouthForm` (−1 frown … +1 smile) | jaw rotation, mouth interior/tongue, smile-line morph |
| Body | `BodyAngleX` (turn), `BodyAngleZ` (lean), `Breath`, `Squash` (−1 stretch … +1 squash), `Jump` (px), `BodyX` (px), `Sit` | bodyWarp, hips/root bones |
| Wings (×2) | `WingRRaise`, `WingRSpread`, `WingRForward`, `WingRCurl`; `WingLRaise`, `WingLSpread` | arm/hand bone rotations, spread-wing morph, draw-order swap for wings in front of the face |
| Tail | `TailSwing` (physics output), `TailLift`, `TailFan` | tail bones |
| Legs | `FootRX/Y`, `FootLX/Y` (px), `LegTuck` | foot bones (steps, dancing, flight tuck) |
| Head feathers | `CrestRuffle` (physics output) | nape lobes / crown warp |
| Extras | `Blush`, `Tear`, `Sweat`, `Shadow` | opacity bindings |
| Accessories | `Acc<Name>` (0 hidden … 1 shown), e.g. `AccExplorerHat`, `AccBackpack` | opacity of each accessory |
| Effects | `Fx<Name>` + per-effect motion, e.g. `FxHearts`, `FxStars`, `FxConfetti`, `FxQuestion`, `FxZzz` | effect parts |

Physics: tail swing from body motion; head-feather ruffle from head motion. Verified with
`analyze --warmup` (no clamping, closed loop seams).

### 3.3 Accessories ✅ (Phase 6, `accessories/`: 47 accessories, effects and scene props)

Each accessory is a set of parts on **its own bone or small warp** attached next to what it rides on
(a hat on the head bone + `follow` onto the face warp; a backpack on the chest; a book on the
`wingR_hand` bone), hidden by default and shown by its `Acc*` parameter. Accessories are never
merged into the body art. Categories: education (book, pencil, blackboard, vocabulary card,
dictionary), travel (backpack, suitcase, passport, map, camera, binoculars, compass, boarding pass),
clothing (explorer hat, pilot hat, winter scarf, raincoat, sunglasses, headphones, graduation cap),
rewards (trophy, medal, crown, stars, hearts, confetti, gift).

## 4. Animation library

### 4.1 Conventions

- **Id:** `<category>_<action>` in snake case; categories `idle`, `comm`, `emo`, `edu`, `rew`,
  `trv`, `rx`. Example: `emo_happy`, `trv_map`, `rx_dizzy`.
- **Kinds:** *loops* (seamless, `analyze` seam check) and *one-shots* (start and end in the rest
  pose, or hand over to a named loop). Gestures that layer over an idle are authored **additively**
  around the parameter defaults (Rev2D layer mode `add`).
- **Metadata** (in each clip's definition, exported to the catalogue): id, category, duration, loop,
  parameters used, accessories, app scenario, status.
- **Export clips** are composed (`compose` op) from layers (idle base + gesture + blink) so that a
  player that plays one clip at a time shows exactly what the rig shows.

### 4.2 Planned clips

| Category | Clips |
| --- | --- |
| Idle | `idle_breathe`, `idle_blink`, `idle_look_around`, `idle_head_tilt`, `idle_feather_ruffle`, `idle_sway`, `idle_sleep`, `idle_wake_up`, `idle_main` (composed) |
| Communication | `comm_talk` (+ soft/excited intensities), `comm_listen`, `comm_think`, `comm_wait`, `comm_explain`, `comm_nod`, `comm_shake_head`, `comm_ask`, `comm_greet`, `comm_goodbye` |
| Emotions | `emo_happy`, `emo_excited`, `emo_proud`, `emo_curious`, `emo_confused`, `emo_surprised`, `emo_worried`, `emo_disappointed`, `emo_embarrassed`, `emo_playful`, `emo_reassuring`, `emo_mischievous` |
| Education | `edu_read_book`, `edu_teach`, `edu_hold_card`, `edu_write`, `edu_point_board`, `edu_explain_grammar`, `edu_pronounce`, `edu_present_word`, `edu_correct_answer`, `edu_celebrate_correct` |
| Rewards | `rew_jump`, `rew_fly_excited`, `rew_celebrate`, `rew_trophy`, `rew_medal`, `rew_crown`, `rew_heart`, `rew_confetti`, `rew_gift`, `rew_streak` |
| Travel | `trv_backpack`, `trv_passport`, `trv_map`, `trv_suitcase`, `trv_photo`, `trv_binoculars`, `trv_boarding_pass`, `trv_explore`, `trv_raincoat`, `trv_compass` |
| Reactions | `rx_startled`, `rx_suspicious`, `rx_hide`, `rx_peek`, `rx_lose_balance`, `rx_dizzy`, `rx_fall_asleep`, `rx_disappointed`, `rx_dramatic_surprise`, `rx_dance` |
| Added for UX | `comm_point_left/up/right` (direct attention to UI elements), `comm_idea` (hint available: light bulb), `comm_encourage` (supportive reaction after a wrong answer), `comm_thinking_dots` (AI processing), `rx_offline` (confused, no internet), `trv_fly_in` / `trv_fly_out` (enter / leave the screen), `trv_take_off` / `trv_land`, `rew_level_up` |

Expressions (static parameter presets: happy, sad, surprised, angry-ish "determined", sleepy,
skeptical, …) live in `character/expressions/` and are reused by the clips.

## 5. App presets (`coco.play(id)`)

A preset maps an **app scenario** to clips and what plays next. Implemented in `web/presets.json`
(✅ Phase 7): 31 presets covering every scenario of the brief (app opening, lesson start,
question, answer selected, correct, incorrect, lesson completed, new landmark, vocabulary, voice
chat, AI processing, no internet, empty chat, daily streak, new user, returning user) plus
`show_correction`, `pronunciation`, `level_up`, `hint`, `goodbye`, `sleep`, `wake_up`, `explore`
and the aliases `idle`, `happy`, `thinking`, `celebrate`, `listening`. The full table (clips,
follow-ups, download sizes) is in `integration_guide.md` §3. It is data, so product can tune it
without touching code.

## 6. Export and frontend integration (Phase 7)

`.r2d.json` is an authoring format: the browser is **not** expected to evaluate it. Options
evaluated (measured in Phase 7; details in `integration_guide.md` §10):

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| **A. Spritesheets** (WebP per clip) + JSON manifest + 15 KB canvas player | No runtime dependency or licence; the Rev2D render of the QC'd model; trivial to cache and lazy-load; works in every framework | 17.3 MB for all 90 clips (54–474 KB each, first paint ≈ 370 KB, a lesson's presets 1.8 MB); no live parametric control (lip sync to arbitrary audio, look-at) | ✅ **Chosen.** Exported at 0.375 × the canvas (a 2× set costs ≈ 2.2× the bytes), loaded per scenario. |
| **B. Spine export** (`rev2d export spine`: Spine 4.2 JSON + atlas) + Spine web runtime | Runtime cross-fades and track layering, resolution-independent bones | Measured on 4 clips: 176 bones, 203 slots, 16 clipping attachments, 6.9 MB JSON (3.8 MB setup + 0.5–1.3 MB per clip, because parameters, warps and physics are baked into keys), so **not smaller** than the spritesheets; masks become hard-edged clips; the Spine runtimes require a **Spine Editor licence**; unverified without one | **Not adopted.** Sample and report in `exports/spine/`; the player's renderer interface leaves room for it. |
| **C. Rev2D core in the browser** (`rev2d/core` + `rev2d/render` are browser-safe; software raster) | Full parametric control, smallest payload | v0.1.0 library, CPU rendering per frame, not built as a production runtime | **Not used** (the brief rules it out too). |
| PNG sequences | Any tool can read frames | One request per frame | **For other tools** (video, engines): `npm run export -- --sequence <ids>`. |
| GIF | Universal previews | 256 colours, 1-bit alpha, large | **Previews only** (`exports/gifs/`, catalogue, docs). |

The player (`web/coco-player.js`, typed by `coco-player.d.ts`) exposes a renderer-agnostic API:
`CocoPlayer.create(container, options)`, `play(name, {then, loop, restart})`, `stop`, `preload`,
`setFacing('left'|'right')`, `setReducedMotion`, `setLabel`, `on('start'|'end'|'event'|'error')`,
`destroy`. The spritesheet renderer sits behind a small interface (`load`, `draw` and a `facing`
property), so the rendering technology can change without touching app code.

## 7. Quality control (every clip)

1. `validate` (0 errors; warnings explained) → 2. render the first pose → 3. contact sheet over
time → 4. look at the motion (sheet + GIF) → 5. `analyze` (parameter ranges, physics clamping, IK
reach, loop seam, parts leaving the canvas) → 6. loop seam check for loops → 7. attachment check
(`inspect --point` on accessories / parts that must stay together) → 8. accessories follow →
9. fix → 10. save the preview into `previews/contact_sheets/<category>/` and update the catalogue.
`npm run qc` produces the evidence; `documentation/animation_catalog.md` records the status.

## 8. Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Inspection, source-art assessment, master spec, layered vector master | ✅ |
| 2 | Master rig: parameters, bindings, physics; sweep sheets per parameter | ✅ |
| 3 | Expressions + idle clips | ✅ |
| 4 | Communication + education clips | ✅ |
| 5 | Emotions, travel, rewards, reactions | ✅ |
| 6 | Accessory library | ✅ |
| 7 | Export pipeline, web player, app presets, integration guide | ✅ (wiring it into the app's own code needs the app repository) |
| 8 | Scenario tests + final visual catalogue | ✅ |

## 9. Risks and open questions

1. **Where is the app?** Still open: no frontend repository was available, so the player, presets
   and guide are framework-agnostic (React and Vue examples, TypeScript types, a demo page). Wiring
   them into the real screens, and matching an existing mascot component if there is one, needs
   that repository.
2. **Spine** — measured and not adopted (§6); only worth revisiting if the team already holds a
   Spine licence and needs runtime cross-fades.
3. **Payload size** — measured: first paint ≈ 370 KB, a lesson's presets 1.8 MB, everything 17.3 MB
   (never needed at once); mitigated by per-clip lazy loading, preloading per screen, WebP and
   15–20 fps.
4. **Art fidelity** — the vector master matches the reference closely
   (`character/master/coco_master_compare.png`); a painted texture pass is possible later from the
   optional artwork listed in the character specification.
5. **Sharpness on large high-DPI displays** — the default export is sharp up to about 190 CSS px
   wide for the full stage on 2× screens; a 2× export is one command (integration guide §6).
