from pathlib import Path
import csv, json
repo = Path(__file__).resolve().parents[2]
coverage = repo / 'SCREEN_COVERAGE.csv'
with coverage.open(encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f); fields = reader.fieldnames; rows = list(reader)
titles = ['Thông tin phiếu nhập', 'Quét hàng nhập', 'Kiểm tra phiếu', 'Đã gửi phiếu nhập — chờ Web']
for row in rows:
    if row['prompt_id'] == 'P04':
        index = int(row['panel_id'][-1]) - 1
        row.update(title=titles[index], disposition='MIGRATED' if index >= 2 else 'LEGACY_ADAPTED', visual_status='FAIL', behavior_status='PASS', integration_status='BLOCKED',
            evidence=f'handoff/P04/REPORT.md; handoff/P04/STATE_ACCEPTANCE.csv; handoff/P04/evidence/comparison-S0{index+1}.png; handoff/P04/evidence/browser-results.json',
            blocker='Exact B04 font/camera/box imagery missing; production metadata/record/status/catalog/hardware and P12/P17 resume integration pending. Fixture only, no Post.')
    elif row['prompt_id'] in ('P02','P03'):
        extra = 'handoff/P04/REPORT.md; handoff/P04/evidence/' + ('home-regression' if row['prompt_id']=='P02' else 'dialog-regression') + '/browser-results.json'
        if extra not in row['evidence']: row['evidence'] += '; ' + extra
        note = ' P04 new inbound route connected in prototype; PN-0001 resume context preserved at pending boundary; backend remains blocked.'
        if note not in row['blocker']: row['blocker'] += note
assert len(rows) == 91 and len({r['panel_id'] for r in rows}) == 91
with coverage.open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields,quoting=csv.QUOTE_ALL);writer.writeheader();writer.writerows(rows)
state=json.loads((repo/'handoff/P04/INPUT_RUN_STATE.json').read_text(encoding='utf-8-sig'))
state.update(current_prompt='P04', last_user_request='P03 tạm chốt; đọc và triển khai P04 — Nhập kho.',
    prompt_status='PROTOTYPE_IMPLEMENTED_VISUAL_REVIEW_AND_INTEGRATION_PENDING',
    previous_prompt={'id':'P03','user_status':'Tạm chốt; bổ sung state sau khi có yêu cầu','visual_status':'FAIL','behavior_status':'PASS','integration_status':'BLOCKED','checkpoint':'handoff/P04/INPUT_RUN_STATE.json'},
    implemented_panel_ids=state['implemented_panel_ids']+[f'P04.S0{i}' for i in range(1,5)],
    remaining_panel_ids=[f'P04.S0{i}' for i in range(1,5)],
    remaining_scope='4/4 P04 prototype panels implemented; remaining visual acceptance and real integration, not missing UI panels.',
    shared_components_changed=['Home mount routes new inbound to P04; existing document IDs stay pending with unchanged context','P01 entry loads scoped P04 CSS only','Shared waiting-web markup/copy for future P24.S03 reuse; P24 NOT_STARTED','P03 component reused for stopped warehouse; its controller/adapter/CSS unchanged'],
    blockers=['Visual differs in font/texture/icons/camera and box imagery; review needed, no pixel-perfect claim.','Approved backend metadata/create/record/status/permissions contract missing; adapter fixture only.','Real catalogue/camera/torch, P12/P17 and existing-document resume/persistence integration pending.','PN-0005/date fixtures only; in-memory draft lost on reload/tab close.','Device keyboard/hardware/backend NOT_RUN.'],
    artifact_paths=['handoff/P04/REPORT.md','handoff/P04/CONTEXT.md','handoff/P04/STATE_ACCEPTANCE.csv','handoff/P04/evidence','docs/flows/inbound','docs/flows/shared/waiting-web.mjs','tests/inbound.test.mjs','scripts/check_inbound.cjs','SCREEN_COVERAGE.csv'],
    next_action='Review P04 visuals and supply approved integration inputs when available. Do not begin P05–P24 without user request.',
    preview_instructions='minhanh / preview → confirm session → Nhập kho. At step 2 open external P04 tools, load 12 fixture scans; review and record. Outcome selector exercises UNKNOWN/status check.',
    tests={'node_total':57,'node_passed':57,'node_failed':0,'p04_node_tests':10,'prior_node_regressions':47,'p04_browser_groups_passed':11,'home_browser_regressions_passed':14,'p03_browser_regressions_passed':13,'browser_errors':0,'external_requests':0,'production':'NOT_RUN'},
    coverage={'baseline_panels':91,'implemented_panels':11,'other_panels_not_started':80},
    baseline_sha256='b0f13c4aff332518a6d5348eac6452dd8e4aa9bf98347568df9e527073c3a67f')
(repo/'RUN_STATE.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('P04 progress updated; 91 panel IDs preserved; 11 implemented, 80 not started.')
