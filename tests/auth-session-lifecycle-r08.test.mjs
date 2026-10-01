import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthFlow} from '../docs/flows/auth-session/auth-flow.mjs';
import {createLazyHome} from '../docs/flows/auth-session/lazy-home.mjs';
import {syncShiftClock} from '../docs/flows/home/vietnam-clock.mjs';
import {bindLoginExperience} from '../docs/flows/auth-session/experience.mjs';

for(const field of ['permission','warehouse']) for(const kind of ['unknown','preview-ready']) {
  test(`r08 ${kind} with ${field} changed during start must reconcile before resubmission`,async()=>{
    const session={namespace:'fixture',actor:{id:'a',name:'A',initials:'A',role:'Kho'},warehouse:{id:'w',name:'W',active:true},permissions:{warehouseOperations:true}};
    let finish,calls=0;
    const adapter={authenticate:async()=>({kind:'authenticated',session}),isValid:s=>s===session,logout(){},startShift(){calls++;return new Promise(r=>finish=r);}};
    const flow=createAuthFlow(adapter);await flow.login({});const pending=flow.start();
    if(field==='permission')session.permissions.warehouseOperations=false;else session.warehouse.active=false;
    finish({kind,startedAt:'2026-09-30T00:00:00.000Z'});await pending;
    assert.equal(flow.snapshot().previewReady,false);
    assert.equal(flow.snapshot().startUnknown,true);
    session.permissions.warehouseOperations=true;session.warehouse.active=true;
    void flow.start();assert.equal(calls,1);
  });
}
test('r08 a definitive denied result is not relabelled UNKNOWN by a simultaneous guard change',async()=>{
  const session={namespace:'fixture',actor:{id:'a',name:'A',initials:'A',role:'Kho'},warehouse:{id:'w',name:'W',active:true},permissions:{warehouseOperations:true}};
  const flow=createAuthFlow({authenticate:async()=>({kind:'authenticated',session}),isValid:s=>s===session,logout(){},async startShift(){session.warehouse.active=false;return {kind:'denied'};}});
  await flow.login({});await flow.start();assert.equal(flow.snapshot().startUnknown,false);assert.equal(flow.snapshot().previewReady,false);
});
test('r08 cancelling load before import microtask does not fetch an abandoned module',async()=>{
  let calls=0;const loader=createLazyHome(()=>{calls++;return {mountHome(){}};});
  const pending=loader.load();loader.reset();await pending;
  assert.equal(calls,0);assert.equal(loader.snapshot().status,'idle');
});
test('r08 retained Home clock follows a newly confirmed receipt and clears unavailable value',()=>{
  const node={stamp:'2026-09-29T21:33:35.037Z',textContent:'04:33:35',getAttribute(){return this.stamp;},setAttribute(k,v){this.stamp=v;}};
  syncShiftClock(node,'2026-09-29T21:33:38.223Z');
  assert.equal(node.stamp,'2026-09-29T21:33:38.223Z');assert.equal(node.textContent,'04:33:38');
  for(const value of [null,undefined,'invalid']){syncShiftClock(node,value);assert.equal(node.stamp,'');assert.equal(node.textContent,'—');}
});
test('r08 pointerdown on form button preserves input focus until click',()=>{
  const nodes=Object.fromEntries(['username','password','toggle-password','password-caps'].map(id=>[id,new EventTarget()]));
  const form=new EventTarget();form.querySelector=q=>nodes[q.slice(1)];
  form.closest=()=>({});bindLoginExperience(form);
  const prior=globalThis.document;globalThis.document={activeElement:nodes.password};
  try {const e=new Event('pointerdown',{cancelable:true});form.dispatchEvent(e);assert.equal(e.defaultPrevented,true);
    globalThis.document.activeElement={};const other=new Event('pointerdown',{cancelable:true});form.dispatchEvent(other);assert.equal(other.defaultPrevented,false);
  } finally {if(prior===undefined)delete globalThis.document;else globalThis.document=prior;}
});
