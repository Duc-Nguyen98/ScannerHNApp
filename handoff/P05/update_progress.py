from pathlib import Path
import json,csv
repo=Path.cwd();out=repo/'handoff/P05'
p=repo/'SCREEN_COVERAGE.csv'
with p.open(encoding='utf-8-sig',newline='') as f:r=csv.DictReader(f);fields=r.fieldnames;rows=list(r)
titles=['Thông tin phiếu xuất','Quét hàng xuất','Kiểm tra phiếu xuất — thiếu hàng','Đã gửi phiếu xuất — chờ Web']
for row in rows:
    if row['prompt_id']=='P05':
        i=int(row['panel_id'][-1]);row.update(title=titles[i-1],disposition='MIGRATED' if i>=3 else 'LEGACY_ADAPTED',visual_status='FAIL',behavior_status='PASS',integration_status='BLOCKED',evidence=f'handoff/P05/REPORT.md; handoff/P05/STATE_ACCEPTANCE.csv; handoff/P05/evidence/comparison-S0{i}.png; handoff/P05/evidence/browser-results.json; tests/outbound.test.mjs',blocker='Prototype complete; visual review pending: exact font/icons/camera/product assets differ. Production source/create/record/status/catalog/permissions/camera/P12 unavailable; fixture only.')
    elif row['panel_id'] in ['P02.S01','P03.S01']:
        row['evidence']+='; handoff/P05/REPORT.md; handoff/P05/evidence/'+('home-regression' if row['panel_id']=='P02.S01' else 'dialog-regression')+'/browser-results.json'
        row['blocker']+=' P05 new outbound connected in prototype; PX-0004 existing-document context stays pending.'
    elif row['panel_id']=='P17.S02':
        row.update(title='Mã không thể xuất',visual_status='FAIL',behavior_status='PASS',integration_status='BLOCKED',evidence='handoff/P05/REPORT.md; handoff/P05/evidence/P17-S02-from-P05.png; tests/outbound.test.mjs',blocker='Direct P05 dependency only: contextual exception UI/return/data retention implemented; exact visual and actual server reason/permission integration pending. P17 board not completed.')
assert len(rows)==91
with p.open('w',encoding='utf-8',newline='') as f:w=csv.DictWriter(f,fieldnames=fields,quoting=csv.QUOTE_ALL);w.writeheader();w.writerows(rows)
p=repo/'RUN_STATE.json';s=json.loads(p.read_text(encoding='utf-8-sig'))
s['previous_prompt']={'id':'P04','user_status':'Tạm chốt ngày 2026-09-25; sẽ bổ sung state đồng bộ sau','checkpoint':'handoff/P05/INPUT_RUN_STATE.json','visual_status':'USER_TEMPORARILY_ACCEPTED','behavior_status':'PASS','integration_status':'BLOCKED'}
s['current_prompt']='P05';s['prompt_status']='PROTOTYPE_IMPLEMENTED_VISUAL_REVIEW_AND_INTEGRATION_PENDING';s['implemented_panel_ids']=list(dict.fromkeys(s['implemented_panel_ids']+[f'P05.S0{i}' for i in range(1,5)]));s['dependency_panels_implemented']=['P17.S02 (P05 direct dependency only)']
s['remaining_panel_ids']=[f'P05.S0{i}' for i in range(1,5)];s['remaining_scope']='P05 4/4 prototype panels implemented; remaining visual acceptance and real integration, not missing UI. P17.S02 implemented only for P05 exception; P17 not complete.'
s['shared_components_changed']=['Home mounts outbound for new-document routes from task/picker; PX-0004 remains pending unchanged','P01 entry loads scoped outbound CSS','Shared waitingWebMarkup supports outbound; default inbound preserved','Home/P03 browser regressions updated for implemented P05 routes and external tools']
s['blockers']=['Visual review: exact B05 font/icons/barcode-box camera/product photos missing; existing repo assets used.','Approved backend source/create/metadata/validate/record/status/permissions contracts missing; fixture only.','Real camera/torch, catalogue/P06, document/P12 and existing-server-document resume unavailable.','PX-0005/sentAt and P17 reason/related document fixtures only. Drafts in memory lost on reload/tab close.','Device keyboard/hardware/backend NOT_RUN.']
s['artifact_paths']=list(dict.fromkeys(s['artifact_paths']+['handoff/P05/REPORT.md','handoff/P05/CONTEXT.md','handoff/P05/STATE_ACCEPTANCE.csv','handoff/P05/evidence','docs/flows/outbound','tests/outbound.test.mjs','scripts/check_outbound.cjs']))
s['next_action']='User visual review P05; do not proceed P06 without instruction.';s['preview_instructions']='minhanh / preview → xác nhận phiên → Xuất kho (hoặc Quét mã → Xuất kho). Bước2 mở tools P05 ngoài app, nạp 7/10 + 1 trùng; review blocked. Quay lại nhập HN12352, HN12353, HN12354; review/send. HN99999 tests P17.S02.'
s['visual_status']='FAIL';s['behavior_status']='PASS';s['integration_status']='BLOCKED';s['tests'].update(node_total=75,node_passed=75,node_failed=0,p05_node_tests=12,prior_node_regressions=63,p05_browser_groups_passed=12,home_browser_regressions_passed=14,p03_browser_regressions_passed=14,browser_errors=0,external_requests=0,production='NOT_RUN',current_evidence='handoff/P05/evidence')
s['coverage']={'baseline_panels':91,'implemented_p01_p05_panels':15,'direct_dependency_panels':1,'other_panels_not_started':75,'note':'P17.S02 direct P05 dependency; P17 board not completed. Visual/integration not accepted.'}
s['baseline_sha256']=json.loads((out/'evidence/baseline-comparison.json').read_text(encoding='utf-8'))['sha256']
s['last_user_request']='Tạm chốt P04, đọc và triển khai P05 Xuất kho';s['latest_revision']={'id':'P05-r01','report':'handoff/P05/REPORT.md','verification':'75/75 Node; 12 P05 browser groups; Home 14; P03 14; visual review and integration pending'}
s['current_work']='P05 prototype ready for user visual review; no P06 work.'
p.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Coverage: 91 panels preserved; P05 updated, direct P17.S02 trace, RUN_STATE updated.')
