"""B04 diagnostic: immutable original, native crops, no image resampling/masks."""
from pathlib import Path
from PIL import Image
import subprocess, hashlib, json, io
repo = Path(__file__).resolve().parents[2]
out = Path(__file__).parent / 'evidence'
source = 'design/01_Main/BOARDS/01_UPDATED_BOARDS/02_nhap_kho.png'
raw = subprocess.check_output(['git', 'show', 'HEAD:' + source], cwd=repo)
provided = Path('C:/Users/TAN MIE/Downloads/ScannerHNApp_24_Prompts_v2.0/ScannerHNApp_24_Prompts/references/B04.png').read_bytes()
assert raw == provided, 'Supplied baseline differs from reference commit'
(out / 'B04-reference.png').write_bytes(raw)
board = Image.open(io.BytesIO(raw)).convert('RGB')
results, actuals = [], []
for i, x in enumerate([36, 410, 786, 1160], 1):
    crop = [x, 84, x + 340, 931]
    ref = board.crop(crop)
    actual = Image.open(out / f'P04-S0{i}-340.png').convert('RGB')
    ref.save(out / f'baseline-S0{i}-crop.png')
    side = Image.new('RGB', (ref.width + actual.width, max(ref.height, actual.height)), '#eaf4f8')
    side.paste(ref, (0, 0)); side.paste(actual, (ref.width, 0))
    side.save(out / f'comparison-S0{i}.png')
    results.append({'panel':f'P04.S0{i}', 'crop_estimated':crop, 'baseline_size':ref.size, 'actual_size':actual.size})
    actuals.append(actual)
overview = Image.new('RGB', (sum(a.width for a in actuals), max(a.height for a in actuals)), '#eaf4f8')
x = 0
for actual in actuals:
    overview.paste(actual,(x,0)); x += actual.width
overview.save(out / 'P04-actual-overview.png')
(out / 'baseline-comparison.json').write_text(json.dumps({'sha256':hashlib.sha256(raw).hexdigest(), 'source_dimensions':board.size,
    'source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip(),
    'supplied_matches_commit':True, 'viewport_css':[340,847], 'DPR':1,'zoom':1,'font':'Arial system; exact B04 unknown',
    'crop_excludes':'OS status bar, board captions; keeps app controls', 'resize':False, 'mask':False, 'threshold':None,
    'visual_status':'FAIL / review needed: font, icons, camera and box imagery differ; migrated copy intentionally differs', 'panels':results},ensure_ascii=False,indent=2),encoding='utf-8')
print('4 comparisons and overview saved; baseline matches commit; no resizing or masking.')
