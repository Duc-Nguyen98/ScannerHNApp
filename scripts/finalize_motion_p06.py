from pathlib import Path
import json,csv,hashlib,subprocess
r=Path(__file__).resolve().parents[1];out=r/'handoff/motion/M06'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,value):p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda value:hashlib.sha256(value).hexdigest()
encode=lambda value:json.dumps(value,ensure_ascii=False,separators=(',',':')).encode()
data=read(out/'evidence/results.json');shell=read(out/'evidence/shell-regression/results.json')
assert len(data)==3 and all(len(x['checks'])==12 and not x['errors'] for x in data)
assert all(x['domain']==data[0]['domain'] for x in data)
assert sum(len(x['checks']) for x in shell)==36 and all(not x['errors'] for x in shell)
flow=read(out/'evidence/flow-regression/results.json')['results'];edges=read(out/'evidence/recent-edges/results.json')['checks']
assert len(flow)==7 and len(edges)==2 and all(x['status']=='PASS' for x in flow+edges)
before=read(out/'evidence/before/geometry.json')
assert all(x['geometry']==before for x in data)
assert read(r/'handoff/flow/FLOW_GATE.json')['gate_status']=='PASS'
prior=read(r/'handoff/motion/M05/SOURCE_MANIFEST.json');priorFiles={x['file']:x for x in prior['files']}
for name in ['docs/flows/shared/motion/motion-primitives.mjs','docs/flows/shared/motion/motion-tokens.css']:
 assert sha((r/name).read_bytes())==priorFiles[name]['sha256']
scope=['docs/flows/lookup/lookup.mjs','docs/flows/lookup/motion.mjs','docs/flows/lookup/read-owner.mjs','docs/flows/home/home.mjs','docs/flows/auth-session/app.mjs']
scoped=[{'file':name,'bytes':(r/name).stat().st_size,'sha256':sha((r/name).read_bytes()),'prior_bytes':priorFiles.get(name,{}).get('bytes',0),'prior_sha256':priorFiles.get(name,{}).get('sha256')} for name in scope]
files=[{'file':p.relative_to(r).as_posix(),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in sorted((r/'docs/flows').rglob('*')) if p.is_file()]
diff=[{'path':p.relative_to(r).as_posix(),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in sorted(p for folder in ['docs/flows','scripts','tests'] for p in (r/folder).rglob('*') if p.is_file())]
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip();appHash=sha(encode(files));diffHash=sha(encode({'source_commit':head,'files':diff}));delta=sum(x['bytes']-x['prior_bytes'] for x in scoped)
manifest={'source_commit':head,'appSourceHash':appHash,'working_diff_hash':diffHash,'definition':'Same sorted path/file-sha256-bytes scheme as M05; includes untracked sources. Scoped bytes compare M05 final source manifest, not a production bundle.','fixture':'hn-scanner-lookup-fixture-v1 + demo-data existing36events; browser clock2026-09-30T01:15:20Z; no seed file changes','scoped':scoped,'scoped_source_byte_delta':delta,'files':files,'diffFiles':diff}
write(out/'SOURCE_MANIFEST.json',manifest)
summary={'prompt':'MOTION_P06','normal':'PASS','os_reduced':'PASS','off':'PASS','panels':4,'node_tests':39,'motion_browser_groups':36,'shell_regression_groups':36,'flow_regression_groups':7,'recent_edge_groups':2,'browser_total':81,'domain_equal':True,'operations_per_mode':data[0]['domain'],'initial_profiles':{x['mode']:x['initialProfile'] for x in data},'source_byte_delta':delta,'static_geometry':'PASS12 panel-mode combinations vs actual before','visual':'USER_REVIEW_PENDING','virtualization':'NOT_NEEDED current seed; DEFERRED long-list backend','fps':'NOT_MEASURED','production':'NOT_RUN','hardware':'NOT_RUN','report':'handoff/motion/M06/REPORT.md'}
write(out/'evidence/summary.json',summary)
write(out/'evidence/geometry-comparison.json',[{'mode':x['mode'],'panel':'P06.S0'+n,'same_as_before':g==before[n]} for x in data for n,g in x['geometry'].items()])
p=r/'handoff/motion/MOTION_COVERAGE.csv'
with p.open(encoding='utf-8-sig',newline='') as f:reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
assert len(rows)==91
for row in rows:
 if row['motion_prompt']=='MOTION_P06':row.update(normal_status='PASS',reduced_status='PASS',off_status='PASS',flow_regression_status='PASS',decision={'P06.S01':'APPLIED','P06.S02':'REUSED','P06.S03':'STATIC_BY_DESIGN','P06.S04':'APPLIED'}[row['panel_id']],evidence='handoff/motion/M06/REPORT.md;handoff/motion/M06/evidence/results.json;handoff/motion/M06/evidence/summary.json',blocker='')
with p.open('w',encoding='utf-8',newline='') as f:writer=csv.DictWriter(f,fields,quoting=csv.QUOTE_ALL);writer.writeheader();writer.writerows(rows)
p=r/'handoff/motion/MOTION_RUN_STATE.json';state=read(p);state.setdefault('verification_history',{})['M05']=state.get('M05',state.get('verification'));panels=[f'P06.S0{i}' for i in range(1,5)]
state['completed_panel_ids']=list(dict.fromkeys(state.get('completed_panel_ids',[])+panels));state['remaining_panel_ids']=[x for x in state.get('remaining_panel_ids',[]) if x not in panels];state['M06']=summary
state.update(current_prompt='MOTION_P06',status='PASS_SCOPED_UI_FIXTURE',verification=summary,appSourceHash=appHash,working_diff_hash=diffHash,affected_dependencies=['M02 shell route identity and mode/cancel wiring','P06 read request/cache and keyed native list','P03 existing overlay cancellation preserved','P07 selection/Back regression','P09/P18 caller state unchanged'],next_action='User review M06. Do not execute M07 or deploy without request.')
state['artifact_paths']=list(dict.fromkeys(state.get('artifact_paths',[])+['handoff/motion/M06/REPORT.md','handoff/motion/M06/SOURCE_MANIFEST.json','handoff/motion/M06/evidence/results.json']))
write(p,state);write(out/'RUN_STATE.json',{'current_prompt':'MOTION_P06','status':'PASS_SCOPED_UI_FIXTURE','completed_panel_ids':panels,'remaining_panel_ids':[],'verification':summary,'next_action':'User visual review; hardware/production unverified; no deploy.'})
print(json.dumps(summary,ensure_ascii=False))
