/**
 * Quality-control renders of the master model.
 *
 *   npm run qc [-- master]       (inside COCO_ANIMATION_SYSTEM/)
 *
 * master: character/master/coco_master.png (transparent), coco_master_white.png and
 *         coco_master_compare.png = reference | vector master | onion-skin overlay, all in the
 *         same canvas region, so drift from the reference is visible at a glance.
 * Later phases add rig sweeps, expression sheets and per-animation contact sheets + analyze reports.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { R, sys } from './lib/rev2d.ts';
import { MODEL_FILE } from './build.ts';

const VIEW: [number, number, number, number] = [300, 240, 430, 680];

function write(file: string, bytes: Uint8Array): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, bytes);
  console.log(`  ${path.relative(sys(), file)}`);
}

async function master(): Promise<void> {
  const m = await R.loadModelFile(MODEL_FILE);
  if (!m.rig) throw new Error(`model has errors:\n${R.formatDiagnostics(m.diagnostics)}`);
  const transparent = R.renderFrame(m, { viewBox: VIEW, scale: 1, background: 'transparent' } as never).image;
  write(sys('character', 'master', 'coco_master.png'), R.encodePNG(transparent));
  const white = R.renderFrame(m, { viewBox: VIEW, scale: 1, background: '#ffffff' } as never).image;
  write(sys('character', 'master', 'coco_master_white.png'), R.encodePNG(white));
  const big = R.renderFrame(m, { viewBox: 'fit', scale: 2, background: 'transparent' } as never).image;
  write(sys('character', 'master', 'coco_master@2x.png'), R.encodePNG(big));

  // Reference placed in the same canvas space (2 canvas px per reference px; see the spec).
  const refFull = R.decodePNG(readFileSync(sys('character', 'master', 'reference_analysis', 'reference_in_canvas.png')));
  const ref = R.cropImage(refFull, VIEW[0], VIEW[1], VIEW[2], VIEW[3]);
  const gap = 12;
  const out = R.createImage(VIEW[2] * 3 + gap * 2, VIEW[3], '#ffffff');
  R.blitImage(out, ref, 0, 0);
  R.blitImage(out, white, VIEW[2] + gap, 0);
  R.blitImage(out, ref, (VIEW[2] + gap) * 2, 0);
  R.blitImage(out, transparent, (VIEW[2] + gap) * 2, 0, 0.55);
  write(sys('character', 'master', 'coco_master_compare.png'), R.encodePNG(out));
}

/** Part groups of the master, back to front (character/parts/coco_layers.png). */
export const LAYER_GROUPS: Array<[string, string[]]> = [
  ['1 tail', ['tailF1', 'tailF2', 'tailF3']],
  ['2 far wing + far leg', ['wingL', 'legL', 'footL']],
  ['3 near leg', ['legR', 'footR']],
  ['4 body', ['body', 'thighShade', 'chestScallops']],
  ['5 near wing', ['wingR', 'wingRCovert']],
  ['6 head', ['napeLobes', 'head', 'crownLight', 'headScallops']],
  ['7 face + eye', ['facePatch', 'eyeRing', 'eye', 'eyeHighlight', 'eyeHighlight2']],
  ['8 beak', ['mouthInside', 'tongue', 'beakLower', 'mouthLine', 'beakUpper', 'beakSheen', 'nostril']],
];

/** Exploded view: each part group rendered alone (other parts hidden; masks still work). */
async function layers(): Promise<void> {
  const doc = JSON.parse(readFileSync(MODEL_FILE, 'utf8')) as { parts: Array<{ id: string; visible?: boolean }> };
  const cells = [];
  const covered = new Set(LAYER_GROUPS.flatMap(([, ids]) => ids));
  const missing = doc.parts.map((p) => p.id).filter((id) => !covered.has(id) && id !== 'shadow');
  if (missing.length) throw new Error(`layers: parts not in any group: ${missing.join(', ')}`);
  for (const [label, ids] of [...LAYER_GROUPS, ['all layers', doc.parts.map((p) => p.id)] as [string, string[]]]) {
    const copy = structuredClone(doc);
    for (const p of copy.parts) p.visible = ids.includes(p.id);
    const m = await R.loadModelObject(copy, path.dirname(MODEL_FILE), MODEL_FILE);
    const image = R.renderFrame(m, { viewBox: VIEW, scale: 0.5, background: '#ffffff' } as never).image;
    cells.push({ image, caption: label });
  }
  const sheet = R.composeSheet(cells, { columns: 9, padding: 10, title: 'Coco master: layers back to front', background: R.resolveColor('#f4f4f7') } as never);
  write(sys('character', 'parts', 'coco_layers.png'), R.encodePNG(sheet));
}

const jobs: Record<string, () => Promise<void>> = { master, layers };

async function main(): Promise<number> {
  const names = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  for (const name of names.length ? names : Object.keys(jobs)) {
    if (!jobs[name]) {
      console.error(`unknown qc job "${name}" (available: ${Object.keys(jobs).join(', ')})`);
      return 2;
    }
    console.log(`qc ${name}`);
    await jobs[name]();
  }
  return 0;
}

process.exitCode = await main();
