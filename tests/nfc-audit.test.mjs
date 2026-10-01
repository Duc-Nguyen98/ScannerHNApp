import test from 'node:test';
import assert from 'node:assert/strict';
import {auditScope,normalizeAudit,auditFilters,selectAudit,findAudit,auditDay} from '../docs/flows/history/nfc-audit-model.mjs';
import {readAuditFixture} from '../docs/flows/history/nfc-audit-fixture.mjs';
const scope={actorId:'A',warehouseId:'HN'},state={previewReady:true,session:{actor:{id:'A'},warehouse:{id:'HN'},permissions:{warehouseOperations:true}}};
const sample=()=>readAuditFixture(scope);
test('actor/permission/warehouse/session required',()=>{assert.deepEqual(auditScope(state),scope);for(const bad of [null,{}, {...state,startUnknown:true},{...state,previewReady:false},{...state,session:{...state.session,permissions:{}}},{...state,session:{...state.session,warehouse:{}}}])assert.equal(auditScope(bad),null);});
test('source absent is unavailable, not empty',()=>{for(const r of [null,{},[],{items:[]},{available:true,items:[]}])assert.equal(normalizeAudit(r,scope).kind,'unavailable');});
test('confirmed empty is distinct',()=>assert.deepEqual(normalizeAudit(readAuditFixture(scope,'empty'),scope),{kind:'ready',items:[],complete:true}));
test('default missing source fixture remains unavailable',()=>assert.equal(normalizeAudit(readAuditFixture(scope,'unavailable'),scope).kind,'unavailable'));
test('current tags and unconfirmed read/prepare never become events',()=>{for(const patch of [{confirmed:false},{type:'READ_UID'},{type:'PREPARED'},{status:'ACTIVE'},{warehouseId:'OTHER'},{id:null}]){const r=sample();r.items[0]={...r.items[0],...patch};assert.equal(normalizeAudit(r,scope).kind,'unavailable');}});
test('dedup immutable event ID',()=>{const r=sample();r.items.push({...r.items[0]});assert.equal(normalizeAudit(r,scope).items.length,4);});
test('unknown ID never falls back',()=>assert.equal(findAudit(sample().items,'missing'),null));
test('field ownership stays per event',()=>{const a=findAudit(sample().items,'NFC-E002');assert.equal(a.product,'Máy quét mã HS-200');assert.equal(a.actor,'Lan Nguyễn');assert.equal(a.previousUid,'NFC-OLD-7B10');assert.ok(a.reason);});
test('type and UID serial search compose without modifying originals',()=>{const r=sample().items,f={...auditFilters(),type:'Thay thẻ',q:'HN12346'};assert.deepEqual(selectAudit(r,f).map(x=>x.id),['NFC-E002']);assert.equal(r.length,4);assert.equal(selectAudit(r,{...f,q:'NFC-OLD'}).length,1);});
test('date and status filters read only',()=>{assert.equal(selectAudit(sample().items,{...auditFilters(),from:'2026-09-10',to:'2026-09-10'}).length,3);assert.equal(selectAudit(sample().items,{...auditFilters(),status:'Đã thu hồi'}).length,1);});
test('invalid dates do not claim valid timeline',()=>{assert.equal(auditDay({day:'2026-02-31',time:'12:30'}),null);assert.equal(auditDay({day:'2026-09-10',time:'25:00'}),null);});
test('complete only explicit source confirmation',()=>{const r=sample();delete r.complete;assert.equal(normalizeAudit(r,scope).complete,false);});
test('fixture long values intact',()=>{const r=readAuditFixture(scope,'long');assert.ok(r.items[0].description.length>2000);assert.match(r.items[0].description,/<>&/);});
for(const bad of [{unexpected:true},42,false,['UID'],'   '])test('invalid optional value is unknown: '+JSON.stringify(bad),()=>{
 const r=sample();r.items[0]={...r.items[0],uid:bad,serial:bad,actor:bad,description:bad};const normalized=normalizeAudit(r,scope);
 assert.equal(normalized.kind,'ready');for(const key of ['uid','serial','actor','description'])assert.equal(normalized.items[0][key],null);
 assert.equal(r.items[0].uid,bad);assert.equal(selectAudit(normalized.items,auditFilters()).length,4);
});
test('normalization preserves valid raw Unicode and whitespace without mutating source',()=>{
 const r=sample(),text='  NFC <>& 🌸\nDòng hai  ';r.items[0].uid=text;assert.equal(normalizeAudit(r,scope).items[0].uid,text);assert.equal(r.items[0].uid,text);
});
test('malformed date/time types cannot claim a timestamp or throw',()=>{
 for(const e of [null,{}, {day:['2026-09-10'],time:'11:20'},{day:'2026-09-10',time:['11:20']},{day:20260910,time:1120}])assert.equal(auditDay(e),null);
});
