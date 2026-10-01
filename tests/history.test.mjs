import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA,initialFilters,selectRecords,readDay,readRecord,readSession,scanCounts} from '../docs/flows/history/history-model.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('P08.r02 documents entry/clear retains inbound-outbound scope over shared source',()=>{
 const f={...initialFilters('documents'),from:'',to:''};
 const rows=selectRecords(f);assert.equal(rows.length,29);
 assert.ok(rows.every(r=>['inbound','outbound'].includes(r.type)));
 assert.equal(selectRecords({...f,type:'nfc'}).length,0);
 assert.equal(selectRecords({...f,q:'no-match'}).length,0);
 assert.equal(selectRecords({...initialFilters('all'),from:'',to:''}).length,48);
 assert.equal(initialFilters('unrecognized').scope,'all');
});
test('P08.r02 missing session identity stays missing; baseline/fixtures retained',()=>{
 for(const id of ['PQ-0002','PQ-0003']){const s=readSession(id);assert.equal(s.actor,undefined);assert.equal(s.warehouse,undefined);}
 const files={
  '../handoff/P08/baseline/B08.png':'78aa9384caf3f2ed600ead4f1c8518a8c254fccaadc96d1e5c8483d5f4c67aa2',
  '../docs/flows/shared/history-fixtures.js':'cdc2ec4b43ff6e36dd6b7cf4320994ac26c08826e2cf4c50d0f2bb842ca3d3b5'
  // P01–P10 dialog synchronization explicitly authorizes P07 source changes.
  // P07 behavior/artwork is verified in its own suite, not a frozen cross-module hash.
 };
 for(const [path,expected]of Object.entries(files))assert.equal(createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex'),expected,path);
});
test('P08.A01 combined query/date/status retains operation scope',()=>{
 const f={...initialFilters(),type:'inbound',q:'Minh Anh',from:'2026-09-09',status:'waiting'};
 const rows=selectRecords(f);assert.equal(rows.length,12);assert.ok(rows.every(r=>r.type==='inbound'));
 assert.equal(selectRecords({...f,q:'HN12345'})[0].id,'LS-0001');assert.equal(selectRecords({...f,q:'PX-0005'}).length,0);
 assert.equal(selectRecords({...f,q:'minh anh'}).length,12);assert.equal(f.type,'inbound');
});
test('P08.A02 exact immutable record/document/event identity; no Post tick',()=>{
 const r=readRecord('LS-0001');assert.equal(r.documentId,'PN-0005');assert.equal(r.status,'waiting');assert.equal(r.events.length,4);
 assert.equal(r.events.at(-1).label,'Gửi phiếu lên Web');assert.ok(r.events.every(e=>!e.label.includes('ghi sổ')));assert.equal(readRecord('bad'),null);
 assert.throws(()=>{r.documentId='bad';});
});
test('P08.A03 19=18+1; duplicate and NFC do not add quantity; event IDs deduplicated',()=>{
 const s=readSession('PQ-0001');assert.deepEqual(scanCounts(s),{total:19,accepted:18,duplicate:1,quantity:17});
 assert.equal(s.events.filter(e=>e.code==='HN12345').length,2);assert.deepEqual(scanCounts({...s,events:[...s.events,s.events[0]]}),scanCounts(s));assert.equal(readSession('bad'),null);
});
test('P08.A04 total 30 from full disjoint fixture, not list page, missing is not zero',()=>{
 assert.equal(DATA.records.length,48);assert.equal(new Set(DATA.records.map(r=>r.activityId)).size,48);
 assert.deepEqual(readDay('2026-09-09').groups,{inbound:12,outbound:6,warranty:4,nfc:3,documents:5});assert.equal(readDay('2026-09-09').total,30);
 assert.equal(readDay('2026-09-08').total,8);assert.equal(readDay('2026-10-01').total,null);assert.equal(readDay('2026-09-09',{available:false}).total,null);
 assert.equal(readDay('2026-09-09',{source:[...DATA.records,DATA.records[0]]}).total,30);
});
test('P08.A05 single shared source with exact event/session links and no auth secrets',()=>{
 const r=readRecord('LS-0004'),event=DATA.nfcEvents.find(e=>e.id===r.nfcEventId);assert.equal(event.day,r.day);assert.equal(event.serial,r.serial);
 const source=readFileSync(new URL('../docs/flows/warranty-components/flow.js',import.meta.url),'utf8');assert.match(source,/const SESSION_EVENTS = globalThis.HN_HISTORY_FIXTURES.sessions/);assert.match(source,/const NFC_EVENTS = globalThis.HN_HISTORY_FIXTURES.nfcEvents/);
 assert.doesNotMatch(JSON.stringify(DATA),/auth_session|access_token|password|POSTED/);
});
test('sort is stable and direction works without mutating source',()=>{
 const before=DATA.records.map(r=>r.id);const a=selectRecords({...initialFilters(),sort:'asc'}),b=selectRecords({...initialFilters(),sort:'desc'});assert.deepEqual(a.map(r=>r.id),b.map(r=>r.id).reverse());assert.deepEqual(DATA.records.map(r=>r.id),before);
});
