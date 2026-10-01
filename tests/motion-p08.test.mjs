import test from 'node:test';
import assert from 'node:assert/strict';
import {mountHistoryMotion} from '../docs/flows/history/motion.mjs';
function fixture(){
 const doc=new EventTarget(),media=new EventTarget();media.matches=false;doc.hidden=false;
 const root={dataset:{},ownerDocument:doc,getAttribute:()=>null,removeAttribute(){delete this.dataset.hnMotionMode;},contains:n=>!!n?.ours};
 doc.defaultView={getComputedStyle:()=>({getPropertyValue:k=>({'--hn-motion-feedback':'140ms','--hn-motion-ease-standard':'linear'})[k]||''})};
 const animations=[],node=()=>({dataset:{},ours:true,isConnected:true,matches:()=>false,animate(frames,options){let done;const a={frames,options,cancelled:false,finished:new Promise(r=>done=r),cancel(){this.cancelled=true;done();}};animations.push(a);return a;}});
 return {root,doc,media,animations,node};
}
test('M08 filter/tab consume the existing140ms primitive, cancellation cleans before hide/reactivate/dispose',()=>{
 const f=fixture(),m=mountHistoryMotion(f),list=f.node(),tab=f.node();m.activate();m.filter(list);m.tab(tab);
 assert.deepEqual(f.animations.map(a=>a.options.duration),[140,140]);assert.equal(list.dataset.motionPrimitive,'HistoryFilter');m.hide();assert.ok(f.animations.every(a=>a.cancelled));m.activate();m.filter(list);assert.equal(f.animations.length,3);m.dispose();m.activate();m.filter(list);assert.equal(f.animations.length,3);
});
test('M08 OS reduction, off and hidden cancel presentation; inactive owner has no effects',()=>{
 const f=fixture();let active=true;const m=mountHistoryMotion({...f,active:()=>active}),n=f.node();m.activate();m.filter(n);f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.equal(f.animations[0].cancelled,true);m.filter(n);assert.equal(f.animations.at(-1).options.duration,80);assert.ok(f.animations.at(-1).frames.every(f=>!('transform'in f)));m.setMode('off');m.filter(n);assert.equal(f.animations.length,2);f.media.matches=false;m.setMode('auto');f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));m.filter(n);assert.equal(f.animations.length,2);f.doc.hidden=false;active=false;m.filter(n);assert.equal(f.animations.length,2);m.dispose();
});
