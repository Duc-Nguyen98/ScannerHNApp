import test from 'node:test';
import assert from 'node:assert/strict';
import {readHomeFixture} from '../docs/flows/home/fixture-adapter.mjs';
import {mergeDocuments,selectDocuments,initialFilters} from '../docs/flows/documents/document-model.mjs';
import {readWarrantyCases,writeWarrantyCase,resetWarrantyCases,isOpenWarrantyCase} from '../docs/flows/shared/warranty-cases.mjs';
const state={previewReady:true,session:{actor:{id:'fixture-minhanh'},warehouse:{id:'fixture-hoa-nam',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}};
test('KPI count uses the same complete fixture source/status selection as destination lists',()=>{
 const data=readHomeFixture(state);
 const waiting=selectDocuments({...initialFilters(),status:'waiting'},mergeDocuments([]));
 assert.equal(data.pendingDocuments,waiting.length);assert.equal(waiting.length,5);
 assert.ok(waiting.every(r=>r.status==='waiting'&&['inbound','outbound'].includes(r.type)));
 assert.equal(data.openWarranties,readWarrantyCases().filter(isOpenWarrantyCase).length);assert.equal(data.openWarranties,4);
});
test('Open grouping excludes returned/unknown statuses and follows case updates',()=>{
 try{
  const row=readWarrantyCases().find(r=>r.id==='BH-001');writeWarrantyCase({...row,status:'Đã trả khách'});
  assert.equal(readHomeFixture(state).openWarranties,3);
  writeWarrantyCase({...row,status:'Unverified'});assert.equal(readHomeFixture(state).openWarranties,3);
  writeWarrantyCase({...row,status:'Chờ bàn giao'});assert.equal(readHomeFixture(state).openWarranties,4);
 }finally{resetWarrantyCases();}
});
test('Confirmed local records are deduplicated and unknown KPI source never falls back to a fake count',()=>{
 const original=mergeDocuments([]).find(r=>r.status==='waiting');
 const posted={...original,status:'posted'};
 assert.equal(readHomeFixture(state,{recorded:[posted,posted]}).pendingDocuments,4);
 const fresh={...original,id:'test-new-receipt',number:'PN-test'};
 assert.equal(readHomeFixture(state,{recorded:[fresh,fresh]}).pendingDocuments,6);
 assert.equal(readHomeFixture(state,{recorded:[{...fresh,warehouseId:'different'}]}).pendingDocuments,5);
 const unknown=readHomeFixture(state,{unknown:true});assert.equal(unknown.pendingDocuments,null);assert.equal(unknown.openWarranties,null);
 assert.equal(readHomeFixture({...state,previewReady:false}),null);
});
