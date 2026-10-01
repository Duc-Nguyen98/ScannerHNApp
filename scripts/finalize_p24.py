from pathlib import Path
import csv,io,json,re,hashlib,collections,html

root=Path(__file__).resolve().parents[1]
base=root/'handoff/P24'
panels={f'P24.S0{i}':title for i,title in enumerate(['Số lượng vượt tồn','Mã hộp chưa thể xuất','Chờ xử lý trên Web','Hồ sơ đã trả khách'],1)}
# Preserve unrelated CSV lines and top-level JSON fields exactly, reading current files.
coverage=root/'SCREEN_COVERAGE.csv'
lines=coverage.read_text(encoding='utf-8-sig').splitlines()
keys=next(csv.reader([lines[0]]));out=[lines[0]]
for line in lines[1:]:
 row=dict(zip(keys,next(csv.reader([line]))));changed=False
 if row['prompt_id']=='P23':
  row['visual_status']='PASS'
  if 'handoff/P23/TEMPORARY_ACCEPTANCE.md' not in row['evidence']:row['evidence']+='; handoff/P23/TEMPORARY_ACCEPTANCE.md'
  row['blocker']='P23 r03 temporarily accepted by user in P24 request2026-09-30; synchronization states deferred. Prior149 logic/67 browser groups remain prototype evidence; production events/backend/hardware/persistence unverified.'
  changed=True
 if row['panel_id'] in panels:
  row.update(title=panels[row['panel_id']],disposition='CURRENT',visual_status='IN_PROGRESS',behavior_status='PASS',integration_status='BLOCKED',evidence='handoff/P24/REPORT.md; handoff/P24/REVIEW.html; handoff/P24/STATE_ACCEPTANCE.csv; handoff/P24/evidence/revision-01',blocker='P24 r01 visual awaiting user review; scoped prototype behavior passed. Production auth/stock/record/Post/status/hardware and durable persistence unverified. Explicit B24 fixtures only.')
  changed=True
 if row['panel_id'] in ['P04.S04','P05.S04','P20.S01']:
  row['visual_status']='IN_PROGRESS'
  if 'handoff/P24/REPORT.md' not in row['evidence']:row['evidence']+='; handoff/P24/REPORT.md; handoff/P24/evidence/revision-01'
  note=' P24 dependency: waiting-Web result/closed-case branch updated and fixture-verified; new presentation awaiting user review; historical acceptance of prior revisions retained.'
  if note not in row['blocker']:row['blocker']+=note
  changed=True
 if changed:
  stream=io.StringIO();csv.writer(stream,quoting=csv.QUOTE_ALL,lineterminator='').writerow([row[k] for k in keys]);out.append(stream.getvalue())
 else:out.append(line)
coverage.write_text('\n'.join(out)+'\n',encoding='utf-8')
rows=list(csv.DictReader(io.StringIO('\n'.join(out))))
assert len(rows)==91 and len({r['prompt_id'] for r in rows})==24
counts={key:dict(collections.Counter(r[key] for r in rows)) for key in ['visual_status','behavior_status','integration_status']}
state={'contract_version':'2.0','source_commit':'da9f623a19d0359c3e80c14f8cc612636ec6ab78','target_kind':'prototype','current_prompt':'P24','revision':'P24-r01','completed_panel_ids':list(panels),'remaining_panel_ids':[],'visual':'AWAITING_USER_REVIEW','behavior':'PASS_PROTOTYPE','integration':'BLOCKED_PRODUCTION','node_tests':165,'p24_node_tests':6,'browser_groups':{'p24_main':5,'p24_edges':6,'p19':9,'p20':7,'p21':9,'p09_navigation':11,'p23':9},'browser_groups_total':56,'layout_combinations':25,'footer_viewports':4,'shared_components_changed':['shared waiting-web presentation; P04/P05 result adapters','P19 validation/rejection; P20 closed-case presentation','Home history callbacks and external P24 preview controls'],'blockers':['Production actor/permission/stock/validate/record/Post/status/cursor contracts unverified.','Camera/NFC/physical keyboard NOT_RUN. Preview memory only; reload/logout loses data.'],'artifact_paths':['handoff/P24/REPORT.md','handoff/P24/REVIEW.html','handoff/P24/DESIGN_TRACE.md','handoff/P24/STATE_ACCEPTANCE.csv','handoff/P24/COVERAGE_SUMMARY.md','handoff/P24/SOURCE_MANIFEST.json','handoff/P24/evidence/revision-01'],'next_action':'User visual review P24 r01. Preserve temporary acceptance P23 r03; synchronized additional states deferred. Production/hardware/persistence unverified.','report':'handoff/P24/REPORT.md','review':'handoff/P24/REVIEW.html','coverage_reference':{'boards':24,'panels':91,'statuses':counts,'basis':'Existing coverage and reports; only P24 and direct dependencies revalidated in this task.'}}
(base/'RUN_STATE.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (base/'STATE_ACCEPTANCE.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f);w.writerow(['id','disposition','visual','behavior','integration','evidence'])
 for i in panels:w.writerow([i,'CURRENT','AWAITING_USER_REVIEW','PASS_PROTOTYPE','BLOCKED_PRODUCTION','evidence/revision-01/after/results.json'])
 for i,e in [('P24.A01','logic.txt; after/results.json; edges/results.json'),('P24.A02','logic.txt; after/results.json'),('P24.A03','logic.txt; after/results.json; edges/results.json; regression/check_p19/results.json'),('P24.A04','logic.txt; after/results.json; edges/results.json; regression/check_p21/after/browser-results.json'),('P24.A05','COVERAGE_SUMMARY.md; SCREEN_COVERAGE.csv')]:w.writerow([i,'CURRENT','AWAITING_USER_REVIEW','PASS_PROTOTYPE','BLOCKED_PRODUCTION',e])

