"""P10 review artifacts; preserve baseline and screenshot aspect ratios."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import shutil, json, hashlib

root = Path(__file__).resolve().parents[1]
out = root / 'handoff/P10/evidence/revision-01'
baseline = Path('C:/Users/TAN MIE/Downloads/ScannerHNApp_24_Prompts_v2.0/ScannerHNApp_24_Prompts/references/B10.png')
shutil.copy2(baseline, out / 'B10-baseline.png')
source = Image.open(baseline)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 24)
board = Image.new('RGB', (2076, 1020), '#eaf3f7')
draw = ImageDraw.Draw(board)
for i, (left, right) in enumerate([(61,413),(459,814),(858,1215),(1258,1613)], 1):
    source.crop((left,39,right,856)).save(out / f'P10-S0{i}-baseline-crop.png')
    actual = Image.open(out / f'P10-S0{i}-actual.png').convert('RGB')
    board.paste(actual, (20+(i-1)*514,50))
    draw.text((20+(i-1)*514,12), f'P10.S0{i} | r01 | 494 x 950', fill='#083b62', font=font)
board.save(out / 'P10-r01-overview.png')
files = ['docs/flows/profile/'+n for n in ['profile.mjs','profile-model.mjs','icons.mjs','style.css','index.html']]
files += ['docs/flows/home/home.mjs','docs/flows/auth-session/index.html','docs/flows/shared/dialog-route.mjs','scripts/check_profile.cjs','scripts/check_home.cjs','scripts/check_dialogs.cjs','scripts/capture_profile.cjs','tests/profile.test.mjs','tests/dialog-route.test.mjs']
manifest = {f: hashlib.sha256((root/f).read_bytes()).hexdigest() for f in files}
manifest['B10 user baseline'] = hashlib.sha256(baseline.read_bytes()).hexdigest()
(out/'source-sha256.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
cards=''.join(f'<section><h2>P10.S0{i}</h2><div class="pair"><figure><img src="evidence/revision-01/P10-S0{i}-baseline-crop.png"><figcaption>B10 · crop estimated · giữ tỉ lệ gốc</figcaption></figure><figure><img src="evidence/revision-01/P10-S0{i}-actual.png"><figcaption>Actual · 494×950 CSS px · DPR 1</figcaption></figure></div></section>' for i in range(1,5))
(root/'handoff/P10/REVIEW.html').write_text('''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P10 r01 · Review</title><style>body{margin:28px;font:16px/1.6 Arial;background:#edf4f8;color:#123b57}h1{margin:0}a{color:#006383}.pair{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}figure{margin:0;max-width:100%}img{display:block;width:352px;max-width:100%;height:auto}section{padding:20px;background:white;border-radius:16px;margin:24px 0}figcaption{font-size:13px}</style><h1>P10 · Cá nhân · r01</h1><p>4/4 panel đã dựng. Visual chờ duyệt; behavior PASS prototype; integration BLOCKED. Baseline và actual khác tỷ lệ do khung app 494×950 đã chốt và bỏ status bar giả; không kéo méo ảnh, không dùng pixel diff để tự nghiệm thu.</p><p><a href="http://127.0.0.1:8766/flows/auth-session/">Mở app</a> · Đăng nhập minhanh / preview → Bắt đầu ca → Cá nhân. <a href="REPORT.md">Báo cáo</a></p>'''+cards,encoding='utf8')
