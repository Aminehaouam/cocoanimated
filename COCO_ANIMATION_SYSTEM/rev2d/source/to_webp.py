"""Convert the exported PNG spritesheets to WebP (lossy with alpha) and point the manifest at them.

    npm run webp                                   (= python3 rev2d/source/to_webp.py, after npm run export)
    python3 rev2d/source/to_webp.py exports/spritesheets@2x [--keep-png]

WebP keeps the soft edges (8-bit alpha) at a fraction of the PNG size. The PNGs are removed unless
--keep-png is given; re-export to get them back.
"""
import json
import sys
from pathlib import Path

from PIL import Image

dirs = [a for a in sys.argv[1:] if not a.startswith('--')]
root = Path(dirs[0]).resolve() if dirs else Path(__file__).resolve().parents[2] / 'exports' / 'spritesheets'
keep_png = '--keep-png' in sys.argv
manifest_file = root / 'manifest.json'
manifest = json.loads(manifest_file.read_text())
before = after = 0
for clip_id, clip in manifest['clips'].items():
    png = root / f'{clip_id}.png'
    if not png.exists():
        continue
    webp = root / f'{clip_id}.webp'
    Image.open(png).save(webp, 'WEBP', quality=86, alpha_quality=95, method=6)
    before += png.stat().st_size
    after += webp.stat().st_size
    clip['file'] = webp.name
    if not keep_png:
        png.unlink()
manifest_file.write_text(json.dumps(manifest, indent=2) + '\n')
print(f'WebP: {before / 1e6:.1f} MB PNG -> {after / 1e6:.1f} MB WebP ({len(manifest["clips"])} clips in {root.name})')
