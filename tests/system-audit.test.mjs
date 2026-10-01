import test from 'node:test';
import assert from 'node:assert/strict';
import {createReadRetry,createDeviceAccess} from '../docs/flows/system/model.mjs';
test('Fulfilled 401/403 responses still activate auth/permission boundary',async()=>{
 for(const [result,panel]of [[{status:401},'expired'],[{status:403},'forbidden'],[{kind:'expired'},'expired'],[{kind:'forbidden'},'forbidden']])assert.deepEqual(await createReadRetry({read:async()=>result}).run(),{kind:'failed',panel});
});
test('Camera validation failure and one broken stop cannot leak remaining tracks',async()=>{
 let stopped=0;const d=createDeviceAccess({isSecureContext:true,navigator:{mediaDevices:{getUserMedia:async()=>({getVideoTracks(){throw new Error('validation')},getTracks(){return [{stop(){throw new Error('stop')}},{stop(){stopped++}}]}})}}});
 assert.equal(await d.requestCamera(),'hardware-error');assert.equal(stopped,1);assert.equal(d.snapshot().pending,false);
});
