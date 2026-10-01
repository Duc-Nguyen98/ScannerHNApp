"""B05 native baseline/actual diagnostic. No resampling, no masks, no pixel-pass threshold."""
from pathlib import Path
from PIL import Image, ImageDraw
import subprocess, hashlib, json, io
repo=Path(__file__).resolve().parents[2]
out=Path(__file__).parent/'evidence'
source='design/01_Main/BOARDS/01_UPDATED_BOARDS/03_xuat_kho.png'
raw=subprocess.check_output(['git','show','HEAD:'+source],cwd=repo)
provided=Path('C:/Users/TAN MIE/Downloads/ScannerHNApp_24_Prompts_v2.0/ScannerHNApp_24_Prompts/references/B05.png').read_bytes()
assert raw==provided
(out/'B05-reference.png').write_bytes(raw)
board=Image.open(io.BytesIO(raw)).convert('RGB')
actuals=[];panels=[]
for i,(left,right) in enumerate([(30,381),(404,755),(780,1132),(1156,1509)],1):
    crop=[left,77,right,946] # estimated excludes OS status bar and board captions
    ref=board.crop(crop);ref.save(out/f'baseline-S0{i}-crop.png')
    actual=Image.open(out/f'P05-S0{i}-494x1000.png').convert('RGB');actuals.append(actual)
    comparison=Image.new('RGB',(ref.width+actual.width,max(ref.height,actual.height)+30),'#eaf4f8')
    draw=ImageDraw.Draw(comparison);draw.text((10,7),'B05 native crop (estimated)',fill='#102640');draw.text((ref.width+10,7),'Actual - 494x950 CSS shell',fill='#102640')
    comparison.paste(ref,(0,30));comparison.paste(actual,(ref.width,30));comparison.save(out/f'comparison-S0{i}.png')
    panels.append({'panel':f'P05.S0{i}','crop_estimated':crop,'baseline_size':ref.size,'actual_size':actual.size})
overview=Image.new('RGB',(sum(a.width for a in actuals),max(a.height for a in actuals)),'#eaf4f8');x=0
for a in actuals:overview.paste(a,(x,0));x+=a.width
overview.save(out/'P05-actual-overview.png')
(out/'baseline-comparison.json').write_text(json.dumps({'sha256':hashlib.sha256(raw).hexdigest(),'supplied_matches_commit':True,'source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip(),'board_size':board.size,'viewport_css':[494,1000],'shell_css':[494,950],'DPR':1,'zoom':1,'font':'Arial system; exact B05 font unavailable','resize':False,'mask':False,'threshold':None,'purpose':'Native side-by-side review only. B05 raster panel and requested 494x950 shell differ in proportions; no valid pixel-diff pass claimed. Intentional copy migration and note count correction.','panels':panels},ensure_ascii=False,indent=2),encoding='utf-8')
print('Baseline matches commit; 4 native comparisons and overview saved.')
