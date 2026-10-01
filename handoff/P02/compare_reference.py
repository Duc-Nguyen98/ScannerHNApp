"""Diagnostic crop/comparison only. Never changes/resizes the locked board."""
import hashlib
import json
from pathlib import Path
from PIL import Image

repo = Path(__file__).resolve().parents[2]
out = Path(__file__).parent / 'evidence'
baseline = repo / 'design/01_Main/BOARDS/00_LOCKED_ORIGINALS/02_Trang_chu_ORIGINAL.jpg'
attached = Path('C:/Users/TAN MIE/Downloads/ScannerHNApp_24_Prompts_v2.0/ScannerHNApp_24_Prompts/references/B02.jpg')
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
expected = 'ed0d7b90fdb66778cab0ff53b9537785e55ec60227d7666e5d7693f42eb15ef8'
assert sha(baseline) == sha(attached) == expected
crop = (522, 48, 1016, 998)  # estimated app area; excludes OS chrome, not app controls
reference = Image.open(baseline).convert('RGB').crop(crop)
actual = Image.open(out / 'P02-S01-494.png').convert('RGB')
assert reference.size == actual.size == (494, 950)
reference.save(out / 'baseline-app-crop.png')
side = Image.new('RGB', (988, 950), 'white')
side.paste(reference, (0, 0)); side.paste(actual, (494, 0))
side.save(out / 'comparison-S01.png')
(out / 'baseline-comparison.json').write_text(json.dumps({
    'sha256': expected, 'attached_sha256': sha(attached), 'post_capture_sha256': sha(baseline),
    'original_dimensions': Image.open(baseline).size, 'crop_estimated': crop,
    'actual_dimensions': actual.size, 'viewport_css': [494, 950], 'dpr': 1, 'zoom': 1,
    'resized': False, 'masked': False, 'pixel_threshold': None,
    'status': 'FAIL: repository photo/icons restored, exact B02 assets/font/texture unverified; no pixel PASS claim',
}, ensure_ascii=False, indent=2), encoding='utf-8')
print('Checksum unchanged; diagnostic comparison written without resize/mask.')
