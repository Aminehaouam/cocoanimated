# Spine export (evaluation sample)

Not used by the web app, which plays the spritesheets in `../spritesheets/`. This folder holds a
Spine 4.2 export of four clips, made to evaluate Spine as a runtime format
(`documentation/integration_guide.md` §10):

```bash
node ../../Rev2D/bin/rev2d.js export spine rev2d/models/coco.r2d.json -o exports/spine --name coco --anim idle_main,emo_happy,comm_greet,edu_celebrate_correct
```

(run in `COCO_ANIMATION_SYSTEM/`, with Rev2D checked out next to the repository).

| File | |
| --- | --- |
| `coco.json` | Spine 4.2 skeleton: 176 bones, 203 slots, 4 animations (6.9 MB, 2.3 MB gzipped) |
| `coco.atlas`, `coco.png`, `coco_2.png` | Texture atlas, premultiplied alpha (`pma: true`) |
| `export_report.json` | Rev2D's conversion report: 1 warning, 35 notes, statistics |

What the report says, in short:

- Parameters, warps (10, as 115 bones with weighted meshes), shape morphs and tail physics are
  **baked** into the animations: the Spine skeleton plays them, but has no parameters to drive.
- The 13 masks (face patch, eye highlights, scallops, accessory details) become **hard-edged
  clipping polygons** (16 clipping attachments). Spine clips on the CPU, which costs frame time.
- Gradient-filled wings stretch with their deform instead of re-evaluating the gradient (slight
  colour differences near moving edges).
- Warning: the scarf stripes are masked by two parts; Spine keeps only the larger one.
- Spine animations have no loop flag: play `idle_main` looping and the others once.

Status: **not verified in a Spine runtime.** Using the Spine runtimes (spine-player, spine-webgl,
...) requires a Spine Editor licence from Esoteric Software. To try it: load `coco.json` with
`coco.atlas` in spine-player, or in the Spine editor with Import Data. To export other clips,
change `--anim`; leave it out for all 90 (expect a very large JSON: 3.8 MB of setup plus about
0.5–1.3 MB per clip).
