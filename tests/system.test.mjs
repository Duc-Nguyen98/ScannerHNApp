import test from 'node:test';
import assert from 'node:assert/strict';
import {classifySystemError,createReadRetry,createDeviceAccess,deviceError} from '../docs/flows/system/model.mjs';
import {createAuthFlow} from '../docs/flows/auth-session/auth-flow.mjs';
import {createFixtureAdapter} from '../docs/flows/auth-session/fixture-adapter.mjs';
import {createInboundFlow} from '../docs/flows/inbound/inbound-flow.mjs';
import {createInboundFixtureAdapter} from '../docs/flows/inbound/fixture-adapter.mjs';
import {resolveNavigation} from '../docs/flows/home/home-flow.mjs';

test('HTTP auth/forbidden never map to network; unclassified errors remain with caller',()=>{
 for(const [error,expected] of [[{status:401},'expired'],[{status:403},'forbidden'],[{kind:'network'},'connection'],[{kind:'unknown'},'connection'],[{kind:'device'},'device'],[{status:500},null],[new TypeError('bug'),null],[{kind:'validation'},null]])assert.equal(classifySystemError(error),expected);
});
test('Read retry fails closed without read source',async()=>{assert.deepEqual(await createReadRetry({}).run(),{kind:'unavailable'});});
test('Read retry deduplicates and invalidates late callbacks on caller exit',async()=>{
 let finish,calls=0;const retry=createReadRetry({read:()=>{calls++;return new Promise(r=>finish=r)}});
 const first=retry.run();assert.deepEqual(await retry.run(),{kind:'ignored'});retry.cancel();finish({kind:'verified'});assert.deepEqual(await first,{kind:'ignored'});assert.equal(calls,1);
});
test('Retry preserves 401/403 classification and never calls a mutation',async()=>{
 for(const [status,panel]of [[401,'expired'],[403,'forbidden'],[500,null]]){const retry=createReadRetry({read:async()=>{throw {status}}});assert.deepEqual(await retry.run(),{kind:'failed',panel});}
});
test('Device detection never infers support from model name or fixture; no permission prompt on mount',()=>{
 let calls=0;const access=createDeviceAccess({isSecureContext:true,navigator:{userAgent:'NFC camera',mediaDevices:{getUserMedia(){calls++}}}});
 assert.equal(calls,0);assert.deepEqual(access.snapshot(),{camera:'not-requested',nfc:'unsupported',pending:false});
 assert.equal(createDeviceAccess({isSecureContext:false,NDEFReader:class{},navigator:{mediaDevices:{getUserMedia(){}}}}).snapshot().camera,'unsupported');
 assert.equal(createDeviceAccess({isSecureContext:true,NDEFReader:class{}}).snapshot().nfc,'not-requested');
});
test('Camera denied/hardware/unsupported are distinct and recoverable',async()=>{
 for(const [name,state]of [['NotAllowedError','denied'],['NotReadableError','hardware-error'],['NotFoundError','hardware-error'],['NotSupportedError','unsupported']]){
  const device=createDeviceAccess({isSecureContext:true,navigator:{mediaDevices:{getUserMedia:async()=>{throw {name}}}}});assert.equal(await device.requestCamera(),state);assert.equal(device.snapshot().pending,false);
 }
 assert.equal(deviceError({name:'SecurityError'}),'denied');
});
test('NFC actual caller errors distinguish denial/hardware; fixture cannot claim capability or readiness',()=>{
 const device=createDeviceAccess({isSecureContext:true,NDEFReader:class{}});
 device.reportFailure('nfc',{name:'NotAllowedError'},{fixture:true});assert.equal(device.snapshot().nfc,'not-requested');
 device.reportFailure('nfc',{name:'NotAllowedError'});assert.equal(device.snapshot().nfc,'denied');
 device.reportFailure('nfc',{name:'NotReadableError'});assert.equal(device.snapshot().nfc,'hardware-error');
 device.reportFailure('nfc',{name:'NotSupportedError'});assert.equal(device.snapshot().nfc,'unsupported');
});
test('Camera grant requires live track evidence and closes stream; duplicate prompts blocked',async()=>{
 let done,calls=0,stopped=0;const track={readyState:'live',stop(){stopped++}};
 const device=createDeviceAccess({isSecureContext:true,navigator:{mediaDevices:{getUserMedia:()=>{calls++;return new Promise(r=>done=r)}}}});
 const first=device.requestCamera();await device.requestCamera();assert.equal(calls,1);done({getVideoTracks:()=>[track],getTracks:()=>[track]});assert.equal(await first,'granted');assert.equal(stopped,1);
});
test('A01 UNKNOWN owner preserves request and allows only check until result verified',async()=>{
 const auth={previewReady:true,session:{actor:{id:'a'},warehouse:{id:'w',active:true},permissions:{warehouseOperations:true}}};
 const adapter=createInboundFixtureAdapter({delay:0});adapter.setOutcome('timeout-recorded');const flow=createInboundFlow({adapter,getState:()=>auth});flow.start();flow.next();flow.fixtureBatch();flow.next();await flow.send();const before=flow.snapshot();assert.equal(before.unknown,true);await flow.send();assert.equal(adapter.metrics().recordCalls,1);
 const retry=createReadRetry({read:async()=>{await flow.check();return {kind:flow.snapshot().recorded?'verified':'unknown'}}});assert.equal((await retry.run()).kind,'verified');assert.deepEqual(flow.snapshot().request,before.request);assert.equal(adapter.metrics().recordCalls,1);assert.equal(adapter.metrics().inventoryDelta,0);
});
test('A02 active owner and direct protected route blocked after session expiration; late response cannot claim success',async()=>{
 const auth=createAuthFlow(createFixtureAdapter({delay:0}));await auth.login({username:'minhanh',password:'preview'});await auth.start();
 let finish,records=0;const adapter={...createInboundFixtureAdapter({delay:0}),record:request=>{records++;return new Promise(r=>finish=()=>r({kind:'recorded',request}))}};
 const flow=createInboundFlow({adapter,getState:auth.snapshot,timeoutMs:1000});flow.start();flow.next();flow.fixtureBatch();flow.next();const sending=flow.send(),request=flow.snapshot().request;auth.expire();assert.equal(auth.snapshot().session,null);assert.equal(auth.snapshot().screen,'expired');assert.equal(resolveNavigation('inbound',null,auth.snapshot()).kind,'blocked');finish();await sending;assert.equal(flow.snapshot().unknown,true);assert.equal(flow.snapshot().recorded,false);assert.deepEqual(flow.snapshot().request,request);await flow.send();assert.equal(records,1);assert.equal(auth.enforceSession(),false);
 auth.logout();await auth.login({username:'minhanh',password:'preview'});assert.equal(auth.snapshot().previewReady,false);await auth.start();assert.equal(auth.snapshot().previewReady,true);await flow.send();assert.equal(records,1); // Still UNKNOWN after auth, no replay.
});
test('A03 permission loss blocks direct owner mutation as well as route',async()=>{
 const auth={previewReady:true,session:{actor:{id:'a'},warehouse:{id:'w',active:true},permissions:{warehouseOperations:true}}};const adapter=createInboundFixtureAdapter({delay:0}),flow=createInboundFlow({adapter,getState:()=>auth});flow.start();flow.next();flow.fixtureBatch();flow.next();auth.session.permissions.warehouseOperations=false;await flow.send();assert.equal(adapter.metrics().recordCalls,0);assert.equal(resolveNavigation('inbound',null,auth).kind,'blocked');assert.equal(flow.snapshot().accepted.length,11);
});
