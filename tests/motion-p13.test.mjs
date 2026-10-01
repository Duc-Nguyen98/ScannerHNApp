import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNotificationMotion} from '../docs/flows/notifications/motion.mjs';

function fixture(){
 const doc=new EventTarget(),media=new EventTarget();doc.hidden=false;media.matches=false;
 let listeners=0;const add=doc.addEventListener.bind(doc),remove=doc.removeEventListener.bind(doc);
 doc.addEventListener=(...args)=>{listeners++;add(...args);};doc.removeEventListener=(...args)=>{listeners--;remove(...args);};
 const root={dataset:{},ownerDocument:doc,getAttribute:()=>null,removeAttribute(){delete this.dataset.hnMotionMode;},contains:n=>n?.ours,closest:()=>null};
 doc.defaultView={getComputedStyle:()=>({getPropertyValue:k=>({'--hn-motion-feedback':'140ms','--hn-motion-ease-standard':'linear'})[k]||''})};
 const animations=[],node=()=>({dataset:{},ours:true,isConnected:true,matches:()=>false,animate(frames,options){let resolve;const a={frames,options,cancelled:false,finished:new Promise(r=>resolve=r),cancel(){this.cancelled=true;resolve();}};animations.push(a);return a;}});
 return {root,doc,media,node,animations,get listeners(){return listeners;}};
}
test('M13 mode off/hidden states are consumed, not replayed on Back or enable',()=>{const f=fixture(),m=mountNotificationMotion(f),node=f.node();m.activate();m.state(node,'doc1:waiting');m.state(node,'doc1:waiting');assert.equal(f.animations.length,1);m.setMode('off');m.state(node,'doc2:waiting');m.setMode('auto');m.state(node,'doc2:waiting');f.doc.hidden=true;m.state(node,'doc3:waiting');f.doc.hidden=false;m.state(node,'doc3:waiting');m.hide();m.activate();m.state(node,'doc1:waiting');assert.equal(f.animations.length,1);m.dispose();});
test('M13 OS policy cancels active opacity; hide/dispose release listener even when repeated',()=>{const f=fixture(),m=mountNotificationMotion(f);m.activate();assert.equal(f.listeners,1);m.list(f.node());f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.ok(f.animations[0].cancelled);m.list(f.node());assert.equal(f.animations[1].options.duration,80);assert.ok(f.animations[1].frames.every(v=>!('transform'in v)));m.hide();m.hide();assert.equal(f.listeners,0);m.activate();m.list(f.node());m.dispose();assert.ok(f.animations.at(-1).cancelled);assert.equal(f.listeners,0);m.activate();m.list(f.node());assert.equal(f.listeners,0);});
test('M13 inactive context is static and mode never triggers a domain callback',()=>{const f=fixture();let active=false;const m=mountNotificationMotion({...f,active:()=>active});m.activate();m.list(f.node());m.state(f.node(),'old');assert.equal(f.animations.length,0);active=true;m.state(f.node(),'old');assert.equal(f.animations.length,0);m.list(f.node());assert.equal(f.animations.length,1);m.cancel();assert.ok(f.animations[0].cancelled);m.dispose();});
