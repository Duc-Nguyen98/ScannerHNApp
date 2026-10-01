import test from 'node:test';
import assert from 'node:assert/strict';
import {initialFilters,selectRecords,readRange} from '../docs/flows/history/history-model.mjs';

test('History search folds uppercase Đ consistently in queries and source data',()=>{
 const source=[{id:'LS-SEARCH',activityId:'ACT-SEARCH',type:'inbound',day:'2026-09-09',actor:'ĐẶNG ĐỨC',documentId:'PN-01',status:'waiting'}];
 for(const q of ['dang duc','ĐẶNG ĐỨC','đặng đức']){
  const f={...initialFilters(),q};
  assert.equal(selectRecords(f,source).length,1);
  assert.equal(readRange(f,{source}).total,1);
 }
 assert.equal(selectRecords({...initialFilters(),q:'không khớp'},source).length,0);
});
