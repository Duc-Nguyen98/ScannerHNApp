import test from 'node:test';
import assert from 'node:assert/strict';
import {recentDocuments,HOME_RECENT_LIMIT} from '../docs/flows/home/recent-documents.mjs';
import {mergeDocuments,initialFilters,selectDocuments,STATUSES} from '../docs/flows/documents/document-model.mjs';
import {readHomeFixture} from '../docs/flows/home/fixture-adapter.mjs';
const state={previewReady:true,session:{actor:{id:'fixture-minhanh'},warehouse:{id:'fixture-hoa-nam',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}};
test('Home shows at most three newest actual P12 IDs/statuses, using the same order as View all',()=>{
 const rows=mergeDocuments([]),before=structuredClone(rows),recent=recentDocuments(rows);
 assert.equal(HOME_RECENT_LIMIT,3);assert.deepEqual(recent.map(r=>r.id),selectDocuments(initialFilters(),rows).slice(0,3).map(r=>r.id));
 for(const row of recent){const source=rows.find(r=>r.id===row.id);assert.equal(row.number,source.number);assert.equal(row.label,STATUSES[source.status]);assert.equal(row.datetime,`${source.day}T${source.time}:00+07:00`);}
 assert.deepEqual(rows,before);
});
test('Calendar order spans months/years and equal timestamps use stable IDs',()=>{
 const base=mergeDocuments([])[0],row=(id,day,time)=>({...base,id,number:id,day,time});
 const rows=[row('old','2026-12-31','23:59'),row('b','2027-01-01','00:00'),row('a','2027-01-01','00:00'),row('new','2027-01-01','00:01')];
 assert.deepEqual(recentDocuments(rows).map(r=>r.id),['new','b','a']);
 assert.deepEqual(recentDocuments(rows.slice().reverse()).map(r=>r.id),['new','b','a']);
});
test('Less than three/empty/missing dates never produce fake rows or render-time timestamps',()=>{
 const base=mergeDocuments([])[0];assert.deepEqual(recentDocuments([]),[]);assert.equal(recentDocuments([base]).length,1);
 assert.equal(recentDocuments([base,base]).length,1);
 for(const row of [{...base,day:''},{...base,day:'2026-02-31'},{...base,time:'25:30'},{...base,id:''}])assert.equal(recentDocuments([row]).length,0);
 assert.equal(readHomeFixture(state,{unknown:true}).recent,null);
});
test('New confirmed receipt appears on Home once, while another warehouse stays outside scope',()=>{
 const base=mergeDocuments([])[0],record={...base,id:'new-confirmed',number:'PN-NEW',day:'2026-09-29',time:'08:16',status:'waiting'};
 const recent=readHomeFixture(state,{recorded:[record,record]}).recent;
 assert.equal(recent.length,3);assert.equal(recent[0].id,record.id);assert.equal(recent.filter(r=>r.id===record.id).length,1);
 assert.ok(!readHomeFixture(state,{recorded:[{...record,warehouseId:'another'}]}).recent.some(r=>r.id===record.id));
});
