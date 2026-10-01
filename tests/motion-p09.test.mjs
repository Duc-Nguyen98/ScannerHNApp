import test from 'node:test';
import assert from 'node:assert/strict';
import {mountWarrantyMotion} from '../docs/flows/warranty/motion.mjs';
function fixture(){
 const doc=new EventTarget(),root=new EventTarget(),media=new EventTarget();media.matches=false;doc.hidden=false;
 Object.assign(root,{dataset:{},ownerDocument:doc,getAttribute:()=>null,removeAttribute(){delete this.dataset.hnMotionMode;},contains:n=>!!n?.ours,closest:()=>null});
 doc.defaultView={getComputedStyle:()=>({getPropertyValue:k=>({'--hn-motion-feedback':'140ms','--hn-motion-row-feedback':'160ms','--hn-motion-press':'100ms','--hn-motion-ease-standard':'linear'})[k]||''})};
 const animations=[],node=()=>({dataset:{},ours:true,isConnected:true,matches:()=>false,animate(frames,options){let done;const a={frames,options,cancelled:false,finished:new Promise(r=>done=r),cancel(){this.cancelled=true;done();}};animations.push(a);return a;}});
 return {root,doc,media,animations,node};
}
test('M09 new receipt animates once; off/hidden outcomes are consumed, not replayed on Back or mode switch',()=>{
 const f=fixture(),m=mountWarrantyMotion(f),n=f.node();m.activate();m.success(n,'R1');m.success(n,'R1');assert.equal(f.animations.length,1);assert.equal(f.animations[0].options.duration,160);m.setMode('off');m.success(n,'R2');m.setMode('auto');m.success(n,'R2');assert.equal(f.animations.length,1);f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));m.success(n,'R3');f.doc.hidden=false;m.success(n,'R3');m.hide();m.activate();m.success(n,'R1');assert.equal(f.animations.length,1);m.dispose();
});
test('M09 error changes animate without replaying identical validation; old filter, OS change, hide and dispose cancel',()=>{
 const f=fixture(),m=mountWarrantyMotion(f),n=f.node();m.activate();m.validation(n,'serial','Invalid');m.validation(n,'serial','Invalid');assert.equal(f.animations.length,1);m.validation(n,'serial','');assert.ok(f.animations[0].cancelled);m.filter(n);m.filter(f.node());assert.ok(f.animations[1].cancelled);f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.ok(f.animations[2].cancelled);m.tab(n);assert.equal(f.animations.at(-1).options.duration,80);assert.ok(f.animations.at(-1).frames.every(v=>!('transform'in v)));m.hide();assert.ok(f.animations.at(-1).cancelled);m.activate();m.tab(n);m.dispose();assert.ok(f.animations.at(-1).cancelled);const length=f.animations.length;m.activate();m.tab(n);assert.equal(f.animations.length,length);
});
