import test from 'node:test';
import assert from 'node:assert/strict';
import {createWarrantyFlow,caseDetails} from '../docs/flows/warranty/warranty-model.mjs';
import {resetWarrantyCases,writeWarrantyCase} from '../docs/flows/shared/warranty-cases.mjs';
import {resolveNavigation} from '../docs/flows/home/home-flow.mjs';
const state=()=>({previewReady:true,session:{actor:{id:'fixture-minhanh',name:'Minh Anh'},warehouse:{id:'fixture-hoa-nam',active:true},permissions:{warehouseOperations:true}}});
test('Per-case drafts survive A → B → A without crossing customers or result text',()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state);f.beginUpdate('BH-001');f.updateDraft.result='Nháp A';f.updateDraft.diagnosis='Chẩn đoán A';f.beginUpdate('BH-007');assert.equal(f.updateDraft.result,'');f.updateDraft.result='Nháp B';f.beginUpdate('BH-001');assert.equal(f.updateDraft.result,'Nháp A');assert.equal(f.updateDraft.diagnosis,'Chẩn đoán A');f.beginUpdate('BH-007');assert.equal(f.updateDraft.result,'Nháp B');
});
test('Completed results remain immutable when another dialog opens; unresolved same-case update is not success',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.beginUpdate('BH-001');f.updateDraft.result='Kết quả đã lưu';await f.submit('update','BH-001');const old=f.confirmedUpdate('BH-001');f.beginUpdate('BH-001');f.updateDraft.result='Nháp chưa lưu';assert.equal(f.confirmedUpdate('BH-001').row.result,'Kết quả đã lưu');f.beginUpdate('BH-007');assert.equal(f.confirmedUpdate('BH-001').receipt.requestId,old.receipt.requestId);f.beginUpdate('BH-001');f.setMode('unknown');await f.submit('update','BH-001');assert.equal(f.confirmedUpdate('BH-001'),null);await f.reconcile();assert.equal(f.confirmedUpdate('BH-001').row.result,'Nháp chưa lưu');
});
test('Repair retry request stays stable after unrelated intake edits and another case visit',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.beginUpdate('BH-001');f.updateDraft.result='Đã sửa';f.setMode('error');await f.submit('update','BH-001');const id=f.snapshot().request.id;f.beginUpdate('BH-007');f.updateDraft.result='Nháp B';f.select('HN12345');f.draft.note='Nháp tiếp nhận độc lập';f.beginUpdate('BH-001');f.setMode('ready');await f.submit('update','BH-001');assert.equal(f.snapshot().receipt.requestId,id);assert.equal(caseDetails('BH-007').result,undefined);
});
test('Adapter rejection releases busy, retains UNKNOWN and forbids blind resubmit',async()=>{
 resetWarrantyCases();let attempts=0;const f=createWarrantyFlow(state,{delay:async()=>{if(++attempts===1)throw Error('transport');}});f.beginUpdate('BH-001');f.updateDraft.result='Đã sửa';const r=await f.submit('update','BH-001');assert.match(r.error,/đối chiếu/);assert.equal(f.snapshot().busy,false);assert.equal(f.snapshot().unknown,true);const id=f.snapshot().request.id;assert.match((await f.submit('update','BH-001')).error,/đối chiếu/);assert.equal(attempts,1);await f.reconcile();assert.equal(f.snapshot().receipt.requestId,id);assert.equal(f.snapshot().writes,1);
});
test('Write-then-throw reconciles by exact request event without a second write',async()=>{
 resetWarrantyCases();let calls=0;const f=createWarrantyFlow(state,{delay:async()=>{},commit:r=>{calls++;writeWarrantyCase(r);throw Error('lost ack');}});f.beginUpdate('BH-001');f.updateDraft.result='Đã sửa';await f.submit('update','BH-001');const id=f.snapshot().request.id;assert.equal(f.snapshot().unknown,true);assert.equal(f.snapshot().writes,0);await f.reconcile();assert.equal(calls,1);assert.equal(f.snapshot().writes,1);assert.equal(f.snapshot().receipt.requestId,id);assert.equal(caseDetails('BH-001').events.filter(e=>e.id===id+'-E').length,1);
});
test('Unverified failed write remains UNKNOWN until matching source appears; reconcile never reposts',async()=>{
 resetWarrantyCases();let calls=0,candidate;const f=createWarrantyFlow(state,{delay:async()=>{},commit:r=>{calls++;candidate=structuredClone(r);throw Error('write unavailable');}});f.beginUpdate('BH-007');f.updateDraft.result='Đã sửa';await f.submit('update','BH-007');const id=f.snapshot().request.id;assert.match((await f.reconcile()).error,/Chưa xác minh/);assert.equal(calls,1);assert.equal(f.snapshot().unknown,true);writeWarrantyCase(candidate);await f.reconcile();assert.equal(calls,1);assert.equal(f.snapshot().receipt.requestId,id);
});
test('Dirty draft keeps observed version and cannot overwrite a changed case or another case ID',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.beginUpdate('BH-001');f.updateDraft.result='Nháp của tôi';writeWarrantyCase({...caseDetails('BH-001'),version:2,result:'Kết quả nguồn mới'});f.beginUpdate('BH-007');f.beginUpdate('BH-001');assert.equal(f.updateDraft.result,'Nháp của tôi');assert.match((await f.submit('update','BH-001')).error,/phiên bản/);assert.equal(caseDetails('BH-001').result,'Kết quả nguồn mới');assert.match((await f.submit('update','BH-007')).error,/đúng hồ sơ/);assert.equal(f.snapshot().writes,0);
});
test('Stopped warehouse allows warranty reads while write guard and account permission still apply',async()=>{
 resetWarrantyCases();const s=state();s.session.warehouse.active=false;assert.equal(resolveNavigation('warranty',undefined,s).kind,'pending');const f=createWarrantyFlow(()=>s,{delay:async()=>{}});f.beginUpdate('BH-001');f.updateDraft.result='Đã sửa';assert.match((await f.submit('update','BH-001')).error,/Kho tạm dừng/);assert.equal(f.snapshot().writes,0);s.session.permissions.warehouseOperations=false;assert.equal(resolveNavigation('warranty',undefined,s).kind,'blocked');
});
