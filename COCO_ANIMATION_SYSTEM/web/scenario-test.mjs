/**
 * Scenario test (Phase 8): drives the real player in headless Chromium.
 *
 *   npm run test:scenarios          (inside COCO_ANIMATION_SYSTEM/; uses the pre-installed playwright)
 *
 * Serves COCO_ANIMATION_SYSTEM/ over HTTP and opens web/demo.html. For every app preset in
 * web/presets.json it plays the preset, checks that its clips start in order, screenshots the canvas
 * in the middle of the last clip (previews/scenarios/<preset>.png), checks that the canvas is not
 * empty and that the right clip follows (the preset's `then`, else the clip's `next`, else the idle).
 * Then it checks the player itself: interruption, keeping a running loop, then: false, facing left,
 * reduced motion, animation events, a missing sheet and two cropped stages. Writes
 * previews/scenarios/results.json and overview.png. Fails on any page error, console error,
 * failed request, empty canvas or wrong sequence.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };
const EXPECTED_404 = 'does-not-exist';

const server = createServer(async (req, res) => {
  try {
    const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(root)) throw new Error('outside root');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
const problems = [];
page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) problems.push(`console error: ${m.text()}`); });
page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()}`));
page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes(EXPECTED_404)) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
await page.goto(`${base}/web/demo.html`);
await page.waitForSelector('body[data-ready="true"]', { timeout: 30000 });

// Page-side helpers: a log of started clips, waiting, and the canvas' opaque pixels.
await page.evaluate(() => {
  const T = {
    started: [],
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    async until(pred, ms) {
      const t0 = performance.now();
      while (!pred() && performance.now() - t0 < ms) await T.sleep(20);
      return pred();
    },
    pixels(canvas = window.coco.canvas) {
      const px = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let n = 0, sx = 0;
      for (let i = 3; i < px.length; i += 4) if (px[i] > 16) { n++; sx += ((i - 3) / 4) % canvas.width; }
      return { opaque: n, cx: n ? sx / n : 0, width: canvas.width };
    },
  };
  window.coco.on('start', (e) => T.started.push(e.id));
  window.__T = T;
});

const manifest = JSON.parse(await readFile(path.join(root, 'exports', 'spritesheets', 'manifest.json'), 'utf8'));
const presets = JSON.parse(await readFile(path.join(root, 'web', 'presets.json'), 'utf8')).presets;
const outDir = path.join(root, 'previews', 'scenarios');
await mkdir(outDir, { recursive: true });
const results = [];
const check = (name, ok, detail) => {
  if (!ok) problems.push(`${name}: ${detail}`);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(22)} ${detail}`);
  return ok;
};

for (const [id, c] of Object.entries(manifest.clips)) {
  if (!(Number.isInteger(c.poster) && c.poster >= 0 && c.poster < c.frames)) problems.push(`${id}: poster ${c.poster} outside 0..${c.frames - 1}`);
}

// 1. Every app preset: its clips in order, a drawn canvas, then the right follow-up.
for (const [name, preset] of Object.entries(presets)) {
  const steps = [].concat(preset.play);
  const lastClip = manifest.clips[steps.at(-1)];
  const next = lastClip.loop ? null : preset.then ?? lastClip.next ?? 'idle_main';
  const nextClip = next && (presets[next] ? [].concat(presets[next].play)[0] : next);
  const r = await page.evaluate(async ({ name, steps }) => {
    const T = window.__T, coco = window.coco;
    T.started.length = 0;
    // A single loop that is already running (explore after new_landmark) keeps playing: no new start.
    const running = steps.length === 1 && coco.looping === steps[0];
    await coco.preload(name);
    T.done = coco.play(name);
    await T.until(() => T.started.length >= steps.length, running ? 300 : 30000);
    const last = coco.manifest.clips[steps.at(-1)];
    await T.sleep(last.loop ? 1000 : last.duration * 500);
    return { started: running && !T.started.length ? [...steps] : [...T.started], running, looping: coco.looping, ...T.pixels() };
  }, { name, steps });
  if (r.running && r.looping !== steps[0]) problems.push(`${name}: ${steps[0]} was running but stopped`);
  await page.locator('#coco canvas').screenshot({ path: path.join(outDir, `${name}.png`) });
  let started = r.started;
  let resolved = true;
  if (nextClip) {
    const r2 = await page.evaluate(async ({ count, wait }) => {
      const T = window.__T;
      await T.until(() => T.started.length > count, wait);
      return { started: [...T.started], resolved: await Promise.race([T.done, T.sleep(50).then(() => 'pending')]) };
    }, { count: steps.length, wait: (lastClip.duration + 5) * 1000 });
    started = r2.started;
    resolved = r2.resolved;
  } else {
    resolved = await page.evaluate(() => Promise.race([window.__T.done, window.__T.sleep(50).then(() => 'pending')]));
  }
  const want = nextClip ? [...steps, nextClip] : steps;
  const ok = r.opaque > 2000 && want.every((s, i) => started[i] === s) && resolved === true;
  check(name, ok, `${started.slice(0, want.length + 1).join(' → ')}${r.running ? ' (already playing: kept running)' : ''} (${r.opaque} px${resolved === true ? '' : `, play() → ${resolved}`})`);
  results.push({ preset: name, scenario: preset.scenario, clips: steps, then: nextClip, started: started.slice(0, want.length), keptRunning: r.running, opaque: r.opaque, ok });
}

// 2. Player behaviour.
const behaviour = await page.evaluate(async () => {
  const T = window.__T, coco = window.coco;
  const out = {};
  const settle = () => T.sleep(150);

  // Interruption: a new play() replaces the running sequence and its follow-up.
  T.started.length = 0;
  const a = coco.play('celebrate');
  await T.until(() => T.started.length >= 1, 5000);
  await T.sleep(300);
  const b = coco.play('thinking');
  const [ra, rb] = await Promise.all([a, b]);
  await T.sleep(3200);
  out.interrupt = { ra, rb, started: [...T.started], looping: coco.looping };

  // Asking again for the running loop keeps it; restart: true starts it over.
  T.started.length = 0;
  const again = await coco.play('thinking');
  const startedAgain = [...T.started];
  const restart = await coco.play('thinking', { restart: true });
  out.keepLoop = { again, startedAgain, restart, startedRestart: [...T.started] };

  // then: false holds the last frame.
  T.started.length = 0;
  const held = await coco.play('happy', { then: false });
  await T.sleep(400);
  out.thenFalse = { held, started: [...T.started], looping: coco.looping };

  // Facing left mirrors the frame on screen exactly.
  await coco.play('idle');
  await T.sleep(300);
  coco.stop();
  const right = T.pixels();
  coco.setFacing('left');
  const left = T.pixels();
  coco.setFacing('right');
  out.facing = { right, left };

  // Reduced motion: one still (poster) frame per clip, same timing, same follow-up.
  coco.setReducedMotion(true);
  await settle();
  T.started.length = 0;
  const p = coco.play('correct');
  await T.until(() => T.started.length >= 1, 5000);
  await T.sleep(100);
  const still1 = coco.canvas.toDataURL();
  await T.sleep(700);
  const still2 = coco.canvas.toDataURL();
  const rp = await p;
  await T.until(() => T.started.length >= 2, 3000);
  out.reducedMotion = { still: still1 === still2, resolved: rp, started: [...T.started], opaque: T.pixels().opaque };
  coco.setReducedMotion(false);
  await settle();

  // Events: one-shot events in order, loop events again on every pass (the manifest has none yet).
  const happy = coco.manifest.clips.emo_happy;
  const idle = coco.manifest.clips.idle_main;
  happy.events = [{ t: 0, name: 'begin' }, { t: happy.duration / 2, name: 'middle' }];
  idle.events = [{ t: 0.2, name: 'beat' }, { t: idle.duration - 0.05, name: 'wrap' }];
  const events = [];
  const offEvents = coco.on('event', (e) => events.push(`${e.id}:${e.name}`));
  await coco.play('happy', { then: false });
  await coco.play('idle', { restart: true });
  await T.sleep(idle.duration * 1000 + 400);
  offEvents();
  delete happy.events;
  delete idle.events;
  out.events = events;

  // A sheet that fails to load: an "error" event, play() → false, the running loop keeps going.
  const errors = [];
  const offErrors = coco.on('error', (e) => errors.push(e.id));
  coco.manifest.clips.__missing = { ...happy, file: 'does-not-exist.webp' };
  const missing = await coco.play('__missing');
  await T.sleep(200);
  out.missing = { missing, errors, looping: coco.looping };
  delete coco.manifest.clips.__missing;
  offErrors();
  return out;
});

const { interrupt, keepLoop, thenFalse, facing, reducedMotion, events, missing } = behaviour;
check('interrupt', interrupt.ra === false && interrupt.rb === true && interrupt.started.join() === 'rew_celebrate,comm_think' && interrupt.looping === 'comm_think',
  `celebrate → ${interrupt.ra}, thinking → ${interrupt.rb}, started ${interrupt.started.join(' → ')}, looping ${interrupt.looping}`);
check('keep running loop', keepLoop.again === true && keepLoop.startedAgain.length === 0 && keepLoop.restart === true && keepLoop.startedRestart.join() === 'comm_think',
  `again: ${keepLoop.startedAgain.length} restarts, restart: true → ${keepLoop.startedRestart.join()}`);
check('then: false', thenFalse.held === true && thenFalse.started.join() === 'emo_happy' && thenFalse.looping === null,
  `started ${thenFalse.started.join(' → ')}, nothing looping: ${thenFalse.looping === null}`);
check('facing left', facing.left.opaque === facing.right.opaque && Math.abs(facing.left.cx - (facing.right.width - 1 - facing.right.cx)) < 0.5,
  `centroid x ${facing.right.cx.toFixed(1)} → ${facing.left.cx.toFixed(1)} on a ${facing.right.width} px canvas`);
check('reduced motion', reducedMotion.still && reducedMotion.resolved === true && reducedMotion.started.join() === 'edu_celebrate_correct,idle_main' && reducedMotion.opaque > 2000,
  `still frame: ${reducedMotion.still}, ${reducedMotion.started.join(' → ')}`);
const wantEvents = 'emo_happy:begin,emo_happy:middle,idle_main:beat,idle_main:wrap,idle_main:beat';
check('events', events.join() === wantEvents, events.join(', '));
check('missing sheet', missing.missing === false && missing.errors.join() === '__missing' && missing.looping === 'idle_main',
  `play() → ${missing.missing}, error events ${missing.errors.join()}, still looping ${missing.looping}`);

// 3. Cropped stages: a bust for chat avatars and a tighter character frame.
const STAGES = { bust: [330, 200, 420, 420], character: [96, 0, 896, 936] };
for (const [stageName, stage] of Object.entries(STAGES)) {
  const r = await page.evaluate(async ({ stage }) => {
    const box = document.createElement('div');
    box.style.cssText = 'width: 320px; position: fixed; left: 0; top: 0; background: #fff';
    document.body.append(box);
    const p = await window.CocoPlayer.create(box, { manifestUrl: '../exports/spritesheets/manifest.json', stage, label: null });
    await window.__T.sleep(300);
    box.id = 'stage-test';
    const px = window.__T.pixels(p.canvas);
    window.__stagePlayer = p;
    return { ...px, size: [p.canvas.width, p.canvas.height] };
  }, { stage });
  await page.locator('#stage-test').screenshot({ path: path.join(outDir, `stage_${stageName}.png`) });
  await page.evaluate(() => { window.__stagePlayer.destroy(); document.querySelector('#stage-test').remove(); });
  check(`stage ${stageName}`, r.opaque > 1000, `[${stage}] → ${r.size.join('x')} canvas, ${r.opaque} px`);
}

// 4. Overview sheet of every scenario screenshot.
await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff;font:12px system-ui;color:#23252e">
  <h1 style="font-size:18px;margin:12px 16px 0">Coco app presets: ${results.filter((r) => r.ok).length}/${results.length} scenarios ok</h1>
  <div style="display:grid;grid-template-columns:repeat(8,150px);gap:8px;padding:12px 16px">${results.map((r) => `
    <figure style="margin:0;text-align:center">
      <img src="${base}/previews/scenarios/${r.preset}.png" style="width:150px;height:150px;object-fit:contain;background:#f4f4f7;border-radius:8px">
      <figcaption><b>${r.preset}</b><br><span style="color:#6b6e7e;font-size:10px">${r.started.join(' → ')}</span></figcaption>
    </figure>`).join('')}</div></body></html>`, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(outDir, 'overview.png'), fullPage: true });

await browser.close();
server.close();
await writeFile(path.join(outDir, 'results.json'), `${JSON.stringify({ presets: results, behaviour: { interrupt, keepLoop, thenFalse, reducedMotion: { ...reducedMotion }, events, missing }, problems }, null, 2)}\n`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} scenarios ok${problems.length ? `\nproblems:\n  ${problems.join('\n  ')}` : ', no problems'}`);
process.exitCode = problems.length ? 1 : 0;
