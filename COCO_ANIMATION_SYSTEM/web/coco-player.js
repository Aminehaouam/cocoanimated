/**
 * CocoPlayer: plays Coco's animations in any web page (no dependencies, works with any framework).
 *
 *   import { CocoPlayer } from './coco-player.js';
 *   const coco = await CocoPlayer.create(document.querySelector('#coco'), {
 *     manifestUrl: '/coco/spritesheets/manifest.json',   // exports/spritesheets/manifest.json
 *     presetsUrl: '/coco/presets.json',                  // web/presets.json
 *   });
 *   coco.play('happy');                                  // an app preset or a clip id
 *   const finished = await coco.play('correct');         // false if something else took over
 *
 * Rendering sits behind a small renderer interface (SpritesheetRenderer below: load, draw, facing,
 * optionally pin and dispose), so another technology, such as a Spine runtime, can replace it
 * without changing the app-facing API. Guide: documentation/integration_guide.md.
 */

/** Draws spritesheet frames on a canvas that shows a fixed region ("stage") of Coco's canvas. */
export class SpritesheetRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} manifest  exports/spritesheets/manifest.json
   * @param {string} baseUrl   URL the sheet files are resolved against (the manifest's own URL)
   * @param {number[]} stage   [x, y, w, h] in Coco's canvas pixels
   * @param {object} [options] maxSheets: sheets kept in memory (default 8); crossOrigin: for sheets
   *                           served from another origin (e.g. "anonymous")
   */
  constructor(canvas, manifest, baseUrl, stage, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.manifest = manifest;
    this.baseUrl = baseUrl;
    this.stage = stage;
    this.scale = manifest.scale;
    this.maxSheets = options.maxSheets ?? 8;
    this.crossOrigin = options.crossOrigin;
    this.sheets = new Map(); // clip id -> Promise<HTMLImageElement>, least recently used first
    this.pinned = new Set(); // clip ids that are never dropped (the idle, the sequence playing)
    this.facing = 'right';
    canvas.width = Math.round(stage[2] * this.scale);
    canvas.height = Math.round(stage[3] * this.scale);
  }

  /** The decoded sheet of a clip. Sheets are cached; beyond maxSheets the least recently used go. */
  load(id) {
    let sheet = this.sheets.get(id);
    if (sheet) {
      this.sheets.delete(id); // re-inserted below as the most recently used
    } else {
      const img = new Image();
      if (this.crossOrigin) img.crossOrigin = this.crossOrigin;
      img.src = new URL(this.manifest.clips[id].file, this.baseUrl).href;
      // decode() settles once the image is decoded, so the first draw does not stall the page.
      sheet = img.decode().then(() => img, () => { throw new Error(`CocoPlayer: cannot load ${img.src}`); });
      sheet.catch(() => { if (this.sheets.get(id) === sheet) this.sheets.delete(id); }); // retry on the next play
    }
    this.sheets.set(id, sheet);
    for (const old of this.sheets.keys()) {
      if (this.sheets.size <= this.maxSheets) break;
      if (old !== id && !this.pinned.has(old)) this.sheets.delete(old);
    }
    return sheet;
  }

  /** Keep these clips' sheets in memory whatever maxSheets says. */
  pin(ids) {
    this.pinned = new Set(ids);
  }

  draw(id, img, frame) {
    const c = this.manifest.clips[id];
    const { ctx, canvas } = this;
    const sx = (frame % c.columns) * c.frameWidth;
    const sy = Math.floor(frame / c.columns) * c.frameHeight;
    const dx = Math.round((c.origin[0] - this.stage[0]) * this.scale);
    const dy = Math.round((c.origin[1] - this.stage[1]) * this.scale);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Facing left = the same art mirrored about the stage's vertical centre line.
    if (this.facing === 'left') ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
    ctx.drawImage(img, sx, sy, c.frameWidth, c.frameHeight, dx, dy, c.frameWidth, c.frameHeight);
  }

  dispose() {
    this.sheets.clear();
    this.pinned.clear();
  }
}

