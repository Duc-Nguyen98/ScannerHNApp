import test from 'node:test';
import assert from 'node:assert/strict';
import {FAULT_OPTIONS,faultError,faultText} from '../docs/flows/warranty/fault-options.mjs';
import {createWarrantyFlow,validateIntake} from '../docs/flows/warranty/warranty-model.mjs';
import {resetWarrantyCases} from '../docs/flows/shared/warranty-cases.mjs';
const state=()=>({previewReady:true,session:{actor:{id:'fixture-minhanh',name:'Minh Anh'},warehouse:{id:'fixture-hoa-nam',active:true},permissions:{warehouseOperations:true}}});
test('18 unique user-requested choices include Other and produce explicit labels',()=>{
 assert.equal(FAULT_OPTIONS.length,18);assert.equal(new Set(FAULT_OPTIONS.map(o=>o.id)).size,18);assert.equal(FAULT_OPTIONS.at(-1).id,'other');
 for(const o of FAULT_OPTIONS.filter(o=>o.id!=='other'))assert.equal(faultText({faultId:o.id}),o.name);
 assert.match(faultError({faultId:'forged'}),/chọn lỗi/);
});
test('Other is required, rejects whitespace and excessive length; cached description survives switching',()=>{
 const f=createWarrantyFlow(state);f.select('SN-XP420B-BK-0008');assert.match(validateIntake(f.draft),/chọn lỗi/);f.chooseFault('other');assert.match(validateIntake(f.draft),/Mô tả/);f.describeFault('   ');assert.match(validateIntake(f.draft),/Mô tả/);f.describeFault('a'.repeat(201));assert.match(validateIntake(f.draft),/200/);f.describeFault('Máy phát tiếng rít khi khởi động');
 f.chooseFault('power-off');assert.equal(f.draft.fault,'Máy không lên nguồn');f.chooseFault('other');assert.equal(f.draft.faultOther,'Máy phát tiếng rít khi khởi động');assert.equal(validateIntake(f.draft),'');
});
test('Confirmation uses selected canonical label and excludes hidden Other text',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.select('SN-XP420B-BK-0008');f.chooseFault('other');f.describeFault('Nháp khác không gửi');f.chooseFault('paper-jam');f.draft.fault='stale forged text';const r=await f.submit('intake');assert.equal(r.row.fault,'Kẹt giấy / Kẹt tem');assert.equal(r.row.faultId,'paper-jam');assert.equal(r.row.faultOther,'');assert.equal(f.draft.faultOther,'Nháp khác không gửi');
});
test('Other custom description is confirmed exactly and survives UNKNOWN without blind retry',async()=>{
 resetWarrantyCases();const f=createWarrantyFlow(state,{delay:async()=>{}});f.select('SN-XP420B-BK-0008');f.chooseFault('other');f.describeFault('  Máy kêu <rít> & rung khi khởi động  ');f.setMode('unknown');await f.submit('intake');const before=structuredClone(f.snapshot().request);assert.equal(f.chooseFault('no-print'),false);assert.equal(f.describeFault('changed'),false);assert.deepEqual(f.snapshot().request,before);assert.match((await f.submit('intake')).error,/đối chiếu/);const r=await f.reconcile();assert.equal(r.row.fault,'Máy kêu <rít> & rung khi khởi động');assert.equal(r.row.faultId,'other');assert.equal(r.receipt.requestId,before.id);
});
test('No request or writes for empty Other; busy/disposed guard fault selection',async()=>{
 resetWarrantyCases();let done;const f=createWarrantyFlow(state,{delay:()=>new Promise(r=>done=r)});f.select('SN-XP420B-BK-0008');f.chooseFault('other');assert.match((await f.submit('intake')).error,/Mô tả/);assert.equal(f.snapshot().request,null);f.describeFault('Có tiếng động lạ');const p=f.submit('intake');assert.equal(f.chooseFault('wifi'),false);assert.equal(f.describeFault('replacement'),false);f.dispose();done();assert.match((await p).error,/kết thúc/);assert.equal(f.snapshot().writes,0);assert.equal(f.chooseFault('usb'),false);
});
