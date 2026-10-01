import test from 'node:test';
import assert from 'node:assert/strict';
import {BUSINESS_DATA,BUSINESS_CONFIG,businessRows,selectBusiness} from '../docs/flows/history/business-history-data.mjs';
import {scanCounts,readSession} from '../docs/flows/history/history-model.mjs';
import {validQueryDate} from '../docs/flows/shared/query-date-policy.mjs';
const filter={q:'',type:'all',status:'all',from:'',to:'',sort:'source'};
test('Business sample extension has unique IDs, complete calendar dates, known statuses and immutable data',()=>{
 for(const kind of Object.keys(BUSINESS_CONFIG)){
  const rows=businessRows(kind);assert.ok(rows.length>=8);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
  for(const row of rows){assert.ok(validQueryDate(row.day));assert.ok(row.actor);assert.ok(row.warehouse);assert.ok(BUSINESS_CONFIG[kind].statuses[row.status]);}
 }
 assert.ok(Object.isFrozen(BUSINESS_DATA));assert.equal(BUSINESS_DATA.sessions.find(s=>s.id==='PQ-0001'),readSession('PQ-0001'));
});
test('Every session reconciles code counts, duplicates and quantity with its data',()=>{
 for(const s of BUSINESS_DATA.sessions){const c=scanCounts(s);assert.equal(c.total,s.total,s.id);assert.equal(c.accepted,s.accepted,s.id);assert.equal(c.duplicate,s.duplicate,s.id);assert.equal(c.quantity,s.quantity,s.id);assert.equal(new Set(s.events.map(e=>e.id)).size,s.events.length);for(const e of s.events.filter(e=>e.result==='duplicate'))assert.ok(s.events.some(a=>a.result==='accepted'&&a.code===e.code),s.id);}
});
test('Shared business filtering combines query/type/date/status and stable sort without mutation',()=>{
 assert.equal(selectBusiness('warranty',{...filter,q:'BH-002',status:'returned',from:'2026-09-10',to:'2026-09-10'}).length,1);
 assert.equal(selectBusiness('warranty',{...filter,q:'BH-002',status:'checking'}).length,0);
 assert.equal(selectBusiness('nfc',{...filter,type:'Thu hồi thẻ',status:'success'}).length,0);
 const rows=selectBusiness('sessions',{...filter,status:'exported'});assert.ok(rows.length);assert.ok(rows.every(r=>r.type==='Xuất linh kiện'));
 const a=selectBusiness('nfc',{...filter,sort:'asc'}),z=selectBusiness('nfc',{...filter,sort:'desc'});assert.deepEqual(a.map(r=>r.id),z.map(r=>r.id).reverse());
});
