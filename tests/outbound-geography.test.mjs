import test from 'node:test';
import assert from 'node:assert/strict';
import {createGeographyClient,GEOGRAPHY_VERSION} from '../docs/flows/outbound/geography.mjs';
import {createOutboundFlow} from '../docs/flows/outbound/outbound-flow.mjs';
import {createOutboundFixtureAdapter} from '../docs/flows/outbound/fixture-adapter.mjs';
import {fixtureGeography,chooseFixtureAddress} from './fixtures/outbound-geography.mjs';
const auth={previewReady:true,session:{actor:{id:'a'},warehouse:{id:'w',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}};
const setup=geography=>{const adapter=createOutboundFixtureAdapter({delay:0}),flow=createOutboundFlow({adapter,geography,getState:()=>auth});flow.start();return{flow,adapter};};
test('geography gates all three steps and verifies district parent; changes clear dependent fields only',()=>{
 const {flow}=setup(fixtureGeography());assert.equal(flow.field('address','bypass'),false);assert.equal(flow.select('district','760'),false);assert.equal(flow.next(),false);
 assert.equal(flow.select('province','79'),true);assert.equal(flow.field('address','bypass'),false);assert.equal(flow.select('district','1'),false);assert.equal(flow.select('district','760'),true);flow.field('address','12 A');assert.equal(flow.next(),true);flow.scan('HN12345');flow.back();const id=flow.snapshot().document.documentId;
 flow.select('province','1');assert.equal(flow.snapshot().document.districtId,null);assert.equal(flow.snapshot().document.address,'');assert.equal(flow.snapshot().accepted.length,1);assert.equal(flow.snapshot().document.documentId,id);assert.equal(flow.next(),false);flow.select('district','1');flow.field('address','14 B');assert.equal(flow.next(),true);
});
test('geography is preserved in frozen request through UNKNOWN and cannot be edited',async()=>{
 const {flow,adapter}=setup(fixtureGeography());chooseFixtureAddress(flow);flow.next();flow.scan('HN12345');flow.next();adapter.setOutcome('unknown');await flow.send();const request=flow.snapshot().request;
 assert.equal(request.document.geographyVersion,GEOGRAPHY_VERSION);assert.equal(request.document.provinceId,'79');assert.equal(request.document.districtId,'760');assert.equal(flow.select('province','1'),false);assert.equal(flow.field('address','changed'),false);assert.deepEqual(flow.snapshot().request,request);
});
test('late districts do not overwrite a new province, changed source, or disposed flow',async()=>{
 const base=fixtureGeography(),resolvers={};const geo={...base,cachedDistricts:()=>[],districts:id=>new Promise(resolve=>resolvers[id]=resolve)};
 const {flow}=setup(geo);flow.select('province','79');flow.select('province','1');resolvers['1'](base.cachedDistricts('1'));await new Promise(r=>setTimeout(r,0));resolvers['79'](base.cachedDistricts('79'));await new Promise(r=>setTimeout(r,0));assert.deepEqual(flow.snapshot().geography.districts,base.cachedDistricts('1'));
 flow.select('province','79');flow.select('source','demo-0006');resolvers['79'](base.cachedDistricts('79'));await new Promise(r=>setTimeout(r,0));assert.equal(flow.snapshot().document.provinceId,null);assert.deepEqual(flow.snapshot().geography.districts,[]);
 flow.select('province','79');flow.dispose();const before=flow.snapshot();resolvers['79'](base.cachedDistricts('79'));await new Promise(r=>setTimeout(r,0));assert.deepEqual(flow.snapshot(),before);
});
test('client uses v1 bounded reads, coalesces/cache reads, omits credentials and rejects incorrect parent',async()=>{
 const calls=[];const client=createGeographyClient({fetcher:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/v1/')?[{code:79,name:'HCM'}]:{code:79,districts:[{code:760,name:'Q1',province_code:79}]}};}});
 await Promise.all([client.provinces(),client.provinces()]);await client.provinces();await client.districts('79');await client.districts('79');assert.equal(calls.length,2);assert.match(calls[1].url,/p\/79\?depth=2$/);assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.referrerPolicy,'no-referrer');await assert.rejects(client.districts('123'));
 const bad=createGeographyClient({fetcher:async url=>({ok:true,json:async()=>url.endsWith('/v1/')?[{code:79,name:'HCM'}]:{code:79,districts:[{code:1,name:'Wrong',province_code:1}]}})});await bad.provinces();await assert.rejects(bad.districts('79'));assert.deepEqual(bad.cachedDistricts('79'),[]);
});
test('client timeout/error can retry and failed data is never cached',async()=>{
 let fail=true;const client=createGeographyClient({timeoutMs:5,fetcher:async(_,o)=>fail?new Promise((_,reject)=>o.signal.addEventListener('abort',()=>reject(Error('timeout')))):{ok:true,json:async()=>[{code:79,name:'HCM'}]}});
 await assert.rejects(client.provinces());assert.deepEqual(client.cachedProvinces(),[]);fail=false;assert.equal((await client.provinces()).length,1);
});
