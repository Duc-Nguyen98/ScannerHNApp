import test from 'node:test';
import assert from 'node:assert/strict';
import {createLazyHome} from '../docs/flows/auth-session/lazy-home.mjs';
import {confirmationGuidance} from '../docs/flows/auth-session/experience.mjs';
import {createAuthFlow} from '../docs/flows/auth-session/auth-flow.mjs';
import {createFixtureAdapter} from '../docs/flows/auth-session/fixture-adapter.mjs';
import {readFileSync} from 'node:fs';
const home={mountHome(){}};
const state={session:{warehouse:{active:true},permissions:{warehouseOperations:true}}};
test('lazy Home is not fetched before load; duplicate calls share one import',async()=>{
  let calls=0,finish;
  const loader=createLazyHome(()=>{calls++;return new Promise(r=>finish=r);});
  assert.equal(calls,0);assert.equal(loader.snapshot().status,'idle');
  const a=loader.load(),b=loader.load();assert.equal(a,b);
  await Promise.resolve();assert.equal(calls,1);finish(home);await a;
  assert.equal(loader.snapshot().status,'ready');await loader.load();assert.equal(calls,1);
});
test('failed import has explicit retry; no automatic retry loop',async()=>{
  const attempts=[];const loader=createLazyHome(n=>{attempts.push(n);if(n===1)throw Error('offline');return home;});
  await loader.load();assert.equal(loader.snapshot().status,'error');assert.deepEqual(attempts,[1]);
  await loader.load();assert.equal(loader.snapshot().status,'ready');assert.deepEqual(attempts,[1,2]);
});
test('logout/reset invalidates a late successful module result',async()=>{
  let finish,changes=0;const loader=createLazyHome(()=>new Promise(r=>finish=r),()=>changes++);
  const p=loader.load();await Promise.resolve();loader.reset();finish(home);await p;
  assert.equal(loader.snapshot().status,'idle');assert.equal(loader.snapshot().module,null);assert.equal(changes,1);
});
test('older failure cannot overwrite a new session loading successfully',async()=>{
  let fail;const loader=createLazyHome(n=>n===1?new Promise((r,j)=>fail=j):home);
  const p=loader.load();await Promise.resolve();loader.reset();await loader.load();fail(Error('late'));await p;
  assert.equal(loader.snapshot().status,'ready');
});
test('cached module can be reused, but does not retain an authenticated session',async()=>{
  const loader=createLazyHome(()=>home);await loader.load();loader.reset();
  assert.deepEqual(loader.snapshot(),{status:'ready',module:home});
});
test('invalid module export is a recoverable UI loading failure',async()=>{
  const loader=createLazyHome(()=>({}));await loader.load();assert.equal(loader.snapshot().status,'error');
});
test('Home retry preserves the verified receipt and calls start only once',async()=>{
  const adapter=createFixtureAdapter({delay:0});let starts=0;const start=adapter.startShift;
  adapter.startShift=(s)=>{starts++;return start(s);};
  const flow=createAuthFlow(adapter);await flow.login({username:'minhanh',password:'preview'});await flow.start();
  const before=flow.snapshot();const loader=createLazyHome(n=>{if(n===1)throw Error();return home;});
  await loader.load();await loader.load();assert.equal(starts,1);assert.deepEqual(flow.snapshot(),before);
});
test('guidance distinguishes stopped, unknown, denied and unverified permission',()=>{
  assert.match(confirmationGuidance(state),/^Thao tác theo quyền/);
  for(const active of [false,undefined,'false']) {
    const s={...state,session:{...state.session,warehouse:{active}}};
    assert.match(confirmationGuidance(s),active===false?/ngừng hoạt động/:/Chưa xác minh trạng thái kho/);
  }
  for(const permission of [false,undefined,1]) {
    const s={...state,session:{...state.session,permissions:{warehouseOperations:permission}}};
    assert.match(confirmationGuidance(s),permission===false?/chưa có quyền/:/Chưa xác minh quyền/);
  }
});
test('UNKNOWN never invites starting again, loading failures only retry UI',()=>{
  assert.match(confirmationGuidance({...state,startUnknown:true}),/đối chiếu trước khi thử lại/);
  assert.match(confirmationGuidance({...state,previewReady:true},'error'),/không gửi lại yêu cầu bắt đầu ca/);
  assert.match(confirmationGuidance({...state,previewReady:true},'ready'),/Chọn Mở Trang chủ/);
});
test('login hints and current shared navigation contracts remain present',()=>{
  const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
  const app=read('../docs/flows/auth-session/app.mjs'),experience=read('../docs/flows/auth-session/experience.mjs');
  assert.doesNotMatch(app,/import\s*\{\s*mountHome\s*\}\s*from/);
  assert.match(app,/enterkeyhint="next"/);assert.match(app,/enterkeyhint="go"/);
  assert.match(experience,/event\.isComposing/);assert.match(experience,/setSelectionRange/);
  assert.doesNotMatch(experience,/localStorage|sessionStorage|\.trim\(/);
  const home=read('../docs/flows/home/home.mjs');
  assert.match(home,/scrollTop=homeContentScroll/);assert.match(home,/returnFocus\?\.focus/);
});
