"""Diagnostic B08 crop/actual comparisons. Never modifies baseline or UI assets."""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib
import json
import argparse

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--revision', default='r01')
parser.add_argument('--out', default='handoff/P08/evidence')
args = parser.parse_args()
out = root / args.out
out.mkdir(parents=True, exist_ok=True)
baseline = root / 'handoff/P08/baseline/B08.png'
board = Image.open(baseline).convert('RGB')
panels = []
for n, x in enumerate([52, 453, 854, 1255], 1):
    crop = board.crop((x, 30, x + 365, 870))
    crop.save(out / f'baseline-S0{n}.png')
    actual = Image.open(out / f'P08-S0{n}-494x1000.png').convert('RGB')
    # Native pixels: baseline 365x840 vs actual 494x950, no distortion/resizing.
    canvas = Image.new('RGB', (365 + 494 + 48, 998), '#edf6fa')
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 12), f'B08 panel {n}: native 365x840', fill='#12384e')
    draw.text((389, 12), 'P08 actual: CSS 494x950 / DPR1', fill='#12384e')
    canvas.paste(crop, (12, 36))
    canvas.paste(actual, (389, 36))
    canvas.save(out / f'comparison-S0{n}.png')
    panels.append(actual)
strip = Image.new('RGB', (494 * 4 + 24 * 5, 998), '#edf6fa')
draw = ImageDraw.Draw(strip)
for i, panel in enumerate(panels):
    x = 24 + i * 518
    draw.text((x, 10), f'P08.S0{i+1} / {args.revision} / fixture', fill='#12384e')
    strip.paste(panel, (x, 36))
strip.save(out / 'P08-four-panels.png')
files = [baseline, *list((root / 'docs/flows/history').glob('*')), root / 'docs/flows/shared/history-fixtures.js']
files += [root / p for p in ['docs/flows/home/home.mjs', 'docs/flows/warranty-components/flow.js', 'docs/flows/warranty-components/index.html', 'docs/flows/auth-session/index.html', 'scripts/check_history_revision.cjs', 'scripts/check_dialogs.cjs', 'tests/history.test.mjs']]
manifest = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files if p.is_file()}
(out / 'source-sha256.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print('4 native-scale comparisons + four-panel actual strip. No pixel-perfect threshold claimed.')
