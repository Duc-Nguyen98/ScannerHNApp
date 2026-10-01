import test from 'node:test';
import assert from 'node:assert/strict';
import {WARRANTY_SEED,WARRANTY_LEDGER,readWarrantyCases} from '../docs/flows/shared/warranty-cases.mjs';
import {caseDetails,componentSummary} from '../docs/flows/warranty/warranty-model.mjs';
import {businessRows} from '../docs/flows/history/business-history-data.mjs';
test('Eight complete warranty cases cover the four already approved stages with unique serials',()=>{
 assert.equal(WARRANTY_SEED.length,8);assert.deepEqual(new Set(WARRANTY_SEED.map(c=>c.status)),new Set(['Đã tiếp nhận','Đang kiểm tra','Chờ bàn giao','Đã trả khách']));
 assert.equal(new Set(WARRANTY_SEED.map(c=>c.serial)).size,8);assert.equal(WARRANTY_SEED.filter(c=>c.status!=='Đã trả khách').length,4);
 for(const c of WARRANTY_SEED){for(const k of ['customer','customerId','contact','fault','note','accessories'])assert.ok(c[k]?.trim(),c.id+':'+k);assert.match(c.contact,/^0\d{3} \d{3} \d{3}$/);assert.equal(c.warehouse,'Kho Hoa Nam');assert.equal(c.ledgerKnown,true);assert.ok(c.note.length<=200&&c.accessories.length<=200);}
});
test('Confirmed repair text belongs only to handed-over or awaiting-handover cases',()=>{
 for(const c of WARRANTY_SEED){if(['Đã trả khách','Chờ bàn giao'].includes(c.status)){assert.ok(c.result);assert.ok(c.diagnosis);assert.ok(c.events.some(e=>e.label==='Hoàn tất sửa chữa'));}else assert.equal(c.result,undefined);if(c.status==='Đã tiếp nhận')assert.equal(c.diagnosis,'');}
});
test('Ledger quantities, case references and event chronology reconcile without invented missing-as-zero',()=>{
 assert.equal(WARRANTY_LEDGER.length,5);assert.equal(new Set(WARRANTY_LEDGER.map(d=>d.id)).size,5);assert.equal(WARRANTY_LEDGER.flatMap(d=>d.lines).reduce((n,l)=>n+l.quantity,0),8);
 for(const c of WARRANTY_SEED){const keys=c.events.map(e=>e.day+' '+e.time);assert.deepEqual(keys,[...keys].sort());assert.equal(c.day+' '+c.time,keys.at(-1));assert.equal(new Set(c.events.map(e=>e.id)).size,c.events.length);for(const d of WARRANTY_LEDGER.filter(d=>d.caseId===c.id)){assert.equal(d.status,'POSTED');assert.ok(c.events.some(e=>e.documentId===d.id));assert.ok(d.day+' '+d.time>=keys[0]);assert.ok(d.day+' '+d.time<=keys.at(-1));assert.ok(d.lines.every(l=>Number.isInteger(l.quantity)&&l.quantity>0));}}
 assert.equal(componentSummary('BH-004').quantity,0);assert.equal(componentSummary('BH-004').known,true);assert.equal(componentSummary('BH-UNKNOWN').quantity,null);assert.equal(componentSummary('BH-001').quantity,3);
});
test('Profile and history read the same authored case/events; no demo badge text in case content',()=>{
 for(const c of readWarrantyCases()){const profile=caseDetails(c.id),history=businessRows('warranty').find(r=>r.id===c.id);assert.equal(profile.customer,c.customer);assert.deepEqual(profile.events,history.events);assert.doesNotMatch([c.id,c.customer,c.note,c.fault,c.accessories,...c.events.map(e=>e.description)].join(' '),/demo|fixture|dữ liệu mẫu/i);}
 assert.ok(Object.isFrozen(WARRANTY_SEED));assert.ok(Object.isFrozen(WARRANTY_LEDGER));
});
