import test from 'node:test';
import assert from 'node:assert/strict';
import {createWarrantyFlow,caseDetails,guardWarranty,postedDocuments,LEDGER_FIXTURE,resolveSerial} from '../docs/flows/warranty/warranty-model.mjs';
import {readWarrantyCases,resetWarrantyCases,writeWarrantyCase} from '../docs/flows/shared/warranty-cases.mjs';
import {businessRows} from '../docs/flows/history/business-history-data.mjs';
const state=()=>({previewReady:true,session:{actor:{id:'fixture-minhanh',name:'Minh Anh'},warehouse:{id:'fixture-hoa-nam',active:true},permissions:{warehouseOperations:true}}});

test('Invalid replacement serial preserves the selected product, draft and retry request',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.select('SN-XP420B-BK-0008');f.chooseFault('usb');f.draft.note='Giữ ghi chú';f.setMode('error');await f.submit('intake');const before=structuredClone(f.snapshot());assert.match(f.select('INVALID-serial').error,/Không tìm thấy serial/);assert.deepEqual(f.snapshot(),before);f.setMode('ready');const r=await f.submit('intake');assert.equal(r.receipt.requestId,before.request.id);assert.equal(r.row.note,'Giữ ghi chú');
});
test('A01 exact serial opens the same case; SKU/code never inferred; intake never posts components',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});assert.equal(resolveSerial('XP-420B'),null);assert.equal(resolveSerial('HN12347'),null);assert.equal(resolveSerial('HN12345').caseId,'BH-001');f.select('HN12345');f.chooseFault('power-off');const r=await f.submit('intake');assert.equal(r.row.id,'BH-001');assert.equal(f.snapshot().writes,0);assert.equal(readWarrantyCases().length,8);assert.equal(postedDocuments('BH-001')[0].lines[1].quantity,2);
});
test('A01 new serial intake keeps partner identity; duplicate request and duplicate serial do not create another case',async()=>{
 resetWarrantyCases();let finish;const f=createWarrantyFlow(state,{delay:()=>new Promise(r=>finish=r)});f.select('SN-XP420B-BK-0008');f.chooseFault('power-off');const p=f.submit('intake');assert.match((await f.submit('intake')).error,/Đang xử lý/);finish();const r=await p;assert.equal(r.row.serial,'SN-XP420B-BK-0008');assert.equal(r.row.customer,'Công ty Minh Phát');assert.equal(readWarrantyCases().length,9);assert.match((await f.submit('intake')).error,/đã được xác nhận/);assert.equal(readWarrantyCases().length,9);
 const g=createWarrantyFlow(state,{delay:async()=>{}});g.select('SN-XP420B-BK-0008');g.chooseFault('power-off');assert.equal((await g.submit('intake')).row.id,r.row.id);assert.equal(readWarrantyCases().length,9);
});
test('A02 ledger filters POSTED and exact case, deduplicates ID, counts quantity separately from codes',()=>{
 const rows=[...LEDGER_FIXTURE,{...LEDGER_FIXTURE[0],id:'draft',status:'DRAFT'},{...LEDGER_FIXTURE[0],id:'other',caseId:'BH-002'},LEDGER_FIXTURE[0]];
 const docs=postedDocuments('BH-001',rows);assert.equal(docs.length,1);assert.equal(docs[0].lines.length,2);assert.equal(docs[0].lines.reduce((n,l)=>n+l.quantity,0),3);assert.equal(postedDocuments('BH-003',rows).length,0);
});
test('A03 update receipt waits for confirmation; handover is not returned, history uses same source',async()=>{
 resetWarrantyCases();let done;const f=createWarrantyFlow(state,{delay:()=>new Promise(r=>done=r)});f.beginUpdate('BH-001');f.updateDraft.result='Đã sửa chữa, máy hoạt động bình thường';const p=f.submit('update','BH-001');assert.equal(f.snapshot().receipt,null);assert.equal(caseDetails('BH-001').status,'Đang kiểm tra');done();await p;assert.equal(caseDetails('BH-001').status,'Chờ bàn giao');assert.equal(caseDetails('BH-001').closed,false);assert.equal(businessRows('warranty').find(c=>c.id==='BH-001').status,'handover');assert.equal(businessRows('warranty').find(c=>c.id==='BH-001').events.at(-1).label,'Hoàn tất sửa chữa');assert.equal(postedDocuments('BH-001')[0].lines[1].quantity,2);
});
test('A04 closed, permission, warehouse and expired session guards apply at handler and after await',async()=>{
 resetWarrantyCases();let s=state(),done;const f=createWarrantyFlow(()=>s,{delay:()=>new Promise(r=>done=r)});assert.match(guardWarranty(s,'BH-002'),/chỉ được xem/);assert.match((await f.submit('update','BH-002')).error,/chỉ được xem/);assert.equal(f.beginUpdate('BH-002'),false);
 f.beginUpdate('BH-001');f.updateDraft.result='Đã sửa';const p=f.submit('update','BH-001');s.session.warehouse.active=false;done();assert.match((await p).error,/Kho tạm dừng/);assert.equal(f.snapshot().writes,0);s=state();s.session.permissions.warehouseOperations=false;assert.match(guardWarranty(s,'BH-001'),/quyền/);s.session=null;assert.match(guardWarranty(s,'BH-001'),/Phiên/);
});
test('A05 case switch cannot carry customer/serial/events or update fields',()=>{
 resetWarrantyCases();const a=caseDetails('BH-001'),b=caseDetails('BH-003');assert.notEqual(a.customer,b.customer);assert.notEqual(a.serial,b.serial);assert.ok(b.events.every(e=>e.id.startsWith('BH-003')));const f=createWarrantyFlow(state);f.beginUpdate(a.id);f.updateDraft.result='Kết quả case1';f.beginUpdate(b.id);assert.equal(f.updateDraft.result,'');assert.equal(caseDetails('invalid'),null);
});
test('UNKNOWN blocks new writes and selection; reconcile keeps request/session/version and commits once',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.beginUpdate('BH-001');f.updateDraft.result='Đã sửa';f.setMode('unknown');await f.submit('update','BH-001');const r=structuredClone(f.snapshot().request);assert.match((await f.submit('update','BH-001')).error,/đối chiếu/);assert.match(f.select('HN12346').error,/đối chiếu/);assert.equal(f.snapshot().receipt,null);await f.reconcile();assert.equal(f.snapshot().receipt.requestId,r.id);assert.equal(f.snapshot().request.scanSessionId,r.scanSessionId);assert.equal(f.snapshot().request.version,r.version);assert.equal(f.snapshot().writes,1);assert.match((await f.reconcile()).error,/Không có/);
});
test('Failure retains update draft and request identity; stale version and dispose cannot commit',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.beginUpdate('BH-001');f.updateDraft.result='Đã sửa';f.setMode('error');await f.submit('update','BH-001');const id=f.snapshot().request.id;f.beginUpdate('BH-001');assert.equal(f.updateDraft.result,'Đã sửa');f.setMode('ready');await f.submit('update','BH-001');assert.equal(f.snapshot().receipt.requestId,id);
 resetWarrantyCases();let done;const g=createWarrantyFlow(state,{delay:()=>new Promise(r=>done=r)});g.beginUpdate('BH-001');g.updateDraft.result='Sửa';const p=g.submit('update','BH-001');writeWarrantyCase({...caseDetails('BH-001'),version:2});done();assert.match((await p).error,/thay đổi/);assert.equal(g.snapshot().writes,0);
 const h=createWarrantyFlow(state,{delay:()=>new Promise(r=>done=r)});h.beginUpdate('BH-001');h.updateDraft.result='Sửa';const q=h.submit('update','BH-001');h.dispose();done();assert.match((await q).error,/kết thúc/);assert.equal(h.snapshot().writes,0);
});
test('Repair update rejects whitespace/malformed/overlong values before requesting; accepts 200 characters',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.beginUpdate('BH-007');
 for(const value of ['   ',null,'x'.repeat(201)]){f.updateDraft.result=value;assert.ok((await f.submit('update','BH-007')).error);assert.equal(f.snapshot().request,null);assert.equal(f.snapshot().writes,0);}
 f.updateDraft.result='x'.repeat(200);f.updateDraft.diagnosis='y'.repeat(201);assert.match((await f.submit('update','BH-007')).error,/Chẩn đoán/);assert.equal(f.snapshot().request,null);
 f.updateDraft.diagnosis='y'.repeat(200);const r=await f.submit('update','BH-007');assert.equal(r.row.result.length,200);assert.equal(r.row.diagnosis.length,200);assert.equal(r.row.status,'Chờ bàn giao');assert.equal(r.row.closed,false);
});