global_file=root/'RUN_STATE.json';text=global_file.read_text(encoding='utf-8');current=json.loads(text)
def set_field(name,value):
 global text
 match=re.search(r'^  "'+re.escape(name)+r'":\s*',text,re.M)
 rendered=json.dumps(value,ensure_ascii=False,indent=2).replace('\n','\n  ')
 if match:
  start=match.end();_,size=json.JSONDecoder().raw_decode(text[start:]);text=text[:start]+rendered+text[start+size:]
 else:text=text.replace('{','{\n  '+json.dumps(name)+': '+rendered+',',1)
set_field('p24_revision_r01',state)
accepted=current.get('p23_revision_r03',{});accepted.update(visual='USER_TEMPORARILY_ACCEPTED',user_acceptance='User P24 request2026-09-30; synchronized states deferred; no production acceptance.')
set_field('p23_revision_r03',accepted)
for k,v in {'current_prompt':'P24','revision':'P24-r01','prompt_status':'P24_R01_IMPLEMENTED_VISUAL_REVIEW_PENDING','previous_prompt':{'id':'P23','revision':'P23-r03','user_status':'Temporarily accepted; synchronized states deferred','latest_revision':'handoff/P23/REVISION_03.md'},'remaining_scope':'P01–P24/91 reference panels inventoried; P24 prototype implemented, visual review pending. Historical visual statuses retained; synchronized states, production/hardware/durable persistence unverified.','next_action':state['next_action'],'coverage_summary_p24':state['coverage_reference']}.items():set_field(k,v)
for key in ['completed_panel_ids','implemented_panel_ids']:set_field(key,list(dict.fromkeys(current.get(key,[])+list(panels))))
# Historical global array omitted P13/P15 even though their reports/coverage already
# recorded prototype implementation. Reconcile inventory only, not acceptance.
implemented=[r['panel_id'] for r in rows if r['behavior_status']=='PASS']
set_field('implemented_panel_ids',implemented)
set_field('implemented_inventory_basis','Reconciled from 91 existing SCREEN_COVERAGE prototype behavior entries after P24; restores historical P13/P15 omissions. Does not assert new testing or visual/production acceptance for other boards.')
set_field('remaining_panel_ids',[p for p in current.get('remaining_panel_ids',[]) if p not in panels])
set_field('artifact_paths',list(dict.fromkeys(current.get('artifact_paths',[])+state['artifact_paths'])))
set_field('shared_components_changed',list(dict.fromkeys(current.get('shared_components_changed',[])+state['shared_components_changed'])))
blockers=[b.replace('P24 remains incomplete.','P24 r01 prototype implemented; visual review pending.').replace('P20 full history, P21 durable resume, P24 full terminal boards pending.','P20/P21/P24 prototypes implemented; production history and durable resume unverified.') for b in current.get('blockers',[])]
set_field('blockers',blockers)
json.loads(text);global_file.write_text(text,encoding='utf-8')

