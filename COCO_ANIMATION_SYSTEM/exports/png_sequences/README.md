# PNG sequences

Generated on demand (not stored here): one RGBA PNG per frame, for video editing, presentations or
engines that want individual frames. The web app uses `../spritesheets/` instead.

```bash
npm run export -- --sequence comm_greet emo_happy
```

writes `exports/png_sequences/<clip>/<clip>_000.png`, `_001.png`, … at the spritesheet scale
(0.375 of the 1024 px canvas) and refreshes those clips' sheets. For larger frames, export elsewhere
at another scale; the sequences then go to `<out>/png_sequences/<clip>/`:

```bash
npm run export -- --sequence --scale 1 --out out/hires comm_greet
```

Every frame of a clip has the same size and the same canvas offset (the clip's `origin` in the
manifest), so the frames line up with each other and with other clips. Loops end one frame before
their start frame, so they repeat seamlessly; one-shots include their last frame.
