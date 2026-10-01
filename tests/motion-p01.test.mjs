import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotionController,resolveMotionMode} from '../docs/flows/shared/motion/motion-primitives.mjs';
import {createMotionController as harnessController} from '../handoff/motion/M00/harness/motion-primitives.mjs';
import {mountAuthMotion} from '../docs/flows/auth-session/motion.mjs';

class ListenerTarget extends EventTarget {
  listeners=new Map();
  addEventListener(type,fn,options){super.addEventListener(type,fn,options);if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
  removeEventListener(type,fn,options){super.removeEventListener(type,fn,options);this.listeners.get(type)?.delete(fn);}
  get listenerCount(){return [...this.listeners.values()].reduce((n,s)=>n+s.size,0);}
}
function fixture(requested='auto',reduced=false){
  const media=new ListenerTarget();media.matches=reduced;
  const doc=new ListenerTarget();doc.hidden=false;
  const tokens={press:'100ms',feedback:'140ms',route:'180ms','panel-enter':'220ms','panel-exit':'160ms','row-feedback':'160ms','ease-standard':'linear'};
  doc.defaultView={getComputedStyle:()=>({getPropertyValue:k=>tokens[k.replace('--hn-motion-','')]||''})};
  const owner=new ListenerTarget();owner.ownerDocument=doc;owner.dataset={};owner.getAttribute=()=>null;owner.removeAttribute=()=>{};owner.contains=n=>n.owner===owner;
  const animations=[];
  function node(excluded=false){return {owner,isConnected:true,matches:()=>excluded,textContent:'Đăng nhập',animate(frames,options){let settle;const a={frames,options,cancelled:false,finished:new Promise(r=>settle=r),cancel(){this.cancelled=true;settle();},finish(){settle();}};animations.push(a);return a;}};}
  return {owner,node,media,doc,animations,controller:createMotionController({element:owner,requested,media})};
}
test('M00 harness reuses the served primitive rather than a second implementation',()=>assert.equal(harnessController,createMotionController));
test('OS reduction cannot be overridden and invalid modes fail to off',()=>{
  assert.equal(resolveMotionMode({requested:'auto',reduced:true}),'reduced');
  assert.equal(resolveMotionMode({requested:'full',reduced:false}),'off');
  assert.equal(resolveMotionMode({requested:'off',reduced:true}),'off');
});
for(const mode of ['auto','reduced','off'])test(`all six M00 primitives preserve presentation lifecycle in ${mode}`,async()=>{
  const f=fixture(mode),n=f.node(),c=f.controller;
  for(const primitive of ['pressFeedback','noticeFeedback','routeTransition','modalSheetMotion','dataState','rowFeedback']){
    const h=c[primitive](n);if(mode==='off'){assert.equal(c.activeCount,0);}else{assert.equal(c.activeCount,1);const a=f.animations.at(-1);assert.ok(a.options.duration<= (mode==='reduced'?80:220));if(mode==='reduced')assert.ok(a.frames.every(x=>!('transform' in x)));a.finish();}
    await h.finished;assert.equal(c.activeCount,0);
  }
  c.dispose();
});
test('rapid replacement, OS change, hidden, detached and security teardown cancel without callbacks',async()=>{
  const f=fixture(),n=f.node(),c=f.controller;
  const a=c.noticeFeedback(n);c.noticeFeedback(n);assert.equal(f.animations[0].cancelled,true);assert.equal(c.activeCount,1);
  f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.equal(c.mode,'reduced');assert.equal(c.activeCount,0);
  c.noticeFeedback(n);f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(c.activeCount,0);
  c.noticeFeedback(n);assert.equal(c.activeCount,0);f.doc.hidden=false;
  n.isConnected=false;c.noticeFeedback(n);assert.equal(c.activeCount,0);n.isConnected=true;
  c.noticeFeedback(n);c.routeTransition(n,{securitySensitive:true});assert.equal(c.activeCount,0);
  c.dispose();await a.finished;c.noticeFeedback(n);assert.equal(c.activeCount,0);
});
test('inputs, preview scale roots and disabled targets remain static',()=>{
  const f=fixture();f.controller.pressFeedback(f.node(true));assert.equal(f.animations.length,0);f.controller.dispose();
});
test('P01 label updates apply immediately, do not replay identical text, and cancel on dispose',async()=>{
  const f=fixture();f.controller.dispose();const previous=globalThis.window;
  globalThis.window={matchMedia:()=>f.media};
  try{
    const c=mountAuthMotion({screen:f.owner}),n=f.node();
    c.label(n,'Đang đăng nhập…');assert.equal(n.textContent,'Đang đăng nhập…');assert.equal(f.animations.length,1);assert.equal(f.animations[0].options.duration,140);
    c.label(n,'Đang đăng nhập…');assert.equal(f.animations.length,1);
    c.busy(true);assert.equal(c.activeCount,0);
    c.label(n,'Đăng nhập');const last=f.animations.at(-1);c.dispose();assert.equal(last.cancelled,true);await last.finished;assert.equal(c.activeCount,0);
  }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
test('repeated P01 mount/dispose leaves zero media, visibility or pointer/key listeners',()=>{
  const f=fixture();f.controller.dispose();const previous=globalThis.window;globalThis.window={matchMedia:()=>f.media};
  try{for(let i=0;i<10;i++){const c=mountAuthMotion({screen:f.owner});assert.equal(f.media.listenerCount,1);assert.equal(f.doc.listenerCount,1);assert.equal(f.owner.listenerCount,2);c.dispose();assert.equal(f.media.listenerCount+f.doc.listenerCount+f.owner.listenerCount,0);}}
  finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
