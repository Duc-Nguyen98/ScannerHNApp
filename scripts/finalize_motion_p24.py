from pathlib import Path
import csv,io,json,re,hashlib,shutil,subprocess,collections,html
root=Path(__file__).resolve().parents[1];base=root/'handoff/motion/M24';motion=root/'handoff/motion'
def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def write(p,v):Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def digest(v):return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
old=read(base/'before/SOURCE_MANIFEST.json');files=[];diff=''
changed=['docs/flows/warranty-components/issue-motion.mjs','docs/flows/warranty-components/issue-view.mjs','docs/flows/warranty-components/issue.css']
for f in old:
 p=root/f['file'];actual=sha(p);is_change=actual!=f['sha256']
 if f['file'].startswith('docs/flows/'):
  assert not is_change or f['file'] in changed,'Unexpected runtime change '+f['file']
  files.append({'file':f['file'],'before':f['sha256'],'after':actual,'before_bytes':f['bytes'],'after_bytes':p.stat().st_size,'changed':is_change})
 elif f['file'] in ['RUN_STATE.json','SCREEN_COVERAGE.csv','handoff/P24/RUN_STATE.json','handoff/flow/FLOW_GATE.json','handoff/flow/FIXTURE_MANIFEST.json']:assert not is_change,'Preserve business/gate '+f['file']
 for_diff=base/'before/source'/f['file']
 if f['file'] in changed:diff+=subprocess.run(['git','diff','--no-index','--',str(for_diff),str(p)],cwd=root,text=True,capture_output=True,encoding='utf-8').stdout
assert {f['file'] for f in files if f['changed']}==set(changed)
source_hash=digest([(f['file'],f['after']) for f in files]);diff_hash=digest([(f['file'],f['before'],f['after']) for f in files if f['changed']])
delta=sum(f['after_bytes']-f['before_bytes'] for f in files if f['changed'])
manifest={'source_commit':commit,'app_source_hash':source_hash,'working_diff_hash':diff_hash,'hash_definition':'Sorted application source file hashes including untracked source; diff identity is before/after hashes of changed files.','source_bytes_delta':delta,'files':files,'test_sources':[{ 'file':p,'sha256':sha(root/p)} for p in ['scripts/check_motion_p24.cjs','scripts/release_motion_p24.cjs','scripts/regression_motion_p24.cjs','tests/motion-p24.test.mjs']]}
write(base/'SOURCE_MANIFEST.json',manifest);(base/'changes.patch').write_text(diff,encoding='utf-8')
before=read(base/'before/results.json');after=read(base/'evidence/results.json');modes=['auto','os-reduced','off'];assert sorted(r['mode'] for r in after)==sorted(modes)
norm=lambda value:json.loads(re.sub(r'[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}','<UUID>',json.dumps(value,ensure_ascii=False)))
geometry=[]
for r in after:
 previous=next(b for b in before if b['mode']==r['mode']);assert r['geometry']==previous['geometry'];assert norm(r['text'])==norm(previous['text']);assert len(r['checks'])==8 and not r['errors'] and not r['mutations']
 assert r['domain']==after[0]['domain']
 for panel,g in r['geometry'].items():geometry.append({'panel':panel,'mode':r['mode'],'equal':True,'nodes':g['nodes']})
assert len(geometry)==15
assert not next(r for r in after if r['mode']=='off')['samples']
assert any(s['primitive']=='ScannerValidation' for r in after for s in r['samples'])
assert any(s['primitive']=='SubmitFeedback' for r in after for s in r['samples'])
flows={mode:read(base/f'release/{mode}/results.json') for mode in modes};tested=[]
for mode,data in flows.items():
 assert len(data['checks'])==12 and all(c['status']=='PASS' and not c['errors'] and not c['external'] for c in data['checks'])
 for c in data['checks']:
  ref=next(x for x in flows['auto']['checks'] if x['id']==c['id']);assert norm(c.get('details'))==norm(ref.get('details')),f'Domain parity {mode}/{c["id"]}'
  assert (base/f'release/{mode}/{c["id"]}-trace.zip').is_file()
  tested.append({'id':c['id'],'mode':mode,'boards':c['boards'],'name':c['name'],'status':c['status'],'domain_summary':c.get('details'),'evidence':f'handoff/motion/M24/release/{mode}/results.json','trace':f'handoff/motion/M24/release/{mode}/{c["id"]}-trace.zip'})
