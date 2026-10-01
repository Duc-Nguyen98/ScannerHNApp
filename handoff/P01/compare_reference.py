"""Diagnostic crops only. Never writes baseline or product assets; no pixel-pass gate."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import argparse

root = Path(__file__).resolve().parents[2]
baseline = root / 'design/01_Main/BOARDS/00_LOCKED_ORIGINALS/01_Dang_nhap_va_Xac_nhan_phien_ORIGINAL.jpg'
parser = argparse.ArgumentParser()
parser.add_argument('--evidence-dir', type=Path, default=Path(__file__).resolve().parent / 'evidence')
parser.add_argument('--actual-extension', default='png', choices=['png', 'jpg'])
args = parser.parse_args()
evidence = args.evidence_dir.resolve()
image = Image.open(baseline)
results = {'sha256': hashlib.sha256(baseline.read_bytes()).hexdigest(), 'baseline_size': image.size,
           'method': 'Unscaled rectangular content crops. Estimated; no source DPR/font/zoom and no approved threshold. Qualitative review only.', 'panels': []}
for panel, x in [('S01', 211), ('S02', 800)]:
    crop = image.crop((x, 114, x + 438, 948))
    actual = Image.open(evidence / f'P01-{panel}-438.{args.actual_extension}').convert('RGB')
    crop.save(evidence / f'baseline-{panel}-crop.png')
    # Preserve pixels, never stretch either reference or actual.
    paired = Image.new('RGB', (crop.width + actual.width, max(crop.height, actual.height)), 'white')
    paired.paste(crop, (0, 0))
    paired.paste(actual, (crop.width, 0))
    paired.save(evidence / f'comparison-{panel}.png')
    results['panels'].append({'panel': panel, 'crop': [x, 114, 438, 834], 'actual_size': actual.size,
                              'visual_status': 'FAIL', 'reason': 'Visible differences remain: logo, hero composition, original font/texture and exact icon rendering. No claim of 100% equivalence.'})
(evidence / 'baseline-comparison.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
print(json.dumps(results, indent=2))
