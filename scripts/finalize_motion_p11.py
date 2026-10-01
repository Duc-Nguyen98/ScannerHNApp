from pathlib import Path
import csv,difflib,hashlib,html,io,json

repo=Path(__file__).resolve().parents[1];out=repo/'handoff/motion/M11'
results=json.loads((out/'verified-05/results.json').read_text(encoding='utf-8'))
before=json.loads((out/'before-complete/results.json').read_text(encoding='utf-8'))
shell=json.loads((out/'shell-final/results.json').read_text(encoding='utf-8'))
assert len(results)==3 and all(len(r['checks'])==7 and not r['errors'] for r in results)
assert len(shell)==3 and all(len(r['checks'])==12 and not r['errors'] for r in shell)
for row in results:
 assert row['geometry']==next(r['geometry'] for r in before if r['mode']==row['mode'])
 assert row['calls']==results[0]['calls'] and row['outcomes']==results[0]['outcomes'] and row['hardware']==0
 assert all(not frame.get('transform') for effect in row['effects'] for frame in effect['frames'])
 if row['mode']=='off':assert not row['effects']
 if row['mode']=='os-reduced':assert all(e['duration']<=80 and e['primitive']!='SecureSuccess' for e in row['effects'])
 if row['mode']=='auto':
  for primitive,ms in [('SecuritySettingsPress',100),('SecureFormFocus',140),('SecureFormError',140),('SecureSuccess',160)]:assert any(e['primitive']==primitive and e['duration']==ms for e in row['effects'])

files=['docs/flows/security/security.mjs','docs/flows/security/motion.mjs','docs/flows/home/home.mjs','docs/flows/security/security-model.mjs','docs/flows/security/preview-adapter.mjs','docs/flows/security/style.css','docs/flows/shared/motion/motion-primitives.mjs','docs/flows/shared/motion/motion-tokens.css']
manifest=[];diff=[];delta=0
for file in files:
 current=(repo/file).read_bytes();old=out/'before/source'/file;prior=old.read_bytes() if old.exists() else b''
 item={'file':file,'before_sha256':hashlib.sha256(prior).hexdigest() if old.exists() else None,'after_sha256':hashlib.sha256(current).hexdigest(),'before_bytes':len(prior),'after_bytes':len(current),'delta':len(current)-len(prior)}
 manifest.append(item);delta+=item['delta']
 if prior!=current:diff.extend(difflib.unified_diff(prior.decode('utf-8').splitlines(True),current.decode('utf-8').splitlines(True),fromfile='before/'+file,tofile='after/'+file))
