import test from 'node:test';
import assert from 'node:assert/strict';
import {createNfcFixtureAdapter} from '../docs/flows/nfc/fixture-adapter.mjs';
import {createNfcFlow} from '../docs/flows/nfc/nfc-flow.mjs';
function setup(options={}){
 const current={previewReady:true,session:{actor:{id:'fixture-minhanh',name:'Minh Anh'},warehouse:{id:'fixture-hoa-nam',active:true},permissions:{warehouseOperations:true}}};
 const adapter=createNfcFixtureAdapter({delay:0,extended:true,...options}),flow=createNfcFlow({adapter,getState:()=>current});
 return {current,adapter,flow};
}
test('Enter intent opens only one complete verified match; no hardware read or mutation',()=>{
 const {flow,adapter}=setup();flow.search('NFC-3F7D9A');const before=flow.snapshot();
 assert.deepEqual(flow.searchIntent(),{action:'open',id:'fixture-tag-002'});assert.deepEqual(flow.snapshot(),before);assert.deepEqual(adapter.stats(),{reads:0,mutations:0});
});
test('Multiple matches focus the first filtered row; zero/empty/whitespace do nothing',()=>{
 const {flow}=setup();flow.search('NFC-OLD');assert.ok(flow.list().items.length>1);assert.deepEqual(flow.searchIntent(),{action:'focus',id:flow.list().items[0].id});
 for(const query of ['not-found','','   ']){flow.search(query);assert.equal(flow.searchIntent(),null,JSON.stringify(query));}
});
test('One loaded result in a partial source does not auto-open',()=>{
 const {flow}=setup({extended:false});flow.search('NFC-3F7D9A');assert.equal(flow.list().items.length,1);assert.deepEqual(flow.searchIntent(),{action:'focus',id:'fixture-tag-002'});
});
test('Failed/stale/unknown/malformed sources cannot produce automatic navigation',()=>{
 const {flow,adapter}=setup();flow.search('NFC-3F7D9A');const ready=flow.list();
 for(const result of [{...ready,status:'error'},{...ready,status:'unknown'},{...ready,status:undefined},{...ready,error:true},{...ready,stale:true},{...ready,items:null},{...ready,items:[{id:''}]},null]){
  adapter.list=()=>result;assert.equal(flow.searchIntent(),null);
 }
 adapter.list=()=>{throw Error('unavailable');};assert.equal(flow.searchIntent(),null);
});
test('Read-only warehouse/capability can inspect rows; wrong scope/session cannot',()=>{
 const {flow,adapter,current}=setup({scenario:'link-denied'});current.session.warehouse.active=false;flow.search('NFC-3F7D9A');assert.equal(flow.searchIntent()?.action,'open');
 assert.deepEqual(adapter.stats(),{reads:0,mutations:0});current.session.warehouse.id='other';assert.equal(flow.searchIntent(),null);current.session=null;assert.equal(flow.searchIntent(),null);
});
test('Search navigation cannot operate outside list or after disposal',()=>{
 const {flow}=setup();flow.search('NFC-3F7D9A');flow.begin();assert.equal(flow.searchIntent(),null);flow.panel(1);assert.equal(flow.searchIntent()?.action,'open');flow.dispose();assert.equal(flow.searchIntent(),null);
});
