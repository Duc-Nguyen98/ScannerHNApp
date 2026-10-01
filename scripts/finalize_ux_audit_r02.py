from pathlib import Path
import csv,hashlib,html,io,json,re
repo=Path(__file__).resolve().parents[1];out=repo/'handoff/ux-audit-2026-09-30-r02'
suites={
 'shared':'shared/verified-02/results.json','forward':'shared/forward-after/results.json','long':'shared/long-verified/results.json',
 'lifecycle':'shared/lifecycle-02/shared-feedback-lifecycle.json','touch':'shared/touch-regression/results.json','touch_edges':'shared/touch-edges/results.json',
 'profile':'shared/profile-regression/results.json','footer':'shared/footer-regression/results.json',
 'lookup_nfc':'p06-p07/after/results.json','nfc_r13':'p06-p07/nfc-regression/results.json','nfc_repeat':'p06-p07/nfc-repeat/results.json','lookup_recent':'p06-p07/recent-regression/after/results.json',
 'manual':'p04-p05/manual-regression/results.json','reader':'p04-p05/verified-02/results.json','eye':'routes/eye-verified/results.json',
 'security_layout':'routes/security-layout/results.json','security_live':'routes/security-live/results.json',
 'warranty':'routes/warranty-regression/navigation-results.json','history':'routes/history-verified/results.json'
}
checked={}
for name,p in suites.items():
 data=json.loads((out/p).read_text(encoding='utf-8-sig'))
 if isinstance(data,list):data={'results':data}
 def fail(v):
  if isinstance(v,dict):
   if v.get('status')=='FAIL': return True
   return any(fail(x) for x in v.values())
  return isinstance(v,list) and any(fail(x) for x in v)
 assert not fail(data),p
 assert not data.get('errors'),p
 rows=data.get('checks',data.get('results',data.get('cases',[])))
 checked[name]={'path':p,'pass_groups':sum(isinstance(r,dict) and r.get('status')=='PASS' for r in rows),'errors':data.get('errors',[])}
 if name=='lifecycle' and data.get('status')=='PASS':checked[name]['pass_groups']=len(rows)
 if name=='footer':checked[name]['unit']='viewport'