summary=['# Tổng hợp coverage sau P24 r01','','**24 board / 91 panel tham chiếu**, giữ nguyên ID. Nguồn: SCREEN_COVERAGE.csv và handoff hiện có; không phải một lượt nghiệm thu lại toàn app.','',f'Visual: `{counts["visual_status"]}`. Behavior: `{counts["behavior_status"]}`. Integration: `{counts["integration_status"]}`.','','PASS ở visual có thể là tạm chốt theo user, không đồng nghĩa nghiệm thu production. IN_PROGRESS gồm các giao diện chờ review; blocker của từng dòng vẫn được giữ. P01/P15/P17 có tạm chốt lịch sử theo bàn giao, nhưng revision mới hoặc đồng bộ sau đó vẫn có thể chờ review. P16 chờ review.','','| Prompt | Panel | Disposition | Visual (theo coverage) | Hành vi | Tích hợp | Báo cáo |','|---|---:|---|---|---|---|---|']
for n in range(1,25):
 pid=f'P{n:02}';group=[r for r in rows if r['prompt_id']==pid]
 summary.append(f'| {pid} | {len(group)} | '+', '.join(sorted({r['disposition'] for r in group}))+' | '+', '.join(sorted({r['visual_status'] for r in group}))+' | '+', '.join(sorted({r['behavior_status'] for r in group}))+' | '+', '.join(sorted({r['integration_status'] for r in group}))+f' | [Handoff](../{pid}/REPORT.md) |')
summary+=['','P13 giữ MIGRATED ở các panel chuyển nghiệp vụ; không phục hồi UI duyệt/Post trên app. P18 r03 đã tạm chốt theo RUN_STATE hiện hành và chỉ thị mới của user, dù câu P24.A05 trong prompt cũ còn ghi “P18 chưa chốt”. Các blocker bàn giao/backend/đóng hồ sơ/vị trí của P18 vẫn giữ. P23 tạm chốt trong yêu cầu P24; P24 chưa chốt.','','91 vị trí ảnh tham chiếu không phải91 route độc lập và không phải tất cả state runtime. Không đổi bất kỳ status board khác ngoài P23 acceptance, P24 và nhánh dependency trực tiếp P04.S04/P05.S04/P20.S01.']
(base/'COVERAGE_SUMMARY.md').write_text('\n'.join(summary)+'\n',encoding='utf-8')

cards=[]
for name,label in [('S01','S01 · Số lượng vượt tồn'),('S02','S02 · Mã hộp chưa thể xuất'),('S03-inbound','S03 · Nhập kho'),('S03-outbound','S03 · Xuất kho'),('S04','S04 · Hồ sơ đã trả khách')]:
 cards.append(f'<section><h2>{label}</h2><div class="pair"><figure><figcaption>Trước P24 · 494×950</figcaption><a href="evidence/revision-01/before/panels/{name}.png"><img loading="lazy" src="evidence/revision-01/before/panels/{name}.png"></a></figure><figure><figcaption>Sau P24 r01 · 494×950</figcaption><a href="evidence/revision-01/after/{name}-494x950.png"><img loading="lazy" src="evidence/revision-01/after/{name}-494x950.png"></a></figure></div></section>')
