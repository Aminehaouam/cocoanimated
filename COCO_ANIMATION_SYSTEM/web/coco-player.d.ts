/** Types for coco-player.js (documentation/integration_guide.md). */

export type Stage = [x: number, y: number, width: number, height: number];
export type Facing = 'left' | 'right';

/** One clip of exports/spritesheets/manifest.json. */
export interface CocoClip {
  file: string;
  category: string;
  kind: string;
  title: string;
  frames: number;
  columns: number;
  frameWidth: number;
  frameHeight: number;
  fps: number;
  loop: boolean;
  duration: number;
  /** Frame shown with reduced motion. */
  poster: number;
  /** Canvas position (Coco canvas px) of each frame's top-left corner. */
  origin: [number, number];
  next?: string;
  from?: string;
  to?: string;
  events?: Array<{ t: number; name: string; data?: unknown }>;
}

export interface CocoManifest {
  format: 'coco-spritesheets';
  version: number;
  canvas: { width: number; height: number; anchor: [number, number] };
  scale: number;
  clips: Record<string, CocoClip>;
}

export interface CocoPreset {
  play: string | string[];
  then?: string;
  scenario?: string;
}

export interface CocoPresetsFile {
  format?: 'coco-presets';
  version?: number;
  presets: Record<string, CocoPreset>;
}

/** What CocoPlayer draws with; SpritesheetRenderer is the default. */
export interface CocoRenderer {
  facing: Facing;
  load(id: string): Promise<unknown>;
  draw(id: string, sheet: any, frame: number): void;
  pin?(ids: string[]): void;
  dispose?(): void;
}

export interface CocoPlayerOptions {
  /** URL of exports/spritesheets/manifest.json; the sheets are resolved next to it. */
  manifestUrl?: string;
  /** URL of web/presets.json. */
  presetsUrl?: string;
  /** The presets themselves, instead of presetsUrl. */
  presets?: CocoPresetsFile | Record<string, CocoPreset>;
  /** Region of Coco's 1024 x 1024 canvas to show (default: all of it). */
  stage?: Stage;
  /** Clip played when nothing else is (default "idle_main"). */
  idle?: string;
  /** Accessible name (default "Coco the parrot"); null = decorative. */
  label?: string | null;
  /** "auto" (default) follows prefers-reduced-motion. */
  reducedMotion?: 'auto' | boolean;
  /** Start the idle right away (default true). */
  autoplay?: boolean;
  /** Sheets kept in memory (default 8). */
  maxSheets?: number;
  /** For sheets on another origin. */
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  renderer?: CocoRenderer;
}

export interface CocoPlayOptions {
  /** What follows the last one-shot: a preset or clip id; false holds the last frame. */
  then?: string | false;
  /** Override whether the last clip loops. */
  loop?: boolean;
  /** Start the loop over even if it is already running. */
  restart?: boolean;
}

export interface CocoEvents {
  start: { id: string; loop: boolean };
  end: { id: string };
  event: { id: string; t: number; name: string; data?: unknown };
  error: { id: string; error: Error };
}

export class SpritesheetRenderer implements CocoRenderer {
  constructor(canvas: HTMLCanvasElement, manifest: CocoManifest, baseUrl: string, stage: Stage, options?: { maxSheets?: number; crossOrigin?: string });
  facing: Facing;
  maxSheets: number;
  load(id: string): Promise<HTMLImageElement>;
  pin(ids: string[]): void;
  draw(id: string, img: HTMLImageElement, frame: number): void;
  dispose(): void;
}

export class CocoPlayer {
  /** Create a player in `container`; rejects if the manifest, presets or idle sheet cannot load. */
  static create(container: HTMLElement, options?: CocoPlayerOptions): Promise<CocoPlayer>;
  constructor(container: HTMLElement, manifest: CocoManifest, presets: CocoPresetsFile | Record<string, CocoPreset>, manifestUrl: string, options?: CocoPlayerOptions);
  readonly canvas: HTMLCanvasElement;
  readonly manifest: CocoManifest;
  readonly presets: Record<string, CocoPreset>;
  readonly renderer: CocoRenderer;
  readonly idle: string;
  readonly reducedMotion: boolean;
  /** Id of the loop that is running, if any. */
  readonly looping: string | null;
  /** Clip ids in the manifest. */
  readonly clips: string[];
  readonly presetNames: string[];
  has(name: string): boolean;
  /** Resolves true once played (a loop: once started), false if replaced or a sheet failed. */
  play(name: string, options?: CocoPlayOptions): Promise<boolean>;
  /** Freeze on the current frame. */
  stop(): void;
  preload(names: string | string[]): Promise<unknown[]>;
  resolve(name: string): { steps: string[]; then?: string };
  setFacing(facing: Facing): void;
  setLabel(label: string | null): void;
  setReducedMotion(mode: 'auto' | boolean): void;
  /** Returns an unsubscribe function. */
  on<K extends keyof CocoEvents>(event: K, fn: (data: CocoEvents[K]) => void): () => void;
  destroy(): void;
}