summary={'revision':'UX-AUDIT-20260930-r02','target_kind':'prototype','reproduced_fixed_cases':11,'node_unique':223,'visual':'AWAITING_USER_REVIEW','behavior':'PASS_PROTOTYPE_SCOPED','integration':'NOT_RUN_PRODUCTION_HARDWARE','suites':checked,'report':'handoff/ux-audit-2026-09-30-r02/REPORT.md','review':'handoff/ux-audit-2026-09-30-r02/REVIEW.html','limitations':['Device keyboard/touch/NFC/camera/WMS unverified.','P24 not implemented; no new durable persistence.','No guarantee against cases outside this audit.']}
(out/'SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
paths=['docs/flows/shared/'+x for x in ['action-dialog.mjs','action-dialog.css','app-modal.mjs','dialog-route.mjs','scaled-controls.mjs']]+['docs/flows/'+x for x in ['history/history-picker.mjs','lookup/lookup.mjs','nfc/nfc.mjs','security/security.mjs','outbound/outbound.mjs','outbound/style.css']]
(out/'source-sha256.json').write_text(json.dumps({p:hashlib.sha256((repo/p).read_bytes()).hexdigest() for p in paths},indent=2)+'\n',encoding='utf-8')
pairs=[
 ('Dialog dài vẫn đọc đủ hậu quả','Tiêu đề cuộn riêng; nút và nội dung quyết định còn truy cập được.','shared/before/long-title.png','shared/verified-02/long-title.png'),
 ('Ngữ cảnh bộ lọc không bị cắt','Chuỗi dài wrap và cuộn bằng chuột hoặc bàn phím.','shared/scope-before/scope-readable.png','shared/verified-02/scope-readable.png'),
 ('Forward không tạo bước Back thừa','P11 Hủy → Forward → Back/Rời màn về đúng Tài khoản & bảo mật.','shared/forward-before/after-leave.png','shared/forward-after/after-leave.png'),
 ('Tìm kiếm sau khi xóa lúc gõ tiếng Việt','Ô mới nhận input và cập nhật đúng query.','p06-p07/before/lookup-ime-after-clear.png','p06-p07/after/lookup-ime-after-clear.png'),
 ('NFC Back nhanh chỉ quay một bước','Hai lần bấm liên tiếp không bỏ qua bước đọc thẻ.','p06-p07/before/nfc-repeated-back-keeps-parent.png','p06-p07/after/nfc-repeated-back-keeps-parent.png'),
 ('Phân biệt lỗi nguồn NFC','Không mở dữ liệu lỗi/cũ như thông tin vừa xác minh.','p06-p07/before/nfc-error-row-click-guard.png','p06-p07/after/nfc-error-row-click-guard.png'),
 ('Tên người nhận dài xem gọn','Hàng từ 1415px còn 101px; Xem đầy đủ giữ nguyên 2100 ký tự.','p04-p05/before-complete/p05-long-review.png','p04-p05/verified-02/p05-long-review.png')
]
cards=[]
for title,desc,before,after in pairs:
 for p in [before,after]:assert (out/p).is_file(),p
 cards.append(f'<section><h2>{html.escape(title)}</h2><p>{html.escape(desc)}</p><div class="pair"><figure><figcaption>Trước</figcaption><a href="{before}"><img loading="lazy" src="{before}" alt="Trước"></a></figure><figure><figcaption>Sau</figcaption><a href="{after}"><img loading="lazy" src="{after}" alt="Sau"></a></figure></div></section>')
doc='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hoa Nam · Rà soát UI/UX r02</title><style>*{box-sizing:border-box}body{margin:0;font:16px/1.55 system-ui,sans-serif;color:#123b57;background:#eef4f8}main{max-width:1100px;margin:auto;padding:28px 20px}h1{font-size:30px;line-height:1.2}h2{font-size:21px;margin:0}p{color:#476477}section{padding:24px;margin:24px 0;border:1px solid #dbe7ee;border-radius:16px;background:white}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;text-align:center}figcaption{font-weight:650;margin-bottom:12px}img{max-width:100%;max-height:800px;width:auto;border-radius:10px;border:1px solid #d8e4ec}a{color:#006887}.tag{display:inline-block;border-radius:8px;background:#fff2d5;color:#805100;padding:6px 10px}@media(max-width:600px){main{padding:18px 10px}section{padding:12px}.pair{gap:8px}h1{font-size:24px}}</style><main><h1>Hoa Nam · Rà soát UI/UX lần hai</h1><span class="tag">11 ca lỗi đã sửa · hình thức chờ review</span><p>Đã kiểm lại thao tác nối tiếp, Back/Forward, nội dung dài, vùng bấm và focus. 223/223 test logic liên quan đạt; giữ 494×950, 24 board / 91 panel và footer đã chốt.</p><p><a href="http://localhost:8766/flows/auth-session/?review=ux-audit-r02" target="_blank" rel="noopener">Mở preview mới</a> · <a href="REPORT.md">Báo cáo và giới hạn kiểm chứng</a></p>'''+''.join(cards)+'''<section><h2>Phạm vi kiểm chứng</h2><p>Ảnh actual cùng viewport và dữ liệu của từng ca; đồng hồ sống có thể khác thời điểm. Chưa kiểm bàn phím/cảm ứng, camera/NFC và WMS trên thiết bị kho thật. Nhấn ảnh để xem nguyên kích thước.</p></section></main></html>'''
(out/'REVIEW.html').write_text(doc,encoding='utf-8')

# Merge only this audit record, preserving ongoing work from other chats.
sp=repo/'RUN_STATE.json';original=sp.read_text(encoding='utf-8-sig');state=json.loads(original);state['ux_audit_20260930_r02']=summary
assert sp.read_text(encoding='utf-8-sig')==original
sp.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cp=repo/'SCREEN_COVERAGE.csv';original=cp.read_text(encoding='utf-8-sig');reader=csv.DictReader(io.StringIO(original));fields=reader.fieldnames;rows=list(reader);assert len(rows)==91 and len(set(r['prompt_id'] for r in rows))==24
for row in rows:
 if row['prompt_id'] in [f'P{i:02d}' for i in range(1,12)]:
  report=summary['report']
  if report not in row['evidence']:row['evidence']+='; '+report
  note=' UX-AUDIT-r02: reproduced fixes and scoped regressions verified; new visuals await review; production/hardware unchanged.'
  if 'UX-AUDIT-r02:' not in row['blocker']:row['blocker']+=note
  if row['prompt_id'] in ['P05','P06','P07','P11']:row['visual_status']='IN_PROGRESS'
buf=io.StringIO(newline='');writer=csv.DictWriter(buf,fieldnames=fields,quoting=csv.QUOTE_ALL,lineterminator='\n');writer.writeheader();writer.writerows(rows)
assert cp.read_text(encoding='utf-8-sig')==original;cp.write_text(buf.getvalue(),encoding='utf-8')
print(json.dumps({'fixed_cases':11,'node':223,'preserved_prompt':state.get('current_prompt'),'preserved_revision':state.get('revision'),'suites':checked},ensure_ascii=False))