dep=read(base/'dependencies/M19/evidence/results.json');assert len(dep)==3 and all(len(r['checks'])==7 and not r['errors'] for r in dep)
reggroups=0
for p in ['regression/regression/after/after/results.json','regression/regression/after/edges/results.json']:
 d=read(base/p);assert not d['errors'] and all(c['status']=='PASS' for c in d['checks']);reggroups+=len(d['checks'])
assert reggroups==11
layout=read(base/'regression/regression/after/after/results.json')['layout'];assert len(layout)==25 and all(r['footer'] and not r['overflow'] and not r['small'] for r in layout)
footer=read(base/'footer/results.json');assert len(footer['checks'])==4 and all(c['status']=='PASS' for c in footer['checks']) and not footer['errors']
node=(base/'node-tests.txt').read_text(encoding='utf-8-sig');assert re.search(r'pass 765\b',node) and re.search(r'fail 0\b',node)
summary={'status':'PASS_SCOPED_UI_FIXTURE','modes':modes,'motion_groups':24,'release_journeys':36,'m19_dependency_groups':21,'p24_regression_groups':11,'node_tests':765,'geometry_equal':geometry,'layout_combinations':25,'footer_viewports':4,'operations':[{ 'mode':r['mode'],**r['domain']} for r in after],'domain_parity':'PASS','source_bytes_delta':delta,'app_source_hash':source_hash,'working_diff_hash':diff_hash,'visual':'USER_REVIEW_PENDING','integration':'BLOCKED_PRODUCTION; business tracking unchanged','performance':{'long_tasks':'Raw entries retained in before/results.json and evidence/results.json; workloads differ, no causal before/after speed inference.','frame_samples':'Actual opacity/transform observations in evidence/results.json; trace ZIPs for all modes.','hardware_fps':'NOT_MEASURED','input_latency':'NOT_MEASURED separately','virtualization':'DEFERRED per M00; no new provider/scroller/virtualizer'}}
write(base/'SUMMARY.json',summary)
coverage=motion/'MOTION_COVERAGE.csv';lines=coverage.read_text(encoding='utf-8-sig').splitlines();keys=next(csv.reader([lines[0]]));out=[lines[0]]
decisions={'P24.S01':'STATIC_BY_DESIGN','P24.S02':'APPLIED','P24.S03':'REUSED','P24.S04':'STATIC_BY_DESIGN'}
for line in lines[1:]:
 row=dict(zip(keys,next(csv.reader([line]))))
 if row['panel_id'] in decisions:
  row.update(normal_status='PASS',reduced_status='PASS',off_status='PASS',flow_regression_status='PASS',decision=decisions[row['panel_id']],evidence='handoff/motion/M24/REPORT.md;handoff/motion/M24/SUMMARY.json;handoff/motion/M24/evidence/results.json',blocker='Motion visual review pending; production/hardware unverified. Release gate scope UI_FIXTURE only.')
  s=io.StringIO();csv.writer(s,quoting=csv.QUOTE_ALL,lineterminator='').writerow([row[k] for k in keys]);out.append(s.getvalue())
 else:out.append(line)
coverage.write_text('\n'.join(out)+'\n',encoding='utf-8');rows=list(csv.DictReader(io.StringIO('\n'.join(out))))
assert len(rows)==91 and len({r['motion_prompt'] for r in rows})==24 and len({r['panel_id'] for r in rows})==91
assert all(r[k]=='PASS' for r in rows for k in ['normal_status','reduced_status','off_status','flow_regression_status'])
gaps=[];inventory=[]
def checks_from(data,mode=None):
 found=[]
 if isinstance(data,list):
  for item in data:found+=checks_from(item,mode)
 elif isinstance(data,dict):
  mode=data.get('mode',mode)
  for c in data.get('checks',[]) if isinstance(data.get('checks',[]),list) else []:
   found.append({'mode':mode,'name':c if isinstance(c,str) else c.get('name',c.get('id',str(c))),'status':'PASS' if isinstance(c,str) else c.get('status','VERIFIED_IN_OWNER_RESULT')})
  for key in ['results','motionResults','modes','verification','cases','stateCases','lifecycleCases']:
   if isinstance(data.get(key),(dict,list)):found+=checks_from(data[key],mode)
 return found
