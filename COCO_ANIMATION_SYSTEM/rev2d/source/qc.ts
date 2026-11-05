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
import { EXPRESSIONS } from '../../character/expressions/expressions.ts';
import { CLIPS, COMPOSED } from '../../animations/index.ts';
import { DEFAULTS, clipParams, type Clip, type ComposedClip } from '../../animations/lib.ts';

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

/** Parameter groups for the rig overview sheets. */
const OVERVIEW_GROUPS: Record<string, string[]> = {
  head: ['AngleX', 'AngleY', 'AngleZ'],
  eye: ['EyeROpen', 'EyeRSmile', 'EyeWide', 'EyeBallX', 'EyeBallY'],
  face: ['BrowRY', 'BrowRAngle', 'MouthOpen', 'MouthForm', 'Blush'],
  body: ['Breath', 'BodyAngleX', 'BodyAngleZ', 'Squash', 'BodyY'],
  wings: ['WingRRaise', 'WingRSpread', 'WingRCurl', 'WingLRaise', 'WingLSpread'],
  tail_legs: ['TailSwing', 'TailLift', 'TailFan', 'FootRY', 'LegTuck'],
};

/** 2-D grids worth checking together: [columns sweep, rows sweep, view box, scale]. */
const GRIDS: Array<{ name: string; sweeps: [string, string]; viewBox: [number, number, number, number] | 'fit'; scale: number }> = [
  { name: 'head_turn', sweeps: ['AngleX=-30,0,30', 'AngleY=30,0,-30'], viewBox: [360, 230, 370, 320], scale: 0.9 },
  { name: 'eye', sweeps: ['EyeROpen=0,0.5,1', 'EyeRSmile=0,0.5,1'], viewBox: [470, 330, 120, 130], scale: 2 },
  { name: 'beak', sweeps: ['MouthOpen=0,0.5,1', 'MouthForm=-1,0,1'], viewBox: [580, 290, 140, 190], scale: 1.6 },
  { name: 'brow', sweeps: ['BrowRAngle=-1,0,1', 'BrowRY=-1,0,1'], viewBox: [460, 300, 150, 160], scale: 1.6 },
  { name: 'wing_near', sweeps: ['WingRRaise=-1.5,-1,0,0.5,1', 'WingRSpread=0,1'], viewBox: 'fit', scale: 0.4 },
  { name: 'wing_far', sweeps: ['WingLRaise=0,0.5,1', 'WingLSpread=0,1'], viewBox: 'fit', scale: 0.4 },
];

/** Rig evidence: one overview sheet per parameter group and the 2-D grids (physics off: values show as set). */
async function rig(): Promise<void> {
  const m = await R.loadModelFile(MODEL_FILE);
  if (!m.rig || !m.model) throw new Error(`model has errors:\n${R.formatDiagnostics(m.diagnostics)}`);
  const model = m.model;
  for (const [group, params] of Object.entries(OVERVIEW_GROUPS)) {
    const sheet = R.renderSheet(m, { overview: { params, steps: 5 }, scale: 0.28, physics: false, viewBox: 'fit', background: '#ffffff' } as never);
    write(sys('previews', 'rig', `overview_${group}.png`), R.encodePNG(sheet.image ?? sheet));
  }
  for (const g of GRIDS) {
    const sweeps = g.sweeps.map((s) => R.parseSweep(model, s));
    const sheet = R.renderSheet(m, { sweeps, viewBox: g.viewBox, scale: g.scale, physics: false, background: '#ffffff' } as never);
    write(sys('previews', 'rig', `grid_${g.name}.png`), R.encodePNG(sheet.image ?? sheet));
  }
}

/** Expression sheet: every preset of character/expressions/expressions.ts on the head. */
async function expressions(): Promise<void> {
  const m = await R.loadModelFile(MODEL_FILE);
  if (!m.rig) throw new Error(R.formatDiagnostics(m.diagnostics));
  const cells = Object.entries(EXPRESSIONS).map(([name, e]) => ({
    image: R.renderFrame(m, { params: e.params, viewBox: [360, 230, 380, 330], scale: 0.62, background: '#ffffff', physics: false } as never).image,
    caption: name,
  }));
  const sheet = R.composeSheet(cells, { columns: 7, padding: 8, title: 'Coco expressions (parameter presets on the master rig)', background: R.resolveColor('#f4f4f7') } as never);
  write(sys('character', 'expressions', 'coco_expressions.png'), R.encodePNG(sheet));
}

interface ClipReport {
  id: string;
  category: string;
  kind: string;
  title: string;
  description: string;
  duration: number;
  loop: boolean;
  params: string[];
  accessories: string[];
  scenarios: string[];
  next?: string;
  status: string;
  issues: string[];
}

/** Parameters a one-shot does not start (index 0) or end (last key) at their default. */
function restIssues(c: Clip, which: 'start' | 'end'): string[] {
  const off: string[] = [];
  for (const [target, keys] of Object.entries(c.tracks)) {
    if (target.includes(':')) continue;
    const k = which === 'start' ? keys[0] : keys[keys.length - 1];
    if (which === 'start' && k.t > 1e-6) continue;
    if (Math.abs(k.v - (DEFAULTS[target] ?? 0)) > 1e-6) off.push(`${target} ${which}s at ${k.v}`);
  }
  return off;
}

/**
 * Per animation: contact sheet (previews/contact_sheets/<category>/<id>.png), GIF preview
 * (exports/gifs/<id>.gif), Rev2D analyze report (previews/reports/<id>.txt) and a QC status; then
 * the catalogue (documentation/animation_catalog.md).
 */
