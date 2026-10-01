from pathlib import Path
import csv,json

root=Path(__file__).resolve().parents[2]
coverage=root/'SCREEN_COVERAGE.csv'
with coverage.open(encoding='utf-8-sig',newline='') as f:
    reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
titles=['Thẻ NFC','Đọc thẻ NFC','Xác minh liên kết','Đã liên kết thẻ NFC']
for row in rows:
    if row['prompt_id']=='P07':
        i=int(row['panel_id'][-1])
        row.update(title=titles[i-1],disposition='LEGACY_ADAPTED',visual_status='IN_PROGRESS',behavior_status='BLOCKED' if i==1 else 'PASS',integration_status='BLOCKED',
                   evidence=f'handoff/P07/REPORT.md; handoff/P07/STATE_ACCEPTANCE.csv; handoff/P07/evidence/P07-S0{i}-494x1000.png; handoff/P07/evidence/comparison-S0{i}.png; handoff/P07/evidence/browser-results.json; handoff/P07/evidence/node-tests.txt',
                   blocker='Visual review pending; production list/mapping/link/capability/device/audit contracts missing; hardware NOT_RUN.'+(' Advanced filter criteria not approved; fixture search/tabs/detail PASS.' if i==1 else ' Fixture behavior PASS only.'))
    if row['prompt_id']=='P06':
        row['visual_status']='IN_PROGRESS'
        row['evidence']+='; handoff/P07/CONTEXT.md (user temporarily accepted P06 on 2026-09-26); handoff/P07/evidence/lookup-regression/browser-results.json'
        row['blocker']+=' User temporarily accepted P06; later state synchronization allowed. P07 product selection callback regression passed; full real integration still pending.'
    if row['panel_id'] in ['P02.S01','P03.S01']:
        row['evidence']+='; handoff/P07/REPORT.md; handoff/P07/evidence/home-regression/browser-results.json; handoff/P07/evidence/browser-results.json'
        row['blocker']+=' Home P07 route implemented; P03 retains four existing operations and modal focus verified over P07.'
assert len(rows)>=91
assert len({r['panel_id'] for r in rows})==len(rows)
with coverage.open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields,quoting=csv.QUOTE_ALL);writer.writeheader();writer.writerows(rows)
state_path=root/'RUN_STATE.json'
s=json.loads(state_path.read_text(encoding='utf-8-sig'))
s.update(current_prompt='P07',prompt_status='FOUR_PROTOTYPE_PANELS_IMPLEMENTED_WITH_SOURCE_BLOCKERS',
         previous_prompt={'id':'P06','user_status':'Tạm chốt ngày 2026-09-26; sẽ bổ sung state đồng bộ sau','checkpoint':'handoff/P07/INPUT_RUN_STATE.json','visual_status':'USER_TEMPORARILY_ACCEPTED','behavior_status':'PASS_FIXTURE_CORE_ADVANCED_FILTER_BLOCKED','integration_status':'BLOCKED'},
         remaining_panel_ids=[f'P07.S0{i}' for i in range(1,5)],remaining_scope='P07 4/4 prototype panels implemented; no missing UI panel. Remaining acceptance/integration: visual user review, advanced filter criteria, approved production capabilities/API/device/audit contracts and hardware tests.',
         visual_status='IN_PROGRESS',behavior_status='BLOCKED',integration_status='BLOCKED',
         current_work='P07 four panels implemented and fixture acceptance verified; advanced filter/production source blockers explicitly retained. No P08 work.',
         last_user_request='Tạm chốt P06, đọc và triển khai prompt 7.',
         next_action='User review P07 prototype. Continue P07 corrections if requested; await actual contracts for real integration. Do not proceed P08 without user instruction.',
         latest_revision={'id':'P07-r01','report':'handoff/P07/REPORT.md','verification':'101/101 Node;11 P07 browser groups;32 measured captures;P06 regression11;Home regression14'},
         preview_instructions='minhanh / preview → Bắt đầu ca → Thẻ NFC → Quét hoặc liên kết thẻ NFC → Mô phỏng đọc thẻ NFC (tools ngoài app) → Tiếp tục → Xác nhận liên kết. Card sản phẩm mở P06 để chọn.',
         baseline_sha256='63f4b3876547ffec943f0e8f369eb22b48ba715ec38b14c51030a150b19a3b65')
s['implemented_panel_ids']+= [f'P07.S0{i}' for i in range(1,5) if f'P07.S0{i}' not in s['implemented_panel_ids']]
s['shared_components_changed'] += ['Home mount/routing/dispose for P07 and P06 product selection callback','P01 entry imports scoped P07 stylesheet','P06 optional selection mode only; regular lookup preserved']
s['blockers']=[
 'P07 advanced filter criteria not approved; search/status tabs operate in fixture adapter only.',
 'Production NFC list/detail/status/mapping/link/status-check and capability contract not supplied; fixture enums are not server enums.',
 'Hardware support/permission/read/write/read-back contract unverified; real NFC NOT_RUN.',
 'P15/P17 warning route contexts pending; P22 audit requires real event source, never current tag state.',
 'P07 visual user acceptance pending; exact Designer fonts/icons/product imagery unavailable. Existing NFC artwork reused; P06 AI box remains labeled demo.'
]
s['artifact_paths'] += ['handoff/P07/REPORT.md','handoff/P07/CONTEXT.md','handoff/P07/STATE_ACCEPTANCE.csv','handoff/P07/REVIEW.html','handoff/P07/evidence','docs/flows/nfc','tests/nfc.test.mjs','scripts/check_nfc.cjs']
s['tests'].update(node_total=101,node_passed=101,node_failed=0,p07_node_tests=12,p07_browser_groups_passed=11,p07_measured_captures_passed=32,current_evidence='handoff/P07/evidence',p06_browser_regression_groups_passed=11,home_browser_regressions_passed=14,hardware='NOT_RUN',production='NOT_RUN',browser_errors=0,external_requests=0)
s['coverage'].update(implemented_p01_p07_panels=23,other_panels_not_started=67,note='P17.S02 previous P05 direct dependency retained. P07 warning context does NOT implement P15/P17.S03. All 91 baseline panel IDs retained.')
s['p07_demo_data']={'namespace':'hn-scanner-nfc-fixture-v1','visible_seed_tags':5,'count_metadata':{'all':8,'linked':5,'unlinked':2},'storage':'memory only','source':'Board fixture; not WMS; no device operations','default_item':'fixture-nfc-serial-HN12345','P06_selection':'Exact P06 id/code/SKU/serial without inferring serial'}
state_path.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Updated {len(rows)} coverage rows; implemented {len(s["implemented_panel_ids"])} panels; P07 source blockers retained.')
