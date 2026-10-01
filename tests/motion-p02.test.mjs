import test from 'node:test';
import assert from 'node:assert/strict';
import {mountShellMotion} from '../docs/flows/home/motion.mjs';
class Target extends EventTarget {
  listeners=new Map();
  addEventListener(t,f,o){super.addEventListener(t,f,o);if(!this.listeners.has(t))this.listeners.set(t,new Set());this.listeners.get(t).add(f);}
  removeEventListener(t,f,o){super.removeEventListener(t,f,o);this.listeners.get(t)?.delete(f);}
  get count(){return [...this.listeners.values()].reduce((n,s)=>n+s.size,0);}
}
function fixture(){
 const screen=new Target(),doc=new Target(),media=new Target();media.matches=false;doc.hidden=false;screen.ownerDocument=doc;screen.dataset={};screen.getAttribute=()=>null;screen.removeAttribute=()=>{};screen.contains=n=>!!n?.ours;
 doc.defaultView={getComputedStyle:()=>({getPropertyValue:k=>({'--hn-motion-route':'180ms','--hn-motion-press':'100ms','--hn-motion-feedback':'140ms','--hn-motion-ease-standard':'linear'})[k]||''})};
 const animations=[];const node=()=>({ours:true,isConnected:true,matches:()=>false,animate(frames,options){let done;const a={frames,options,finished:new Promise(r=>done=r),cancelled:false,cancel(){this.cancelled=true;done();},finish(){done();}};animations.push(a);return a;}});
 return {screen,doc,media,node,animations};
}
test('Shell reuses one route owner; replacement cancels old effect, repeated identity never replays',async()=>{
 const f=fixture(),m=mountShellMotion(f),home=f.node(),dest=f.node(),tab=f.node(),nextTab=f.node();
 m.commit('home',home,tab);assert.equal(f.animations.length,1);assert.equal(f.animations[0].options.duration,180);
 m.commit('home',home,tab);assert.equal(f.animations.length,1);
 m.commit('documents',dest,nextTab);assert.equal(f.animations[0].cancelled,true);assert.deepEqual(f.animations.slice(1).map(a=>a.options.duration),[180,140]);
 m.commit('documents',dest,nextTab);assert.equal(f.animations.length,3);
 m.commit('security',dest,nextTab,{securitySensitive:true});assert.equal(m.activeCount,0);assert.ok(f.animations.every(a=>a.cancelled));
 m.dispose();
});
test('OS/off/hidden and dispose cancel motion without owning navigation or domain callbacks',async()=>{
 const f=fixture(),m=mountShellMotion(f),dest=f.node(),tab=f.node();m.commit('home',dest,tab);m.setMode('off');assert.equal(m.activeCount,0);m.commit('lookup',dest,tab);assert.equal(f.animations.length,1);
 m.setMode('auto');m.commit('home',dest,tab);f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.equal(m.mode,'reduced');assert.equal(m.activeCount,0);
 m.setMode('off');m.commit('lookup',dest,tab);assert.equal(f.animations.length,2);
 f.media.matches=false;m.setMode('auto');m.commit('home',dest,tab);f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(m.activeCount,0);m.dispose();assert.equal(f.screen.count+f.doc.count+f.media.count,0);
});
test('Ten shell lifecycles leave no pointer/key/media/visibility listeners or active handles',()=>{
 const f=fixture();for(let i=0;i<10;i++){const m=mountShellMotion(f);assert.equal(f.screen.count,2);assert.equal(f.media.count,1);assert.equal(f.doc.count,1);m.commit('home',f.node(),f.node());m.dispose();m.dispose();assert.equal(m.activeCount,0);assert.equal(f.screen.count+f.media.count+f.doc.count,0);}
});