export class CocoPlayer {
  /**
   * Create a player in `container` and, unless autoplay is false, start the idle.
   * Rejects if the manifest, the presets or the idle's sheet cannot be loaded.
   *
   * @param {HTMLElement} container  element that receives the canvas (sized by your CSS)
   * @param {object} [options]
   *   manifestUrl    URL of exports/spritesheets/manifest.json; the sheets are resolved next to it
   *   presetsUrl     URL of web/presets.json, or presets: the parsed object (both optional)
   *   stage          [x, y, w, h]: the region of Coco's 1024 x 1024 canvas to show (default: all)
   *   idle           clip played when nothing else is (default "idle_main")
   *   label          accessible name (default "Coco the parrot"); null = decorative (aria-hidden)
   *   reducedMotion  "auto" (follow prefers-reduced-motion, the default), true or false
   *   autoplay       start the idle right away (default true)
   *   maxSheets, crossOrigin  passed to SpritesheetRenderer
   *   renderer       an object to draw with instead of a SpritesheetRenderer
   */
  static async create(container, options = {}) {
    const getJson = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CocoPlayer: ${url}: HTTP ${res.status}`);
      return res.json();
    };
    const manifestUrl = new URL(options.manifestUrl ?? 'manifest.json', document.baseURI).href;
    const [manifest, presets] = await Promise.all([
      getJson(manifestUrl),
      options.presets ?? (options.presetsUrl ? getJson(new URL(options.presetsUrl, document.baseURI).href) : {}),
    ]);
    const player = new CocoPlayer(container, manifest, presets, manifestUrl, options);
    if (options.autoplay !== false) {
      let failure;
      const off = player.on('error', (e) => { failure = e.error; });
      const started = await player.play(player.idle);
      off();
      if (!started) {
        player.destroy();
        throw failure ?? new Error(`CocoPlayer: cannot start "${player.idle}"`);
      }
    }
    return player;
  }

  constructor(container, manifest, presets, manifestUrl, options = {}) {
    if (manifest.format !== 'coco-spritesheets') throw new Error('CocoPlayer: not a Coco spritesheet manifest');
    this.manifest = manifest;
    this.presets = presets.presets ?? presets;
    this.idle = options.idle ?? 'idle_main';
    this.listeners = new Map();
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, { display: 'block', width: '100%', height: 'auto' });
    this.setLabel(options.label === undefined ? 'Coco the parrot' : options.label);
    container.appendChild(this.canvas);
    const stage = options.stage ?? [0, 0, manifest.canvas.width, manifest.canvas.height];
    this.renderer = options.renderer ?? new SpritesheetRenderer(this.canvas, manifest, manifestUrl, stage, options);
    this.token = 0; // bumped by every play() and stop(): an older sequence sees it was replaced
    this.current = null; // what is on screen: { id, img, frame }
    this.looping = null; // id of the loop that is running
    this.settle = null; // resolves the running one-shot's run() (false = interrupted)
    this.raf = 0;
    this.timer = 0;
    this.setReducedMotion(options.reducedMotion ?? 'auto');
  }

  /** Clip ids in the manifest. */
  get clips() {
    return Object.keys(this.manifest.clips);
  }

  /** Preset names. */
  get presetNames() {
    return Object.keys(this.presets);
  }

  /** True if `name` is a preset or a clip id. */
  has(name) {
    return Object.hasOwn(this.presets, name) || Object.hasOwn(this.manifest.clips, name);
  }

  /** Accessible name of the canvas (null = decorative). */
  setLabel(label) {
    if (label == null) {
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.removeAttribute('role');
      this.canvas.removeAttribute('aria-label');
    } else {
      this.canvas.removeAttribute('aria-hidden');
      this.canvas.setAttribute('role', 'img');
      this.canvas.setAttribute('aria-label', label);
    }
  }

  /** "right" (the master art) or "left" (mirrored). */
  setFacing(facing) {
    this.renderer.facing = facing === 'left' ? 'left' : 'right';
    const c = this.current;
    if (c) this.renderer.draw(c.id, c.img, c.frame);
  }

  /** "auto" follows the system setting (live), true holds one frame per clip, false animates. */
  setReducedMotion(mode) {
    this.motionQuery?.removeEventListener?.('change', this.onMotionChange);
    this.motionQuery = null;
    if (mode === 'auto' && globalThis.matchMedia) {
      this.motionQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
      this.onMotionChange = () => this.applyReducedMotion(this.motionQuery.matches);
      this.motionQuery.addEventListener?.('change', this.onMotionChange);
      this.applyReducedMotion(this.motionQuery.matches);
    } else {
      this.applyReducedMotion(mode === true);
    }
  }

  applyReducedMotion(on) {
    const changed = this.reducedMotion !== undefined && this.reducedMotion !== on;
    this.reducedMotion = on;
    // A running loop switches at once; a one-shot plays out and what follows uses the new mode.
    if (changed && this.looping) this.play(this.looping, { restart: true });
  }

  /** Listen to "start" {id, loop}, "end" {id}, "event" {id, t, name, data} or "error" {id, error}. Returns an unsubscribe function. */
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  emit(event, data) {
    const fns = [...(this.listeners.get(event) ?? [])];
    if (event === 'error' && !fns.length) console.error(data.error);
    for (const fn of fns) {
      try {
        fn(data);
      } catch (error) {
        console.error(error);
      }
    }
  }

  /** Load the sheets of presets or clips ahead of time (at most maxSheets stay cached). */
  preload(names) {
    return Promise.all([].concat(names).flatMap((n) => this.resolve(n).steps).map((id) => this.renderer.load(id)));
  }

  /** A preset name or clip id -> the clips to play in order and the preset's follow-up. */
  resolve(name) {
    const preset = Object.hasOwn(this.presets, name) ? this.presets[name] : null;
    const steps = preset ? [].concat(preset.play) : Object.hasOwn(this.manifest.clips, name) ? [name] : null;
    if (!steps) throw new Error(`CocoPlayer: unknown preset or clip "${name}"`);
    const missing = steps.filter((id) => !Object.hasOwn(this.manifest.clips, id));
    if (missing.length) throw new Error(`CocoPlayer: "${name}" uses clips missing from the manifest: ${missing.join(', ')}`);
    return { steps, then: preset?.then };
  }

  /**
   * Play a preset or a clip id. The steps play in order; after the last one-shot, what follows is
   * options.then, else the preset's `then`, else the last clip's `next`, else the idle (then: false
   * holds the last frame). A looping last clip keeps playing until the next call, and asking again for
   * the loop that is running leaves it running (restart: true starts it over; loop: true / false
   * overrides how the last clip plays).
   * Resolves true once the sequence has played (a looping last clip: once it has started), false if
   * another play() or stop() took over first or a sheet failed to load (an "error" event says which).
   */
  async play(name, options = {}) {
    const { steps, then } = this.resolve(name);
    const token = ++this.token;
    const lastId = steps[steps.length - 1];
    const loopLast = options.loop ?? !!this.manifest.clips[lastId].loop;
    if (steps.length === 1 && loopLast && !options.restart && this.looping === lastId) return true;
    this.renderer.pin?.([this.idle, ...steps]);
    for (let i = 0; i < steps.length; i++) {
      const last = i === steps.length - 1;
      if (!(await this.run(steps[i], last && loopLast, token)) || token !== this.token) return false;
    }
    if (loopLast) return true;
    const next = options.then ?? then ?? this.manifest.clips[lastId].next ?? this.idle;
    if (next !== false) this.play(next).catch((error) => this.emit('error', { id: next, error }));
    return true;
  }

  /** Freeze on the current frame (cancels the sequence and what would follow it). */
  stop() {
    this.token++;
    this.halt();
  }

  destroy() {
    this.stop();
    this.motionQuery?.removeEventListener?.('change', this.onMotionChange);
    this.renderer.dispose?.();
    this.canvas.remove();
    this.listeners.clear();
  }

  /** End what is playing: cancel its frame callback or timer and settle its run() as interrupted. */
  halt() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
    this.raf = this.timer = 0;
    this.looping = null;
    const settle = this.settle;
    this.settle = null;
    settle?.(false);
  }

  show(id, img, frame) {
    const c = this.current;
    if (c && c.id === id && c.img === img && c.frame === frame) return;
    this.current = { id, img, frame };
    this.renderer.draw(id, img, frame);
  }

  /** Play one clip. Resolves true at its end (a loop: once it has started), false if replaced. */
  async run(id, loop, token) {
    const clip = this.manifest.clips[id];
    let img;
    try {
      img = await this.renderer.load(id);
    } catch (error) {
      if (token === this.token) this.emit('error', { id, error });
      return false;
    }
    // While the sheet loaded, the previous clip kept playing; it ends now, unless this call was replaced.
    if (token !== this.token) return false;
    this.halt();
    this.emit('start', { id, loop });
    const { frames, fps, duration } = clip;
    const events = clip.events ?? [];
    return new Promise((resolve) => {
      const finish = () => {
        this.settle = null;
        this.raf = this.timer = 0;
        this.emit('end', { id });
        resolve(true);
      };
      if (loop) this.looping = id;
      else this.settle = resolve;
      if (this.reducedMotion) {
        // Reduced motion: hold the clip's poster frame and keep its timing, so app flows still advance.
        this.show(id, img, clip.poster ?? 0);
        if (loop) resolve(true);
        else this.timer = setTimeout(finish, duration * 1000);
        return;
      }
      this.show(id, img, 0);
      let t0 = -1;
      let prev = -1;
      const tick = (now) => {
        if (t0 < 0) t0 = now;
        const t = (now - t0) / 1000;
        if (events.length) this.fire(id, events, loop, duration, prev, t);
        prev = t;
        const frame = Math.floor(t * fps);
        if (!loop && frame >= frames) {
          this.show(id, img, frames - 1);
          return finish();
        }
        this.show(id, img, loop ? frame % frames : frame);
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
      if (loop) resolve(true);
    });
  }

  /** Emit the clip's events whose time falls in (prev, t]; a loop repeats them every duration. */
  fire(id, events, loop, duration, prev, t) {
    const first = loop ? Math.max(0, Math.floor(prev / duration)) : 0;
    const lastPass = loop ? Math.floor(t / duration) : 0;
    for (let k = first; k <= lastPass; k++) {
      for (const e of events) {
        const at = k * duration + e.t;
        if (at > prev && at <= t) this.emit('event', { id, ...e });
      }
    }
  }
}
