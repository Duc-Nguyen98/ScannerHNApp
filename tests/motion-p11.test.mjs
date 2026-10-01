import test from 'node:test';
import assert from 'node:assert/strict';
import {mountSecurityMotion} from '../docs/flows/security/motion.mjs';

function fixture(){
 const doc=new EventTarget(),root=new EventTarget(),media=new EventTarget();media.matches=false;doc.hidden=false;
 Object.assign(root,{dataset:{},ownerDocument:doc,getAttribute:()=>null,removeAttribute(){delete this.dataset.hnMotionMode;},contains:n=>!!n?.ours,closest:()=>null});
 doc.defaultView={getComputedStyle:()=>({getPropertyValue:k=>({'--hn-motion-feedback':'140ms','--hn-motion-row-feedback':'160ms','--hn-motion-press':'100ms','--hn-motion-ease-standard':'linear'})[k]||''})};
 const animations=[],node=()=>({dataset:{},ours:true,isConnected:true,matches:()=>false,animate(frames,options){let done;const a={frames,options,cancelled:false,finished:new Promise(r=>done=r),cancel(){this.cancelled=true;done();}};animations.push(a);return a;}});
 return {root,doc,media,animations,node};
}
test('M11 confirmed result is consumed once across hide, off, hidden, and mode changes',()=>{
 const f=fixture(),m=mountSecurityMotion(f),n=f.node(),a={},b={},c={};m.activate();m.success(n,a);m.success(n,a);assert.equal(f.animations.length,1);assert.equal(f.animations[0].options.duration,160);
 m.setMode('off');m.success(n,b);m.setMode('auto');m.success(n,b);assert.equal(f.animations.length,1);
 f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));m.success(n,c);f.doc.hidden=false;m.success(n,c);m.hide();m.activate();m.success(n,a);assert.equal(f.animations.length,1);m.dispose();
});
test('M11 distinct errors animate without reading inputs; repeated sync remains static and OS/hide cancel',()=>{
 const f=fixture(),m=mountSecurityMotion(f),n=f.node();m.activate();m.validation(n,'confirm','Mismatch');m.validation(n,'confirm','Mismatch');assert.equal(f.animations.length,1);assert.equal(f.animations[0].options.duration,140);
 f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.ok(f.animations[0].cancelled);m.validation(n,'confirm','');m.validation(n,'confirm','Required');assert.equal(f.animations[1].options.duration,80);assert.ok(f.animations[1].frames.every(v=>!('transform'in v)));m.hide();assert.ok(f.animations[1].cancelled);m.activate();m.validation(n,'current','Required');m.dispose();assert.ok(f.animations.at(-1).cancelled);const count=f.animations.length;m.activate();m.validation(n,'next','Required');assert.equal(f.animations.length,count);
});
test('M11 off never changes domain state or generates effects, including fresh validation/results',()=>{
 const f=fixture(),m=mountSecurityMotion({...f,requested:'off'}),n=f.node();m.activate();m.validation(n,'confirm','Mismatch');m.success(n,{});assert.equal(f.animations.length,0);m.dispose();assert.equal(f.root.dataset.hnMotionMode,undefined);
});
