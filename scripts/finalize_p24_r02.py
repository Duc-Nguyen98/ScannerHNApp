from pathlib import Path
import json,csv,io,re,hashlib,collections

root=Path(__file__).resolve().parents[1];base=root/'handoff/P24'
source_files=['docs/flows/warranty-components/'+n for n in ['issue-view.mjs','issue-experience.mjs','issue.css','history-view.mjs','history.css']]+['docs/flows/shared/'+n for n in ['waiting-web.mjs','waiting-web.css','UI_STANDARD.md']]+['docs/flows/inbound/inbound.mjs','docs/flows/outbound/outbound.mjs','docs/flows/home/home.mjs','docs/flows/history/warranty-session-view.mjs','tests/scanner-states-r02.test.mjs','scripts/check_p24_r02.cjs','scripts/run_p24_r02.cjs','scripts/finalize_p24_r02.py','scripts/verify_p24_r02.cjs']
manifest=[{'path':p,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in source_files]
(base/'SOURCE_MANIFEST_02.json').write_text(json.dumps({'revision':'P24-r02','files':manifest,'note':'Global progress files remain editable by other chats; r01 snapshots/evidence retained.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
coverage=root/'SCREEN_COVERAGE.csv';lines=coverage.read_text(encoding='utf-8-sig').splitlines();keys=next(csv.reader([lines[0]]));out=[lines[0]]
targets={f'P24.S0{i}' for i in range(1,5)}|{'P04.S04','P05.S04','P20.S01','P23.S02'}
for line in lines[1:]:
 row=dict(zip(keys,next(csv.reader([line]))))
 if row['panel_id'] in targets:
  row['visual_status']='IN_PROGRESS';row['behavior_status']='PASS';row['integration_status']='BLOCKED'
  for ref in ['handoff/P24/REVISION_02.md','handoff/P24/REVIEW_02.html','handoff/P24/evidence/revision-02']:
   if ref not in row['evidence']:row['evidence']+='; '+ref
  note=' P24 r02 six authorized UX improvements verified in prototype; new presentation/caller branch awaits review. P23 r03 historical temporary acceptance retained; production/hardware/persistence unverified.'
  if note not in row['blocker']:row['blocker']+=note
  stream=io.StringIO();csv.writer(stream,quoting=csv.QUOTE_ALL,lineterminator='').writerow([row[k] for k in keys]);out.append(stream.getvalue())
 else:out.append(line)
coverage.write_text('\n'.join(out)+'\n',encoding='utf-8');rows=list(csv.DictReader(io.StringIO('\n'.join(out))))
counts={k:dict(collections.Counter(r[k] for r in rows)) for k in ['visual_status','behavior_status','integration_status']}
state=json.loads((base/'RUN_STATE.json').read_text(encoding='utf-8'));state.update(revision='P24-r02',visual='AWAITING_USER_REVIEW',behavior='PASS_PROTOTYPE',integration='BLOCKED_PRODUCTION',node_tests=170,p24_node_tests=11,browser_groups={'p24_main':5,'p24_edges':6,'p24_r02_ux':5,'p19':9,'p20':7,'p21':9,'p23':9},browser_groups_total=50,layout_combinations=35,footer_viewports=4,report='handoff/P24/REVISION_02.md',review='handoff/P24/REVIEW_02.html',next_action='User review P24 r02 six requested UX improvements; retain P23 r03 temporary acceptance. Production/hardware/persistence unverified.')
refs=['handoff/P24/REVISION_02.md','handoff/P24/REVIEW_02.html','handoff/P24/REVISION_02_CONTEXT.md','handoff/P24/STATE_ACCEPTANCE_02.csv','handoff/P24/SOURCE_MANIFEST_02.json','handoff/P24/evidence/revision-02']
state['artifact_paths']=list(dict.fromkeys(state['artifact_paths']+refs));state['coverage_reference']={'boards':24,'panels':91,'statuses':counts,'basis':'Prior board reports retained; r02 only revalidated scoped P24/dependencies.'}
state['shared_components_changed']=['P19 sheet/rejection presentation; quantity comparison helper','Shared waiting-web presentation and P04/P05 primary document CTA','P20 closed notice/timeline link; P23 verified caller bridge; Home callback']
(base/'RUN_STATE.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (base/'STATE_ACCEPTANCE_02.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f);w.writerow(['requirement','panel','visual','behavior','integration','evidence'])
 for n,panel in enumerate(['P24.S01','P24.S02','P24.S03','P24.S03','P24.S04','P24.S04'],1):w.writerow([f'U0{n}',panel,'AWAITING_USER_REVIEW','PASS_PROTOTYPE','BLOCKED_PRODUCTION','evidence/revision-02/after/ux/results.json; evidence/revision-02/after/after/results.json'])

global_file=root/'RUN_STATE.json';text=global_file.read_text(encoding='utf-8');old=json.loads(text)
def patch(key,value):
 global text
 match=re.search(r'^  "'+re.escape(key)+r'":\s*',text,re.M);render=json.dumps(value,ensure_ascii=False,indent=2).replace('\n','\n  ')
 if match:
  start=match.end();_,size=json.JSONDecoder().raw_decode(text[start:]);text=text[:start]+render+text[start+size:]
 else:text=text.replace('{','{\n  '+json.dumps(key)+': '+render+',',1)
patch('p24_revision_r02',state)
for k,v in {'current_prompt':'P24','revision':'P24-r02','prompt_status':'P24_R02_IMPLEMENTED_VISUAL_REVIEW_PENDING','next_action':state['next_action'],'coverage_summary_p24':state['coverage_reference'],'remaining_scope':'P24 r02 six UX improvements implemented; visual review pending. Historical acceptance retained; synchronized extra states and production/hardware/persistence remain unverified.'}.items():patch(k,v)
patch('artifact_paths',list(dict.fromkeys(old.get('artifact_paths',[])+refs)))
json.loads(text);global_file.write_text(text,encoding='utf-8')

pairs=[('S01 · Nhập số lượng','before/after/S01-494x950','after/after/S01-494x950'),('S01 · Sửa số lượng đã chọn','before/ux/S01-edit','after/ux/S01-edit'),('S02 · Hộp chưa thể xuất','before/after/S02-494x950','after/after/S02-494x950'),('S03 · Phiếu nhập vừa gửi','before/after/S03-inbound-494x950','after/after/S03-inbound-494x950'),('S03 · Phiếu xuất vừa gửi','before/after/S03-outbound-494x950','after/after/S03-outbound-494x950'),('S04 · Hồ sơ chỉ đọc','before/after/S04-494x950','after/after/S04-494x950')]
cards=''.join(f'<section><h2>{name}</h2><div class="pair">'+''.join(f'<figure><figcaption>{label}</figcaption><a href="evidence/revision-02/{p}.png"><img loading="lazy" src="evidence/revision-02/{p}.png" alt="{name} {label}"></a></figure>' for label,p in [('Trước · r01',before),('Sau · r02',after)])+'</div></section>' for name,before,after in pairs)
page='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P24 r02 · Sáu cải tiến UI/UX</title><style>body{margin:0;background:#eef5f8;color:#12384e;font:16px/1.6 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:28px 20px}h1{margin-bottom:6px}h2{font-size:22px}a{color:#076c8c}section{background:white;padding:24px;border:1px solid #dce9ef;border-radius:16px;margin-top:24px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}figure{margin:0}figcaption{padding:8px 0;font-weight:650}img{width:100%;height:auto;display:block;border:1px solid #dce9ef;border-radius:8px;box-sizing:border-box}.badge{display:inline-block;border-radius:8px;padding:6px 12px;background:#fff2d7;color:#78500b}nav{display:flex;gap:20px;flex-wrap:wrap}.note{padding:16px;background:#eaf5fa;border-radius:10px}@media(max-width:650px){.pair{grid-template-columns:1fr}main{padding:16px}section{padding:14px}}</style><main><h1>P24 r02 · Sáu cải tiến UI/UX</h1><p class="badge">Đã triển khai · Chờ review hình thức</p><p>170 test logic · 50 nhóm trình duyệt · 35 tổ hợp layout · 4 viewport footer. Prototype, chưa xác minh backend/thiết bị/lưu bền.</p><nav><a href="http://localhost:8766/flows/auth-session/?v=p24-r02">Mở preview</a><a href="REVISION_02.md">Báo cáo r02</a><a href="REVISION_02_CONTEXT.md">Nguồn và phạm vi</a><a href="REVIEW.html">Review r01</a></nav><p class="note">S01 so sánh lượng đang sửa; S02 giữ số mã/phiếu và sửa mã nhanh; S03 mở đúng phiếu và tách hai mốc; S04 gọn cảnh báo và mở thẳng quá trình bảo hành. Giữ 494×950, footer Home/P03 và guard nghiệp vụ.</p><p>Ảnh trước–sau cùng viewport494×950, DPR1, font local và timezone Việt Nam. UUID của phiên mẫu được tạo riêng mỗi lần chạy. Bấm ảnh xem kích thước gốc.</p>'''+cards+'''<section><h2>Đường quay lại hồ sơ</h2><p>P20 → Quá trình bảo hành P23 đúng case → Back giữ phiếu đã tải, cuộn và focus. Marker lạ không tạo caller; logout không phục hồi phiên.</p><div class="pair"><figure><figcaption>Quá trình bảo hành</figcaption><img loading="lazy" src="evidence/revision-02/after/ux/S04-timeline.png"></figure><figure><figcaption>Trở lại lịch sử linh kiện đã tải</figcaption><img loading="lazy" src="evidence/revision-02/after/ux/S04-loaded.png"></figure></div></section><section><h2>Mã phiếu dài vẫn đọc đầy đủ</h2><p>Kiểm presentation bằng chuỗi tổng hợp2000+ ký tự trên state đã record: label nút gọn2dòng, nội dung gốc giữ tại summary/reader. Không dùng dữ liệu này làm bằng chứng WMS.</p><img style="max-width:494px" loading="lazy" src="evidence/revision-02/after/ux/S03-long-label-494x950.png"></section></main></html>'''
(base/'REVIEW_02.html').write_text(page,encoding='utf-8')
print(json.dumps({'revision':state['revision'],'coverage':state['coverage_reference']},ensure_ascii=False))
