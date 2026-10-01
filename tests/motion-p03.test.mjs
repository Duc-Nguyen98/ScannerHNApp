import test from 'node:test';
import assert from 'node:assert/strict';
import {acquireOverlayScrollLock} from '../docs/flows/shared/overlay-scroll-lock.mjs';
import {createMotionController} from '../docs/flows/shared/motion/motion-primitives.mjs';

function style(value='',priority=''){
 return {value,priority,getPropertyValue(){return this.value;},getPropertyPriority(){return this.priority;},setProperty(k,v,p=''){this.value=v;this.priority=p;},removeProperty(){this.value='';this.priority='';}};
}
for(const order of [[0,1],[1,0]])test('Overlay page lock restores once after final owner releases '+order,()=>{
 const doc={documentElement:{style:style('clip','important')},body:{style:style('auto')}};
 const releases=[acquireOverlayScrollLock(doc),acquireOverlayScrollLock(doc)];
 assert.equal(doc.documentElement.style.value,'hidden');assert.equal(doc.body.style.value,'hidden');
 releases[order[0]]();releases[order[0]]();assert.equal(doc.documentElement.style.value,'hidden');
 releases[order[1]]();assert.equal(doc.documentElement.style.value,'clip');assert.equal(doc.documentElement.style.priority,'important');assert.equal(doc.body.style.value,'auto');
});
test('Ten independent mount/close cycles leave no stale lock; documents are independent',()=>{
 const make=()=>({documentElement:{style:style()},body:{style:style()}}),a=make(),b=make();
 const keep=acquireOverlayScrollLock(b);
 for(let i=0;i<10;i++){const release=acquireOverlayScrollLock(a);release();assert.equal(a.documentElement.style.value,'');assert.equal(a.body.style.value,'');assert.equal(b.body.style.value,'hidden');}
 keep();assert.equal(b.body.style.value,'');
});

function fixture(requested='auto',reduced=false){
 const media=new EventTarget();media.matches=reduced;const doc=new EventTarget();doc.hidden=false;
 const tokens={feedback:'140ms','panel-enter':'220ms','panel-exit':'160ms','ease-standard':'cubic-bezier(0.2,0,0,1)'};
 doc.defaultView={getComputedStyle:()=>({getPropertyValue:k=>tokens[k.replace('--hn-motion-','')]||''})};
 const element={ownerDocument:doc,dataset:{},getAttribute:()=>null,removeAttribute(){},contains:()=>true};
 const animations=[];const node={isConnected:true,matches:()=>false,animate(frames,options){let done;const a={frames,options,finished:new Promise(resolve=>done=resolve),cancel(){this.cancelled=true;done();},finish(){done();}};animations.push(a);return a;}};
 return {motion:createMotionController({element,requested,media}),media,doc,node,animations};
}
test('Backdrop fades from transparent at140ms; stopped modal220ms has no transform; exit160ms',async()=>{
 const f=fixture();let handle=f.motion.backdropMotion(f.node);assert.deepEqual(f.animations[0].frames,[{opacity:0},{opacity:1}]);assert.equal(f.animations[0].options.duration,140);f.animations[0].finish();await handle.finished;
 handle=f.motion.modalSheetMotion(f.node,{fadeOnly:true});assert.equal(f.animations[1].options.duration,220);assert.ok(f.animations[1].frames.every(x=>!x.transform));f.animations[1].finish();await handle.finished;
 handle=f.motion.modalSheetMotion(f.node,{exit:true});assert.equal(f.animations[2].options.duration,160);f.animations[2].finish();await handle.finished;assert.equal(f.motion.activeCount,0);f.motion.dispose();
});
test('OS override and off have no motion transform, cancel mid-flight without domain callback',async()=>{
 const f=fixture();const enter=f.motion.modalSheetMotion(f.node);f.media.matches=true;f.media.dispatchEvent(new Event('change'));await enter.finished;assert.equal(f.motion.activeCount,0);assert.equal(f.motion.mode,'reduced');
 const h=f.motion.backdropMotion(f.node);assert.ok(f.animations.at(-1).options.duration<=80);assert.ok(f.animations.at(-1).frames.every(x=>!x.transform));f.motion.setMode('off');await h.finished;const count=f.animations.length;await f.motion.modalSheetMotion(f.node).finished;assert.equal(f.animations.length,count);f.motion.dispose();
});