for n in range(1,25):
 board=f'M{n:02}';board_rows=[r for r in rows if r['motion_prompt']==f'MOTION_P{n:02}'];report=motion/board/'REPORT.md';assert report.is_file();report_text=report.read_text(encoding='utf-8-sig')
 refs=sorted({ref.strip() for r in board_rows for ref in r['evidence'].split(';') if ref.strip()});evidence=[];runtime=[]
 if n==1:refs+=['handoff/motion/M01/evidence/modes-and-states.json','handoff/motion/M01/evidence/lifecycle.json']
 for ref in refs:
  p=Path(ref) if Path(ref).is_absolute() else root/ref
  if not p.exists():gaps.append({'board':board,'missing':ref});continue
  local_ref=ref
  if ':/' in ref:
   target=base/'imported-evidence'/board/p.name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target);local_ref=target.relative_to(root).as_posix();assert sha(p)==sha(target)
  evidence.append({'path':local_ref,'original':ref,'sha256':sha(p)})
  if p.suffix=='.json':runtime+=checks_from(read(p))
 inventory.append({'board':board,'panels':[r['panel_id'] for r in board_rows],'mode_status':{k:'PASS' for k in ['normal','reduced','off']},'decisions':{r['panel_id']:r['decision'] for r in board_rows},'recorded_runtime_checks':runtime,'declared_runtime_scope':report_text,'evidence':evidence,'note':'Owner results describe expanded runtime scope; reference panels are not all runtime states. Historical owner evidence retained, essential journeys rechecked by M24.'})
write(base/'RUNTIME_STATE_INVENTORY.json',{'boards':inventory,'coverage_gaps':gaps});assert not gaps
tokens=root/'docs/flows/shared/motion/motion-tokens.css';fixture=read(root/'handoff/flow/FIXTURE_MANIFEST.json')
gate={'gate_status':'READY_FOR_FINAL','scope':'UI_FIXTURE','source_commit':commit,'app_source_hash':source_hash,'working_diff_hash':diff_hash,'source_manifest':'handoff/motion/M24/SOURCE_MANIFEST.json','fixture_version':fixture['fixture_version'],'fixture_manifest':'handoff/flow/FIXTURE_MANIFEST.json','token_version':'MOTION_CONTRACT-v1.0 / M00','token_sha256':sha(tokens),'normal_result':'PASS','reduced_result':'PASS','off_result':'PASS','board_count':24,'panel_count':91,'decisions':dict(collections.Counter(r['decision'].split(';')[0] for r in rows)),'raw_decisions':dict(collections.Counter(r['decision'] for r in rows)),'tested_flows':tested,'domain_parity':'PASS; generated UUIDs normalized for cross-mode summaries; each journey asserts exact identity within its own mode.','coverage_gaps':gaps,'known_issues':['Motion visual acceptance remains user review pending.','Production WMS/API/permissions and physical camera/NFC/keyboard unverified; fixture-only gate.','Page-memory/durable persistence limitations remain per business owner; no production persistence claim.','Target-device FPS/input-latency/dropped-frames not measured; native scrolling and deferred virtualization preserved.'],'evidence':['handoff/motion/MOTION_COVERAGE.csv','handoff/motion/M24/RUNTIME_STATE_INVENTORY.json','handoff/motion/M24/SUMMARY.json','handoff/motion/M24/node-tests.txt','handoff/motion/M24/evidence/results.json','handoff/flow/FLOW_GATE.json'],'business_tracking_unchanged':True,'public_deployed':False}
write(motion/'MOTION_RELEASE_GATE.json',gate)
state_file=motion/'MOTION_RUN_STATE.json';text=state_file.read_text(encoding='utf-8-sig');state=json.loads(text)
def patch(key,value):
 global text
 m=re.search(r'^  "'+re.escape(key)+r'":\s*',text,re.M);value=json.dumps(value,ensure_ascii=False,indent=2).replace('\n','\n  ')
 if m:
  start=m.end();_,size=json.JSONDecoder().raw_decode(text[start:]);text=text[:start]+value+text[start+size:]
 else:text=text.replace('{','{\n  '+json.dumps(key)+': '+value+',',1)