unchanged=['security-model.mjs','preview-adapter.mjs','style.css','motion-primitives.mjs','motion-tokens.css']
assert all(m['before_sha256']==m['after_sha256'] for m in manifest if Path(m['file']).name in unchanged)
(out/'SOURCE_MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
(out/'changes.patch').write_text(''.join(diff),encoding='utf-8')
summary={'prompt':'MOTION_P11','normal':'PASS','os_reduced':'PASS','off':'PASS','panels':4,'node_tests':68,'motion_browser_groups':21,'shell_regression_groups':36,'static_geometry':'PASS12 exact panel-mode comparisons','domain_equal':True,'operations_per_mode':{r['mode']:r['calls'] for r in results},'result_signatures_equal':True,'camera_calls_per_mode':[0,0,0],'source_byte_delta':delta,'primitive_source_unchanged':True,'visual':'USER_REVIEW_PENDING','virtualization':'NOT_NEEDED','fps':'NOT_MEASURED','hardware':'NOT_RUN','production':'NOT_RUN','report':'handoff/motion/M11/REPORT.md','preflight_repair':'Expiry clears password fields immediately; no credentials captured in evidence'}
(out/'SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

rows=[]
for n in range(1,5):
 panel=f'P11.S{n:02d}';images=[]
 for mode,label in [('auto','Auto'),('os-reduced','OS giảm chuyển động'),('off','Tắt')]:
  src=f'verified-05/{mode}-{panel}.png';assert(out/src).is_file()
  images.append(f'<figure><figcaption>{label}</figcaption><a href="{src}"><img src="{src}" loading="lazy" alt="{panel} · {label}"></a></figure>')
 rows.append(f'<section><h2>{panel}</h2><div class="modes">'+''.join(images)+'</div></section>')
doc='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>M11 · Bảo mật</title><style>*{box-sizing:border-box}body{margin:0;background:#eef4f8;color:#123b57;font:16px/1.55 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:26px 20px}h1{font-size:29px;line-height:1.2}h2{font-size:22px}.modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}section{background:white;border:1px solid #d5e4eb;border-radius:14px;padding:20px;margin:24px 0}figure{margin:0;text-align:center}figcaption{font-weight:650;margin-bottom:12px}img{width:100%;border-radius:10px;border:1px solid #dbe7ec}a{color:#006383}.note{padding:14px;border-left:3px solid #087a96;background:#fff}.tag{color:#805100;background:#fff0d2;border-radius:8px;padding:5px 10px;display:inline-block}@media(max-width:680px){main{padding:18px 10px}.modes{grid-template-columns:1fr}img{max-width:360px}}
</style><main><h1>MOTION_P11 · Bảo mật</h1><span class="tag">4 panel × 3 chế độ đạt · hình thức chờ review</span><p>Focus/lỗi140ms, press100ms; biểu tượng thành công160ms chỉ sau kết quả xác nhận. Reduced giữ phản hồi80ms và tắt hiệu ứng trang trí; off giữ nguyên nội dung và nghiệp vụ.</p><p><a href="http://localhost:8766/flows/auth-session/?review=M11" target="_blank" rel="noopener">Mở preview mới</a> · <a href="REPORT.md">Báo cáo</a> · <a href="verified-05/results.json">Số đo motion / operation</a></p><p class="note">Các ô nhập trong ảnh được che màu tím chỉ để bảo vệ mật khẩu khi kiểm thử; đây không phải màu giao diện. So sánh geometry/DOM/text sau settle đạt12/12 với bản trước sửa. Ảnh tĩnh không chứng minh motion; trace riêng không chứa DOM snapshot hoặc thao tác nhập mật khẩu.</p><p>Trace: <a href="verified-05/auto-trace.zip">auto</a> · <a href="verified-05/os-reduced-trace.zip">OS reduced</a> · <a href="verified-05/off-trace.zip">off</a>. <a href="before-complete/results.json">Snapshot trước</a>.</p>'''+''.join(rows)+'''<p>68 test logic,21 nhóm P11 và36 nhóm AppShell đạt. Không đo60fps hay nghiệm thu backend/thiết bị thật; không deploy.</p></main></html>'''
(out/'REVIEW.html').write_text(doc,encoding='utf-8')

statepath=repo/'handoff/motion/MOTION_RUN_STATE.json';original=statepath.read_text(encoding='utf-8-sig');state=json.loads(original)
state.update(current_prompt='MOTION_P11',status='PASS_SCOPED_UI_FIXTURE',verification=summary,M11=summary,next_action='User review M11; MOTION_P12 awaits request. No deploy; production limits unchanged.',source_manifest='handoff/motion/M11/SOURCE_MANIFEST.json',working_diff_hash=hashlib.sha256((out/'SOURCE_MANIFEST.json').read_bytes()).hexdigest(),working_diff_hash_definition='M11 scoped before/after source manifest SHA256; historical whole-tree hashes remain in prior reports.')
for panel in [f'P11.S{n:02d}' for n in range(1,5)]:
 if panel not in state['completed_panel_ids']:state['completed_panel_ids'].append(panel)
 if panel in state['remaining_panel_ids']:state['remaining_panel_ids'].remove(panel)
for artifact in ['REPORT.md','REVIEW.html','SUMMARY.json','SOURCE_MANIFEST.json']:
 p='handoff/motion/M11/'+artifact
 if p not in state.setdefault('artifact_paths',[]):state['artifact_paths'].append(p)
assert statepath.read_text(encoding='utf-8-sig')==original
statepath.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cp=repo/'handoff/motion/MOTION_COVERAGE.csv';original=cp.read_text(encoding='utf-8-sig');reader=csv.DictReader(io.StringIO(original));fields=reader.fieldnames;coverage=list(reader);assert len(coverage)==91
for row in coverage:
 if row['motion_prompt']=='MOTION_P11':
  for name in ['normal_status','reduced_status','off_status','flow_regression_status']:row[name]='PASS'
  row['decision']='APPLIED;STATIC_BY_DESIGN_INPUTS_ROWS_EXIT' if row['panel_id']=='P11.S04' else 'APPLIED'
  row['evidence']='handoff/motion/M11/REPORT.md;handoff/motion/M11/verified-05/results.json;handoff/motion/M11/shell-final/results.json';row['blocker']=''
buf=io.StringIO(newline='');writer=csv.DictWriter(buf,fieldnames=fields,quoting=csv.QUOTE_ALL,lineterminator='\n');writer.writeheader();writer.writerows(coverage)
assert cp.read_text(encoding='utf-8-sig')==original;cp.write_text(buf.getvalue(),encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False))
