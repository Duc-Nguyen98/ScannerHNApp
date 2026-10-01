"""Read-only raster sampling; diagnostic estimates, not original CSS tokens."""
from pathlib import Path
from PIL import Image
from statistics import median
import json

evidence = Path(__file__).resolve().parent / 'evidence'
images = {
    'B01': Image.open(evidence / 'baseline-S02-crop.png').convert('RGB'),
    'revision02': Image.open(evidence / 'revision-02/P01-S02-438.jpg').convert('RGB'),
}
regions = {
    'primary_empty': (100, 575, 130, 620),
    'notice_surface': (120, 530, 360, 537),
    'secondary_surface': (40, 695, 100, 725),
    'avatar_empty': (53, 304, 78, 317),
    'warehouse_blue': (43, 410, 69, 436),
    'info_blue': (45, 485, 69, 509),
    'logout_ink': (156, 699, 180, 724),
    'footer_ink': (155, 788, 285, 825),
}
for label, img in images.items():
    result = {}
    for region, box in regions.items():
        pixels = list(img.crop(box).getdata())
        if region.endswith('_blue'):
            pixels = [p for p in pixels if p[2] - p[0] > 45 and p[0] < 110 and p[1] < 170]
        if region.endswith('_ink'):
            pixels = [p for p in pixels if p[0] < 170 and p[1] < 190 and p[2] > p[0] + 10]
        if pixels:
            rgb = [round(median([p[c] for p in pixels])) for c in range(3)]
            result[region] = {'rgb': rgb, 'hex': '#%02x%02x%02x' % tuple(rgb), 'pixels': len(pixels)}
    print(json.dumps({'source': label, 'estimated': True, 'regions': result}, ensure_ascii=False))
