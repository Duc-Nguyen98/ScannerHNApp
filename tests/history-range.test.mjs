import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA,initialFilters,readRange,selectRecords} from '../docs/flows/history/history-model.mjs';
test('All history filters start unbounded, including documents; aggregate covers48 unique activities',()=>{
 for(const scope of ['all','documents']){const f=initialFilters(scope);assert.equal(f.from,'');assert.equal(f.to,'');}
 const all=readRange(initialFilters());assert.equal(all.total,48);assert.deepEqual(all.groups,{inbound:19,outbound:10,warranty:6,nfc:5,documents:8});
});
test('Range aggregate includes both endpoints and carries query/status into exact drilldown',()=>{
 const f={...initialFilters(),from:'2026-09-08',to:'2026-09-09'};
 assert.equal(readRange(f).total,38);assert.deepEqual(readRange(f).groups,{inbound:15,outbound:8,warranty:5,nfc:4,documents:6});
 assert.equal(readRange({...f,status:'waiting'}).total,23);
 assert.equal(readRange({...f,q:'HN12345'}).total,2);
 for(const type of Object.keys(DATA.names))assert.equal(readRange(f).groups[type],selectRecords({...f,type}).length);
 assert.equal(readRange({...f,to:f.from}).total,8);
 assert.equal(readRange(f,{source:[...DATA.records,DATA.records[0]]}).total,38);
});
test('Unavailable and unmatched results remain distinct; all-days keeps older dates accessible',()=>{
 assert.equal(readRange(initialFilters(),{available:false}).total,null);
 assert.equal(readRange({...initialFilters(),from:'2026-09-20',to:'2026-09-21'}).total,null);
 assert.equal(readRange({...initialFilters(),q:'not-found'}).total,0);
 assert.equal(readRange(initialFilters(),{source:[]}).total,0);
});
