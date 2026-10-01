from pathlib import Path
import csv,json
repo=Path(__file__).resolve().parents[2]
coverage=repo/'SCREEN_COVERAGE.csv'
with coverage.open(encoding='utf-8-sig',newline='') as f:
    reader=csv.DictReader(f); fields=reader.fieldnames;rows=list(reader)
titles=['Tra cứu sản phẩm','Thông tin sản phẩm','Tồn kho sản phẩm','Lịch sử giao dịch']
for row in rows:
    if row['prompt_id']=='P06':
        i=int(row['panel_id'][-1]);row.update(title=titles[i-1],disposition='LEGACY_ADAPTED',visual_status='FAIL',behavior_status='BLOCKED' if i==1 else 'PASS',integration_status='BLOCKED',evidence=f'handoff/P06/REPORT.md; handoff/P06/STATE_ACCEPTANCE.csv; handoff/P06/evidence/comparison-S0{i}.png; handoff/P06/evidence/browser-results.json; tests/lookup.test.mjs',blocker='Exact product/gallery assets missing; font/icon visual review needed. Backend catalogue/stock/events/capabilities unverified; fixture only.'+(' Advanced filter criteria not approved; search/category tested.' if i==1 else ' P09/P12/print/gallery source pending.' if i==2 else ''))
    if row['panel_id'] in ['P02.S01','P03.S01']:
        row['evidence']+='; handoff/P06/REPORT.md; handoff/P06/evidence/'+('home' if row['prompt_id']=='P02' else 'dialog')+'-regression/browser-results.json'
        row['blocker']+=' P06 lookup now connected in prototype with item context; real backend remains blocked.'
    if row['prompt_id']=='P05':
        row['evidence']+='; handoff/P06/CONTEXT.md (user temporarily accepted P05, 2026-09-25)'
with coverage.open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fields,quoting=csv.QUOTE_ALL);writer.writeheader();writer.writerows(rows)
assert len(rows)>=91
state=json.loads((repo/'handoff/P06/INPUT_RUN_STATE.json').read_text(encoding='utf-8-sig'))
state.update(current_prompt='P06',prompt_status='FOUR_PROTOTYPE_PANELS_IMPLEMENTED_WITH_SOURCE_BLOCKERS',previous_prompt={'id':'P05','user_status':'Tạm chốt ngày 2026-09-25; sẽ bổ sung state đồng bộ sau','checkpoint':'handoff/P06/INPUT_RUN_STATE.json','visual_status':'USER_TEMPORARILY_ACCEPTED','behavior_status':'PASS','integration_status':'BLOCKED'},remaining_panel_ids=[f'P06.S0{i}' for i in range(1,5)],remaining_scope='P06 4/4 UI panels implemented. Remaining: original images, advanced filter decision, visual acceptance and real integration; no missing panel.',shared_components_changed=['Home mount/routing/cleanup for P06 and P03 item context','P01 entry imports scoped P06 CSS/module','Home/P03 browser assertions reflect implemented P06 route'],blockers=['Product and gallery image assets unavailable; exact B06 font/icons unverified, visual review needed.','Advanced catalogue filter criteria/options not approved; filter affordance explains pending source.','Real catalogue/stock/event APIs and module capability mapping not supplied; read-only fixtures only.','P09/P12/print/camera integrations pending. No real hardware/API test.'],next_action='User review P06 visual; supply product assets, advanced filter criteria and read/capability contracts. Do not proceed P07 without instruction.',preview_instructions='minhanh / preview → xác nhận phiên → Quét hoặc nhập mã sản phẩm (hoặc Quét mã → Tra cứu sản phẩm). HN12345 → Số lượng tồn kho; Back → cuộn dưới gallery → Lịch sử giao dịch.',visual_status='FAIL',behavior_status='BLOCKED',integration_status='BLOCKED',last_user_request='Tạm chốt P05 và đọc/triển khai prompt P06 Tra cứu',latest_revision={'id':'P06-r01','report':'handoff/P06/REPORT.md','verification':'85/85 Node; P06 browser11; Home14/P03 14/P05 12 PASS. Advanced filter/assets/real integration remain blocked.'},current_work='P06 four panels implemented and captured; final handoff with source blockers. Awaiting visual acceptance, do not proceed P07.',coverage={'baseline_panels':91,'implemented_p01_p06_panels':19,'direct_dependency_panels':1,'other_panels_not_started':71,'note':'P17.S02 only direct P05 dependency; visual/real integration not accepted.'},tests={'node_total':85,'node_passed':85,'node_failed':0,'p06_node_tests':8,'prior_node_regressions':77,'p06_browser_groups_passed':11,'home_browser_regressions_passed':14,'p03_browser_regressions_passed':14,'p05_browser_groups_passed':12,'p04_browser_scope':'12/11+1 and waiting Web included in P05 regression','browser_errors':0,'external_requests':0,'production':'NOT_RUN','current_evidence':'handoff/P06/evidence'})
state['baseline_sha256']=json.loads((repo/'handoff/P06/evidence/baseline-source.json').read_text())['supplied_sha256']
state['implemented_panel_ids']+= [f'P06.S0{i}' for i in range(1,5)]
state['artifact_paths']+=['handoff/P06/REPORT.md','handoff/P06/CONTEXT.md','handoff/P06/STATE_ACCEPTANCE.csv','handoff/P06/evidence','docs/flows/lookup','tests/lookup.test.mjs','scripts/check_lookup.cjs']
(repo/'RUN_STATE.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (repo/'handoff/P06/STATE_ACCEPTANCE.csv').open('w',encoding='utf-8',newline='') as f:
    writer=csv.writer(f);writer.writerow(['id','visual_status','behavior_status','integration_status','evidence','remaining'])
    for row in rows:
        if row['prompt_id']=='P06':writer.writerow([row['panel_id'],row['visual_status'],row['behavior_status'],row['integration_status'],row['evidence'],row['blocker']])
    for i in range(1,6):writer.writerow([f'P06.A0{i}','NOT_RUN','PASS','BLOCKED','tests/lookup.test.mjs; evidence/node-tests.txt; evidence/browser-results.json','Fixture only; backend not verified'+('; advanced filter criteria separately blocked' if i==1 else '')])
print(f'Updated {len(rows)} baseline coverage rows; P06 4 panels, 5 acceptance cases. P05 temporary acceptance preserved.')
