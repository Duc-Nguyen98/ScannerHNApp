from pathlib import Path
import csv, hashlib, json, subprocess
r=Path(__file__).resolve().parents[1]
out=r/'handoff/motion/M04'
data=json.loads((out/'evidence/results.json').read_text(encoding='utf-8'))
assert len(data)==3 and all(len(x['checks'])==13 and all(c['status']=='PASS' for c in x['checks']) and not x['errors'] for x in data)
assert all(x['domain']==data[0]['domain'] and x['operations']=={'record':2,'check':1,'camera':0} and len(x['panels'])==4 for x in data)
shell=json.loads((out/'evidence/shell-regression/results.json').read_text(encoding='utf-8'))
manual=json.loads((out/'evidence/manual-regression/results.json').read_text(encoding='utf-8'))
assert sum(len(x['checks']) for x in shell)==36 and all(not x['errors'] for x in shell)
assert len(manual['checks'])==11 and not manual['errors']
files=['docs/flows/inbound/motion.mjs','docs/flows/inbound/motion.css','docs/flows/inbound/inbound.mjs','docs/flows/inbound/inbound-flow.mjs','docs/flows/inbound/manual-entry.mjs','docs/flows/inbound/style.css','docs/flows/home/home.mjs','docs/flows/auth-session/index.html','docs/flows/auth-session/bootstrap.mjs','docs/flows/auth-session/app.mjs','docs/flows/shared/motion/motion-primitives.mjs','docs/flows/shared/motion/motion-tokens.css']
manifest={p:{'bytes':(r/p).stat().st_size,'sha256':hashlib.sha256((r/p).read_bytes()).hexdigest()} for p in files}
digest=hashlib.sha256(json.dumps(manifest,sort_keys=True).encode()).hexdigest()
(out/'SOURCE_MANIFEST.json').write_text(json.dumps({'definition':'SHA256 over sorted JSON of scoped source file bytes/hash; not a full-repo commit or production bundle','files':manifest,'scoped_hash':digest},indent=2),encoding='utf-8')
summary={'prompt':'MOTION_P04','normal':'PASS','os_reduced':'PASS','off':'PASS','panels':4,'node_tests':47,'motion_browser_groups':39,'shell_regression_groups':36,'manual_regression_groups':11,'browser_total':86,'domain_equal_across_modes':True,'operations_per_mode':data[0]['operations'],'list_profiles':{x['mode']:x['listProfile'] for x in data},'source_bytes_new_motion_consumer':manifest[files[0]]['bytes']+manifest[files[1]]['bytes'],'static_geometry':'PASS all4panels in3modes against before','visual':'USER_REVIEW_PENDING','hardware':'NOT_RUN','production':'NOT_RUN','fps':'NOT_MEASURED','scoped_source_hash':digest}
(out/'evidence/summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
p=r/'handoff/motion/MOTION_COVERAGE.csv'
with p.open(encoding='utf-8-sig',newline='') as f: reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
for row in rows:
 if row['motion_prompt']=='MOTION_P04':
  row.update(normal_status='PASS',reduced_status='PASS',off_status='PASS',flow_regression_status='PASS',decision='STATIC_BY_DESIGN' if row['panel_id']=='P04.S03' else 'APPLIED',evidence='handoff/motion/M04/REPORT.md;handoff/motion/M04/evidence/results.json;handoff/motion/M04/evidence/summary.json',blocker='')
assert len(rows)==91
with p.open('w',encoding='utf-8',newline='') as f: w=csv.DictWriter(f,fieldnames=fields,quoting=csv.QUOTE_ALL);w.writeheader();w.writerows(rows)
p=r/'handoff/motion/MOTION_RUN_STATE.json';state=json.loads(p.read_text(encoding='utf-8-sig'))
panels=[f'P04.S0{i}' for i in range(1,5)]
state['completed_panel_ids']=list(dict.fromkeys(state.get('completed_panel_ids',[])+panels))
state['remaining_panel_ids']=[i for i in state.get('remaining_panel_ids',[]) if i not in panels]
state['M04']=summary|{'report':'handoff/motion/M04/REPORT.md'}
if state.get('current_prompt') in ['MOTION_P00','MOTION_P01','MOTION_P02','MOTION_P03','MOTION_P04']:
 state.update(current_prompt='MOTION_P04',status='PASS_SCOPED_UI_FIXTURE',verification=summary,affected_dependencies=['M02 AppShell mode/security','P05 optional manual-entry default preserved','P12 result Back','P17 UNKNOWN','P24.S03 waiting-Web hero owned by P04'],next_action='Review M04 motion. Do not start MOTION_P05 or deploy without user request.')
p.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(out/'RUN_STATE.json').write_text(json.dumps({'current_prompt':'MOTION_P04','status':'PASS_SCOPED_UI_FIXTURE','completed_panel_ids':panels,'remaining_panel_ids':[],'verification':summary,'next_action':'User review; production/hardware not verified; no deployment.'},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False))