for k,v in {'current_prompt':'MOTION_P24','status':'READY_FOR_FINAL_UI_FIXTURE','completed_panel_ids':[r['panel_id'] for r in rows],'remaining_panel_ids':[],'affected_dependencies':['M19 ValidationFeedback','M04/M05 TerminalStates reused','M20 closed/read reused','FLOW_GATE J01–J12'],'next_action':'User review M24 motion; run FINAL separately with FINAL_BRIDGE.md and original FINAL. Preserve current source/fixture/tokens; no deploy performed in M24.','deployed':False,'m24':summary,'release_gate':'handoff/motion/MOTION_RELEASE_GATE.json','current_source_manifest':'handoff/motion/M24/SOURCE_MANIFEST.json','appSourceHash':source_hash,'working_diff_hash':diff_hash}.items():patch(k,v)
patch('artifact_paths',list(dict.fromkeys(state.get('artifact_paths',[])+gate['evidence']+['handoff/motion/M24/REPORT.md','handoff/motion/M24/REVIEW.html','handoff/motion/FINAL_BRIDGE.md','handoff/motion/ScannerHNApp_FINAL_Noi_Luong_Public_Preview_v1.0.md'])))
json.loads(text);state_file.write_text(text,encoding='utf-8')
original=base/'inputs/ScannerHNApp_FINAL_Noi_Luong_Public_Preview_v1.0.md';target=motion/original.name;shutil.copyfile(original,target);assert sha(original)==sha(target)
bridge=f'''# FINAL_BRIDGE — source sau MOTION_P24

MOTION_RELEASE_GATE hiện **READY_FOR_FINAL**, chỉ trong phạm vi UI_FIXTURE. Đây là bàn giao để chạy FINAL ở yêu cầu tiếp theo; M24 chưa commit/push/deploy. Hãy đọc gate và xác minh source thực tế trước khi thực thi, không dùng câu này làm bằng chứng thay thế.

- Source commit: `{commit}` + working copy hiện hành.
- App source hash: `{source_hash}`; diff identity M24: `{diff_hash}`.
- Manifest: [M24/SOURCE_MANIFEST.json](M24/SOURCE_MANIFEST.json); [gate](MOTION_RELEASE_GATE.json); [coverage](MOTION_COVERAGE.csv); [runtime inventory](M24/RUNTIME_STATE_INVENTORY.json).
- Fixture: `{fixture['fixture_version']}`, giữ namespace/scenario và mapping trong [manifest](../flow/FIXTURE_MANIFEST.json).
- Token: MOTION_CONTRACT1.0/M00; SHA256 `{sha(tokens)}`. Core/engine/owners hiện hành giữ nguyên.
- Contract nghiệp vụ v2 và chốt mới: [CONTRACT_CONTEXT](../CONTRACT_CONTEXT.md), AGENTS/UI_STANDARD hiện hành và HANDOFF. Không khôi phục yêu cầu cũ đã được user thay đổi.

Khi user yêu cầu chạy [FINAL gốc]({target.name}), thực thi trên source này. Giữ routing, data owner, seed, ID, auto/OS-reduced/off, native scroll và single-owner primitives. Không dựng lại24board, thêm engine/virtualizer hoặc sửa dist/gallery để thay source. FINAL kiểm những thiếu sót có bằng chứng và build/public theo quyền trong yêu cầu FINAL, không tái coi integration/hardware là PASS vì mock.

Review controls nằm ngoài app: auto tôn trọng OS, reduced/off giữ đầy đủ nội dung/quyền/operation. FINAL bổ sung version/link scene theo prompt gốc và kiểm deep link/refresh/assets/public anonymous. Nếu đổi router/fixture/token/guard thì kiểm lại phần evidence chịu ảnh hưởng trước khi phát hành. Source hash đổi cần refresh release identity và ghi trace, không dùng gate cũ cho build khác.

Đã kiểm:24board/91panel;765logic; M24 24 nhóm/3mode; FLOW_GATE12×3 hành trình; M19 21nhóm; P24 11nhóm;15geometry;25layout và4footer. Motion visual chờ review; backend/hardware/durable persistence và target-device FPS chưa xác minh. File FINAL đi kèm được sao chép nguyên byte; authorization của nội dung FINAL chỉ áp khi user yêu cầu chạy FINAL, không phải lệnh publish trong lượt M24.
'''
(motion/'FINAL_BRIDGE.md').write_text(bridge,encoding='utf-8')
cards=[]
for panel in ['P24.S01','P24.S02','P24.S03-inbound','P24.S03-outbound','P24.S04']:
 cards.append('<section><h2>'+panel+'</h2><div class="grid">'+''.join(f'<figure><figcaption>{mode}</figcaption><a href="evidence/{mode}-{panel}.png"><img loading="lazy" src="evidence/{mode}-{panel}.png"></a></figure>' for mode in modes)+'</div></section>')
