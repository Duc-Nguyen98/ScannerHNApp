from pathlib import Path
import csv, hashlib, json, subprocess
r=Path(__file__).resolve().parents[1]
out=r/'handoff/motion/M05'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
write=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda data:hashlib.sha256(data).hexdigest()
compact=lambda value:json.dumps(value,ensure_ascii=False,separators=(',',':')).encode()
data=read(out/'evidence/results.json')
assert len(data)==3 and all(len(x['checks'])==13 and not x['errors'] and len(x['panels'])==4 for x in data)
assert all(x['domain']==data[0]['domain'] and x['operations']=={'record':3,'check':1,'camera':0} for x in data)
for name,total in [('p04-regression',39),('shell-regression',36)]:
 rows=read(out/f'evidence/{name}/results.json');assert sum(len(x['checks']) for x in rows)==total and all(not x['errors'] for x in rows)
manual=read(out/'evidence/manual-regression/results.json');assert len(manual['checks'])==11 and not manual['errors']
before=read(out/'evidence/before-source/manifest.json')
for name in ['docs/flows/shared/motion/motion-primitives.mjs','docs/flows/shared/motion/motion-tokens.css','docs/flows/inbound/manual-entry.mjs']:
 assert sha((r/name).read_bytes())==next(x['sha256'] for x in before if x['path']==name)
assert read(r/'handoff/flow/FLOW_GATE.json')['gate_status']=='PASS'
files=[{'file':p.relative_to(r).as_posix(),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in sorted((r/'docs/flows').rglob('*')) if p.is_file()]
paths=sorted(p for folder in ['docs/flows','scripts','tests'] for p in (r/folder).rglob('*') if p.is_file())
diff=[{'path':p.relative_to(r).as_posix(),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in paths]
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip()
appHash=sha(compact(files));diffHash=sha(compact({'source_commit':head,'files':diff}))
scope=[x['path'] for x in before]+['docs/flows/shared/motion/scan-flow-feedback.mjs','docs/flows/outbound/motion.mjs','docs/flows/outbound/motion.css']
scoped=[{'path':name,'bytes':(r/name).stat().st_size,'sha256':sha((r/name).read_bytes())} for name in scope]
delta=sum(x['bytes'] for x in scoped)-sum(x['bytes'] for x in before)
write(out/'SOURCE_MANIFEST.json',{'source_commit':head,'fixture_version':'hn-outbound-preview-v1; BOARD_CODES/EXTRA_CODES unchanged; clock2026-09-30T01:15:20Z','appSourceHash':appHash,'working_diff_hash':diffHash,'definition':'Sorted file/sha256/bytes docs/flows and path/sha256/bytes docs/flows/scripts/tests including untracked. Scoped byte delta is source text, not a bundle/FPS benchmark.','files':files,'diffFiles':diff,'scoped':scoped,'scoped_source_byte_delta':delta})
summary={'prompt':'MOTION_P05','normal':'PASS','os_reduced':'PASS','off':'PASS','panels':4,'node_tests':64,'motion_browser_groups':39,'p04_regression_groups':39,'shell_regression_groups':36,'manual_regression_groups':11,'browser_total':125,'domain_equal_across_modes':True,'operations_per_mode':data[0]['operations'],'list_profiles':{x['mode']:x['listProfile'] for x in data},'source_byte_delta':delta,'static_geometry':'PASS12panel-mode combinations against actual before','visual':'USER_REVIEW_PENDING','hardware':'NOT_RUN','production':'NOT_RUN','fps':'NOT_MEASURED','report':'handoff/motion/M05/REPORT.md'}
write(out/'evidence/summary.json',summary)
write(out/'evidence/geometry-comparison.json',[{'mode':x['mode'],'panel':p['id'],'same_as_before':p['geometry']==next(b['geometry'] for b in read(out/'evidence/before/geometry.json') if b['id']==p['id'])} for x in data for p in x['panels']])
p=r/'handoff/motion/MOTION_COVERAGE.csv'
with p.open(encoding='utf-8-sig',newline='') as f: reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
assert len(rows)==91
for row in rows:
 if row['motion_prompt']=='MOTION_P05':row.update(normal_status='PASS',reduced_status='PASS',off_status='PASS',flow_regression_status='PASS',decision='APPLIED',evidence='handoff/motion/M05/REPORT.md;handoff/motion/M05/evidence/results.json;handoff/motion/M05/evidence/summary.json',blocker='')
with p.open('w',encoding='utf-8',newline='') as f:w=csv.DictWriter(f,fieldnames=fields,quoting=csv.QUOTE_ALL);w.writeheader();w.writerows(rows)
p=r/'handoff/motion/MOTION_RUN_STATE.json';state=read(p);state.setdefault('verification_history',{})['M04']=state.get('M04',state.get('verification'))
panels=[f'P05.S0{i}' for i in range(1,5)]
state['completed_panel_ids']=list(dict.fromkeys(state.get('completed_panel_ids',[])+panels));state['remaining_panel_ids']=[x for x in state.get('remaining_panel_ids',[]) if x not in panels];state['M05']=summary
state.update(current_prompt='MOTION_P05',status='PASS_SCOPED_UI_FIXTURE',verification=summary,appSourceHash=appHash,working_diff_hash=diffHash,affected_dependencies=['P04 shared Scan/Form/Submit consumer','M02 mode/security/route owner','P03 overlays preserved','P12 result Back','P17 exceptions/UNKNOWN','P24 waiting-Web result'],next_action='User review M05. Do not execute MOTION_P06 or deploy without request.')
for name in ['handoff/motion/M05/REPORT.md','handoff/motion/M05/SOURCE_MANIFEST.json','handoff/motion/M05/evidence/results.json']:
 if name not in state.setdefault('artifact_paths',[]):state['artifact_paths'].append(name)
write(p,state);write(out/'RUN_STATE.json',{'current_prompt':'MOTION_P05','status':'PASS_SCOPED_UI_FIXTURE','completed_panel_ids':panels,'remaining_panel_ids':[],'verification':summary,'next_action':'User review; hardware/production unverified; no deploy.'})
print(json.dumps(summary,ensure_ascii=False))