async function anims(): Promise<void> {
  const m = await R.loadModelFile(MODEL_FILE);
  if (!m.rig || !m.model) throw new Error(R.formatDiagnostics(m.diagnostics));
  const only = process.argv.slice(3).filter((a) => !a.startsWith('-'));
  const reports: ClipReport[] = [];
  const all: Array<Clip | ComposedClip> = [...CLIPS, ...COMPOSED];
  for (const c of all) {
    const a = m.model.animations.find((x) => x.id === c.id);
    if (!a) throw new Error(`animation ${c.id} is not in the model (rebuild)`);
    const params = 'tracks' in c ? clipParams(c) : [...new Set(a.tracks.map((t) => t.target.replace(/^param:/, '')))];
    const warmup = a.loop ? Math.max(8, a.duration * 2) : undefined;
    if (!only.length || only.includes(c.id)) {
      const sheet = R.renderSheet(m, { animation: c.id, frames: a.loop ? 10 : 12, columns: a.loop ? 5 : 6, warmup, viewBox: 'fit', scale: 0.3, background: '#ffffff' } as never);
      write(sys('previews', 'contact_sheets', c.category, `${c.id}.png`), R.encodePNG(sheet));
      // Small GIF previews (12 fps, ~250 px tall): catalogue and docs, not production assets.
      const seq = R.renderSequence(m, { animation: c.id, fps: 12, warmup, viewBox: 'fit', scale: 0.24, background: '#ffffff' } as never);
      write(sys('exports', 'gifs', `${c.id}.gif`), R.encodeGIF(seq.frames.map((f) => f.image), { fps: 12, loop: true }));
    }
    const an = R.analyzeAnimation(m, { animation: c.id, warmup });
    if (!only.length || only.includes(c.id)) write(sys('previews', 'reports', `${c.id}.txt`), `${R.formatAnalysis(an)}\n`);

    const issues: string[] = [];
    if (a.loop && an.seam && !an.seam.ok) issues.push(`loop seam: ${an.seam.params.map((p) => `${p.id} jumps ${p.jump.toFixed(3)}`).concat(an.seam.bones.map((b) => `bone ${b.id} ${b.distance.toFixed(2)} px`)).join(', ')}`);
    for (const p of an.physics) if (p.clampedShare > 0.05) issues.push(`physics ${p.param} clamped in ${Math.round(p.clampedShare * 100)}% of frames`);
    for (const o of an.outsideCanvas) if (!o.always) issues.push(`${o.part} leaves the canvas (${o.maxOverflow.toFixed(0)} px)`);
    if (!a.loop && 'tracks' in c) {
      if (!c.next?.startsWith('hold:')) issues.push(...restIssues(c, 'end').map((s) => `does not end at rest: ${s}`));
      if (!c.from) issues.push(...restIssues(c, 'start').map((s) => `does not start at rest: ${s}`));
    }
    reports.push({
      id: c.id, category: c.category, kind: c.kind, title: c.title, description: c.description, duration: a.duration, loop: a.loop,
      params, accessories: c.accessories ?? [], scenarios: c.scenarios, next: c.next,
      status: issues.length ? '⚠ check' : '✅ verified', issues,
    });
    console.log(`  ${c.id}: ${issues.length ? `ISSUES: ${issues.join('; ')}` : 'ok'}`);
  }
  writeFileSync(sys('documentation', 'animation_catalog.md'), catalog(reports));
  console.log(`  documentation/animation_catalog.md (${reports.length} animations)`);
}

function catalog(reports: ClipReport[]): string {
  const cats = [...new Set(reports.map((r) => r.category))];
  const lines = [
    '# Coco animation catalogue',
    '',
    'Generated by `npm run qc -- anims` from the clip definitions (`animations/`) and Rev2D\'s analysis of the',
    'built model. **Status** is ✅ only when the clip passed the automatic checks: loop seam closed (loops),',
    'physics never clamped for more than 5 % of the frames, no part leaving the canvas, one-shots ending at',
    'rest. Every clip also has a contact sheet (`previews/contact_sheets/`), a GIF preview (`exports/gifs/`) and a',
    'full analysis report (`previews/reports/`).',
    '',
    `Total: **${reports.length}** animations, ${reports.filter((r) => r.status.startsWith('✅')).length} verified.`,
    '',
  ];
  for (const cat of cats) {
    lines.push(`## ${cat[0].toUpperCase()}${cat.slice(1)}`, '');
    lines.push('| ID | Kind | Duration | Loop | Parameters | Accessories | Scenario | Then | Status | Preview |');
    lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const r of reports.filter((x) => x.category === cat)) {
      const status = r.issues.length ? `${r.status}: ${r.issues.join('; ')}` : r.status;
      lines.push(
        `| \`${r.id}\` — ${r.title} | ${r.kind} | ${r.duration} s | ${r.loop ? 'loop' : 'one-shot'} | ${r.params.map((p) => `\`${p}\``).join(' ')} | ${r.accessories.map((p) => `\`${p}\``).join(' ') || '—'} | ${r.scenarios.join('; ')} | ${r.next ? `\`${r.next}\`` : '—'} | ${status} | [sheet](../previews/contact_sheets/${r.category}/${r.id}.png) · [gif](../exports/gifs/${r.id}.gif) |`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

const jobs: Record<string, () => Promise<void>> = { master, layers, rig, expressions, anims };

async function main(): Promise<number> {
  // `qc anims idle_main idle_blink` = only those clips; other jobs take no arguments.
  const first = process.argv[2];
  const names = first === 'anims' ? ['anims'] : process.argv.slice(2).filter((a) => !a.startsWith('-'));
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