page='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P24 r01 · Review</title><style>body{margin:0;background:#eef5f8;color:#12384e;font:16px/1.6 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:32px 20px}h1{margin-bottom:6px}h2{font-size:22px}a{color:#076c8c}section{background:white;padding:24px;border:1px solid #dce9ef;border-radius:16px;margin-top:24px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}figure{margin:0}figcaption{padding:8px 0;font-weight:650}img{width:100%;height:auto;display:block;border:1px solid #dce9ef;border-radius:8px;box-sizing:border-box}.badge{display:inline-block;border-radius:8px;padding:6px 12px;background:#fff2d7;color:#78500b}nav{display:flex;gap:20px;flex-wrap:wrap}.note{padding:16px;background:#eaf5fa;border-radius:10px}@media(max-width:650px){.pair{grid-template-columns:1fr}main{padding:16px}section{padding:14px}}</style><main><h1>P24 · Trạng thái Scanner</h1><p class="badge">r01 · Chờ review hình thức</p><p>Bốn panel · 165 test logic · 56 nhóm trình duyệt · 25 tổ hợp layout · 4 viewport footer. Kết quả prototype; backend/thiết bị/lưu bền chưa xác minh.</p><nav><a href="http://localhost:8766/flows/auth-session/?v=p24-r01">Mở preview</a><a href="REPORT.md">Báo cáo</a><a href="DESIGN_TRACE.md">Nguồn thiết kế</a><a href="COVERAGE_SUMMARY.md">24 board / 91 panel</a></nav><p class="note">Đăng nhập minhanh / preview → xác nhận phiên → công cụ P24 ngoài khung app. P23 r03 đã tạm chốt; state đồng bộ bổ sung sau. Bấm ảnh để xem kích thước gốc. Trước–sau dùng cùng viewport/DPR1/font local; B24 bên dưới là ảnh tham chiếu, không phải UI render.</p><section><h2>Baseline B24 do user cung cấp</h2><a href="evidence/revision-01/baseline/B24.png"><img src="evidence/revision-01/baseline/B24.png" alt="Baseline B24 bốn trạng thái"></a><p>Giữ khung494×950 và component hiện hành. Không đóng BH-001 hoặc đổi mã phiếu để làm giống ảnh. S03 giữ các lối thao tác có sẵn của owner; S04 chính dùng BH-002/XLK-0003 đúng nguồn P09.</p></section>'''+''.join(cards)+'''<section><h2>Mẫu B24 riêng — hai biến thể S03</h2><p>Opt-in ngoài app. PN-0005 thực sự record12 mã khác nhau; PX-0004 record10 mã. Nguồn mặc định P04 vẫn12 lượt/11 mã; không cộng mã trùng. Mở mẫu tải lại trang và mất dữ liệu thử đang giữ trong bộ nhớ.</p><p><a href="http://localhost:8766/flows/auth-session/?v=p24-r01&amp;sample=b24">Mở mẫu B24 nhập/xuất</a></p><div class="pair"><img loading="lazy" src="evidence/revision-01/after/B24-S03-inbound.png" alt="PN0005 12 mã"><img loading="lazy" src="evidence/revision-01/after/B24-S03-outbound.png" alt="PX0004 10 mã"></div></section><section><h2>S04 — mẫu có trang tiếp theo</h2><p>Fixture P20 riêng để kiểm tải thêm/chống trùng trong case đóng; không đưa các phiếu mẫu này vào ledger P09. Hồ sơ mặc định chỉ có một phiếu đã xuất và hiển thị Đã tải hết.</p><img style="max-width:494px" loading="lazy" src="evidence/revision-01/after/S04-sample.png" alt="Mẫu phân trang case đóng"></section></main></html>'''
(base/'REVIEW.html').write_text(page,encoding='utf-8')
changed=['docs/flows/warranty-components/'+n for n in ['issue-model.mjs','issue-fixture.mjs','issue-view.mjs','issue.css','history-view.mjs','history.css']]+['docs/flows/shared/waiting-web.mjs','docs/flows/shared/waiting-web.css','docs/flows/shared/UI_STANDARD.md','docs/flows/home/home.mjs']+['docs/flows/'+op+'/'+n for op in ['inbound','outbound'] for n in [op+'.mjs','style.css','fixture-adapter.mjs']]+['docs/flows/inbound/inbound-flow.mjs','tests/scanner-states.test.mjs','tests/component-issue.test.mjs','tests/component-issue-r03.test.mjs','scripts/check_p24.cjs','scripts/check_p24_edges.cjs','scripts/capture_p24_before.cjs','scripts/run_p24_regression.cjs','scripts/finalize_p24.py','handoff/P23/RUN_STATE.json','handoff/P23/TEMPORARY_ACCEPTANCE.md']
manifest=[{'path':p,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in changed]
manifest.append({'path':'scripts/verify_p24.cjs','sha256':hashlib.sha256((root/'scripts/verify_p24.cjs').read_bytes()).hexdigest()})
(base/'SOURCE_MANIFEST.json').write_text(json.dumps({'source_commit':state['source_commit'],'files':manifest,'global_files':['RUN_STATE.json','SCREEN_COVERAGE.csv'],'note':'Global files intentionally not frozen: other chats may update independent fields.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(state['coverage_reference'],ensure_ascii=False))
