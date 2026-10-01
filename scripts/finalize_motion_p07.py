from pathlib import Path
import json, csv, hashlib, subprocess
r=Path(__file__).resolve().parents[1];out=r/'handoff/motion/M07'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda b:hashlib.sha256(b).hexdigest()
encode=lambda v:json.dumps(v,ensure_ascii=False,separators=(',',':')).encode()
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
data=read(out/'evidence/results.json');shell=read(out/'evidence/shell-regression/results.json');flow=read(out/'evidence/flow-regression/results.json')
assert len(data)==3 and all(len(x['checks'])==7 and not x['errors'] for x in data)
assert all(x['domain']==data[0]['domain'] and x['finalStats']==data[0]['finalStats'] for x in data)
assert sum(len(x['checks']) for x in shell)==36 and all(not x['errors'] for x in shell)
assert len(flow['checks'])==4 and all(x['status']=='PASS' for x in flow['checks'])
assert read(r/'handoff/flow/FLOW_GATE.json')['gate_status']=='PASS'
before=read(out/'SOURCE_BEFORE.json')
for name in ['docs/flows/shared/motion/motion-primitives.mjs','docs/flows/shared/motion/motion-tokens.css','docs/flows/nfc/assets/B07-artwork-source.png']:
 assert sha((r/name).read_bytes())==before[name]['sha256']
scope=list(before)+['docs/flows/nfc/motion.mjs']
scoped=[{'file':n,'bytes':(r/n).stat().st_size,'sha256':sha((r/n).read_bytes()),'prior_bytes':before.get(n,{}).get('bytes',0),'prior_sha256':before.get(n,{}).get('sha256')} for n in scope]
files=[{'file':p.relative_to(r).as_posix(),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in sorted((r/'docs/flows').rglob('*')) if p.is_file()]
diff=[{'path':p.relative_to(r).as_posix(),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in sorted(p for folder in ['docs/flows','scripts','tests'] for p in (r/folder).rglob('*') if p.is_file())]
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip();appHash=sha(encode(files));diffHash=sha(encode({'source_commit':head,'files':diff}));delta=sum(x['bytes']-x['prior_bytes'] for x in scoped)
write(out/'SOURCE_MANIFEST.json',{'source_commit':head,'appSourceHash':appHash,'working_diff_hash':diffHash,'definition':'M06 sorted file/path + SHA256 + bytes scheme, including untracked source. Scoped delta against M07 actual before, not production bundle.','fixture':'hn-scanner-nfc-fixture-v1; existing30tags/5readUIDs, no seed changes','scoped':scoped,'scoped_source_byte_delta':delta,'files':files,'diffFiles':diff})
summary={'prompt':'MOTION_P07','normal':'PASS','os_reduced':'PASS','off':'PASS','panels':4,'node_tests':77,'motion_browser_groups':21,'shell_regression_groups':36,'flow_regression_groups':4,'browser_total':61,'domain_equal':True,'operations_per_mode':data[0]['finalStats'],'initial_profiles':{x['mode']:x['profile'] for x in data},'source_byte_delta':delta,'static_geometry':'PASS12 panel-mode combinations relative to shell vs actual before','visual':'USER_REVIEW_PENDING','virtualization':'NOT_NEEDED existing30rows; DEFERRED long-list backend','fps':'NOT_MEASURED','production':'NOT_RUN','hardware':'NOT_RUN','report':'handoff/motion/M07/REPORT.md'}
write(out/'evidence/summary.json',summary)
prior=read(out/'evidence/before/results.json')
def relative(boxes):
 o=boxes['.hn-screen'];return {k:None if a is None else [a[0]-o[0],a[1]-o[1],a[2],a[3]] for k,a in boxes.items()}
geometry=[{'mode':x['mode'],'panel':panel,'same_as_before':relative(g)==relative(prior[i]['geometry'][panel])} for i,x in enumerate(data) for panel,g in x['geometry'].items()]
assert all(x['same_as_before'] for x in geometry);write(out/'evidence/geometry-comparison.json',geometry)
p=r/'handoff/motion/MOTION_COVERAGE.csv'
with p.open(encoding='utf-8-sig',newline='') as f:reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
assert len(rows)==91
for row in rows:
 if row['motion_prompt']=='MOTION_P07':row.update(normal_status='PASS',reduced_status='PASS',off_status='PASS',flow_regression_status='PASS',decision='STATIC_BY_DESIGN' if row['panel_id']=='P07.S02' else 'APPLIED',evidence='handoff/motion/M07/REPORT.md;handoff/motion/M07/evidence/results.json;handoff/motion/M07/evidence/geometry-comparison.json',blocker='')
with p.open('w',encoding='utf-8',newline='') as f:w=csv.DictWriter(f,fields,quoting=csv.QUOTE_ALL);w.writeheader();w.writerows(rows)
p=r/'handoff/motion/MOTION_RUN_STATE.json';state=read(p);write(out/'INPUT_MOTION_RUN_STATE.json',state)
state.setdefault('verification_history',{})['M06']=state.get('M06',state.get('verification'));panels=[f'P07.S0{i}' for i in range(1,5)]
state['completed_panel_ids']=list(dict.fromkeys(state.get('completed_panel_ids',[])+panels));state['remaining_panel_ids']=[x for x in state.get('remaining_panel_ids',[]) if x not in panels];state['M07']=summary
state.update(current_prompt='MOTION_P07',status='PASS_SCOPED_UI_FIXTURE',verification=summary,appSourceHash=appHash,working_diff_hash=diffHash,affected_dependencies=['M02 shell mode/cancel fanout;36 regression groups PASS','P07 read cancellation/listening adapter lifecycle;link/UNKNOWN unchanged','P06 picker/Back and repeated NFC link flow','P15/P17 retain current warning owners;P22 audit source unchanged'],next_action='User review M07. Do not execute M08 or deploy without request.')
state['artifact_paths']=list(dict.fromkeys(state.get('artifact_paths',[])+['handoff/motion/M07/REPORT.md','handoff/motion/M07/SOURCE_MANIFEST.json','handoff/motion/M07/evidence/results.json']))
write(p,state);write(out/'RUN_STATE.json',{'current_prompt':'MOTION_P07','status':'PASS_SCOPED_UI_FIXTURE','completed_panel_ids':panels,'remaining_panel_ids':[],'verification':summary,'affected_dependencies':state['affected_dependencies'],'next_action':'User visual review; production/hardware unverified; no deploy.'})
print(json.dumps(summary,ensure_ascii=False))