page='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MOTION P24 · Release gate</title><style>body{margin:0;background:#eef5f8;color:#12384e;font:16px/1.6 system-ui,sans-serif}main{max-width:1300px;margin:auto;padding:28px 20px}a{color:#076c8c}section{background:white;padding:24px;border:1px solid #dce9ef;border-radius:16px;margin-top:24px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}figcaption{font-weight:650;margin-bottom:8px}img{width:100%;height:auto;border:1px solid #dce9ef;border-radius:8px;box-sizing:border-box}.badge{display:inline-block;padding:6px 12px;border-radius:8px;background:#e6f5ec;color:#176c47}nav{display:flex;gap:20px;flex-wrap:wrap}@media(max-width:750px){.grid,.pair{grid-template-columns:1fr}}</style><main><h1>MOTION_P24 · Trạng thái Scanner</h1><p class="badge">READY_FOR_FINAL · UI_FIXTURE</p><p>Chờ user review motion/hình thức. Chưa publish; backend và thiết bị thật chưa nghiệm thu.</p><nav><a href="http://localhost:8766/flows/auth-session/?v=motion-p24">Preview</a><a href="REPORT.md">Báo cáo</a><a href="SUMMARY.json">Kết quả</a><a href="../MOTION_RELEASE_GATE.json">Release gate</a><a href="../FINAL_BRIDGE.md">FINAL bridge</a></nav><p>765 test logic;24 nhóm M24;12 hành trình×3mode;15geometry/node-count bằng trước. Highlight lỗi140/80/0ms; waiting-Web160/0/0ms dùng owner cũ; quantity/closed guard tức thì. Không camera/count animation hoặc provider mới.</p><section><h2>Trace chuyển động thật</h2><nav><a href="evidence/auto-trace.zip">Auto trace</a><a href="evidence/os-reduced-trace.zip">OS reduced trace</a><a href="evidence/off-trace.zip">Off trace</a><a href="evidence/results.json">Frame samples / operations</a></nav><p>Ảnh tĩnh bên dưới là trạng thái sau settle, không chứng minh FPS. Trace/raw samples ghi Chromium local; chưa đo target-device FPS/dropped frames/input latency riêng.</p></section><section><h2>S01 · Viền lỗi tức thì theo MOTION_P24</h2><div class="pair"><figure><figcaption>Trước</figcaption><img src="before/auto-P24.S01.png"></figure><figure><figcaption>Sau · không shake</figcaption><img src="evidence/auto-P24.S01.png"></figure></div></section>'''+''.join(cards)+'''<section><h2>Phạm vi giữ nguyên</h2><p>91 panel gồm APPLIED/REUSED/STATIC_BY_DESIGN. Các trạng thái mở rộng giữ evidence theo owner; không coi91panel là91route hoặc toàn bộ state runtime. AppShell, overlay, M00 core/tokens, fixtures và business tracking giữ hash. S02 là panel riêng như B24; camera theo lifecycle owner, chỉ notice lỗi có hiệu ứng.</p><a href="RUNTIME_STATE_INVENTORY.json">Runtime state inventory</a></section></main></html>'''
(base/'REVIEW.html').write_text(page,encoding='utf-8')
for f in ['REPORT.md','REVIEW.html']:
 s=(base/f).read_text(encoding='utf-8');links=re.findall(r'(?:href|src)="([^"]+)"',s) if f.endswith('.html') else re.findall(r'\]\(([^)]+)\)',s)
 for link in links:
  if not re.match(r'https?://|#',link):assert (base/link).resolve().exists(),f+' -> '+link
print(json.dumps({'gate_status':gate['gate_status'],'source_bytes_delta':delta,'app_source_hash':source_hash,'coverage_decisions':gate['decisions'],'geometry_equal':len(geometry),'release_journeys':len(tested),'node_tests':765},ensure_ascii=False,indent=2))
