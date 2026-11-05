/**
 * Build Coco's master model: rev2d/models/coco.r2d.json.
 *
 *   npm run build            (inside COCO_ANIMATION_SYSTEM/)
 *
 * The model is assembled from the source modules with Rev2D's own edit ops (applyOps), so every
 * item is schema-checked as it is added and the result is validated as a whole. The file is written
 * only when there are no errors; warnings are printed (and must be explained or fixed).
 * Source of truth: character/ (art), rev2d/rigs/ (skeleton, controls), animations/, accessories/.
 * Never hand-edit the generated model: change the sources and rebuild.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { R, sys } from './lib/rev2d.ts';
import { CANVAS } from '../../character/master/landmarks.ts';
import { characterParts } from '../../character/parts/index.ts';
import { skeletonOps } from '../rigs/skeleton.ts';

type Op = Record<string, unknown> & { op: string };

export const MODEL_FILE = sys('rev2d', 'models', 'coco.r2d.json');

export function modelOps(): Op[] {
  return [
    ...(skeletonOps() as Op[]),
    ...characterParts().map((value) => ({ op: 'add', kind: 'part', value })),
  ];
}

async function main(): Promise<number> {
  const doc = {
    format: 'rev2d',
    version: 1,
    meta: { name: 'coco', width: CANVAS.width, height: CANVAS.height, background: 'transparent', fps: 30 },
  };
  const ops = modelOps();
  const res = R.applyOps(doc, ops as never);
  const failed = res.results.filter((r) => !r.ok);
  if (failed.length) {
    for (const r of failed.slice(0, 10)) console.error(`FAIL #${r.index} ${r.op}: ${r.message}${r.hint ? `\n  hint: ${r.hint}` : ''}`);
  }
  const errors = res.diagnostics.filter((d) => d.severity === 'error');
  const warnings = res.diagnostics.filter((d) => d.severity === 'warning');
  if (res.diagnostics.length) console.log(R.formatDiagnostics(res.diagnostics));
  if (!res.ok || errors.length) {
    console.error(`NOT written: ${failed.length} failed op(s), ${errors.length} error(s)`);
    return 1;
  }

  // Round-trip through the canonical formatter, then load exactly that text (textures, rig compile).
  const text = R.formatModelJson(res.doc);
  const loaded = await R.loadModelObject(JSON.parse(text), path.dirname(MODEL_FILE), MODEL_FILE);
  if (!loaded.rig) {
    console.error(R.formatDiagnostics(loaded.diagnostics));
    console.error('NOT written: the model does not compile');
    return 1;
  }
  mkdirSync(path.dirname(MODEL_FILE), { recursive: true });
  writeFileSync(MODEL_FILE, text);
  const m = loaded.model!;
  console.log(
    `${path.relative(process.cwd(), MODEL_FILE)}: written — ${ops.length} ops; ${m.parameters.length} parameters, ${m.bones.length} bones, ` +
      `${m.warps.length} warps, ${m.parts.length} parts, ${m.bindings.length} bindings, ${m.physics.length} physics, ${m.animations.length} animations; ` +
      `${warnings.length} warning(s)`,
  );
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('build.ts')) {
  process.exitCode = await main();
}
