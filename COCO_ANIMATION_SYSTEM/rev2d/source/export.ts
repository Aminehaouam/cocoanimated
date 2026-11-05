/**
 * Export the animation library for the web.
 *
 *   npm run export                        all clips -> exports/spritesheets/<id>.png + manifest.json
 *   npm run export -- idle_main comm_talk                 selected clips (merged into the manifest)
 *   npm run export -- --scale 0.75 --out exports/spritesheets@2x     another resolution, elsewhere
 *   npm run export -- --sequence idle_main                also a PNG sequence in exports/png_sequences/<id>/
 *                                                         (with --out: <out>/png_sequences/<id>/)
 *
 * Every frame is rendered by Rev2D's deterministic renderer. Each clip is cropped to the union of its
 * visible bounds over all frames; the manifest stores that crop's origin in canvas pixels, so the
 * player can draw every clip on the same canvas anchor (Coco's feet at (512, 893)) without wasted space.
 * Overlay clips (talk) are baked over idle_main so they are alive on their own; physics loops are
 * pre-rolled (warm-up) so they loop seamlessly. `npm run webp` (rev2d/source/to_webp.py) then
 * converts the sheets to WebP.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { R, sys } from './lib/rev2d.ts';
import { MODEL_FILE } from './build.ts';
import { CLIPS, COMPOSED } from '../../animations/index.ts';
import type { Clip, ComposedClip } from '../../animations/lib.ts';

const ANCHOR: [number, number] = [512, 893];

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { scale: { type: 'string' }, fps: { type: 'string' }, sequence: { type: 'boolean' }, out: { type: 'string' } },
  });
  const scale = Number(values.scale ?? 0.375);
  const m = await R.loadModelFile(MODEL_FILE);
  if (!m.rig || !m.model) throw new Error(R.formatDiagnostics(m.diagnostics));
  const all: Array<Clip | ComposedClip> = [...CLIPS, ...COMPOSED];
  const unknown = positionals.filter((id) => !all.some((c) => c.id === id));
  if (unknown.length) throw new Error(`unknown clip ids: ${unknown.join(', ')}`);
  const selected = positionals.length ? all.filter((c) => positionals.includes(c.id)) : all;
  const outDir = values.out ? path.resolve(values.out) : sys('exports', 'spritesheets');
  mkdirSync(outDir, { recursive: true });
  const manifest: Record<string, unknown> = {};
  let bytes = 0;

  for (const c of selected) {
    const a = m.model.animations.find((x) => x.id === c.id)!;
    const overlay = c.kind === 'overlay';
    const animation = overlay ? 'idle_main' : c.id;
    const layers = overlay ? [`${c.id},add`] : [];
    const duration = overlay ? 8 : a.duration;
    const loop = overlay ? true : a.loop;
    const fps = Number(values.fps ?? (loop && duration > 4 ? 15 : 20));
    const warmup = loop ? Math.max(8, duration * 2) : undefined;
    const seq = R.renderSequence(m, { animation, animations: layers, fps, warmup, viewBox: 'fit', padding: 8, scale, background: 'transparent' } as never);
    const frames = seq.frames.map((f) => f.image);
    // A loop sampled up to t = duration ends on its first frame again: drop the duplicate.
    if (loop && frames.length > Math.round(duration * fps)) frames.pop();
    const fw = frames[0].width, fh = frames[0].height;
    const columns = Math.min(frames.length, Math.max(1, Math.floor(4096 / fw)));
    const rows = Math.ceil(frames.length / columns);
    const sheet = R.createImage(fw * columns, fh * rows, 'transparent');
    frames.forEach((img, i) => R.blitImage(sheet, img, (i % columns) * fw, Math.floor(i / columns) * fh));
    const png = R.encodePNG(sheet);
    writeFileSync(path.join(outDir, `${c.id}.png`), png);
    bytes += png.length;
    if (values.sequence) {
      const dir = values.out ? path.join(outDir, 'png_sequences', c.id) : sys('exports', 'png_sequences', c.id);
      mkdirSync(dir, { recursive: true });
      frames.forEach((img, i) => writeFileSync(path.join(dir, `${c.id}_${String(i).padStart(3, '0')}.png`), R.encodePNG(img)));
    }
    const [vx, vy] = seq.viewBox;
    // The one frame a reduced-motion player holds: a loop's first frame, the landed end of an entrance
    // from off-screen, the start of an exit, else the middle of the one-shot (its key pose).
    const last = frames.length - 1;
    const poster = loop ? 0 : c.from?.startsWith('off-screen') ? last : c.to?.startsWith('off-screen') ? 0 : Math.round(last / 2);
    manifest[c.id] = {
      file: `${c.id}.png`, category: c.category, kind: c.kind, title: c.title,
      frames: frames.length, columns, frameWidth: fw, frameHeight: fh, fps, loop, duration, poster,
      // Canvas position (model px) of each frame's top-left corner; frame px = model px * scale.
      origin: [Math.round(vx * 100) / 100, Math.round(vy * 100) / 100],
      ...(c.next ? { next: c.next } : {}), ...(c.from ? { from: c.from } : {}), ...(c.to ? { to: c.to } : {}),
      ...(a.events?.length ? { events: a.events } : {}),
    };
    console.log(`  ${c.id}: ${frames.length} frames ${fw}x${fh} @${fps}fps, sheet ${columns}x${rows}, ${(png.length / 1024).toFixed(0)} KB`);
  }

  const file = path.join(outDir, 'manifest.json');
  const existing = positionals.length ? (await import(`file://${file}`, { with: { type: 'json' } }).catch(() => ({ default: { clips: {} } }))).default : { clips: {} };
  writeFileSync(file, `${JSON.stringify({
    format: 'coco-spritesheets', version: 1,
    canvas: { width: m.model.meta.width, height: m.model.meta.height, anchor: ANCHOR },
    scale,
    clips: { ...(existing.clips ?? {}), ...manifest },
  }, null, 2)}\n`);
  console.log(`${path.relative(sys(), outDir)}: ${selected.length} sheets, ${(bytes / 1024 / 1024).toFixed(1)} MB PNG; manifest.json`);
  return 0;
}

process.exitCode = await main();
