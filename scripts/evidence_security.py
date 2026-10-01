"""P11 visual evidence only: unchanged baseline crops and real browser captures."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, hashlib, shutil
root=Path(__file__).resolve().parents[1]
out=root/'handoff/P11/evidence/revision-01'
baseline=Path('C:/Users/TAN MIE/Downloads/ScannerHNApp_24_Prompts_v2.0/ScannerHNApp_24_Prompts/references/B11.png')
shutil.copy2(baseline,out/'B11-baseline.png')
source=Image.open(baseline)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
overview=Image.new('RGB',(2076,1020),'#edf4f8');draw=ImageDraw.Draw(overview)
crops=[(22,79,380,862),(401,79,759,862),(780,79,1136,862),(1156,79,1516,862)]
for i,crop in enumerate(crops,1):
    source.crop(crop).save(out/f'P11-S0{i}-baseline-crop.png')
    actual=Image.open(out/f'final/P11-S0{i}-actual.png').convert('RGB')
    assert actual.size==(494,950)
    overview.paste(actual,(20+(i-1)*514,50))
    draw.text((20+(i-1)*514,12),f'P11.S0{i} | r01 | 494 x 950',fill='#083b62',font=font)
overview.save(out/'P11-r01-overview.png')
files=[p for p in (root/'docs/flows/security').iterdir() if p.is_file()]
files += [root/p for p in ['docs/flows/home/home.mjs','docs/flows/home/home-flow.mjs','docs/flows/profile/profile.mjs','docs/flows/auth-session/index.html','scripts/check_security.cjs','scripts/check_profile.cjs','tests/security.test.mjs']]
manifest={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
manifest['B11 user baseline']=hashlib.sha256(baseline.read_bytes()).hexdigest()
(out/'source-sha256.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
(out/'capture-context.json').write_text(json.dumps({'baseline_size':source.size,'baseline_crops_estimated':crops,'app_css_px':[494,950],'reference_viewport':[494,1000],'dpr':1,'browser_zoom':1,'font':'Arial, sans-serif; Designer font unverified','scroll_top_reference':0,'fixture':'P11 explicit B11 isolated memory adapter; fixed 2026-09-09T14:25:00+07:00','status_bar':'omitted per contract; shared app shell retained','animation':'no P11 animation','source_commit':'da9f623a19d0359c3e80c14f8cc612636ec6ab78','visual_status':'USER_REVIEW_PENDING; no pixel-perfect threshold claimed'},ensure_ascii=False,indent=2),encoding='utf8')
cards=''.join(f'<section><h2>P11.S0{i} · {title}</h2><div class="pair"><figure><img src="evidence/revision-01/P11-S0{i}-baseline-crop.png"><figcaption>Baseline B11 · crop estimated · tỉ lệ gốc</figcaption></figure><figure><img src="evidence/revision-01/final/P11-S0{i}-actual.png"><figcaption>Actual r01 · 494×950 CSS px · DPR 1</figcaption></figure></div></section>' for i,title in enumerate(['Đổi mật khẩu','Xác thực thông tin — lỗi','Đã đổi mật khẩu','Phiên đăng nhập'],1))
(root/'handoff/P11/REVIEW.html').write_text('''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P11 r01 · Bảo mật · Đối chiếu</title><style>body{margin:28px;font:16px/1.6 Arial;background:#edf4f8;color:#123b57}h1{margin:0}a{color:#006383}.pair{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}figure{margin:0;max-width:100%}img{display:block;width:358px;max-width:100%;height:auto}section{padding:24px;background:white;border-radius:16px;margin:24px 0}figcaption{font-size:13px}p{max-width:1100px}</style><h1>P11 · Bảo mật · r01</h1><p>Đã dựng đủ 4 panel tương tác. Visual chờ user nghiệm thu; behavior đã kiểm trong prototype; integration backend BLOCKED. B11 có tỷ lệ phone khác khung app 494×950 đã chốt. Bỏ status bar giả, dùng nav chung và icon metadata pastel trung tính. Font Designer chưa xác minh. Không kéo méo ảnh hoặc tự kết luận pixel-perfect.</p><p><a href="http://127.0.0.1:8766/flows/auth-session/">Mở app preview</a> · Đăng nhập minhanh / preview → Bắt đầu ca → Cá nhân → Tài khoản &amp; bảo mật. Chọn Đổi mật khẩu hoặc Phiên đăng nhập.</p><p>Mặc định thao tác chưa kết nối, không giả thành công. Để xem các state B11, mở “P11 · Kịch bản kiểm chứng” ở công cụ ngoài app, chọn “B11 · thành công &amp; hai thiết bị (fixture)”. Đây là adapter thử trong bộ nhớ; không thay mật khẩu tài khoản hoặc P01 và không đăng xuất thiết bị thật.</p><p><a href="REPORT.md">Báo cáo</a> · <a href="evidence/revision-01/P11-r01-overview.png">Bốn panel actual</a> · <a href="evidence/revision-01/final/browser-results.json">Kết quả browser P11</a></p>'''+cards,encoding='utf8')
