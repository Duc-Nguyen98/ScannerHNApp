"""Assemble unscaled contiguous browser captures, evidence only; never app assets."""
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
import json
import math

folder = Path(__file__).resolve().parent / 'evidence/revision-04'
captures = json.loads((folder / 'capture-parts.json').read_text(encoding='utf-8'))
results = []
for panel in ('S01', 'S02'):
    top_meta = next(p for p in captures if p['panel'] == panel and p['part'] == 'top')
    body_meta = next(p for p in captures if p['panel'] == panel and p['part'] == 'body')
    assert top_meta['scrollY'] == 0
    assert top_meta['viewport'] == body_meta['viewport'] and top_meta['dpr'] == body_meta['dpr']
    top = Image.open(folder / f'{panel}-top.png').convert('RGB')
    body = Image.open(folder / f'{panel}-body.png').convert('RGB')
    assert top.size == body.size
    seam = round(body_meta['scrollY'] * body_meta['dpr'])
    height = math.ceil(top_meta['screenHeight'] * top_meta['dpr'])
    assert 0 < seam < top.height and height - seam <= body.height
    full = Image.new('RGB', (top.width, height))
    full.paste(top.crop((0, 0, top.width, seam)), (0, 0))
    full.paste(body.crop((0, 0, body.width, height - seam)), (0, seam))
    full.save(folder / f'{panel}-full.png')
    overlap = min(100, top.height - seam)
    diff = ImageChops.difference(top.crop((0, seam, top.width, seam + overlap)), body.crop((0, 0, body.width, overlap)))
    results.append({'panel': panel, 'output': f'{panel}-full.png', 'size': full.size,
                    'seam_y_raster': seam, 'overlap_mean_absolute_rgb': ImageStat.Stat(diff).mean,
                    'method': 'Contiguous actual screenshots at same viewport/DPR, no resize/recolor/inpainting. Full-page evidence only; not a product image asset.'})
(folder / 'assembly.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
print(json.dumps(results, indent=2))
