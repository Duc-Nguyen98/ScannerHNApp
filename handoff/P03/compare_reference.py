"""Diagnostic comparison with B03: immutable crops, no resize/masking/threshold."""
from pathlib import Path
from PIL import Image
import subprocess
import hashlib
import io
import json

repo = Path(__file__).resolve().parents[2]
out = Path(__file__).parent / 'evidence'
board_path = 'design/01_Main/BOARDS/01_UPDATED_BOARDS/01_dialog_header_aligned_v2.png'
raw = subprocess.check_output(['git', 'show', 'HEAD:' + board_path], cwd=repo)
digest = hashlib.sha256(raw).hexdigest()
assert digest == 'a13e65f782ac8f64048a1a3ea2dfe615a62cdb9c99076d8ba5cdefaeb0901caa'
baseline = Image.open(io.BytesIO(raw)).convert('RGB')
(out / 'B03-reference.png').write_bytes(raw)
results = []
overview = Image.new('RGB', (4 * 394, 692), 'white')
for i, x in enumerate([50, 477, 903, 1329], 1):
    crop = (x, 85, x + 394, 777)
    reference = baseline.crop(crop)
    actual = Image.open(out / f'P03-S0{i}-394.png').convert('RGB')
    assert actual.size == reference.size == (394, 692)
    reference.save(out / f'baseline-S0{i}-crop.png')
    side = Image.new('RGB', (788, 692), 'white')
    side.paste(reference, (0, 0))
    side.paste(actual, (394, 0))
    side.save(out / f'comparison-S0{i}.png')
    overview.paste(actual, ((i - 1) * 394, 0))
    results.append({'panel': f'P03.S0{i}', 'crop_estimated': crop,
                    'actual': f'P03-S0{i}-394.png', 'comparison': f'comparison-S0{i}.png'})
overview.save(out / 'P03-actual-overview.png')
(out / 'baseline-comparison.json').write_text(json.dumps({
    'source_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo).decode().strip(),
    'baseline_sha256': digest, 'source_dimensions': baseline.size, 'panels': results,
    'viewport_css': [394, 692], 'DPR': 1, 'zoom': 1,
    'font': 'Arial, sans-serif (system; exact B03 family UNKNOWN)',
    'crop_excludes': 'OS status bar, home indicator, board captions; all app controls retained',
    'resized': False, 'masked': False, 'pixel_threshold': None,
    'visual_status': 'FAIL: layout implemented; visible differences in typography/icon geometries/texture; designer review needed',
}, ensure_ascii=False, indent=2), encoding='utf-8')
print('4 fixed-size comparisons and actual overview saved; baseline unchanged.')
