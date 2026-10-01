"""Append this audit's record without replacing another chat's checkpoint."""
from pathlib import Path
import csv, hashlib, html, io, json

repo=Path(__file__).resolve().parents[1]
out=repo/'handoff/ux-upgrade-2026-09-30'
sources=[
 'docs/flows/shared/scaled-controls.mjs','docs/flows/shared/priority-touch.mjs','docs/flows/shared/priority-touch.css',
 'docs/flows/auth-session/app.mjs','docs/flows/auth-session/index.html',
 'docs/flows/inbound/inbound.mjs','docs/flows/inbound/style.css','docs/flows/inbound/manual-entry.mjs',
 'docs/flows/outbound/outbound.mjs','docs/flows/outbound/style.css','docs/flows/outbound/fixture-adapter.mjs','docs/flows/outbound/source-review.mjs',
 'docs/flows/lookup/lookup.mjs','docs/flows/lookup/lookup-flow.mjs','docs/flows/lookup/style.css','docs/flows/lookup/recent-items.mjs',
 'docs/flows/nfc/nfc.mjs','docs/flows/nfc/nfc-flow.mjs','docs/flows/nfc/fixture-adapter.mjs',
 'AGENTS.md','docs/flows/shared/UI_STANDARD.md'
]
hashes={p:hashlib.sha256((repo/p).read_bytes()).hexdigest() for p in sources}
(out/'source-sha256.json').write_text(json.dumps(hashes,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
summary={
 'revision':'UX-20260930-r01','source_commit':'da9f623a19d0359c3e80c14f8cc612636ec6ab78','target_kind':'prototype',
 'features':['Priority touch controls P01–P11','Focused manual entry P04/P05','Recent lookup P06','Enter UID P07','Quick date ranges P06','Source replacement comparison P05'],
 'visual':'AWAITING_USER_REVIEW','behavior':'PASS_PROTOTYPE','integration':'NOT_RUN_PRODUCTION_HARDWARE',
 'node_unique':214,
 'browser_groups':{'touch_layout':12,'touch_edges':9,'profile_regression':7,'security_regression':7,'p04_p05':41,'p06':33,'p07':20},
 'footer_viewports':4,'root_layout_measurements':66,
 'report':'handoff/ux-upgrade-2026-09-30/REPORT.md','review':'handoff/ux-upgrade-2026-09-30/REVIEW.html',
 'limitations':['Real devices and WMS are unverified.','Recent items and drafts remain in page memory; no durable draft contract implemented.','At 340×420 manual entry lists require internal scrolling.','Additional NFC regression after final shared geometry: touch/nfc-final-regression/results.json; overlaps P07 groups, do not add again.']
}
(out/'SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

pairs=[
 ('Vùng bấm trên màn hình nhỏ','Back, lọc và xóa có chỗ riêng sau khi co khung.','touch/before/P06-list-360x800.png','touch/verified/P06-list-360x800.png'),
 ('Nhập mã tập trung · P04','Camera thu gọn; input, bộ đếm và mã vừa nhập dễ theo dõi.','p04-p05/before/p04-manual-494x1000.png','p04-p05/verified-touch/p04-manual-494x1000.png'),
 ('Nhập mã tập trung · P05','Ô nhập giữ focus và không tự gửi trong lúc gõ tiếng Việt.','p04-p05/before/p05-manual-494x1000.png','p04-p05/verified-touch/p05-manual-494x1000.png'),
 ('Sản phẩm vừa tra cứu','Tối đa 3 sản phẩm, chỉ nhớ trong phiên theo tài khoản và kho.','p06/before/recent-list-360x800.png','p06/final-touch/after/recent-list-360x800.png'),
 ('Tìm UID bằng Enter','Một kết quả đã xác minh mở dialog chi tiết hiện có.','p07/before/unique-enters-existing-detail.png','p07/verified/unique-enters-existing-detail.png'),
 ('Khoảng ngày nhanh','Dùng chung picker; chỉ Áp dụng mới lưu.','p06/before/date-picker-360x800.png','p06/final-touch/after/date-picker-360x800.png'),
 ('Đổi phiếu có so sánh','Đọc đầy đủ người nhận, số lượng và các thông tin sẽ thay thế.','p04-p05/before/p05-change-source.png','p04-p05/verified-touch/p05-change-source.png')
]
cards=[]
for title,detail,before,after in pairs:
 for p in [before,after]:
  if not (out/p).is_file(): raise FileNotFoundError(p)
 cards.append(f'<section><h2>{html.escape(title)}</h2><p>{html.escape(detail)}</p><div class="pair"><figure><figcaption>Trước</figcaption><a href="{before}"><img loading="lazy" src="{before}" alt="Trước: {html.escape(title)}"></a></figure><figure><figcaption>Sau</figcaption><a href="{after}"><img loading="lazy" src="{after}" alt="Sau: {html.escape(title)}"></a></figure></div></section>')
doc='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hoa Nam · 6 cải tiến UI/UX</title><style>
*{box-sizing:border-box}body{margin:0;background:#eef4f8;color:#123b57;font:16px/1.55 system-ui,sans-serif}main{max-width:1120px;margin:auto;padding:28px 20px}h1{font-size:30px;line-height:1.2;margin:0 0 14px}h2{font-size:22px;margin:0}p{margin:10px 0 20px;color:#426278}a{color:#006383}header{padding-bottom:22px}section{background:#fff;border:1px solid #dae6ee;border-radius:16px;padding:24px;margin-bottom:24px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;text-align:center}figcaption{margin-bottom:12px;font-weight:650}img{width:auto;max-width:100%;max-height:820px;vertical-align:top;border:1px solid #d5e1ea;border-radius:10px}.tag{display:inline-block;padding:5px 10px;background:#fff4d9;color:#805100;border-radius:8px}.note{border-left:3px solid #087a96;padding-left:14px}@media(max-width:600px){main{padding:22px 10px}section{padding:14px}.pair{gap:8px}h1{font-size:24px}}
</style><main><header><h1>Hoa Nam · 6 cải tiến thao tác</h1><span class="tag">Hình thức chờ bạn review</span><p>Giữ 24 board / 91 panel, khung 494×950 và footer đã chốt. Đây là ảnh chạy thực tế trong prototype; nhấn ảnh để xem đầy đủ.</p><p><a href="http://localhost:8766/flows/auth-session/?review=ux-20260930" target="_blank" rel="noopener">Mở preview mới</a> · <a href="REPORT.md">Báo cáo kiểm chứng</a></p><p class="note">214 test logic đạt. Các luồng chính đã kiểm bằng trình duyệt trên nhiều viewport. Bàn phím/camera/NFC và WMS thật chưa xác minh; không có lưu nháp bền qua tải lại app.</p></header>'''+''.join(cards)+'''<section><h2>Cửa sổ thấp</h2><p>Vùng bấm ưu tiên dành chỗ thật để tránh bấm nhầm. Danh sách dài vẫn cuộn trong app; không cắt dữ liệu để ép vừa khung.</p><div class="pair"><figure><figcaption>P03 · chọn tác vụ</figcaption><img src="touch/verified-edges/P03-picker.png" alt="P03 vùng bấm không chồng nhau"></figure><figure><figcaption>P07 · xem thẻ</figcaption><img src="touch/verified-edges/P07-detail.png" alt="Nút sao chép NFC trong hàng riêng"></figure></div></section></main></html>'''
(out/'REVIEW.html').write_text(doc,encoding='utf-8')

state_path=repo/'RUN_STATE.json';original=state_path.read_text(encoding='utf-8-sig');state=json.loads(original)
state['ux_upgrade_20260930']=summary
if state_path.read_text(encoding='utf-8-sig')!=original: raise RuntimeError('RUN_STATE changed while preparing; rerun to merge latest')
state_path.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
coverage_path=repo/'SCREEN_COVERAGE.csv';original=coverage_path.read_text(encoding='utf-8-sig');reader=csv.DictReader(io.StringIO(original));fields=reader.fieldnames;rows=list(reader)
assert len(rows)>=91 and len(set(r['prompt_id'] for r in rows))==24
for row in rows:
 if row['prompt_id'] in [f'P{i:02d}' for i in range(1,12)]:
  evidence='handoff/ux-upgrade-2026-09-30/REPORT.md'
  if evidence not in row['evidence']: row['evidence']+='; '+evidence
  if row['prompt_id']!='P10': row['visual_status']='IN_PROGRESS'
  note=' UX20260930: six approved improvements applied; scoped prototype behavior verified, new visuals await user review. Production/hardware unchanged.'
  if 'UX20260930:' not in row['blocker']: row['blocker']+=note
buf=io.StringIO(newline='');writer=csv.DictWriter(buf,fieldnames=fields,quoting=csv.QUOTE_ALL,lineterminator='\n');writer.writeheader();writer.writerows(rows)
if coverage_path.read_text(encoding='utf-8-sig')!=original: raise RuntimeError('Coverage changed while preparing; rerun to merge latest')
coverage_path.write_text(buf.getvalue(),encoding='utf-8')
print(json.dumps({'node':214,'browser_groups':sum(summary['browser_groups'].values()),'coverage_panels':len(rows),'preserved_current_prompt':state.get('current_prompt'),'preserved_revision':state.get('revision'),'review':str(out/'REVIEW.html')},ensure_ascii=False))
