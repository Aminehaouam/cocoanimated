/**
 * Loads the Rev2D library (https://github.com/RevStudio/Rev2D) from a local checkout.
 *
 * Location: $REV2D_HOME, else a checkout next to this repository (<repo>/../Rev2D).
 * The checkout needs its dependencies (`npm ci` in it). Scripts run through Rev2D's own tsx:
 *   node $REV2D_HOME/node_modules/tsx/dist/cli.mjs rev2d/source/build.ts
 * (that is what `npm run build` does inside COCO_ANIMATION_SYSTEM/).
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** COCO_ANIMATION_SYSTEM/ */
export const SYSTEM_ROOT = path.resolve(here, '../../..');
/** The repository root (parent of COCO_ANIMATION_SYSTEM/). */
export const REPO_ROOT = path.resolve(SYSTEM_ROOT, '..');
/** The Rev2D checkout. */
export const REV2D_HOME = path.resolve(process.env.REV2D_HOME ?? path.join(REPO_ROOT, '..', 'Rev2D'));

if (!existsSync(path.join(REV2D_HOME, 'src', 'index.ts'))) {
  throw new Error(
    `Rev2D checkout not found at ${REV2D_HOME}. Clone https://github.com/RevStudio/Rev2D there and run "npm ci" in it, or set REV2D_HOME.`,
  );
}

// The type comes from the sibling checkout (erased at runtime); the module itself follows REV2D_HOME.
type Rev2D = typeof import('../../../../Rev2D/src/index.ts');

/** The Rev2D public API: applyOps, loadModelObject, renderFrame, renderSheet, analyzeAnimation, ... */
export const R: Rev2D = await import(pathToFileURL(path.join(REV2D_HOME, 'src', 'index.ts')).href);

/** Absolute path inside COCO_ANIMATION_SYSTEM/. */
export function sys(...parts: string[]): string {
  return path.join(SYSTEM_ROOT, ...parts);
}
