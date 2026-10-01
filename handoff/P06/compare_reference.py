"""Technical native-crop comparison; no resampling, masks or pixel-pass claim."""
from pathlib import Path
from PIL import Image, ImageDraw
import subprocess, hashlib, json
repo=Path(__file__).resolve().parents[2]
out=Path(__file__).parent/'evidence'
raw=subprocess.check_output(['git','show','HEAD:design/01_Main/BOARDS/01_UPDATED_BOARDS/04_tra_cuu.png'],cwd=repo)
assert raw==(out/'B06-reference.png').read_bytes()
board=Image.open(out/'B06-reference.png').convert('RGB')
actuals=[];panels=[]
for i,(left,right) in enumerate([(33,381),(409,753),(781,1128),(1156,1504)],1):
    crop=[left,76,right,945] # estimated app-only crop; exclude OS status bar/caption
    ref=board.crop(crop);ref.save(out/f'baseline-S0{i}-crop.png')
    actual=Image.open(out/f'P06-S0{i}-494x1000.png').convert('RGB');actuals.append(actual)
    comparison=Image.new('RGB',(ref.width+actual.width,max(ref.height,actual.height)+30),'#eaf4f8')
    draw=ImageDraw.Draw(comparison);draw.text((10,7),'B06 native crop (estimated)',fill='#102640');draw.text((ref.width+10,7),'Actual 494x950 CSS shell',fill='#102640')
    comparison.paste(ref,(0,30));comparison.paste(actual,(ref.width,30));comparison.save(out/f'comparison-S0{i}.png')
    panels.append({'panel':f'P06.S0{i}','crop_estimated':crop,'baseline_size':ref.size,'actual_size':actual.size})
overview=Image.new('RGB',(sum(a.width for a in actuals),max(a.height for a in actuals)),'#eaf4f8');x=0
for a in actuals:overview.paste(a,(x,0));x+=a.width
overview.save(out/'P06-actual-overview.png')
(out/'baseline-comparison.json').write_text(json.dumps({'source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip(),'sha256':hashlib.sha256(raw).hexdigest(),'supplied_matches_commit':True,'viewport_css':[494,1000],'shell_css':[494,950],'DPR':1,'zoom':1,'font':'Arial system; exact B06 font unknown','resize':False,'mask':False,'threshold':None,'purpose':'Native diagnostic only: raster panel and existing app shell differ in proportions; visual review required. Product assets missing, no board image used as UI.','panels':panels},ensure_ascii=False,indent=2),encoding='utf-8')
print('B06 matches HEAD; four native comparisons and overview saved.')
